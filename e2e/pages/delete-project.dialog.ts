import { type Locator, type Page } from '@playwright/test';

/** The delete-project dialog over a project's edit page (docs/mocks/dialogs/delete-project). */
export class DeleteProjectDialog {
  readonly dialog: Locator;
  readonly description: Locator;
  readonly consequences: Locator;
  readonly confirmName: Locator;
  readonly mismatch: Locator;
  readonly confirm: Locator;
  readonly keep: Locator;
  readonly alert: Locator;

  constructor(private readonly page: Page) {
    this.dialog = page.getByRole('dialog', { name: /^Delete .+\?$/ });
    this.description = this.dialog.locator('.dialog__body > p').first();
    this.consequences = this.dialog.getByRole('listitem');
    this.confirmName = this.dialog.getByLabel('Type the project name to confirm');
    this.mismatch = this.dialog.locator('.field__error');
    this.confirm = this.dialog.getByRole('button', { name: /^(Delete project|Deleting…|Try again)$/ });
    this.keep = this.dialog.getByRole('button', { name: 'Keep project' });
    this.alert = this.dialog.locator('.alert--danger');
  }

  /** Answers the next delete with a server fault. */
  async failNextDelete(): Promise<void> {
    let failed = false;
    await this.page.route('**/api/v1/projects/*', (route) => {
      if (route.request().method() !== 'DELETE' || failed) return route.continue();
      failed = true;
      return route.fulfill({ status: 500, json: {} });
    });
  }

  /** Holds the next delete until released, so the busy state can be seen. */
  async holdDelete(): Promise<() => void> {
    let release!: () => void;
    const released = new Promise<void>((r) => (release = r));
    let held = false;
    await this.page.route('**/api/v1/projects/*', async (route) => {
      if (route.request().method() !== 'DELETE' || held) return route.continue();
      held = true;
      await released;
      return route.continue();
    });
    return release;
  }
}
