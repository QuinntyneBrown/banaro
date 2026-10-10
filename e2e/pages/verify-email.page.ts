import { type Locator, type Page } from '@playwright/test';
import { waitForApp } from './app';

/** Verify-email page at `/verify-email` (docs/mocks/pages/verify-email). */
export class VerifyEmailPage {
  readonly title: Locator;
  readonly sub: Locator;
  readonly alert: Locator;
  readonly resend: Locator;
  readonly sendNewLink: Locator;
  readonly backToSignIn: Locator;
  readonly setUpProfile: Locator;

  constructor(private readonly page: Page) {
    const main = page.getByRole('main');
    this.title = main.locator('.auth__title');
    this.sub = main.locator('.auth__sub');
    this.alert = main.locator('.alert');
    this.resend = main.getByRole('button', { name: 'Send the link again' });
    this.sendNewLink = main.getByRole('button', { name: 'Send a new link' });
    this.backToSignIn = main.getByRole('link', { name: 'Back to sign in' });
    this.setUpProfile = main.getByRole('link', { name: 'Set up your profile' });
  }

  async open(link = '/verify-email'): Promise<void> {
    await this.page.goto(link);
    await waitForApp(this.page);
  }

  /** Answers the next resend with 429 and the given Retry-After. */
  async throttleNextResend(retryAfterSeconds: number): Promise<void> {
    await this.page.route('**/api/v1/email/verification-notification', (route) =>
      route.fulfill({
        status: 429,
        headers: { 'Retry-After': String(retryAfterSeconds) },
        json: { code: 'too_many_requests' },
      }),
    );
  }
}
