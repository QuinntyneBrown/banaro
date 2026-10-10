import { type Locator, type Page } from '@playwright/test';
import { waitForApp } from './app';

export interface JoinDetails {
  name?: string;
  email?: string;
  password?: string;
  agree?: boolean;
}

/** Join page at `/join` (docs/mocks/pages/join). */
export class JoinPage {
  readonly title: Locator;
  readonly name: Locator;
  readonly email: Locator;
  readonly password: Locator;
  readonly agree: Locator;
  readonly codeOfConductLink: Locator;
  readonly submit: Locator;
  readonly errorSummary: Locator;
  readonly alert: Locator;
  readonly confirmedAction: Locator;
  readonly resendAction: Locator;

  constructor(private readonly page: Page) {
    const main = page.getByRole('main');
    this.title = main.locator('.auth__title');
    this.name = main.getByLabel('Full name');
    this.email = main.getByLabel('E-mail');
    this.password = main.getByLabel('Password');
    this.agree = main.getByRole('checkbox');
    this.codeOfConductLink = main.getByRole('link', { name: 'code of conduct (opens in a new tab)' });
    this.submit = main.getByRole('button', { name: /Join Banaro|Creating your account/ });
    this.errorSummary = main.locator('.form-summary');
    this.alert = main.locator('.alert');
    this.confirmedAction = main.getByRole('link', { name: 'I have confirmed my e-mail' });
    this.resendAction = main.getByRole('button', { name: 'Send the link again' });
  }

  async open(): Promise<void> {
    await this.page.goto('/join');
    await waitForApp(this.page);
  }

  async fill(details: JoinDetails): Promise<void> {
    if (details.name !== undefined) await this.name.fill(details.name);
    if (details.email !== undefined) await this.email.fill(details.email);
    if (details.password !== undefined) await this.password.fill(details.password);
    if (details.agree) await this.agree.check();
  }

  summaryErrors(): Promise<string[]> {
    return this.errorSummary.locator('li').allTextContents().then((items) => items.map((i) => i.trim()));
  }

  /** Holds the next join request until the returned function is called. */
  async holdSubmission(): Promise<() => void> {
    let release!: () => void;
    const released = new Promise<void>((r) => (release = r));
    await this.page.route('**/api/v1/join', async (route) => {
      await released;
      await route.continue();
    });
    return release;
  }
}
