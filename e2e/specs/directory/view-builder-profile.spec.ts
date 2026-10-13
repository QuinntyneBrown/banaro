// Acceptance Test
// Traces to: L2-011
// Description:
// Given /builders/{id}, when a member opens another builder's profile, then it shows initials, name,
// role, neighbourhood and distance, match score with its reasons, skills, bio, experience, what they
// are building, open to and last-seen status. A profile with only the required fields shows only
// those sections and the "here to meet people first" line. An id that does not exist, or a profile
// hidden from the viewer, shows the not-found page with a 404 status. A failed load shows the error
// state with "Try again". The member's own profile offers "Edit profile" and "Who can see this".

import { expect, type Page, test } from '@playwright/test';
import { resetRateLimits, sql } from '../../fixtures/backend';
import { type BuilderMember, createBuilder } from '../../fixtures/builders';
import { AccountMenu } from '../../pages/account-menu';
import { BuilderProfilePage } from '../../pages/builder-profile.page';
import { DirectoryPage } from '../../pages/directory.page';
import { SignInPage } from '../../pages/sign-in.page';

async function signedIn(page: Page, member: BuilderMember): Promise<void> {
  const signIn = new SignInPage(page);
  await signIn.open('/about');
  await signIn.signIn(member.email, member.password);
  await expect(page).toHaveURL(/\/about$/);
}

test.describe('view a builder profile', () => {
  test.beforeEach(() => resetRateLimits());

  test('a member sees the whole profile with match, facts and status', async ({ page }) => {
    const daniel = createBuilder({
      name: 'Daniel Reyes',
      neighbourhood: 'riverdale',
      headline: 'Full-stack engineer',
      bio: 'Ten years shipping Laravel apps.',
      building: 'Psalter, scripture memory with spaced repetition',
      skills: ['Laravel', 'Angular'],
      openTo: ['co_founding'],
      activeMinutesAgo: 1,
    });
    sql(`INSERT INTO experience_entries (builder_id, position, title, organization, started_on, created_at, updated_at)
         SELECT id, 1, 'Platform lead', 'Northwind Logistics', '2018-04-01', now(), now()
         FROM builders WHERE public_id = '${daniel.builderId}'`);
    await signedIn(page, createBuilder({ neighbourhood: 'leslieville' }));
    const profile = new BuilderProfilePage(page);

    await profile.open(daniel.builderId);

    await expect(profile.breadcrumb).toHaveText(['Builders', 'Daniel Reyes']);
    await expect(profile.name).toHaveText('Daniel Reyes');
    await expect(profile.role).toHaveText('Full-stack engineer');
    await expect(profile.initials).toHaveText('DR');
    await expect(profile.place).toContainText('Riverdale · 1.5 km away');
    await expect(profile.status).toHaveText('Online now');
    await expect(profile.about).toContainText('Ten years shipping Laravel apps.');
    await expect(profile.skills).toHaveText(['Laravel', 'Angular']);
    await expect(profile.experience).toContainText(['Platform lead · Northwind Logistics']);
    await expect(profile.building).toContainText('Psalter, scripture memory with spaced repetition');
    await expect(profile.match).toHaveText(/^\s*\d{1,3}%\s*match\s*$/);
    await expect(profile.matchReasons).toContainText('Daniel is 1.5 km from Leslieville.');
    await expect(profile.fact('Open to')).toHaveText('Co-founding');
    await expect(profile.fact('Neighbourhood')).toHaveText('Riverdale');
    await expect(profile.fact('Distance')).toHaveText('1.5 km from Leslieville');
    await expect(profile.fact('Member since')).toHaveText(/^\s*[A-Z][a-z]+ \d{4}\s*$/);
    await expect(profile.editProfile).toHaveCount(0);
  });

  test('a sparse profile shows only its sections and the line about meeting people first', async ({ page }) => {
    const esther = createBuilder({ name: 'Esther Nguyen', neighbourhood: 'riverdale', role: 'designer' });
    await signedIn(page, createBuilder());
    const profile = new BuilderProfilePage(page);

    await profile.open(esther.builderId);

    await expect(profile.name).toHaveText('Esther Nguyen');
    await expect(profile.role).toHaveText('Designer');
    await expect(profile.about).toHaveCount(0);
    await expect(profile.skills).toHaveCount(0);
    await expect(profile.experience).toHaveCount(0);
    await expect(profile.building).toContainText('No project listed yet. Esther is here to meet people first.');
  });

  test('a missing or hidden profile shows the not-found page with a 404 status', async ({ page }) => {
    const hidden = createBuilder({ name: 'Hidden Builder' });
    const profile = new BuilderProfilePage(page);

    const missing = await page.goto('/builders/01jb0000000000000000000000');
    expect(missing?.status()).toBe(404);
    await expect(profile.notFoundTitle).toHaveText("We can't find that builder");
    await expect(profile.browseBuilders).toHaveAttribute('href', '/builders');

    const visitor = await page.goto(`/builders/${hidden.builderId}`);
    expect(visitor?.status()).toBe(404);
    await expect(profile.notFoundTitle).toHaveText("We can't find that builder");
  });

  test('a failed load offers "Try again"', async ({ page }) => {
    const surname = 'Zz' + Date.now().toString(36).replace(/[0-9]/g, 'q');
    createBuilder({ name: `Daniel ${surname}` });
    await signedIn(page, createBuilder());
    const directory = new DirectoryPage(page);
    const profile = new BuilderProfilePage(page);
    await directory.open(`?q=${surname}`);
    await profile.failLoading();

    // A link inside the app loads the profile in the browser, where the failure is answered.
    await directory.card(`Daniel ${surname}`).name.click();

    await expect(profile.errorTitle).toHaveText("We couldn't load this profile");
    await profile.restore();
    await profile.tryAgain.click();
    await expect(profile.name).toHaveText(`Daniel ${surname}`);
  });

  test('the own profile offers "Edit profile" and "Who can see this"', async ({ page }) => {
    const amara = createBuilder({ name: 'Amara Osei' });
    await signedIn(page, amara);
    const profile = new BuilderProfilePage(page);

    await profile.open(amara.builderId);

    await expect(profile.name).toHaveText('Amara Osei');
    await expect(profile.editProfile).toHaveAttribute('href', '/profile/edit');
    await expect(profile.whoCanSee).toHaveAttribute('href', '/settings/privacy');
    await expect(profile.match).toHaveCount(0);
  });

  test('"View profile" in the account menu opens the own profile', async ({ page }) => {
    const amara = createBuilder({ name: 'Amara Osei' });
    await signedIn(page, amara);
    const profile = new BuilderProfilePage(page);

    await new AccountMenu(page).go('View profile');

    await expect(page).toHaveURL(new RegExp(`/builders/${amara.builderId}$`));
    await expect(profile.editProfile).toBeVisible();
  });
});
