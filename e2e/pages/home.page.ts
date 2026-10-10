import { type Locator, type Page } from '@playwright/test';
import { waitForApp } from './app';

/** Public home page at `/` (docs/mocks/pages/home). */
export class HomePage {
  readonly headline: Locator;
  readonly lead: Locator;
  readonly joinAction: Locator;
  readonly browseAction: Locator;
  readonly areas: Locator;
  readonly testimonial: Locator;
  readonly verse: Locator;
  readonly matchingInvitation: Locator;
  readonly footer: Locator;

  constructor(private readonly page: Page) {
    const hero = page.locator('.hero');
    this.headline = hero.getByRole('heading', { level: 1 });
    this.lead = hero.locator('.hero__lead');
    this.joinAction = hero.locator('.hero__actions').getByRole('link', { name: 'Join Banaro' });
    this.browseAction = hero.locator('.hero__actions').getByRole('link', { name: 'Browse builders' });
    this.areas = page.locator('.areas .area__title');
    this.testimonial = page.locator('.quote__text');
    this.verse = page.locator('.verse__text');
    this.matchingInvitation = page.locator('.match');
    this.footer = page.getByRole('contentinfo');
  }

  async open(): Promise<void> {
    await this.page.goto('/');
    await waitForApp(this.page);
  }

  areaTitles(): Promise<string[]> {
    return this.areas.allTextContents();
  }

  /** Number of distinct columns the four area cards occupy. */
  async areaColumns(): Promise<number> {
    const lefts = await this.page.locator('.areas > li').evaluateAll((items) =>
      items.map((item) => Math.round(item.getBoundingClientRect().left)),
    );
    return new Set(lefts).size;
  }

  footerLink(name: string): Locator {
    return this.footer.getByRole('link', { name });
  }

  startMatching(): Locator {
    return this.matchingInvitation.getByRole('link', { name: 'Start matching' });
  }
}
