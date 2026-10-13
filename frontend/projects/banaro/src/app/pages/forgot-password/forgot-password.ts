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
import { Alert, AuthCard, Button, Field, fieldDescriptionId, FormSummary, Input } from 'components';
import { SeoService } from '../../shared/seo.service';

type State = 'default' | 'invalid' | 'submitting' | 'success';
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'bn-forgot-password-page',
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
  templateUrl: './forgot-password.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordPage {
  private readonly api = inject(IDENTITY_API);
  private readonly i18n = inject(TranslationService);
  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);
  private readonly connectivity = inject(ConnectivityService);

  protected readonly describedBy = fieldDescriptionId;
  protected readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.pattern(EMAIL)]],
  });

  protected readonly state = signal<State>('default');
  protected readonly emailError = signal<string | null>(null);
  protected readonly alert = signal<string | null>(null);
  protected readonly sentTo = signal('');
  protected readonly offline = computed(() => this.connectivity.status() === 'offline');
  protected readonly summaryErrors = computed(() => {
    const error = this.emailError();
    return error ? [{ controlId: 'email', message: error }] : [];
  });

  constructor() {
    inject(SeoService).set({
      title: this.i18n.t('identity.forgot.meta.title'),
      description: this.i18n.t('identity.forgot.meta.description'),
      path: '/forgot-password',
    });
  }

  protected submit(): void {
    if (this.state() === 'submitting') return;
    this.alert.set(null);
    if (this.form.controls.email.invalid) {
      this.emailError.set(this.i18n.t('identity.errors.email'));
      this.state.set('invalid');
      afterNextRender(() => this.document.getElementById('email')?.focus(), {
        injector: this.injector,
      });
      return;
    }
    this.emailError.set(null);
    this.send(this.form.getRawValue().email.trim());
  }

  /** Repeats the request for the address shown on the success state. */
  protected sendAgain(): void {
    this.send(this.sentTo());
  }

  private send(email: string): void {
    this.state.set('submitting');
    this.api.requestPasswordReset(email).subscribe({
      next: () => {
        this.sentTo.set(email);
        this.state.set('success');
      },
      error: (error: unknown) => {
        const failure = toApiError(error);
        if (failure.kind === 'validation') {
          this.emailError.set(failure.fields['email'] ?? this.i18n.t('identity.errors.email'));
          this.state.set('invalid');
          return;
        }
        this.alert.set(
          failure.kind === 'rate-limited'
            ? this.i18n.t('identity.forgot.errors.tooMany', {
                minutes: retryAfterMinutes(failure.retryAfterSeconds),
              })
            : this.i18n.t('identity.forgot.errors.failed'),
        );
        this.state.set(this.sentTo() ? 'success' : 'default');
      },
    });
  }
}
