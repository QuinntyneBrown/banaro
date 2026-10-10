import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DOCUMENT,
  inject,
  Injector,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  ConnectivityService,
  IDENTITY_API,
  SessionStore,
  toApiError,
  TranslatePipe,
  TranslationService,
} from 'api';
import {
  Alert,
  AuthCard,
  Button,
  Field,
  fieldDescriptionId,
  FormError,
  FormSummary,
  Input,
} from 'components';
import { SeoService } from '../../shared/seo.service';

type State = 'default' | 'invalid' | 'submitting' | 'success' | 'error';
type FieldName = 'password' | 'confirm';
const FIELD_ORDER: FieldName[] = ['password', 'confirm'];

@Component({
  selector: 'bn-reset-password-page',
  imports: [
    Alert,
    AuthCard,
    Button,
    Field,
    FormSummary,
    Input,
    ReactiveFormsModule,
    RouterLink,
    TranslatePipe,
  ],
  templateUrl: './reset-password.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordPage {
  private readonly api = inject(IDENTITY_API);
  private readonly session = inject(SessionStore);
  private readonly i18n = inject(TranslationService);
  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);
  private readonly connectivity = inject(ConnectivityService);

  /** From `resetPasswordResolver`. */
  readonly linkUsable = input(false);
  readonly token = input('');
  readonly email = input('');

  protected readonly describedBy = fieldDescriptionId;
  protected readonly form = inject(NonNullableFormBuilder).group({ password: [''], confirm: [''] });

  protected readonly state = linkedSignal<State>(() => (this.linkUsable() ? 'default' : 'error'));
  protected readonly errors = signal<Partial<Record<FieldName, string>>>({});
  protected readonly alert = signal<string | null>(null);
  protected readonly offline = computed(() => this.connectivity.status() === 'offline');
  protected readonly summaryErrors = computed<FormError[]>(() =>
    FIELD_ORDER.filter((f) => this.errors()[f]).map((f) => ({
      controlId: f,
      message: this.errors()[f] as string,
    })),
  );

  constructor() {
    inject(SeoService).set({
      title: this.i18n.t('identity.reset.meta.title'),
      description: this.i18n.t('identity.reset.meta.description'),
      path: '/reset-password',
    });
  }

  protected submit(): void {
    if (this.state() === 'submitting') return;
    this.alert.set(null);
    const { password, confirm } = this.form.getRawValue();
    const errors: Partial<Record<FieldName, string>> = {};
    if (!password) errors.password = this.i18n.t('identity.errors.passwordRequired');
    else if (password.length < 12) errors.password = this.i18n.t('identity.errors.passwordMin');
    else if (password.length > 128) errors.password = this.i18n.t('identity.errors.passwordMax');
    if (!errors.password && !confirm)
      errors.confirm = this.i18n.t('identity.reset.errors.confirmRequired');
    else if (!errors.password && confirm !== password)
      errors.confirm = this.i18n.t('identity.reset.errors.mismatch');
    if (Object.keys(errors).length) {
      this.showInvalid(errors);
      return;
    }

    this.errors.set({});
    this.state.set('submitting');
    this.api
      .resetPassword({
        token: this.token(),
        email: this.email(),
        password,
        passwordConfirmation: confirm,
      })
      .subscribe({
        next: () => {
          this.session.member.set(null);
          this.state.set('success');
        },
        error: (error: unknown) => {
          const failure = toApiError(error);
          this.form.reset();
          if (failure.kind === 'rejected' && failure.code === 'reset_link_invalid') {
            this.state.set('error');
          } else if (failure.kind === 'validation') {
            this.showInvalid({ password: failure.fields['password'] });
          } else {
            this.alert.set(this.i18n.t('identity.reset.errors.failed'));
            this.state.set('default');
          }
        },
      });
  }

  private showInvalid(errors: Partial<Record<FieldName, string>>): void {
    this.errors.set(errors);
    this.state.set('invalid');
    const first = FIELD_ORDER.find((f) => errors[f]) ?? 'password';
    afterNextRender(() => this.document.getElementById(first)?.focus(), {
      injector: this.injector,
    });
  }
}
