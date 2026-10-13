import { type Locator, type Page } from '@playwright/test';
import { waitForApp } from './app';

/** Code of conduct at `/code-of-conduct` (docs/mocks/pages/code-of-conduct). */
export class CodeOfConductPage {
  readonly title: Locator;
  readonly lastUpdated: Locator;
  readonly contents: Locator;
  readonly sections: Locator;
  readonly contactLink: Locator;

  constructor(private readonly page: Page) {
    const main = page.getByRole('main');
    this.title = main.locator('.page-head__title');
    this.lastUpdated = main.locator('.page-head__sub time');
    this.contents = main.getByRole('navigation', { name: 'On this page' });
    this.sections = main.locator('.prose h2');
    this.contactLink = main.locator('.prose').getByRole('link', { name: 'the contact page' });
  }

  async open(): Promise<number | undefined> {
    const response = await this.page.goto('/code-of-conduct');
    await waitForApp(this.page);
    return response?.status();
  }

  contentsEntries(): Promise<string[]> {
    return this.contents.getByRole('link').allTextContents().then((t) => t.map((s) => s.trim()));
  }

  async jumpTo(entry: string): Promise<void> {
    await this.contents.getByRole('link', { name: entry }).click();
  }

  section(title: string): Locator {
    return this.page.getByRole('main').locator('.prose h2', { hasText: title });
  }
}
