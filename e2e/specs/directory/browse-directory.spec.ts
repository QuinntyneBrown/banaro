// Acceptance Test
// Traces to: L2-009
// Description:
// Given builders in the directory, when a member opens /builders, then the count and builder cards show
// name, role, neighbourhood and distance, match score, skills, "Building", "Open to" and online status
// as a word. Searching filters after a pause and puts the term in the URL; the sort select re-orders
// and is reflected in the URL; "Show 12 more" loads the next page and the page number is in the URL, so
// a reload restores it; a page past the end returns the last page. A visitor sees the reduced card.
// While results load, 12 skeleton cards show; a failure shows the error state with "Try again".

import { expect, type Page, test } from '@playwright/test';
import { randomBytes } from 'node:crypto';
import { resetRateLimits } from '../../fixtures/backend';
import { type BuilderMember, createBuilder } from '../../fixtures/builders';
import { DirectoryPage } from '../../pages/directory.page';
import { SignInPage } from '../../pages/sign-in.page';

/** A surname no other test uses, so a search for it finds only this test's builders. */
function uniqueSurname(): string {
  return 'Zz' + Array.from(randomBytes(6), (b) => 'abcdefghijklmnopqrstuvwxyz'[b % 26]).join('');
}

async function signedIn(page: Page, member: BuilderMember): Promise<void> {
  const signIn = new SignInPage(page);
  await signIn.open('/about');
  await signIn.signIn(member.email, member.password);
  await expect(page).toHaveURL(/\/about$/);
}

test.describe('browse the builder directory', () => {
  test.beforeEach(() => resetRateLimits());

  test('a member sees full cards with distance, match, facts and online status', async ({ page }) => {
    const surname = uniqueSurname();
    createBuilder({
      name: `Daniel ${surname}`,
      neighbourhood: 'riverdale',
      headline: 'Full-stack engineer',
      skills: ['Laravel', 'Angular', 'PostgreSQL'],
      building: 'Psalter',
      openTo: ['co_founding'],
      activeMinutesAgo: 1,
    });
    createBuilder({ name: `Esther ${surname}`, role: 'engineer', neighbourhood: 'the-annex', activeMinutesAgo: 240 });
    await signedIn(page, createBuilder({ neighbourhood: 'leslieville' }));
    const directory = new DirectoryPage(page);

    await directory.open(`?q=${surname}`);

    await expect(directory.title).toHaveText('Builders near you');
    await expect(directory.sub).toHaveText(/^\s*[\d,]+ builders? in Toronto and the GTA\.\s*$/);
    await expect(directory.count).toHaveText('Showing 1–2 of 2 builders');
    const daniel = directory.card(`Daniel ${surname}`);
    await expect(daniel.name).toHaveAttribute('href', /^\/builders\/[0-9a-z]{26}$/);
    await expect(daniel.role).toHaveText('Full-stack engineer');
    await expect(daniel.place).toHaveText('Riverdale · 1.5 km away');
    await expect(daniel.match).toHaveText(/^\s*\d{1,3}%\s*match\s*$/);
    await expect(daniel.skills).toHaveText(['Laravel', 'Angular', 'PostgreSQL']);
    await expect(daniel.building).toHaveText('Psalter');
    await expect(daniel.openTo).toHaveText('Co-founding');
    await expect(daniel.status).toHaveText('Online now');
    await expect(daniel.initials).toHaveText(`D${surname[0]}`);
    const esther = directory.card(`Esther ${surname}`);
    await expect(esther.role).toHaveText('Engineer');
    await expect(esther.building).toHaveText('No project listed');
    await expect(esther.status).toHaveText('Seen 4 h ago');
    await expect(esther.skills).toHaveCount(0);
  });

  test('searching filters after a pause and keeps the term in the URL', async ({ page }) => {
    const surname = uniqueSurname();
    createBuilder({ name: `Grace ${surname}`, skills: ['Figma'] });
    createBuilder({ name: `Noah ${surname}`, skills: ['Rust'] });
    await signedIn(page, createBuilder());
    const directory = new DirectoryPage(page);
    await directory.open(`?q=${surname}`);
    await expect(directory.cards).toHaveCount(2);

    await directory.search.fill(`${surname} fig`);

    await expect(page).toHaveURL(new RegExp(`[?&]q=${surname}(\\+|%20)fig`));
    await expect.poll(() => directory.cardNames()).toEqual([`Grace ${surname}`]);
    await expect(directory.count).toHaveText('Showing 1–1 of 1 builder');
  });

  test('the sort select re-orders the results and is reflected in the URL', async ({ page }) => {
    const surname = uniqueSurname();
    createBuilder({ name: `Old ${surname}`, joinedDaysAgo: 30, activeMinutesAgo: 1 });
    createBuilder({ name: `New ${surname}`, joinedDaysAgo: 1, activeMinutesAgo: 600 });
    await signedIn(page, createBuilder());
    const directory = new DirectoryPage(page);
    await directory.open(`?q=${surname}`);
    await expect(directory.sort).toHaveValue('best_match');
    expect(await directory.sortOptions()).toEqual(['Best match', 'Nearest', 'Recently active', 'Newest']);

    await directory.sort.selectOption({ label: 'Newest' });
    await expect(page).toHaveURL(/[?&]sort=newest/);
    await expect.poll(() => directory.cardNames()).toEqual([`New ${surname}`, `Old ${surname}`]);

    await directory.sort.selectOption({ label: 'Recently active' });
    await expect(page).toHaveURL(/[?&]sort=recently_active/);
    await expect.poll(() => directory.cardNames()).toEqual([`Old ${surname}`, `New ${surname}`]);
  });

  test('"Show more" loads the next page into the URL, and a reload restores it', async ({ page }) => {
    // Fourteen builders through the database container take a while to create.
    test.slow();
    const surname = uniqueSurname();
    for (let i = 1; i <= 14; i++) {
      createBuilder({ name: `Builder${String(i).padStart(2, '0')} ${surname}`, activeMinutesAgo: i });
    }
    await signedIn(page, createBuilder());
    const directory = new DirectoryPage(page);
    await directory.open(`?q=${surname}&sort=recently_active`);
    await expect(directory.cards).toHaveCount(12);
    await expect(directory.pagerText).toHaveText('12 of 14 · page 1 of 2');

    await directory.more.click();

    await expect(directory.cards).toHaveCount(14);
    await expect(page).toHaveURL(/[?&]page=2/);
    await expect(directory.more).toHaveCount(0);
    await expect(directory.pagerText).toHaveText('14 of 14 · page 2 of 2');
    await page.reload();
    await expect(directory.cards).toHaveCount(14);
  });

  test('a page past the end shows the last page', async ({ page }) => {
    const surname = uniqueSurname();
    createBuilder({ name: `Only ${surname}` });
    await signedIn(page, createBuilder());
    const directory = new DirectoryPage(page);

    await directory.open(`?q=${surname}&page=9`);

    await expect(directory.cards).toHaveCount(1);
    await expect(page).toHaveURL(/[?&]page=1(&|$)/);
  });

  test('a visitor sees the reduced card and only the sorts that need no viewer', async ({ page }) => {
    const surname = uniqueSurname();
    createBuilder({ name: `Ruth ${surname}`, building: 'Hidden fact', activeMinutesAgo: 1, skills: ['Python'] });
    const directory = new DirectoryPage(page);

    await directory.open(`?q=${surname}`);

    const ruth = directory.card(`Ruth ${surname}`);
    await expect(ruth.name).toBeVisible();
    await expect(ruth.place).toHaveText('Leslieville');
    await expect(ruth.skills).toHaveText(['Python']);
    await expect(ruth.match).toHaveCount(0);
    await expect(ruth.building).toHaveCount(0);
    await expect(ruth.status).toHaveCount(0);
    expect(await directory.sortOptions()).toEqual(['Recently active', 'Newest']);
  });

  test('loading shows 12 skeleton cards and a failure offers "Try again"', async ({ page }) => {
    const surname = uniqueSurname();
    createBuilder({ name: `Elijah ${surname}` });
    await signedIn(page, createBuilder());
    const directory = new DirectoryPage(page);
    await directory.open();

    const release = await directory.holdResults();
    await directory.search.fill(surname);
    await expect(directory.skeletons).toHaveCount(12);
    release();
    await expect(directory.cards).toHaveCount(1);

    await directory.failResults();
    await directory.sort.selectOption({ label: 'Newest' });
    await expect(directory.errorTitle).toHaveText("We couldn't load the builders");
    await directory.restoreResults();
    await directory.tryAgain.click();
    await expect(directory.cards).toHaveCount(1);
    await expect(page).toHaveURL(/[?&]sort=newest/);
  });
});
