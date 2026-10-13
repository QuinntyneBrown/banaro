// Acceptance Test
// Traces to: L2-013
// Description:
// Given a project, when anyone opens /projects/{id}, then it shows the name, the owner (linked), the
// one-line description, the description, the stage, "looking for", the link and the feedback count.
// The owner sees their own project without "Give feedback" and "Offer to help"; a project with no
// feedback invites the first comment; an unknown id is the not-found page with a 404 status; a
// failure offers "Try again"; while loading, the page shows its skeleton. A visitor's "Give feedback"
// and "Offer to help" lead to sign-in and back to the project.

import { expect, test } from '@playwright/test';
import { resetRateLimits } from '../../fixtures/backend';
import { createBuilder } from '../../fixtures/builders';
import { createProject } from '../../fixtures/projects';
import { ProjectPage } from '../../pages/project.page';
import { ProjectsPage } from '../../pages/projects.page';
import { SignInPage } from '../../pages/sign-in.page';

test.describe('view a project', () => {
  test.beforeEach(() => resetRateLimits());

  test('a visitor reads the project with its facts and its owner linked', async ({ page }) => {
    const owner = createBuilder({ name: 'Daniel Reyes' });
    const id = createProject(owner, {
      name: 'Psalter',
      summary: 'Scripture memory with spaced repetition',
      description: 'Psalter shows the few verses that are about to slip away.',
      stage: 'beta',
      lookingFor: ['contributor', 'advisor'],
      link: 'https://psalter.example.ca/about',
      feedbackCount: 41,
    });
    const project = new ProjectPage(page);

    await project.open(id);

    await expect(project.breadcrumb).toHaveText(['Projects', 'Psalter']);
    await expect(project.title).toHaveText('Psalter');
    await expect(project.by).toContainText('by Daniel Reyes');
    await expect(project.by).toContainText('Scripture memory with spaced repetition');
    await expect(project.ownerLink).toHaveAttribute('href', `/builders/${owner.builderId}`);
    await expect(project.aboutTitle).toHaveText('About Psalter');
    await expect(project.about).toHaveText(['Psalter shows the few verses that are about to slip away.']);
    await expect(project.feedbackTitle).toContainText('41 comments');
    await expect(project.fact('Stage')).toHaveText('Beta');
    await expect(project.fact('Looking for')).toHaveText('Contributors, Advisor');
    await expect(project.externalLink).toHaveText('psalter.example.ca');
    await expect(project.externalLink).toHaveAttribute('href', 'https://psalter.example.ca/about');
    await expect(project.builderCard).toContainText('Daniel Reyes');
  });

  test('the owner sees their own project without the actions for other people', async ({ page }) => {
    const owner = createBuilder({ name: 'Amara Osei' });
    const id = createProject(owner, { name: 'Harvest', feedbackCount: 23 });
    const signIn = new SignInPage(page);
    await signIn.open(`/projects/${id}`);
    await signIn.signIn(owner.email, owner.password);
    const project = new ProjectPage(page);

    await expect(project.title).toHaveText('Harvest', { timeout: 45_000 });

    await expect(project.giveFeedback).toHaveCount(0);
    await expect(project.offerToHelp).toHaveCount(0);
    await expect(project.feedbackTitle).toContainText('23 comments');
  });

  test('a project with no feedback invites the first comment', async ({ page }) => {
    const id = createProject(createBuilder({ name: 'Esther Nguyen' }), { name: 'Hearth', feedbackCount: 0 });
    const project = new ProjectPage(page);

    await project.open(id);

    await expect(project.feedbackTitle).toContainText('0 comments');
    await expect(project.emptyFeedbackTitle).toBeVisible();
  });

  test('an unknown id is the not-found page with a 404 status', async ({ page }) => {
    const project = new ProjectPage(page);

    const response = await page.goto('/projects/' + 'a'.repeat(26));

    expect(response?.status()).toBe(404);
    await expect(project.notFoundTitle).toBeVisible();
    await expect(project.browseProjects).toHaveAttribute('href', '/projects');
    await expect(project.shareProject).toHaveAttribute('href', '/projects/new');
  });

  test('a failure offers "Try again"', async ({ page }) => {
    const word = `zeph${Date.now().toString(36)}`;
    createProject(createBuilder(), { name: `${word} Gather` });
    const projects = new ProjectsPage(page);
    const project = new ProjectPage(page);
    await projects.open(`?q=${word}`);
    await project.failLoading();

    await projects.card('Gather').nameLink.click();

    await expect(project.errorTitle).toBeVisible();
    await expect(project.backToProjects).toHaveAttribute('href', '/projects');

    await project.restore();
    await project.tryAgain.click();
    await expect(project.title).toHaveText(`${word} Gather`);
  });

  test('while loading, the page shows its skeleton before the project', async ({ page }) => {
    const word = `zeph${Date.now().toString(36)}`;
    createProject(createBuilder(), { name: `${word} Ledgerline` });
    const projects = new ProjectsPage(page);
    const project = new ProjectPage(page);
    await projects.open(`?q=${word}`);
    const release = await project.holdLoading();

    await projects.card('Ledgerline').nameLink.click();

    await expect(project.loading).toBeVisible();
    release();
    await expect(project.title).toHaveText(`${word} Ledgerline`);
    await expect(project.loading).toHaveCount(0);
  });

  test('a visitor\'s "Give feedback" and "Offer to help" lead to sign-in and back', async ({ page }) => {
    const owner = createBuilder({ name: 'Grace Liu' });
    const id = createProject(owner, { name: 'Gather', lookingFor: ['designer'] });
    const project = new ProjectPage(page);
    await project.open(id);

    await expect(project.offerToHelp).toHaveAttribute('href', new RegExp(`/sign-in\\?returnTo=%2Fprojects%2F${id}`));
    await project.giveFeedback.click();
    await expect(page).toHaveURL(new RegExp(`/sign-in\\?returnTo=%2Fprojects%2F${id}$`));

    const member = createBuilder({ name: 'Noah Fischer' });
    await new SignInPage(page).signIn(member.email, member.password);

    await expect(page).toHaveURL(new RegExp(`/projects/${id}$`), { timeout: 45_000 });
    await expect(project.title).toHaveText('Gather');
  });
});
