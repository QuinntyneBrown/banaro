import { type Locator, type Page } from '@playwright/test';

/** The give-feedback dialog over a project's page (docs/mocks/dialogs/give-feedback). */
export class GiveFeedbackDialog {
  readonly dialog: Locator;
  readonly description: Locator;
  readonly comment: Locator;
  readonly error: Locator;
  readonly post: Locator;
  readonly cancel: Locator;
  readonly alert: Locator;

  constructor(private readonly page: Page) {
    this.dialog = page.getByRole('dialog', { name: /^Give feedback on / });
    this.description = this.dialog.locator('.dialog__body > p').first();
    this.comment = this.dialog.getByLabel('Your feedback');
    this.error = this.dialog.locator('.field__error');
    this.post = this.dialog.getByRole('button', { name: /^(Post feedback|Posting…|Try again)$/ });
    this.cancel = this.dialog.getByRole('button', { name: 'Cancel' });
    this.alert = this.dialog.locator('.alert--danger');
  }

  /** Answers the next post with this status (and a Retry-After when it is 429), once. */
  async failNextPost(status = 500): Promise<void> {
    let failed = false;
    await this.page.route('**/api/v1/projects/*/feedback', (route) => {
      if (route.request().method() !== 'POST' || failed) return route.continue();
      failed = true;
      return route.fulfill({
        status,
        headers: status === 429 ? { 'Retry-After': '600' } : {},
        json: status === 403 ? { code: 'feedback_not_allowed' } : {},
      });
    });
  }

  /** Holds the next post until released, so the busy state can be seen. */
  async holdPost(): Promise<() => void> {
    let release!: () => void;
    const released = new Promise<void>((r) => (release = r));
    let held = false;
    await this.page.route('**/api/v1/projects/*/feedback', async (route) => {
      if (route.request().method() !== 'POST' || held) return route.continue();
      held = true;
      await released;
      return route.continue();
    });
    return release;
  }
}
