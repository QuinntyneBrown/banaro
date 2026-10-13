// Acceptance Test
// Traces to: L2-012
// Description:
// Given a member at /projects/new, when they submit a name, one-line summary, optional description,
// stage, "looking for" roles and an optional link, then the project is created and the success state
// links to its page. Missing or overlong values show field errors; while saving the button is busy;
// a member with 10 projects is told about the limit; only http and https links are accepted. A visitor
// is sent to sign in.

import { expect, type Page, test } from '@playwright/test';
import { resetRateLimits } from '../../fixtures/backend';
import { type BuilderMember, createBuilder } from '../../fixtures/builders';
import { createProject } from '../../fixtures/projects';
import { ProjectFormPage } from '../../pages/project-form.page';
import { SignInPage } from '../../pages/sign-in.page';

async function signedIn(page: Page, member: BuilderMember): Promise<void> {
  const signIn = new SignInPage(page);
  await signIn.open('/about');
  await signIn.signIn(member.email, member.password);
  await expect(page).toHaveURL(/\/about$/);
}

test.describe('share a project', () => {
  test.beforeEach(() => resetRateLimits());

  test('a member shares a project and the success state links to it', async ({ page }) => {
    await signedIn(page, createBuilder());
    const form = new ProjectFormPage(page);
    await form.openNew();
    await expect(form.title).toHaveText('Share a project');
    await expect(form.breadcrumb).toHaveText(['Projects', 'Share a project']);

    await form.name.fill('Harvest');
    await form.summary.fill('Volunteer scheduling for GTA food banks');
    await form.description.fill('Six food banks use Harvest every week.');
    await form.stage.selectOption({ label: 'Pilot' });
    await form.lookingFor('Technical co-founder').check();
    await form.link.fill('https://harvest.example.ca');
    await form.submit.click();

    await expect(form.successTitle).toHaveText('Harvest is shared');
    await expect(form.viewProject).toHaveText('View Harvest');
    await expect(form.viewProject).toHaveAttribute('href', /^\/projects\/[0-9a-z]{26}$/);
    await expect(form.backToProjects).toHaveAttribute('href', '/projects');
  });

  test('missing values show field errors and a summary', async ({ page }) => {
    await signedIn(page, createBuilder());
    const form = new ProjectFormPage(page);
    await form.openNew();

    await form.submit.click();

    await expect(form.error('name')).toHaveText("Enter your project's name.");
    await expect(form.error('summary')).toHaveText('Describe your project in one line.');
    expect(await form.summaryErrors()).toEqual(["Enter your project's name.", 'Describe your project in one line.']);
  });

  test('only http and https links are accepted', async ({ page }) => {
    await signedIn(page, createBuilder());
    const form = new ProjectFormPage(page);
    await form.openNew();
    await form.name.fill('Harvest');
    await form.summary.fill('Volunteer scheduling');

    await form.link.fill('ftp://harvest.example.ca');
    await form.submit.click();

    await expect(form.error('link')).toHaveText('Enter a web address that starts with http:// or https://.');
  });

  test('while saving, the button is busy', async ({ page }) => {
    await signedIn(page, createBuilder());
    const form = new ProjectFormPage(page);
    await form.openNew();
    await form.name.fill('Harvest');
    await form.summary.fill('Volunteer scheduling');
    const release = await form.holdSave();

    await form.submit.click();

    await expect(form.submit).toHaveText('Sharing…');
    await expect(form.submit).toBeDisabled();
    release();
    await expect(form.successTitle).toHaveText('Harvest is shared');
  });

  test('a member with 10 projects is told about the limit', async ({ page }) => {
    const amara = createBuilder();
    for (let i = 1; i <= 10; i++) createProject(amara, { name: `Project ${i}` });
    await signedIn(page, amara);
    const form = new ProjectFormPage(page);
    await form.openNew();
    await form.name.fill('One more');
    await form.summary.fill('Volunteer scheduling');

    await form.submit.click();

    await expect(form.limit).toContainText(
      'You can share up to 10 projects. Delete one you no longer need to share another.',
    );
  });

  test('a visitor is sent to sign in', async ({ page }) => {
    const form = new ProjectFormPage(page);

    await form.openNew();

    await expect(page).toHaveURL(/\/sign-in\?returnTo=%2Fprojects%2Fnew$/);
  });
});
