// Acceptance Test
// Traces to: L2-010
// Description:
// Given the directory's filters for role, open to, neighbourhood or city, distance and skills, when a
// member selects values, then results match every group and any value within a group, and each
// option shows its count. Distance defaults to 40 km with options 5, 10, 25, 40 km and "Anywhere in
// the GTA". Filters live in the URL, so a reload restores them, and "Clear all" resets them. With no
// match the no-results state shows the active filters, "Clear all filters" and a wider distance.
// Skills are toggle buttons and groups are fieldsets with legends. Below 992 px the filters open as a
// bottom sheet that applies on "Apply". Long names end in an ellipsis and a builder without skills
// has no skills row.

import { expect, type Page, test } from '@playwright/test';
import { randomBytes } from 'node:crypto';
import { resetRateLimits } from '../../fixtures/backend';
import { type BuilderMember, createBuilder } from '../../fixtures/builders';
import { DirectoryPage } from '../../pages/directory.page';
import { SignInPage } from '../../pages/sign-in.page';

function uniqueSurname(): string {
  return 'Zz' + Array.from(randomBytes(6), (b) => 'abcdefghijklmnopqrstuvwxyz'[b % 26]).join('');
}

async function signedIn(page: Page, member: BuilderMember): Promise<void> {
  const signIn = new SignInPage(page);
  await signIn.open('/about');
  await signIn.signIn(member.email, member.password);
  await expect(page).toHaveURL(/\/about$/);
}

/** Four builders who differ by role, open to, place and skills, all named with one surname. */
function cast(surname: string): void {
  createBuilder({ name: `Daniel ${surname}`, role: 'engineer', neighbourhood: 'riverdale', openTo: ['co_founding'], skills: ['Laravel'] });
  createBuilder({ name: `Grace ${surname}`, role: 'designer', neighbourhood: 'markham', openTo: ['contributing'], skills: ['Figma'] });
  createBuilder({ name: `Noah ${surname}`, role: 'engineer', neighbourhood: 'the-annex', openTo: ['advising', 'contributing'], skills: ['Swift'] });
  createBuilder({ name: `Ruth ${surname}`, role: 'founder', neighbourhood: 'scarborough', openTo: ['co_founding', 'advising'], skills: ['Product strategy'] });
}

test.describe('filter the builder directory', () => {
  test.beforeEach(() => resetRateLimits());

  test('groups combine with AND, options with OR, and each option shows its count', async ({ page }) => {
    test.slow();
    const surname = uniqueSurname();
    cast(surname);
    await signedIn(page, createBuilder({ neighbourhood: 'leslieville' }));
    const directory = new DirectoryPage(page);
    await directory.open(`?q=${surname}`);
    const filters = directory.filters();
    await expect(filters.group('Role')).toBeVisible();
    await expect(filters.count('Role', 'Engineers')).toHaveText('2');
    await expect(filters.option('Distance', '40 km')).toBeChecked();

    await filters.option('Role', 'Engineers').check();
    await filters.option('Role', 'Designers').check();
    await expect(page).toHaveURL(/[?&]role=engineer(%2C|,)designer/);
    await expect.poll(() => directory.cardNames()).toEqual(
      expect.arrayContaining([`Daniel ${surname}`, `Grace ${surname}`, `Noah ${surname}`]),
    );
    await expect(directory.cards).toHaveCount(3);

    await filters.option('Open to', 'Contributing').check();
    await expect(directory.cards).toHaveCount(2);
    await expect(filters.count('Role', 'Founders')).toHaveText('0');
    await expect(directory.activeFilters).toHaveText(['Engineers', 'Designers', 'Contributing']);
    await expect(directory.activeFilters.first()).toHaveAttribute('aria-label', 'Remove filter: Engineers');
  });

  test('filters are restored from the URL, removed one by one, and "Clear all" resets them', async ({ page }) => {
    const surname = uniqueSurname();
    cast(surname);
    await signedIn(page, createBuilder());
    const directory = new DirectoryPage(page);
    await directory.open(`?q=${surname}&area=Downtown%20Toronto&skills=laravel,swift`);
    const filters = directory.filters();

    await expect(filters.option('Neighbourhood or city', 'Downtown Toronto')).toBeChecked();
    await expect(filters.skill('Laravel')).toHaveAttribute('aria-pressed', 'true');
    await expect(directory.cards).toHaveCount(2);

    await directory.activeFilters.filter({ hasText: 'Swift' }).click();
    await expect(directory.cards).toHaveCount(1);
    await expect(page).not.toHaveURL(/swift/);

    await directory.clearAll.click();
    await expect(page).toHaveURL(new RegExp(`/builders\\?q=${surname}$`));
    await expect(directory.cards).toHaveCount(4);
    await expect(directory.activeFilters).toHaveCount(0);
  });

  test('distance options narrow and widen the search', async ({ page }) => {
    const surname = uniqueSurname();
    createBuilder({ name: `Near ${surname}`, neighbourhood: 'oakville' });
    createBuilder({ name: `Far ${surname}`, neighbourhood: 'ajax' });
    await signedIn(page, createBuilder({ neighbourhood: 'oakville' }));
    const directory = new DirectoryPage(page);
    await directory.open(`?q=${surname}`);
    const filters = directory.filters();
    await expect(directory.cards).toHaveCount(1);
    await expect(filters.group('Distance').getByRole('radio')).toHaveCount(5);

    await filters.option('Distance', 'Anywhere in the GTA').check();

    await expect(page).toHaveURL(/[?&]distance=any/);
    await expect(directory.cards).toHaveCount(2);
  });

  test('no match shows the active filters, "Clear all filters" and a wider distance', async ({ page }) => {
    const surname = uniqueSurname();
    createBuilder({ name: `Far ${surname}`, neighbourhood: 'ajax', role: 'designer' });
    await signedIn(page, createBuilder({ neighbourhood: 'oakville' }));
    const directory = new DirectoryPage(page);
    await directory.open(`?q=${surname}&role=designer&distance=25`);

    await expect(directory.noResults).toHaveText('No builders match those filters');
    await expect(directory.count).toHaveText('0 builders match');
    await expect(directory.activeFilters).toHaveText(['Designers', 'Within 25 km']);
    await expect(directory.widen).toHaveText('Search within 40 km');

    await directory.widen.click();
    await expect(page).toHaveURL(/[?&]distance=40/);
    await expect(directory.widen).toHaveText('Search anywhere in the GTA');
    await directory.widen.click();
    await expect(directory.cards).toHaveCount(1);

    await directory.open(`?q=${surname}&role=founder`);
    await directory.clearAllFilters.click();
    await expect(directory.cards).toHaveCount(0);
    await expect(page).toHaveURL(new RegExp(`/builders\\?q=${surname}$`));
  });

  test('skills are toggle buttons and every group is a fieldset with a legend', async ({ page }) => {
    await signedIn(page, createBuilder());
    const directory = new DirectoryPage(page);
    await directory.open();
    const filters = directory.filters();

    await expect(filters.groups).toHaveCount(5);
    for (const legend of ['Role', 'Open to', 'Neighbourhood or city', 'Distance', 'Popular skills'] as const) {
      await expect(filters.group(legend)).toBeVisible();
    }
    await expect(filters.skill('Figma')).toHaveAttribute('aria-pressed', 'false');
    await filters.skill('Figma').click();
    await expect(filters.skill('Figma')).toHaveAttribute('aria-pressed', 'true');
    await expect(page).toHaveURL(/[?&]skills=figma/);
  });

  test('below 992 px the filters open as a bottom sheet that applies on "Apply"', async ({ page }) => {
    const surname = uniqueSurname();
    cast(surname);
    await page.setViewportSize({ width: 390, height: 844 });
    await signedIn(page, createBuilder());
    const directory = new DirectoryPage(page);
    await directory.open(`?q=${surname}`);
    await expect(directory.filterSheet).toHaveCount(0);

    await directory.filtersButton.click();
    const sheet = directory.filters();
    await expect(directory.filterSheet).toBeVisible();
    await sheet.option('Role', 'Founders').check();
    await expect(page).not.toHaveURL(/role=/);
    await sheet.apply.click();

    await expect(directory.filterSheet).toHaveCount(0);
    await expect(page).toHaveURL(/[?&]role=founder/);
    await expect(directory.cards).toHaveCount(1);
    await expect(directory.filtersButton).toBeFocused();

    await directory.filtersButton.click();
    await expect(directory.filterSheet).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(directory.filterSheet).toHaveCount(0);
    await expect(directory.filtersButton).toBeFocused();
  });

  test('a visitor has no filters', async ({ page }) => {
    const directory = new DirectoryPage(page);
    await directory.open();

    await expect(directory.cards.first()).toBeVisible();
    await expect(directory.filters().groups).toHaveCount(0);
  });

  test('a long name ends in an ellipsis and a builder without skills has no skills row', async ({ page }) => {
    const surname = uniqueSurname();
    const longName = `Maximilian Alexander Wolfeschlegelsteinhausen ${surname}`;
    createBuilder({ name: longName, headline: 'Principal full-stack engineer and technical co-founder, public-sector platforms' });
    await signedIn(page, createBuilder());
    const directory = new DirectoryPage(page);
    await directory.open(`?q=${surname}`);
    const card = directory.card(longName);

    await expect(card.name).toHaveText(longName);
    await expect(card.name).toHaveCSS('text-overflow', 'ellipsis');
    await expect(card.role).toHaveCSS('text-overflow', 'ellipsis');
    await expect(card.skills).toHaveCount(0);
    await expect(card.initials).toBeVisible();
  });
});
