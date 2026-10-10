import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  CONTACT_TOPICS,
  ContactTopic,
  PUBLIC_SITE_API,
  retryAfterMinutes,
  toApiError,
  TranslatePipe,
  TranslationService,
} from 'api';
import {
  Alert,
  Button,
  Field,
  fieldDescriptionId,
  FormError,
  FormSummary,
  Input,
  PageHeader,
  Textarea,
} from 'components';
import { SeoService } from '../../shared/seo.service';

type State = 'default' | 'invalid' | 'submitting' | 'success';
type FieldName = 'name' | 'email' | 'topic' | 'message';

const FIELD_ORDER: FieldName[] = ['name', 'email', 'topic', 'message'];
const CONTROL_IDS: Record<FieldName, string> = {
  name: 'c-name',
  email: 'c-email',
  topic: 'c-topic',
  message: 'c-message',
};
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TOPIC_KEYS: Record<ContactTopic, string> = {
  general: 'contact.topics.general',
  partnership: 'contact.topics.partnership',
  press: 'contact.topics.press',
  'report-problem': 'contact.topics.reportProblem',
  'propose-event': 'contact.topics.proposeEvent',
};

@Component({
  selector: 'bn-contact-page',
  imports: [
    Alert,
    Button,
    Field,
    FormSummary,
    Input,
    PageHeader,
    ReactiveFormsModule,
    RouterLink,
    Textarea,
    TranslatePipe,
  ],
  templateUrl: './contact.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactPage {
  private readonly api = inject(PUBLIC_SITE_API);
  private readonly i18n = inject(TranslationService);
  private readonly injector = inject(Injector);
  private readonly summary = viewChild(FormSummary);
  private readonly nameInput = viewChild('nameInput', { read: ElementRef<HTMLInputElement> });

  protected readonly ids = CONTROL_IDS;
  protected readonly topics = CONTACT_TOPICS.map((value) => ({ value, key: TOPIC_KEYS[value] }));
  protected readonly describedBy = fieldDescriptionId;

  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.pattern(EMAIL)]],
    topic: ['' as ContactTopic | '', Validators.required],
    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
    website: [''],
  });

  protected readonly state = signal<State>('default');
  protected readonly errors = signal<Partial<Record<FieldName, string>>>({});
  protected readonly formError = signal<string | null>(null);
  protected readonly sentTo = signal({ firstName: '', email: '' });

  protected readonly summaryErrors = computed<FormError[]>(() => {
    const fieldErrors = FIELD_ORDER.filter((f) => this.errors()[f]).map((f) => ({
      controlId: CONTROL_IDS[f],
      message: this.errors()[f] as string,
    }));
    const general = this.formError();
    return general ? [{ message: general }, ...fieldErrors] : fieldErrors;
  });

  constructor() {
    inject(SeoService).set({
      title: this.i18n.t('contact.meta.title'),
      description: this.i18n.t('contact.meta.description'),
      path: '/contact',
    });
    afterNextRender(() => this.nameInput()?.nativeElement.focus());
  }

  protected submit(): void {
    if (this.state() === 'submitting') return;
    this.formError.set(null);
    const errors = this.clientErrors();
    if (Object.keys(errors).length) {
      this.showInvalid(errors);
      return;
    }

    const value = this.form.getRawValue();
    this.state.set('submitting');
    this.api.sendContactMessage({ ...value, topic: value.topic as ContactTopic }).subscribe({
      next: () => {
        this.sentTo.set({ firstName: value.name.trim().split(/\s+/)[0], email: value.email });
        this.state.set('success');
      },
      error: (error: unknown) => {
        const failure = toApiError(error);
        if (failure.kind === 'validation') {
          this.showInvalid(this.pickFieldErrors(failure.fields));
        } else {
          this.formError.set(
            failure.kind === 'rate-limited'
              ? this.i18n.t('common.errors.slowDown', {
                  minutes: retryAfterMinutes(failure.retryAfterSeconds),
                })
              : this.i18n.t('contact.errors.failed'),
          );
          this.showInvalid({});
        }
      },
    });
  }

  private showInvalid(errors: Partial<Record<FieldName, string>>): void {
    this.errors.set(errors);
    this.state.set('invalid');
    afterNextRender(() => this.summary()?.focus(), { injector: this.injector });
  }

  private clientErrors(): Partial<Record<FieldName, string>> {
    const c = this.form.controls;
    const errors: Partial<Record<FieldName, string>> = {};
    if (c.name.hasError('required') || !c.name.value.trim())
      errors.name = this.i18n.t('contact.errors.nameRequired');
    else if (c.name.hasError('maxlength')) errors.name = this.i18n.t('contact.errors.nameMax');
    if (c.email.invalid) errors.email = this.i18n.t('contact.errors.email');
    if (c.topic.invalid) errors.topic = this.i18n.t('contact.errors.topic');
    if (c.message.hasError('required'))
      errors.message = this.i18n.t('contact.errors.messageRequired');
    else if (c.message.hasError('minlength'))
      errors.message = this.i18n.t('contact.errors.messageMin');
    else if (c.message.hasError('maxlength'))
      errors.message = this.i18n.t('contact.errors.messageMax');
    return errors;
  }

  private pickFieldErrors(fields: Record<string, string>): Partial<Record<FieldName, string>> {
    return Object.fromEntries(FIELD_ORDER.filter((f) => fields[f]).map((f) => [f, fields[f]]));
  }
}
