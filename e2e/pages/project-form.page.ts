import { type Locator, type Page } from '@playwright/test';
import { waitForApp } from './app';

/** Share a project at `/projects/new` and edit one at `/projects/{id}/edit` (docs/mocks/pages/project-new, project-edit). */
export class ProjectFormPage {
  readonly breadcrumb: Locator;
  readonly title: Locator;
  readonly name: Locator;
  readonly summary: Locator;
  readonly description: Locator;
  readonly stage: Locator;
  readonly link: Locator;
  readonly submit: Locator;
  readonly cancel: Locator;
  readonly errorSummary: Locator;
  readonly limit: Locator;
  readonly successTitle: Locator;
  readonly viewProject: Locator;
  readonly backToProjects: Locator;

  constructor(private readonly page: Page) {
    const main = page.getByRole('main');
    this.breadcrumb = main.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('listitem');
    this.title = main.locator('.page-head__title');
    this.name = main.getByLabel('Project name');
    this.summary = main.getByLabel('One-line summary');
    this.description = main.getByLabel(/^Description/);
    this.stage = main.getByLabel('Stage');
    this.link = main.getByLabel(/^Link/);
    this.submit = main.getByRole('button', { name: /^(Share project|Sharing…|Save changes|Saving…)$/ });
    this.cancel = main.getByRole('link', { name: 'Cancel' });
    this.errorSummary = main.locator('.form-summary');
    this.limit = main.locator('.alert--danger');
    this.successTitle = main.locator('.empty__title');
    this.viewProject = main.getByRole('link', { name: /^View / });
    this.backToProjects = main.getByRole('link', { name: 'Back to projects' });
  }

  async openNew(): Promise<void> {
    await this.page.goto('/projects/new');
    await waitForApp(this.page);
  }

  async openEdit(id: string): Promise<void> {
    await this.page.goto(`/projects/${id}/edit`);
    await waitForApp(this.page);
  }

  lookingFor(role: string): Locator {
    return this.page.getByRole('main').getByRole('group', { name: 'Who are you looking for?' }).getByRole('checkbox', { name: role });
  }

  /** The error under one field. */
  error(field: 'name' | 'summary' | 'description' | 'stage' | 'link'): Locator {
    return this.page.getByRole('main').locator(`#project-${field}-err`);
  }

  summaryErrors(): Promise<string[]> {
    return this.errorSummary
      .locator('li')
      .allTextContents()
      .then((items) => items.map((i) => i.trim()));
  }

  /** Holds the next save until released, so the submitting state can be seen. */
  async holdSave(): Promise<() => void> {
    let release!: () => void;
    const released = new Promise<void>((r) => (release = r));
    let held = false;
    await this.page.route('**/api/v1/projects**', async (route) => {
      const method = route.request().method();
      if ((method !== 'POST' && method !== 'PUT') || held) return route.continue();
      held = true;
      await released;
      return route.continue();
    });
    return release;
  }
}
