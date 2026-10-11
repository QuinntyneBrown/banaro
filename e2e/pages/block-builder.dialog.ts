import { type Locator, type Page } from '@playwright/test';

/** The block-builder dialog over a profile (docs/mocks/dialogs/block-builder). */
export class BlockBuilderDialog {
  readonly dialog: Locator;
  readonly description: Locator;
  readonly consequences: Locator;
  readonly confirm: Locator;
  readonly cancel: Locator;
  readonly alert: Locator;

  constructor(private readonly page: Page) {
    this.dialog = page.getByRole('dialog', { name: /^Block .+\?$/ });
    this.description = this.dialog.locator('.dialog__body > p').first();
    this.consequences = this.dialog.getByRole('listitem');
    this.confirm = this.dialog.getByRole('button', { name: /^(Block \S+|Blocking…|Try again)$/ });
    this.cancel = this.dialog.getByRole('button', { name: 'Cancel' });
    this.alert = this.dialog.locator('.alert--danger');
  }

  /** Answers the next block with a server fault. */
  async failNextBlock(): Promise<void> {
    let failed = false;
    await this.page.route('**/api/v1/blocks/*', (route) => {
      if (route.request().method() !== 'PUT' || failed) return route.continue();
      failed = true;
      return route.fulfill({ status: 500, json: {} });
    });
  }
}
