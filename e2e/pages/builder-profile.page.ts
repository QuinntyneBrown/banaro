import { type Locator, type Page } from '@playwright/test';
import { waitForApp } from './app';

/** A builder's profile at `/builders/{id}` (docs/mocks/pages/builder-profile). */
export class BuilderProfilePage {
  readonly breadcrumb: Locator;
  readonly name: Locator;
  readonly role: Locator;
  readonly place: Locator;
  readonly status: Locator;
  readonly photo: Locator;
  readonly initials: Locator;
  readonly about: Locator;
  readonly skills: Locator;
  readonly experience: Locator;
  readonly building: Locator;
  readonly match: Locator;
  readonly matchReasons: Locator;
  readonly glance: Locator;
  readonly editProfile: Locator;
  readonly whoCanSee: Locator;
  readonly sayHello: Locator;
  readonly more: Locator;
  readonly notFoundTitle: Locator;
  readonly browseBuilders: Locator;
  readonly errorTitle: Locator;
  readonly tryAgain: Locator;
  readonly skeleton: Locator;

  constructor(private readonly page: Page) {
    const main = page.getByRole('main');
    this.breadcrumb = main.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('listitem');
    this.name = main.locator('.profile-head__name');
    this.role = main.locator('.profile-head__role');
    this.place = main.locator('.profile-head .card__place');
    this.status = main.locator('.profile-head .status');
    this.photo = main.locator('.profile-head__photo');
    this.initials = main.locator('.profile-head__initials');
    this.about = main.getByRole('region', { name: 'About' });
    this.skills = main.getByRole('region', { name: 'Skills' }).getByRole('listitem');
    this.experience = main.getByRole('region', { name: 'Experience' }).getByRole('listitem');
    this.building = main.getByRole('region', { name: /building$/ });
    this.match = main.locator('.card__match');
    this.matchReasons = main.locator('.match-reasons');
    this.glance = main.locator('.facts');
    this.editProfile = main.getByRole('link', { name: 'Edit profile' });
    this.whoCanSee = main.getByRole('link', { name: 'Who can see this' });
    this.sayHello = main.getByRole('button', { name: 'Say hello' }).or(main.getByRole('link', { name: 'Say hello' }));
    this.more = main.getByRole('button', { name: 'More' });
    this.notFoundTitle = main.locator('.error-page__title');
    this.browseBuilders = main.getByRole('link', { name: 'Browse builders' });
    this.errorTitle = main.locator('.empty__title');
    this.tryAgain = main.getByRole('button', { name: 'Try again' });
    this.skeleton = main.locator('.skeleton');
  }

  async open(id: string): Promise<void> {
    await this.page.goto(`/builders/${id}`);
    await waitForApp(this.page);
  }

  /** The value of one "At a glance" fact. */
  fact(term: 'Open to' | 'Neighbourhood' | 'Distance' | 'Member since'): Locator {
    return this.glance.locator('div', { has: this.page.locator('dt', { hasText: term }) }).locator('dd');
  }

  /** Answers profile requests with a server error until `restore()`. */
  async failLoading(): Promise<void> {
    await this.page.route('**/api/v1/builders/*', (route) => route.fulfill({ status: 500, json: {} }));
  }

  async restore(): Promise<void> {
    await this.page.unroute('**/api/v1/builders/*');
  }
}
