// Acceptance Test
// Traces to: L2-014
// Description:
// Given the owner of a project, when they open /projects/{id}/edit, then the form is filled in and
// "Save changes" returns them to the project page with a confirmation. Invalid values show the error
// summary and nothing is saved, and while saving the button is busy. A member who is not the owner is
// shown the forbidden page. "Delete project" opens a dialog that asks for the project name before the
// danger button is enabled, shows busy while deleting, then returns the owner to the showcase with a
// confirmation; a failed delete keeps the project and the typed name and offers "Try again".

import { expect, type Page, test } from '@playwright/test';
import { resetRateLimits } from '../../fixtures/backend';
import { type BuilderMember, createBuilder } from '../../fixtures/builders';
import { createProject } from '../../fixtures/projects';
import { DeleteProjectDialog } from '../../pages/delete-project.dialog';
import { ErrorPage } from '../../pages/error-page';
import { ProjectFormPage } from '../../pages/project-form.page';
import { ProjectPage } from '../../pages/project.page';
import { SignInPage } from '../../pages/sign-in.page';
import { Toasts } from '../../pages/toasts';

async function signedInAt(page: Page, member: BuilderMember, path: string): Promise<void> {
  const signIn = new SignInPage(page);
  await signIn.open(path);
  await signIn.signIn(member.email, member.password);
  await expect(page).toHaveURL((url) => url.pathname === path, { timeout: 45_000 });
}

test.describe('edit and delete a project', () => {
  test.beforeEach(() => resetRateLimits());

  test('the owner changes a project and returns to its page with a confirmation', async ({ page }) => {
    const owner = createBuilder({ name: 'Amara Osei' });
    const id = createProject(owner, {
      name: 'Harvest',
      summary: 'Volunteer scheduling for GTA food banks',
      stage: 'beta',
      lookingFor: ['technical_co_founder'],
    });
    await signedInAt(page, owner, `/projects/${id}/edit`);
    const form = new ProjectFormPage(page);
    const toasts = new Toasts(page);

    await expect(form.title).toHaveText('Edit Harvest');
    await expect(form.breadcrumb).toHaveText(['Projects', 'Harvest', 'Edit']);
    await expect(form.name).toHaveValue('Harvest');
    await expect(form.summary).toHaveValue('Volunteer scheduling for GTA food banks');
    await expect(form.stage).toHaveValue('beta');
    await expect(form.lookingFor('Technical co-founder')).toBeChecked();

    await form.summary.fill('Shift scheduling for food banks across the GTA');
    await form.lookingFor('Advisor').check();
    await form.submit.click();

    await expect(page).toHaveURL(new RegExp(`/projects/${id}$`));
    await expect(toasts.withTitle('Changes saved')).toContainText('Harvest is up to date.');
    const project = new ProjectPage(page);
    await expect(project.by).toContainText('Shift scheduling for food banks across the GTA');
    await expect(project.fact('Looking for')).toHaveText('Technical co-founder, Advisor');
  });

  test('invalid values show the summary and save nothing', async ({ page }) => {
    const owner = createBuilder();
    const id = createProject(owner, { name: 'Harvest' });
    await signedInAt(page, owner, `/projects/${id}/edit`);
    const form = new ProjectFormPage(page);

    await form.name.fill('');
    await form.submit.click();

    await expect(form.errorSummary).toBeVisible();
    expect((await form.summaryErrors()).length).toBeGreaterThan(0);
    await expect(page).toHaveURL(new RegExp(`/projects/${id}/edit$`));
    await page.goto(`/projects/${id}`);
    await expect(new ProjectPage(page).title).toHaveText('Harvest');
  });

  test('while saving, the button is busy', async ({ page }) => {
    const owner = createBuilder();
    const id = createProject(owner, { name: 'Harvest' });
    await signedInAt(page, owner, `/projects/${id}/edit`);
    const form = new ProjectFormPage(page);
    const release = await form.holdSave();

    await form.summary.fill('A new line');
    await form.submit.click();

    await expect(form.submit).toHaveText('Saving…');
    await expect(form.submit).toBeDisabled();
    release();
    await expect(page).toHaveURL(new RegExp(`/projects/${id}$`));
  });

  test('a member who is not the owner is shown the forbidden page', async ({ page }) => {
    const id = createProject(createBuilder({ name: 'Grace Liu' }), { name: 'Gather' });
    const stranger = createBuilder({ name: 'Noah Fischer' });
    const signIn = new SignInPage(page);
    await signIn.open(`/projects/${id}/edit`);
    await signIn.signIn(stranger.email, stranger.password);
    const forbidden = new ErrorPage(page);

    await expect(forbidden.title).toHaveText("This one isn't yours to open", { timeout: 45_000 });
    await expect(page.getByRole('main').locator('input')).toHaveCount(0);
  });

  test('delete asks for the project name, shows busy, and returns to the showcase', async ({ page }) => {
    const owner = createBuilder({ name: 'Amara Osei' });
    const id = createProject(owner, { name: 'Harvest', feedbackCount: 23 });
    await signedInAt(page, owner, `/projects/${id}/edit`);
    const form = new ProjectFormPage(page);
    const dialog = new DeleteProjectDialog(page);
    const toasts = new Toasts(page);

    await expect(form.dangerZone).toContainText('Deleting Harvest removes the project page and its 23 comments.');
    await form.deleteProject.click();

    await expect(dialog.dialog).toHaveAccessibleName('Delete Harvest?');
    await expect(dialog.confirmName).toBeFocused();
    await expect(dialog.confirm).toBeDisabled();

    await dialog.confirmName.fill('harvest app');
    await expect(dialog.mismatch).toContainText("That doesn't match. Type Harvest exactly");
    await expect(dialog.confirm).toBeDisabled();

    await dialog.confirmName.fill('Harvest');
    await expect(dialog.mismatch).toHaveCount(0);
    await expect(dialog.confirm).toBeEnabled();
    const release = await dialog.holdDelete();
    await dialog.confirm.click();

    await expect(dialog.confirm).toHaveText('Deleting…');
    release();
    await expect(page).toHaveURL(/\/projects$/);
    await expect(toasts.withTitle('Harvest deleted')).toBeVisible();

    const response = await page.goto(`/projects/${id}`);
    expect(response?.status()).toBe(404);
  });

  test('a failed delete keeps the project and the typed name and offers "Try again"', async ({ page }) => {
    const owner = createBuilder();
    const id = createProject(owner, { name: 'Harvest' });
    await signedInAt(page, owner, `/projects/${id}/edit`);
    const form = new ProjectFormPage(page);
    const dialog = new DeleteProjectDialog(page);
    await form.deleteProject.click();
    await dialog.confirmName.fill('Harvest');
    await dialog.failNextDelete();

    await dialog.confirm.click();

    await expect(dialog.alert).toContainText("We couldn't delete Harvest");
    await expect(dialog.confirmName).toHaveValue('Harvest');
    await expect(dialog.confirm).toHaveText('Try again');
    await dialog.confirm.click();
    await expect(page).toHaveURL(/\/projects$/);
  });

  test('"Keep project" closes the dialog and leaves the project', async ({ page }) => {
    const owner = createBuilder();
    const id = createProject(owner, { name: 'Harvest' });
    await signedInAt(page, owner, `/projects/${id}/edit`);
    const form = new ProjectFormPage(page);
    const dialog = new DeleteProjectDialog(page);
    await form.deleteProject.click();

    await dialog.keep.click();

    await expect(dialog.dialog).toHaveCount(0);
    await expect(form.deleteProject).toBeFocused();
    await expect(page).toHaveURL(new RegExp(`/projects/${id}/edit$`));
  });
});
