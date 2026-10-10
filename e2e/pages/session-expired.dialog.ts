import { type BrowserContext, type Locator, type Page } from '@playwright/test';

/** The session-expired dialog over any member page (docs/mocks/dialogs/session-expired). */
export class SessionExpiredDialog {
  readonly dialog: Locator;
  readonly email: Locator;
  readonly password: Locator;
  readonly signBackIn: Locator;
  readonly signOut: Locator;
  readonly fieldError: Locator;
  readonly resetLink: Locator;
  readonly alert: Locator;

  constructor(private readonly page: Page) {
    this.dialog = page.getByRole('dialog', { name: 'Your session has expired' });
    this.email = this.dialog.getByLabel('E-mail');
    this.password = this.dialog.getByLabel('Password');
    this.signBackIn = this.dialog.getByRole('button', { name: /^(Sign back in|Signing in…|Try again)$/ });
    this.signOut = this.dialog.getByRole('button', { name: 'Sign out' });
    this.fieldError = this.dialog.locator('.field__error');
    this.resetLink = this.dialog.getByRole('link', { name: /reset it/ });
    this.alert = this.dialog.locator('.alert');
  }

  /** Ends the browser's session as an expiry would: the session cookie is gone. */
  static async expire(context: BrowserContext): Promise<void> {
    await context.clearCookies({ name: 'banaro_session' });
  }

  async signInWith(password: string): Promise<void> {
    await this.password.fill(password);
    await this.signBackIn.click();
  }

  /** Answers the next sign-in from the dialog with the given status. */
  async answerNextSignIn(status: number, headers: Record<string, string> = {}): Promise<void> {
    let answered = false;
    await this.page.route('**/api/v1/session', (route) => {
      if (route.request().method() !== 'POST' || answered) return route.continue();
      answered = true;
      return route.fulfill({ status, headers, json: { message: 'Error' } });
    });
  }
}
