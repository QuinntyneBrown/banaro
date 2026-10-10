import { type Locator, type Page } from '@playwright/test';

/** About page at `/about` (docs/mocks/pages/about). */
export class AboutPage {
  readonly title: Locator;
  readonly sections: Locator;
  readonly joinAction: Locator;
  readonly contactAction: Locator;

  constructor(private readonly page: Page) {
    const main = page.getByRole('main');
    this.title = main.locator('.page-head__title');
    this.sections = main.locator('.prose h2');
    this.joinAction = main.getByRole('link', { name: 'Join Banaro' });
    this.contactAction = main.getByRole('link', { name: 'Contact us' });
  }

  async open(): Promise<void> {
    await this.page.goto('/about');
  }

  sectionTitles(): Promise<string[]> {
    return this.sections.allTextContents();
  }

  /** Text of the section under the given heading. */
  section(title: string): Locator {
    return this.page.locator('.prose h2', { hasText: title }).locator('xpath=following-sibling::*[1]');
  }
}
