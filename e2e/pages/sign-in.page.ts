import { type Locator, type Page } from '@playwright/test';
import { waitForApp } from './app';

/** Sign-in page at `/sign-in` (docs/mocks/pages/sign-in). */
export class SignInPage {
  readonly title: Locator;
  readonly email: Locator;
  readonly password: Locator;
  readonly submit: Locator;
  readonly errorSummary: Locator;
  readonly alert: Locator;
  readonly forgotPassword: Locator;
  readonly signInAgain: Locator;

  constructor(private readonly page: Page) {
    const main = page.getByRole('main');
    this.title = main.locator('.auth__title');
    this.email = main.getByLabel('E-mail');
    this.password = main.getByLabel('Password');
    this.submit = main.getByRole('button', { name: /^(Sign in|Try again|Signing in…)$/ });
    this.errorSummary = main.locator('.form-summary');
    this.alert = main.locator('.alert');
    this.forgotPassword = main.getByRole('link', { name: 'Forgot your password?' });
    this.signInAgain = main.getByRole('link', { name: 'Sign in again' });
  }

  async open(returnTo?: string): Promise<void> {
    const query = returnTo === undefined ? '' : `?returnTo=${encodeURIComponent(returnTo)}`;
    await this.page.goto(`/sign-in${query}`);
    await waitForApp(this.page);
  }

  async signIn(email: string, password: string): Promise<void> {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
  }

  summaryErrors(): Promise<string[]> {
    return this.errorSummary
      .locator('li')
      .allTextContents()
      .then((items) => items.map((i) => i.trim()));
  }

  /** Counts sign-in requests that leave the browser from now on. */
  countSignInRequests(): () => number {
    let count = 0;
    this.page.on('request', (request) => {
      if (request.method() === 'POST' && request.url().endsWith('/api/v1/session')) count++;
    });
    return () => count;
  }

  /** Answers the next sign-in with 429 and the given Retry-After. */
  async throttleNextAttempt(retryAfterSeconds: number): Promise<void> {
    await this.page.route('**/api/v1/session', (route) =>
      route.request().method() === 'POST'
        ? route.fulfill({
            status: 429,
            headers: { 'Retry-After': String(retryAfterSeconds) },
            json: { code: 'too_many_attempts' },
          })
        : route.continue(),
    );
  }

  path(): string {
    return new URL(this.page.url()).pathname;
  }
}
