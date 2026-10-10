import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DOCUMENT,
  inject,
  Injector,
  signal,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  ConnectivityService,
  IDENTITY_API,
  retryAfterMinutes,
  toApiError,
  TranslatePipe,
  TranslationService,
} from 'api';
import {
  Alert,
  AuthCard,
  Button,
  Check,
  Checkbox,
  Field,
  fieldDescriptionId,
  FieldError,
  FormError,
  FormSummary,
  Input,
} from 'components';
import { SeoService } from '../../shared/seo.service';

type State = 'default' | 'invalid' | 'submitting' | 'success';
type FieldName = 'name' | 'email' | 'password' | 'agree';

const FIELD_ORDER: FieldName[] = ['name', 'email', 'password', 'agree'];
const CONTROL_IDS: Record<FieldName, string> = {
  name: 'name',
  email: 'email',
  password: 'password',
  agree: 'agree',
};
const SERVER_FIELDS: Record<string, FieldName> = {
  name: 'name',
  email: 'email',
  password: 'password',
  agreed_to_code_of_conduct: 'agree',
};
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'bn-join-page',
  imports: [
    Alert,
    AuthCard,
    Button,
    Check,
    Checkbox,
    Field,
    FieldError,
    FormSummary,
    Input,
    ReactiveFormsModule,
    RouterLink,
    TranslatePipe,
  ],
  templateUrl: './join.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JoinPage {
  private readonly api = inject(IDENTITY_API);
  private readonly i18n = inject(TranslationService);
  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);
  private readonly connectivity = inject(ConnectivityService);

  protected readonly ids = CONTROL_IDS;
  protected readonly describedBy = fieldDescriptionId;

  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.pattern(EMAIL)]],
    password: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(128)]],
    agree: [false, Validators.requiredTrue],
  });

  protected readonly state = signal<State>('default');
  protected readonly errors = signal<Partial<Record<FieldName, string>>>({});
  protected readonly formError = signal<string | null>(null);
  protected readonly sentTo = signal('');
  protected readonly offline = computed(() => this.connectivity.status() === 'offline');

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
      title: this.i18n.t('identity.join.meta.title'),
      description: this.i18n.t('identity.join.meta.description'),
      path: '/join',
    });
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
    this.api
      .join({
        name: value.name.trim(),
        email: value.email.trim(),
        password: value.password,
        agreedToCodeOfConduct: true,
      })
      .subscribe({
        next: () => {
          this.sentTo.set(value.email.trim());
          this.form.controls.password.reset();
          this.state.set('success');
        },
        error: (error: unknown) => {
          const failure = toApiError(error);
          if (failure.kind === 'validation') {
            const fields: Partial<Record<FieldName, string>> = {};
            for (const [server, message] of Object.entries(failure.fields)) {
              const field = SERVER_FIELDS[server];
              if (field) fields[field] = message;
            }
            this.showInvalid(fields);
          } else {
            this.formError.set(
              failure.kind === 'rate-limited'
                ? this.i18n.t('common.errors.slowDown', {
                    minutes: retryAfterMinutes(failure.retryAfterSeconds),
                  })
                : this.i18n.t('identity.errors.failed'),
            );
            this.showInvalid({});
          }
        },
      });
  }

  /** Shows the summary as an alert and moves focus to the first invalid field (L2-001 criterion 13). */
  private showInvalid(errors: Partial<Record<FieldName, string>>): void {
    this.errors.set(errors);
    this.state.set('invalid');
    const first = FIELD_ORDER.find((f) => errors[f]);
    afterNextRender(
      () => {
        const target = first
          ? this.document.getElementById(CONTROL_IDS[first])
          : this.document.getElementById('error-summary');
        target?.focus();
      },
      { injector: this.injector },
    );
  }

  private clientErrors(): Partial<Record<FieldName, string>> {
    const c = this.form.controls;
    const errors: Partial<Record<FieldName, string>> = {};
    if (!c.name.value.trim()) errors.name = this.i18n.t('identity.errors.nameRequired');
    else if (c.name.hasError('maxlength')) errors.name = this.i18n.t('identity.errors.nameMax');
    if (c.email.invalid) errors.email = this.i18n.t('identity.errors.email');
    if (c.password.hasError('required'))
      errors.password = this.i18n.t('identity.errors.passwordRequired');
    else if (c.password.hasError('minlength'))
      errors.password = this.i18n.t('identity.errors.passwordMinCount', {
        count: c.password.value.length,
      });
    else if (c.password.hasError('maxlength'))
      errors.password = this.i18n.t('identity.errors.passwordMax');
    if (!c.agree.value) errors.agree = this.i18n.t('identity.errors.agree');
    return errors;
  }
}
