import { type Locator, type Page } from '@playwright/test';
import { resolve } from 'node:path';

const files = resolve(import.meta.dirname, '../fixtures/files');

/** Fixture files in e2e/fixtures/files. */
export type PhotoFile = 'amara-harvest-day.jpg' | 'small-photo.jpg' | 'team-offsite.heic';

/** The change-photo dialog over the profile edit page (docs/mocks/dialogs/change-photo). */
export class ChangePhotoDialog {
  readonly dialog: Locator;
  readonly description: Locator;
  readonly dropzone: Locator;
  readonly fileInput: Locator;
  readonly choose: Locator;
  readonly fileName: Locator;
  readonly fileSize: Locator;
  readonly preview: Locator;
  readonly progress: Locator;
  readonly error: Locator;
  readonly alert: Locator;
  readonly save: Locator;
  readonly cancel: Locator;
  readonly close: Locator;
  readonly removePhoto: Locator;

  constructor(private readonly page: Page) {
    this.dialog = page.getByRole('dialog', { name: 'Change your photo' });
    this.description = this.dialog.locator('.dialog__body > p').first();
    this.dropzone = this.dialog.getByRole('group', { name: 'New photo' });
    this.fileInput = this.dialog.locator('input[type=file]');
    this.choose = this.dialog.locator('label.btn');
    this.fileName = this.dialog.locator('.dropzone__file .rows__title');
    this.fileSize = this.dialog.locator('.dropzone__file .rows__meta');
    this.preview = this.dialog.getByRole('img', { name: 'Preview of your new photo' });
    this.progress = this.dialog.getByRole('progressbar', { name: 'Uploading photo' });
    this.error = this.dialog.locator('.field__error');
    this.alert = this.dialog.locator('.alert--danger');
    this.save = this.dialog.getByRole('button', { name: /^(Save photo|Uploading…|Try again)$/ });
    this.cancel = this.dialog.getByRole('button', { name: 'Cancel' });
    this.close = this.dialog.getByRole('button', { name: 'Close dialog' });
    this.removePhoto = this.dialog.getByRole('button', { name: 'Remove photo' });
  }

  async choosePhoto(file: PhotoFile): Promise<void> {
    await this.fileInput.setInputFiles(resolve(files, file));
  }

  /**
   * Holds the next upload so the busy state can be seen. The returned release lets it through and
   * resolves once the API has accepted it.
   */
  async holdUpload(): Promise<() => Promise<void>> {
    let release!: () => void;
    const released = new Promise<void>((r) => (release = r));
    let held = false;
    await this.page.route('**/api/v1/me/photo', async (route) => {
      if (route.request().method() !== 'POST' || held) return route.continue();
      held = true;
      await released;
      return route.continue();
    });
    return async () => {
      const accepted = this.page.waitForResponse(
        (response) => response.url().endsWith('/api/v1/me/photo') && response.request().method() === 'POST',
      );
      release();
      await accepted;
    };
  }

  /** Saves and waits until the API has accepted the upload, so the scan can run. */
  async saveAndWaitForUpload(): Promise<void> {
    const accepted = this.page.waitForResponse(
      (response) => response.url().endsWith('/api/v1/me/photo') && response.request().method() === 'POST',
    );
    await this.save.click();
    await accepted;
  }

  /** Answers the next upload with a server fault. */
  async failNextUpload(): Promise<void> {
    let failed = false;
    await this.page.route('**/api/v1/me/photo', (route) => {
      if (route.request().method() !== 'POST' || failed) return route.continue();
      failed = true;
      return route.fulfill({ status: 503, json: { message: 'Service unavailable' } });
    });
  }

  /** Reports every progress check as the scanner having rejected the photo. */
  async rejectScan(): Promise<void> {
    await this.page.route('**/api/v1/me/photo/*', (route) =>
      route.request().method() === 'GET'
        ? route.fulfill({ json: { id: route.request().url().split('/').pop(), status: 'rejected', url: null } })
        : route.continue(),
    );
  }
}
