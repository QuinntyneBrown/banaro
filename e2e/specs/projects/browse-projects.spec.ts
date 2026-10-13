// Acceptance Test
// Traces to: L2-015
// Description:
// Given the project showcase, when a visitor or member opens /projects, then projects are listed as
// cards with name, owner, one-line description, stage, "looking for" and feedback count, most recent
// activity first, with a count line. Search narrows the list after a pause and the stage and
// "looking for" filters combine with it, all persisted in the URL. "Show more projects" appends the
// next page and survives a reload. No match shows the active filters with ways to remove them or share
// a project. While loading, 12 skeleton cards show; a failure offers "Try again".

import { expect, test } from '@playwright/test';
import { randomBytes } from 'node:crypto';
import { resetRateLimits } from '../../fixtures/backend';
import { createBuilder } from '../../fixtures/builders';
import { createProject } from '../../fixtures/projects';
import { ProjectsPage } from '../../pages/projects.page';
import { SignInPage } from '../../pages/sign-in.page';

/** A word no other test's projects contain, so a search by it lists only this test's projects. */
const uniqueWord = () => `zeph${randomBytes(4).toString('hex')}`;

test.describe('browse projects', () => {
  test.beforeEach(() => resetRateLimits());

  test('a visitor sees cards with their facts, most recent activity first', async ({ page }) => {
    const word = uniqueWord();
    const owner = createBuilder({ name: 'Amara Osei' });
    createProject(owner, { name: `${word} Older`, summary: 'Seen long ago', activeDaysAgo: 9, stage: 'idea' });
    createProject(owner, {
      name: `${word} Newest`,
      summary: 'Volunteer scheduling for GTA food banks',
      activeDaysAgo: 0,
      stage: 'pilot',
      lookingFor: ['technical_co_founder', 'advisor'],
      feedbackCount: 23,
    });
    createProject(owner, { name: `${word} Middle`, summary: 'Somewhere in between', activeDaysAgo: 3, feedbackCount: 1 });
    const projects = new ProjectsPage(page);

    await projects.open(`?q=${word}`);

    await expect(projects.cards).toHaveCount(3);
    expect(await projects.cardNames()).toEqual([`${word} Newest`, `${word} Middle`, `${word} Older`]);
    await expect(projects.count).toHaveText('Showing 1–3 of 3 projects, most recent first');
    const newest = projects.card('Newest');
    await expect(newest.owner).toHaveText('by Amara Osei');
    await expect(newest.line).toHaveText('Volunteer scheduling for GTA food banks');
    await expect(newest.fact('Stage')).toHaveText('Pilot');
    await expect(newest.fact('Looking for')).toHaveText('Technical co-founder, Advisor');
    await expect(newest.fact('Feedback')).toHaveText('23 comments');
    await expect(projects.card('Middle').fact('Feedback')).toHaveText('1 comment');
    await expect(newest.nameLink).toHaveAttribute('href', /^\/projects\/[0-9a-z]{26}$/);
  });

  test('search is applied after a pause and goes into the URL', async ({ page }) => {
    const word = uniqueWord();
    const owner = createBuilder();
    createProject(owner, { name: `${word} Psalter`, summary: 'Scripture memory' });
    createProject(owner, { name: `${word} Harvest`, summary: 'Food bank scheduling' });
    const projects = new ProjectsPage(page);
    await projects.open(`?q=${word}`);
    await expect(projects.cards).toHaveCount(2);

    await projects.search.fill(`${word} psal`);

    await expect(page).toHaveURL(new RegExp(`q=${word}\\+psal|q=${word}%20psal`));
    await expect(projects.cards).toHaveCount(1);
    await expect(projects.card('Psalter').name).toBeVisible();
    await expect(projects.count).toHaveText('Showing 1–1 of 1 project, most recent first');
  });

  test('the stage and "looking for" filters combine and are kept in the URL', async ({ page }) => {
    const word = uniqueWord();
    const owner = createBuilder();
    createProject(owner, { name: `${word} A`, stage: 'launched', lookingFor: ['advisor'] });
    createProject(owner, { name: `${word} B`, stage: 'launched', lookingFor: ['designer'] });
    createProject(owner, { name: `${word} C`, stage: 'idea', lookingFor: ['advisor'] });
    const projects = new ProjectsPage(page);
    await projects.open(`?q=${word}`);
    await expect(projects.cards).toHaveCount(3);

    await projects.stage.selectOption({ label: 'Launched' });
    await expect(projects.cards).toHaveCount(2);
    await projects.lookingFor.selectOption({ label: 'Advisor' });

    await expect(projects.cards).toHaveCount(1);
    await expect(projects.card('A').name).toBeVisible();
    await expect(page).toHaveURL(/stage=launched/);
    await expect(page).toHaveURL(/looking_for=advisor/);
    await expect(projects.activeFilters).toHaveText(['Stage: Launched', 'Looking for: Advisor']);

    await page.reload();

    await expect(projects.cards).toHaveCount(1);
    await expect(projects.stage).toHaveValue('launched');
    await expect(projects.lookingFor).toHaveValue('advisor');
  });

  test('"Show more projects" appends the next 12 and a reload shows the same list', async ({ page }) => {
    test.slow();
    const word = uniqueWord();
    const owner = createBuilder();
    for (let i = 0; i < 14; i++) createProject(owner, { name: `${word} P${i}`, activeDaysAgo: i });
    const projects = new ProjectsPage(page);
    await projects.open(`?q=${word}`);

    await expect(projects.cards).toHaveCount(12);
    await expect(projects.pagerText).toHaveText('Showing 12 of 14 projects');
    await projects.showMore.click();

    await expect(projects.cards).toHaveCount(14);
    await expect(page).toHaveURL(/page=2/);
    await expect(projects.showMore).toHaveCount(0);

    await page.reload();

    await expect(projects.cards).toHaveCount(14);
  });

  test('no match lists the active filters and offers to clear them or share a project', async ({ page }) => {
    const word = uniqueWord();
    createProject(createBuilder(), { name: `${word} Only`, stage: 'idea' });
    const projects = new ProjectsPage(page);

    await projects.open(`?q=${word}&stage=launched&looking_for=advisor`);

    await expect(projects.noResultsTitle).toBeVisible();
    await expect(projects.count).toContainText('0 projects match');
    await expect(projects.activeFilters).toHaveText(['Stage: Launched', 'Looking for: Advisor']);
    await expect(projects.shareProject).toHaveAttribute('href', '/projects/new');

    await projects.clearFilters.click();

    await expect(projects.cards).toHaveCount(1);
    await expect(page).not.toHaveURL(/stage=/);
  });

  test('loading shows 12 skeleton cards and a failure offers "Try again"', async ({ page }) => {
    const word = uniqueWord();
    createProject(createBuilder(), { name: `${word} Only` });
    const projects = new ProjectsPage(page);
    await projects.open();

    const release = await projects.holdResults();
    await projects.search.fill(word);
    await expect(projects.skeletons).toHaveCount(12);
    await expect(projects.count).toHaveText('Loading projects…');
    release();
    await expect(projects.cards).toHaveCount(1);
    await projects.restoreResults();

    await projects.failResults();
    await projects.stage.selectOption({ label: 'Idea' });
    await expect(projects.errorTitle).toBeVisible();
    await expect(projects.count).toHaveText('Projects could not be loaded');
    await expect(projects.browseBuilders).toBeVisible();

    await projects.restoreResults();
    await projects.tryAgain.click();
    await expect(projects.errorTitle).toHaveCount(0);
    await expect(page).toHaveURL(/stage=idea/);
  });

  test('"Share a project" leads a member to the form and a visitor to sign in first', async ({ page, context }) => {
    const projects = new ProjectsPage(page);
    await projects.open();

    await projects.shareProject.click();
    await expect(page).toHaveURL(/\/sign-in\?returnTo=%2Fprojects%2Fnew/);

    const member = createBuilder();
    const signIn = new SignInPage(page);
    await signIn.signIn(member.email, member.password);

    await expect(page).toHaveURL(/\/projects\/new$/, { timeout: 45_000 });
    await context.clearCookies();
  });
});
