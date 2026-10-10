import { type Locator, type Page } from '@playwright/test';
import { waitForApp } from './app';

export interface ContactMessage {
  name: string;
  email: string;
  topic: string;
  message: string;
}

/** Contact page at `/contact` (docs/mocks/pages/contact). */
export class ContactPage {
  readonly title: Locator;
  readonly name: Locator;
  readonly email: Locator;
  readonly topic: Locator;
  readonly message: Locator;
  readonly send: Locator;
  readonly errorSummary: Locator;
  readonly successAlert: Locator;

  constructor(private readonly page: Page) {
    const main = page.getByRole('main');
    this.title = main.locator('.page-head__title');
    this.name = main.getByLabel('Your name');
    this.email = main.getByLabel('E-mail');
    this.topic = main.getByLabel('Topic');
    this.message = main.getByLabel('Message', { exact: true });
    this.send = main.getByRole('button', { name: /Send message|Sending/ });
    this.errorSummary = main.locator('.form-summary');
    this.successAlert = main.locator('.alert--success');
  }

  async open(): Promise<void> {
    await this.page.goto('/contact');
    await waitForApp(this.page);
  }

  async fill(message: Partial<ContactMessage>): Promise<void> {
    if (message.name !== undefined) await this.name.fill(message.name);
    if (message.email !== undefined) await this.email.fill(message.email);
    if (message.topic !== undefined) await this.topic.selectOption({ label: message.topic });
    if (message.message !== undefined) await this.message.fill(message.message);
  }

  async submit(): Promise<void> {
    await this.send.click();
  }

  summaryErrors(): Promise<string[]> {
    return this.errorSummary.locator('li').allTextContents().then((items) => items.map((i) => i.trim()));
  }

  fieldError(field: Locator): Promise<string | null> {
    return field.evaluate((el) => {
      const id = el.getAttribute('aria-describedby');
      return id ? (document.getElementById(id)?.textContent?.trim() ?? null) : null;
    });
  }

  /** Holds the next contact submission until the returned function is called. */
  async holdSubmission(): Promise<() => Promise<void>> {
    let release!: () => void;
    const released = new Promise<void>((r) => (release = r));
    await this.page.route('**/api/v1/contact-messages', async (route) => {
      await released;
      await route.continue();
    });
    return async () => release();
  }
}
