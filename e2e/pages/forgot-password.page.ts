import { type Locator, type Page } from '@playwright/test';
import { waitForApp } from './app';

/** Forgot-password page at `/forgot-password` (docs/mocks/pages/forgot-password). */
export class ForgotPasswordPage {
  readonly title: Locator;
  readonly sub: Locator;
  readonly email: Locator;
  readonly submit: Locator;
  readonly sendAgain: Locator;
  readonly errorSummary: Locator;
  readonly alert: Locator;

  constructor(private readonly page: Page) {
    const main = page.getByRole('main');
    this.title = main.locator('.auth__title');
    this.sub = main.locator('.auth__sub');
    this.email = main.getByLabel('E-mail');
    this.submit = main.getByRole('button', { name: /^(Send reset link|Sending…)$/ });
    this.sendAgain = main.getByRole('button', { name: 'Send it again' });
    this.errorSummary = main.locator('.form-summary');
    this.alert = main.locator('.alert');
  }

  async open(): Promise<void> {
    await this.page.goto('/forgot-password');
    await waitForApp(this.page);
  }

  async request(email: string): Promise<void> {
    await this.email.fill(email);
    await this.submit.click();
  }

  /** Counts reset-link requests that leave the browser from now on. */
  countRequests(): () => number {
    let count = 0;
    this.page.on('request', (r) => {
      if (r.method() === 'POST' && r.url().endsWith('/api/v1/forgot-password')) count++;
    });
    return () => count;
  }

  async throttleNextRequest(retryAfterSeconds: number): Promise<void> {
    await this.page.route('**/api/v1/forgot-password', (route) =>
      route.fulfill({
        status: 429,
        headers: { 'Retry-After': String(retryAfterSeconds) },
        json: { message: 'Too Many Attempts.' },
      }),
    );
  }
}
