import { type Locator, type Page } from '@playwright/test';
import { waitForApp } from './app';

/** Settings at `/settings/*` (docs/mocks/pages/settings), with its section navigation. */
export class SettingsPage {
  readonly title: Locator;
  readonly nav: Locator;
  readonly currentSection: Locator;
  readonly sectionTitle: Locator;
  readonly save: Locator;
  readonly saved: Locator;
  readonly failed: Locator;
  readonly loadError: Locator;
  readonly tryAgain: Locator;

  constructor(private readonly page: Page) {
    const main = page.getByRole('main');
    this.title = main.locator('.page-head__title');
    this.nav = main.getByRole('navigation', { name: 'Settings' });
    this.currentSection = this.nav.locator('[aria-current="page"]');
    this.sectionTitle = main.locator('section h2').first();
    this.save = main.getByRole('button', { name: /^(Save changes|Saving…)$/ });
    this.saved = main.locator('.alert--success');
    this.failed = main.locator('.alert--danger');
    this.loadError = main.locator('.empty__title');
    this.tryAgain = main.getByRole('button', { name: 'Try again' });
  }

  async openPrivacy(): Promise<void> {
    await this.page.goto('/settings/privacy');
    await waitForApp(this.page);
  }

  /** A radio option of the privacy section, by its title. */
  choice(title: string): Locator {
    return this.page.getByRole('main').getByRole('radio', { name: new RegExp(`^${title}`) });
  }

  /** A switch of the privacy section, by its title. */
  switch(title: string): Locator {
    return this.page.getByRole('main').getByRole('switch', { name: title });
  }

  /** Answers the next privacy save with a server fault. */
  async failNextSave(): Promise<void> {
    let failed = false;
    await this.page.route('**/api/v1/settings/privacy', (route) => {
      if (route.request().method() !== 'PUT' || failed) return route.continue();
      failed = true;
      return route.fulfill({ status: 500, json: {} });
    });
  }
}
