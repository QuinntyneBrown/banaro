import { type Locator, type Page } from '@playwright/test';
import { waitForApp } from './app';

/** Edit profile at `/profile/edit` (docs/mocks/pages/profile-edit). */
export class ProfileEditPage {
  readonly title: Locator;
  readonly skeleton: Locator;
  readonly errorTitle: Locator;
  readonly tryAgain: Locator;
  readonly errorSummary: Locator;
  readonly saved: Locator;
  readonly alert: Locator;
  readonly name: Locator;
  readonly headline: Locator;
  readonly neighbourhood: Locator;
  readonly bio: Locator;
  readonly bioCounter: Locator;
  readonly skills: Locator;
  readonly skillInput: Locator;
  readonly addSkill: Locator;
  readonly lookingFor: Locator;
  readonly addExperience: Locator;
  readonly addLink: Locator;
  readonly save: Locator;
  readonly cancel: Locator;

  constructor(private readonly page: Page) {
    const main = page.getByRole('main');
    this.title = main.locator('.page-head__title');
    this.skeleton = main.locator('.skeleton');
    this.errorTitle = main.locator('.empty__title');
    this.tryAgain = main.getByRole('button', { name: 'Try again' });
    this.errorSummary = main.locator('.form-summary');
    this.saved = main.locator('.alert--success');
    this.alert = main.locator('.alert--danger');
    this.name = main.getByLabel('Full name');
    this.headline = main.getByLabel('Role', { exact: true });
    this.neighbourhood = main.getByLabel('Neighbourhood', { exact: true });
    this.bio = main.getByLabel('Bio');
    this.bioCounter = main.locator('.field__counter');
    this.skills = main.getByRole('list', { name: 'Your skills' }).getByRole('listitem');
    this.skillInput = main.getByLabel('Skills', { exact: true });
    this.addSkill = main.getByRole('button', { name: 'Add', exact: true });
    this.lookingFor = main.getByLabel(/What I am looking for/);
    this.addExperience = main.getByRole('button', { name: 'Add a role' });
    this.addLink = main.getByRole('button', { name: 'Add a link' });
    this.save = main.getByRole('button', { name: /^(Save changes|Saving…)$/ });
    this.cancel = main.getByRole('link', { name: 'Cancel' }).or(main.getByRole('button', { name: 'Cancel' }));
  }

  async open(): Promise<void> {
    await this.page.goto('/profile/edit');
    await waitForApp(this.page);
  }

  openTo(choice: 'Co-founding' | 'Advising' | 'Contributing'): Locator {
    return this.page.getByRole('main').getByRole('checkbox', { name: new RegExp(`^${choice}`) });
  }

  removeSkill(name: string): Locator {
    return this.page.getByRole('main').getByRole('button', { name: `Remove skill: ${name}` });
  }

  experienceField(index: number, label: 'Role title' | 'Organisation' | 'Started' | 'Ended'): Locator {
    return this.page.getByRole('main').getByRole('group', { name: `Role ${index + 1}` }).getByLabel(label);
  }

  linkField(index: number, label: 'Link name' | 'Web address'): Locator {
    return this.page.getByRole('main').getByRole('group', { name: `Link ${index + 1}` }).getByLabel(label);
  }

  summaryErrors(): Promise<string[]> {
    return this.errorSummary
      .locator('li')
      .allTextContents()
      .then((items) => items.map((i) => i.trim()));
  }

  /** Holds the next request matching `method` on the own-profile endpoint until released. */
  async hold(method: 'GET' | 'PUT'): Promise<() => void> {
    let release!: () => void;
    const released = new Promise<void>((r) => (release = r));
    await this.page.route('**/api/v1/me/profile', async (route) => {
      if (route.request().method() !== method) return route.continue();
      await released;
      await route.continue();
    });
    return release;
  }

  /** Answers the next request matching `method` with a server error. */
  async failNext(method: 'GET' | 'PUT'): Promise<void> {
    let failed = false;
    await this.page.route('**/api/v1/me/profile', (route) => {
      if (route.request().method() !== method || failed) return route.continue();
      failed = true;
      return route.fulfill({ status: 500, json: { message: 'Server Error', requestId: 'test' } });
    });
  }
}
