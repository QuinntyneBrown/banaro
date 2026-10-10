import { type Locator, type Page } from '@playwright/test';
import { waitForApp } from './app';

/** Reset-password page at `/reset-password` (docs/mocks/pages/reset-password). */
export class ResetPasswordPage {
  readonly title: Locator;
  readonly sub: Locator;
  readonly password: Locator;
  readonly confirm: Locator;
  readonly submit: Locator;
  readonly errorSummary: Locator;
  readonly sendNewLink: Locator;
  readonly signIn: Locator;

  constructor(private readonly page: Page) {
    const main = page.getByRole('main');
    this.title = main.locator('.auth__title');
    this.sub = main.locator('.auth__sub');
    this.password = main.getByLabel('New password', { exact: true });
    this.confirm = main.getByLabel('Confirm new password');
    this.submit = main.getByRole('button', { name: /^(Update password|Updating…)$/ });
    this.errorSummary = main.locator('.form-summary');
    this.sendNewLink = main.getByRole('link', { name: 'Send a new link' });
    this.signIn = main.getByRole('link', { name: 'Sign in', exact: true });
  }

  async open(link: string): Promise<void> {
    await this.page.goto(link);
    await waitForApp(this.page);
  }

  async choose(password: string, confirmation = password): Promise<void> {
    await this.password.fill(password);
    await this.confirm.fill(confirmation);
    await this.submit.click();
  }

  summaryErrors(): Promise<string[]> {
    return this.errorSummary
      .locator('li')
      .allTextContents()
      .then((items) => items.map((i) => i.trim()));
  }
}
