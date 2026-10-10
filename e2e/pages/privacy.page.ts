import { type Locator, type Page } from '@playwright/test';

/** Privacy policy at `/privacy` (docs/mocks/pages/privacy). */
export class PrivacyPage {
  readonly title: Locator;
  readonly lastUpdated: Locator;
  readonly sections: Locator;
  readonly body: Locator;

  constructor(private readonly page: Page) {
    const main = page.getByRole('main');
    this.title = main.locator('.page-head__title');
    this.lastUpdated = main.locator('.page-head__sub time');
    this.sections = main.locator('.prose h2');
    this.body = main.locator('.prose');
  }

  async open(): Promise<void> {
    await this.page.goto('/privacy');
  }

  sectionTitles(): Promise<string[]> {
    return this.sections.allTextContents();
  }

  section(title: string): Locator {
    return this.page.locator('.prose h2', { hasText: title }).locator('xpath=following-sibling::*[1]');
  }
}
