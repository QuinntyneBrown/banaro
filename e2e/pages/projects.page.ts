import { type Locator, type Page } from '@playwright/test';
import { waitForApp } from './app';

/** One project card in the list (docs/mocks/pages/projects). */
export class ProjectCardLocator {
  readonly name: Locator;
  readonly nameLink: Locator;
  readonly owner: Locator;
  readonly line: Locator;
  readonly mark: Locator;

  constructor(readonly root: Locator) {
    this.name = root.locator('.project__name');
    this.nameLink = root.locator('.project__name a');
    this.owner = root.locator('.project__owner');
    this.line = root.locator('.project__line');
    this.mark = root.locator('.project__mark');
  }

  /** The value of one fact: "Stage", "Looking for" or "Feedback". */
  fact(term: 'Stage' | 'Looking for' | 'Feedback'): Locator {
    return this.root.locator('.project__facts div').filter({ has: this.root.page().locator('dt', { hasText: term }) }).locator('dd');
  }
}

/** The project showcase at `/projects`. */
export class ProjectsPage {
  readonly title: Locator;
  readonly search: Locator;
  readonly searchButton: Locator;
  readonly stage: Locator;
  readonly lookingFor: Locator;
  readonly count: Locator;
  readonly cards: Locator;
  readonly skeletons: Locator;
  readonly showMore: Locator;
  readonly pagerText: Locator;
  readonly activeFilters: Locator;
  readonly noResultsTitle: Locator;
  readonly clearFilters: Locator;
  readonly shareProject: Locator;
  readonly errorTitle: Locator;
  readonly tryAgain: Locator;
  readonly browseBuilders: Locator;

  constructor(private readonly page: Page) {
    const main = page.getByRole('main');
    this.title = main.getByRole('heading', { level: 1 });
    this.search = main.getByLabel('Search projects');
    this.searchButton = main.getByRole('button', { name: 'Search', exact: true });
    // A select's accessible name is its label text plus whitespace, so a substring match finds it.
    this.stage = main.getByRole('combobox', { name: 'Stage' });
    this.lookingFor = main.getByRole('combobox', { name: 'Looking for' });
    this.count = main.locator('.proj-toolbar__count');
    this.cards = main.locator('li.project');
    this.skeletons = main.locator('.skeleton-card');
    this.showMore = main.getByRole('button', { name: 'Show more projects' });
    this.pagerText = main.locator('.pager__text');
    this.activeFilters = main.getByRole('list', { name: 'Active filters' }).locator('button.chip');
    this.noResultsTitle = main.getByRole('heading', { name: 'No projects match those filters' });
    // The toolbar and the no-results block both offer it; either one clears the filters.
    this.clearFilters = main.getByRole('button', { name: 'Clear filters' }).first();
    this.shareProject = main.getByRole('link', { name: 'Share a project' }).last();
    this.errorTitle = main.getByRole('heading', { name: "We couldn't load the projects" });
    this.tryAgain = main.getByRole('button', { name: 'Try again' });
    this.browseBuilders = main.getByRole('link', { name: 'Browse builders' });
  }

  async open(query = ''): Promise<void> {
    await this.page.goto(`/projects${query}`);
    await waitForApp(this.page);
  }

  card(name: string): ProjectCardLocator {
    return new ProjectCardLocator(this.cards.filter({ has: this.page.locator('.project__name', { hasText: name }) }));
  }

  async cardNames(): Promise<string[]> {
    return (await this.cards.locator('.project__name').allTextContents()).map((n) => n.trim());
  }

  /** Holds the next list request until released, so the loading state can be seen. */
  async holdResults(): Promise<() => void> {
    let release!: () => void;
    const released = new Promise<void>((r) => (release = r));
    let held = false;
    await this.page.route('**/api/v1/projects?**', async (route) => {
      if (held) return route.continue();
      held = true;
      await released;
      return route.continue();
    });
    return release;
  }

  /** Answers list requests with a server error until `restoreResults()`. */
  async failResults(): Promise<void> {
    await this.page.route('**/api/v1/projects?**', (route) => route.fulfill({ status: 500, json: {} }));
  }

  async restoreResults(): Promise<void> {
    await this.page.unroute('**/api/v1/projects?**');
  }
}
