import { type Locator, type Page } from '@playwright/test';
import { waitForApp } from './app';

/** One project's page at `/projects/{id}` (docs/mocks/pages/project-detail). */
export class ProjectPage {
  readonly breadcrumb: Locator;
  readonly title: Locator;
  readonly by: Locator;
  readonly ownerLink: Locator;
  readonly giveFeedback: Locator;
  readonly offerToHelp: Locator;
  readonly aboutTitle: Locator;
  readonly about: Locator;
  readonly feedbackTitle: Locator;
  readonly emptyFeedbackTitle: Locator;
  readonly glance: Locator;
  readonly externalLink: Locator;
  readonly builderCard: Locator;
  readonly notFoundTitle: Locator;
  readonly browseProjects: Locator;
  readonly shareProject: Locator;
  readonly errorTitle: Locator;
  readonly tryAgain: Locator;
  readonly backToProjects: Locator;
  readonly loading: Locator;

  constructor(private readonly page: Page) {
    const main = page.getByRole('main');
    this.breadcrumb = main.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('listitem');
    this.title = main.getByRole('heading', { level: 1 });
    this.by = main.locator('.proj-head__by');
    this.ownerLink = this.by.getByRole('link');
    this.giveFeedback = main.locator('.proj-head__actions').getByRole('link', { name: 'Give feedback' });
    this.offerToHelp = main.locator('.proj-head__actions').getByRole('link', { name: 'Offer to help' });
    this.aboutTitle = main.getByRole('heading', { level: 2, name: /^About / });
    this.about = main.locator('.prose p');
    this.feedbackTitle = main.locator('#fb-title');
    this.emptyFeedbackTitle = main.getByRole('heading', { name: 'Be the first to say something' });
    this.glance = main.getByRole('complementary', { name: 'About this project' });
    this.externalLink = this.glance.locator('a[rel~="noopener"]');
    this.builderCard = this.glance.locator('.aside-card').filter({ hasText: 'The builder' });
    this.notFoundTitle = main.getByRole('heading', { level: 1, name: "We couldn't find that project" });
    this.browseProjects = main.getByRole('link', { name: 'Browse projects' });
    this.shareProject = main.getByRole('link', { name: 'Share a project' });
    this.errorTitle = main.getByRole('heading', { name: "We couldn't load this project" });
    this.tryAgain = main.getByRole('button', { name: 'Try again' });
    this.backToProjects = main.getByRole('link', { name: 'Back to projects' });
    this.loading = main.locator('[aria-busy="true"]');
  }

  /** The value of one "At a glance" fact. */
  fact(term: 'Stage' | 'Looking for' | 'Updated' | 'Shared'): Locator {
    return this.glance
      .locator('.facts > div')
      .filter({ has: this.page.locator('dt', { hasText: term }) })
      .locator('dd');
  }

  async open(id: string): Promise<void> {
    await this.page.goto(`/projects/${id}`);
    await waitForApp(this.page);
  }

  /** Answers project requests with a server error until `restore()`. */
  async failLoading(): Promise<void> {
    await this.page.route('**/api/v1/projects/*', (route) => route.fulfill({ status: 500, json: {} }));
  }

  /** Holds the next project request until released, so the loading state can be seen. */
  async holdLoading(): Promise<() => void> {
    let release!: () => void;
    const released = new Promise<void>((r) => (release = r));
    let held = false;
    await this.page.route('**/api/v1/projects/*', async (route) => {
      if (held) return route.continue();
      held = true;
      await released;
      return route.continue();
    });
    return release;
  }

  async restore(): Promise<void> {
    await this.page.unroute('**/api/v1/projects/*');
  }
}
