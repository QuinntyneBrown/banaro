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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  ConnectivityService,
  landingFor,
  retryAfterMinutes,
  safeReturnPath,
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

type State = 'default' | 'invalid' | 'submitting' | 'error' | 'signed-out';
type FieldName = 'email' | 'password';

const FIELD_ORDER: FieldName[] = ['email', 'password'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'bn-sign-in-page',
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
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInPage {
  private readonly session = inject(SessionStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly i18n = inject(TranslationService);
  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);
  private readonly connectivity = inject(ConnectivityService);

  protected readonly describedBy = fieldDescriptionId;

  protected readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.pattern(EMAIL)]],
    password: ['', Validators.required],
  });

  // Navigation state, not a query parameter, selects the signed-out state (L2-003 criterion 5).
  protected readonly state = signal<State>(
    this.router.currentNavigation()?.extras.state?.['signedOut'] ? 'signed-out' : 'default',
  );
  protected readonly errors = signal<Partial<Record<FieldName, string>>>({});
  /** A danger alert at the top of the form: too many attempts, or the request failed. */
  protected readonly formAlert = signal<string | null>(null);
  protected readonly offline = computed(() => this.connectivity.status() === 'offline');

  protected readonly summaryErrors = computed<FormError[]>(() =>
    FIELD_ORDER.filter((f) => this.errors()[f]).map((f) => ({
      controlId: f,
      message: this.errors()[f] as string,
    })),
  );

  constructor() {
    inject(SeoService).set({
      title: this.i18n.t('identity.signIn.meta.title'),
      description: this.i18n.t('identity.signIn.meta.description'),
      path: '/sign-in',
    });
    if (this.state() === 'signed-out') {
      afterNextRender(() => this.document.getElementById('auth-title')?.focus());
    }
  }

  protected submit(): void {
    if (this.state() === 'submitting') return;
    this.formAlert.set(null);
    const errors = this.clientErrors();
    if (Object.keys(errors).length) {
      this.errors.set(errors);
      this.state.set('invalid');
      this.focus(FIELD_ORDER.find((f) => errors[f]) ?? 'email');
      return;
    }

    this.errors.set({});
    this.state.set('submitting');
    const { email, password } = this.form.getRawValue();
    this.session.signIn({ email: email.trim(), password }).subscribe({
      next: (member) => {
        const returnTo = this.route.snapshot.queryParamMap.get('returnTo');
        const target = landingFor(member, safeReturnPath(returnTo));
        void this.router.navigateByUrl(target);
      },
      error: (error: unknown) => {
        const failure = toApiError(error);
        this.form.controls.password.reset();
        if (failure.kind === 'rejected' && failure.code === 'invalid_credentials') {
          this.state.set('error');
          this.focus('password');
          return;
        }
        this.formAlert.set(
          failure.kind === 'rate-limited'
            ? this.i18n.t('identity.signIn.errors.tooMany', {
                minutes: retryAfterMinutes(failure.retryAfterSeconds),
              })
            : this.i18n.t('identity.signIn.errors.failed'),
        );
        this.state.set('default');
        this.focus('password');
      },
    });
  }

  private focus(id: string): void {
    afterNextRender(() => this.document.getElementById(id)?.focus(), { injector: this.injector });
  }

  private clientErrors(): Partial<Record<FieldName, string>> {
    const c = this.form.controls;
    const errors: Partial<Record<FieldName, string>> = {};
    if (c.email.invalid) errors.email = this.i18n.t('identity.signIn.errors.email');
    if (c.password.invalid) errors.password = this.i18n.t('identity.signIn.errors.password');
    return errors;
  }
}
