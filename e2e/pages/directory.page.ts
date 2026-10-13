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

  /** The filter panel: the sidebar at 992 px and wider, the bottom sheet below. */
  filters(): DirectoryFilters {
    return new DirectoryFilters(
      this.page.getByRole('main').locator('aside.filters').or(this.page.getByRole('dialog', { name: 'Filters' })),
    );
  }

  get filtersButton(): Locator {
    return this.page.getByRole('main').getByRole('button', { name: 'Filters' });
  }

  get filterSheet(): Locator {
    return this.page.getByRole('dialog', { name: 'Filters' });
  }

  get activeFilters(): Locator {
    return this.page.getByRole('main').getByRole('list', { name: 'Active filters' }).getByRole('button');
  }

  get clearAll(): Locator {
    return this.page.getByRole('main').locator('.cluster').getByRole('button', { name: 'Clear all' });
  }

  get noResults(): Locator {
    return this.page.getByRole('main').locator('.empty__title');
  }

  get clearAllFilters(): Locator {
    return this.page.getByRole('main').getByRole('button', { name: 'Clear all filters' });
  }

  get widen(): Locator {
    return this.page.getByRole('main').getByRole('button', { name: /^Search (within \d+ km|anywhere in the GTA)$/ });
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

/** The filter groups, in the sidebar or the sheet. */
export class DirectoryFilters {
  readonly groups: Locator;
  readonly apply: Locator;

  constructor(readonly root: Locator) {
    this.groups = root.locator('fieldset');
    this.apply = root.getByRole('button', { name: /^Apply/ });
  }

  group(legend: 'Role' | 'Open to' | 'Neighbourhood or city' | 'Distance' | 'Popular skills'): Locator {
    return this.root.getByRole('group', { name: legend });
  }

  /** A checkbox or radio option, named by its label and count ("Engineers 2"). */
  option(
    legend: 'Role' | 'Open to' | 'Neighbourhood or city' | 'Distance',
    label: string,
  ): Locator {
    return this.group(legend).getByRole(legend === 'Distance' ? 'radio' : 'checkbox', {
      name: new RegExp(`^${label}( \\d+)?$`),
    });
  }

  skill(name: string): Locator {
    return this.group('Popular skills').getByRole('button', { name: new RegExp(`^${name}`) });
  }

  /** The count beside an option, as text. */
  count(legend: 'Role' | 'Open to' | 'Neighbourhood or city', label: string): Locator {
    return this.group(legend).locator('.check', { hasText: label }).locator('.check__count');
  }
}
