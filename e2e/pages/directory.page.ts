import { type Locator, type Page } from '@playwright/test';
import { waitForApp } from './app';

/** One builder card in the directory results. */
export class BuilderCard {
  readonly name: Locator;
  readonly role: Locator;
  readonly match: Locator;
  readonly place: Locator;
  readonly skills: Locator;
  readonly building: Locator;
  readonly openTo: Locator;
  readonly status: Locator;
  readonly initials: Locator;

  constructor(readonly root: Locator) {
    this.name = root.locator('.card__name a');
    this.role = root.locator('.card__role');
    this.match = root.locator('.card__match');
    this.place = root.locator('.card__place');
    this.skills = root.getByRole('list', { name: 'Skills' }).getByRole('listitem');
    this.building = root.locator('.card__facts div').filter({ hasText: 'Building' }).locator('dd');
    this.openTo = root.locator('.card__facts div').filter({ hasText: 'Open to' }).locator('dd');
    this.status = root.locator('.status');
    this.initials = root.locator('.card__initials');
  }
}

/** The builder directory at `/builders` (docs/mocks/pages/directory). */
export class DirectoryPage {
  readonly title: Locator;
  readonly sub: Locator;
  readonly search: Locator;
  readonly searchButton: Locator;
  readonly sort: Locator;
  readonly count: Locator;
  readonly cards: Locator;
  readonly skeletons: Locator;
  readonly more: Locator;
  readonly pagerText: Locator;
  readonly errorTitle: Locator;
  readonly tryAgain: Locator;

  constructor(private readonly page: Page) {
    const main = page.getByRole('main');
    this.title = main.locator('.page-head__title');
    this.sub = main.locator('.page-head__sub');
    this.search = main.getByRole('searchbox', { name: 'Search builders' });
    this.searchButton = main.getByRole('search').getByRole('button', { name: 'Search' });
    this.sort = main.getByLabel('Sort by');
    this.count = main.locator('.toolbar__count');
    this.cards = main.locator('ul.results > li > article.card');
    this.skeletons = main.locator('.skeleton-card');
    this.more = main.locator('.pager').getByRole('button');
    this.pagerText = main.locator('.pager__text');
    this.errorTitle = main.locator('.empty__title');
    this.tryAgain = main.getByRole('button', { name: 'Try again' });
  }

  async open(query = ''): Promise<void> {
    await this.page.goto(`/builders${query}`);
    await waitForApp(this.page);
  }

  card(name: string): BuilderCard {
    return new BuilderCard(this.cards.filter({ has: this.page.locator('.card__name', { hasText: name }) }));
  }

  async cardNames(): Promise<string[]> {
    return (await this.cards.locator('.card__name').allTextContents()).map((n) => n.trim());
  }

  async sortOptions(): Promise<string[]> {
    return (await this.sort.locator('option').allTextContents()).map((o) => o.trim());
  }

  /** Holds the next directory request until released, so the loading state can be seen. */
  async holdResults(): Promise<() => void> {
    let release!: () => void;
    const released = new Promise<void>((r) => (release = r));
    let held = false;
    await this.page.route('**/api/v1/builders?**', async (route) => {
      if (held) return route.continue();
      held = true;
      await released;
      return route.continue();
    });
    return release;
  }

  /** Answers directory requests with a server error until `restoreResults()`. */
  async failResults(): Promise<void> {
    await this.page.route('**/api/v1/builders?**', (route) => route.fulfill({ status: 500, json: {} }));
  }

  async restoreResults(): Promise<void> {
    await this.page.unroute('**/api/v1/builders?**');
  }
}
