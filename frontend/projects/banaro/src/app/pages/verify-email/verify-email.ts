import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  IDENTITY_API,
  ResendVerificationRequest,
  retryAfterMinutes,
  SessionStore,
  toApiError,
  TranslatePipe,
  TranslationService,
  VerificationOutcome,
} from 'api';
import { Alert, AuthCard, Button, ToastService } from 'components';
import { SeoService } from '../../shared/seo.service';

const ONBOARDING = '/welcome';

@Component({
  selector: 'bn-verify-email-page',
  imports: [Alert, AuthCard, Button, RouterLink, TranslatePipe],
  templateUrl: './verify-email.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerifyEmailPage {
  private readonly api = inject(IDENTITY_API);
  private readonly router = inject(Router);
  private readonly i18n = inject(TranslationService);
  private readonly toasts = inject(ToastService);
  private readonly session = inject(SessionStore);

  /** From `verifyEmailResolver`; null when the page was opened without a link. */
  readonly outcome = input<VerificationOutcome | null>(null);
  readonly token = input<string>();

  /** The address the join page passed on, for a visitor who has not signed in. */
  private readonly joinedEmail: string | undefined =
    this.router.currentNavigation()?.extras.state?.['email'];

  protected readonly state = computed(() => {
    const outcome = this.outcome();
    if (outcome === 'verified') return 'success';
    return outcome ? 'error' : 'default';
  });
  protected readonly email = computed(() => this.session.member()?.email ?? this.joinedEmail ?? '');
  /** Opening a link signs no one in, so a visitor reaches set-up through sign-in (criterion 7). */
  protected readonly setUpPath = computed(() =>
    this.session.signedIn() ? ONBOARDING : '/sign-in',
  );
  protected readonly setUpParams = computed(() =>
    this.session.signedIn() ? {} : { returnTo: ONBOARDING },
  );
  protected readonly sending = signal(false);
  protected readonly alert = signal<string | null>(null);

  constructor() {
    inject(SeoService).set({
      title: this.i18n.t('identity.verify.meta.title'),
      description: this.i18n.t('identity.verify.meta.description'),
      path: '/verify-email',
    });
  }

  /**
   * Asks for a new link for whichever account the session, the link or the joined address names.
   * With none of them, the person signs in first (L2-002 criterion 8).
   */
  protected resend(): void {
    const outcome = this.outcome();
    const request: ResendVerificationRequest = {};
    if (outcome && outcome !== 'verified' && outcome.linkKnown) request.token = this.token();
    else if (!this.session.signedIn() && this.joinedEmail) request.email = this.joinedEmail;

    if (!request.token && !request.email && !this.session.signedIn()) {
      void this.router.navigateByUrl(`/sign-in?returnTo=${encodeURIComponent('/verify-email')}`);
      return;
    }

    this.sending.set(true);
    this.alert.set(null);
    this.api.resendVerification(request).subscribe({
      next: () => {
        this.sending.set(false);
        this.toasts.show({ variant: 'success', title: this.i18n.t('identity.verify.sent') });
      },
      error: (error: unknown) => {
        this.sending.set(false);
        const failure = toApiError(error);
        if (failure.kind === 'rate-limited') {
          this.alert.set(
            this.i18n.t('identity.verify.errors.tooMany', {
              minutes: retryAfterMinutes(failure.retryAfterSeconds),
            }),
          );
          return;
        }
        this.toasts.show({
          variant: 'danger',
          title: this.i18n.t('identity.verify.errors.failed'),
          action: { label: this.i18n.t('identity.signOut.failed.retry'), run: () => this.resend() },
        });
      },
    });
  }
}
