import { type Locator, type Page } from '@playwright/test';

/** The offer-to-help dialog over a project's page (docs/mocks/dialogs/offer-to-help). */
export class OfferToHelpDialog {
  readonly dialog: Locator;
  readonly description: Locator;
  readonly role: Locator;
  readonly message: Locator;
  readonly roleError: Locator;
  readonly messageError: Locator;
  readonly send: Locator;
  readonly cancel: Locator;
  readonly alert: Locator;

  constructor(private readonly page: Page) {
    this.dialog = page.getByRole('dialog', { name: /^Offer to help with / });
    this.description = this.dialog.locator('.dialog__body > p').first();
    this.role = this.dialog.getByRole('combobox', { name: 'How could you help?' });
    this.message = this.dialog.getByLabel('Message');
    this.roleError = this.dialog.locator('#oh-role-err');
    this.messageError = this.dialog.locator('#oh-msg-err');
    this.send = this.dialog.getByRole('button', { name: /^(Send offer|Sending…|Try again)$/ });
    this.cancel = this.dialog.getByRole('button', { name: 'Cancel' });
    this.alert = this.dialog.locator('.alert--danger');
  }

  /** The role choices, placeholder first. */
  async roleOptions(): Promise<string[]> {
    return (await this.role.locator('option').allTextContents()).map((o) => o.trim());
  }

  /** Answers the next send with this status once. */
  async failNextSend(status = 500): Promise<void> {
    let failed = false;
    await this.page.route('**/api/v1/projects/*/help-offers', (route) => {
      if (route.request().method() !== 'POST' || failed) return route.continue();
      failed = true;
      return route.fulfill({ status, json: {} });
    });
  }

  /** Holds the next send until released, so the busy state can be seen. */
  async holdSend(): Promise<() => void> {
    let release!: () => void;
    const released = new Promise<void>((r) => (release = r));
    let held = false;
    await this.page.route('**/api/v1/projects/*/help-offers', async (route) => {
      if (route.request().method() !== 'POST' || held) return route.continue();
      held = true;
      await released;
      return route.continue();
    });
    return release;
  }
}
