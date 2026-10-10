import { type Locator, type Page } from '@playwright/test';
import { waitForApp } from './app';

/** The not-found, forbidden and server-error pages (docs/mocks/pages/{not-found,forbidden,server-error}). */
export class ErrorPage {
  readonly code: Locator;
  readonly title: Locator;
  readonly headings: Locator;
  readonly search: Locator;
  readonly referenceId: Locator;
  readonly robots: Locator;

  constructor(private readonly page: Page) {
    const main = page.getByRole('main');
    this.code = main.locator('.error-page__code');
    this.title = main.locator('.error-page__title');
    this.headings = page.locator('h1');
    this.search = main.getByRole('search').getByLabel('Search builders');
    this.referenceId = main.locator('.error-page__reference code');
    this.robots = page.locator('meta[name="robots"]');
  }

  async open(path: string): Promise<number | undefined> {
    const response = await this.page.goto(path);
    await waitForApp(this.page);
    return response?.status();
  }

  action(name: string): Locator {
    return this.page.getByRole('main').getByRole('link', { name }).or(this.page.getByRole('main').getByRole('button', { name }));
  }

  async searchFor(query: string): Promise<void> {
    await this.search.fill(query);
    await this.page.getByRole('main').getByRole('search').getByRole('button', { name: 'Search' }).click();
  }

  /** Makes the next browser task throw an error that the application did not handle. */
  async throwUnhandledError(): Promise<void> {
    await this.page.evaluate(() => {
      setTimeout(() => {
        throw new Error('Unhandled test error');
      });
    });
  }
}
