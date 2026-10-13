// Acceptance Test
// Traces to: L2-017
// Description:
// Given a project that is looking for roles, when a member who is not its owner opens "Offer to help",
// then the dialog offers only those roles, and sending a role with a message of 10 to 1,000 characters
// closes it with a confirmation. A missing role or message is explained next to its field and nothing is
// sent. A member with an offer already waiting is told so. While sending, the fields are read-only and
// the button busy; a failure keeps the inputs and offers "Try again". A project looking for no one
// offers no way to help, and the owner has none.

import { expect, type Page, test } from '@playwright/test';
import { resetRateLimits } from '../../fixtures/backend';
import { type BuilderMember, createBuilder } from '../../fixtures/builders';
import { createHelpOffer } from '../../fixtures/help-offers';
import { createProject } from '../../fixtures/projects';
import { OfferToHelpDialog } from '../../pages/offer-to-help.dialog';
import { ProjectPage } from '../../pages/project.page';
import { SignInPage } from '../../pages/sign-in.page';
import { Toasts } from '../../pages/toasts';

async function signedInAt(page: Page, member: BuilderMember, id: string): Promise<void> {
  const signIn = new SignInPage(page);
  await signIn.open(`/projects/${id}`);
  await signIn.signIn(member.email, member.password);
  await expect(page).toHaveURL(new RegExp(`/projects/${id}$`), { timeout: 45_000 });
}

const MESSAGE = 'I can review the Laravel code on weekends and help write tests.';

test.describe('offer to help with a project', () => {
  test.beforeEach(() => resetRateLimits());

  test('a member offers a role the project is looking for and sees a confirmation', async ({ page }) => {
    const id = createProject(createBuilder({ name: 'Daniel Reyes' }), {
      name: 'Psalter',
      lookingFor: ['contributor', 'advisor'],
    });
    await signedInAt(page, createBuilder({ name: 'Amara Osei' }), id);
    const project = new ProjectPage(page);
    const dialog = new OfferToHelpDialog(page);
    const toasts = new Toasts(page);

    await project.offerToHelp.click();

    await expect(dialog.dialog).toHaveAccessibleName('Offer to help with Psalter');
    await expect(dialog.description).toContainText('Daniel is notified');
    expect(await dialog.roleOptions()).toEqual(['Choose a role', 'Contributors', 'Advisor']);
    await expect(dialog.role).toBeFocused();

    await dialog.role.selectOption({ label: 'Advisor' });
    await dialog.message.fill(MESSAGE);
    await dialog.send.click();

    await expect(dialog.dialog).toHaveCount(0);
    await expect(toasts.withTitle('Offer sent')).toContainText('Daniel has your offer');
    await expect(project.offerToHelp).toBeFocused();
  });

  test('a missing role or message is explained next to its field and nothing is sent', async ({ page }) => {
    const id = createProject(createBuilder({ name: 'Daniel Reyes' }), { name: 'Psalter', lookingFor: ['contributor'] });
    await signedInAt(page, createBuilder(), id);
    const project = new ProjectPage(page);
    const dialog = new OfferToHelpDialog(page);
    await project.offerToHelp.click();

    await dialog.send.click();

    await expect(dialog.roleError).toHaveText('Choose how you could help.');
    await expect(dialog.messageError).toContainText('Write a message before sending');
    await expect(dialog.role).toBeFocused();

    await dialog.role.selectOption({ label: 'Contributors' });
    await dialog.message.fill('Too short');
    await dialog.send.click();
    await expect(dialog.messageError).toContainText('Use at least 10 characters');
    await expect(dialog.message).toBeFocused();
  });

  test('a member with an offer already waiting is told so', async ({ page }) => {
    const id = createProject(createBuilder({ name: 'Daniel Reyes' }), { name: 'Psalter', lookingFor: ['contributor'] });
    const member = createBuilder({ name: 'Amara Osei' });
    createHelpOffer(id, member);
    await signedInAt(page, member, id);
    const project = new ProjectPage(page);
    const dialog = new OfferToHelpDialog(page);
    await project.offerToHelp.click();
    await dialog.role.selectOption({ label: 'Contributors' });
    await dialog.message.fill(MESSAGE);

    await dialog.send.click();

    await expect(dialog.alert).toContainText('You already have an offer waiting');
    await expect(dialog.message).toHaveValue(MESSAGE);
    await expect(dialog.dialog).toBeVisible();
  });

  test('while sending, the fields are read-only and the button busy; "Cancel" stays available', async ({ page }) => {
    const id = createProject(createBuilder({ name: 'Daniel Reyes' }), { name: 'Psalter', lookingFor: ['contributor'] });
    await signedInAt(page, createBuilder(), id);
    const project = new ProjectPage(page);
    const dialog = new OfferToHelpDialog(page);
    await project.offerToHelp.click();
    const release = await dialog.holdSend();
    await dialog.role.selectOption({ label: 'Contributors' });
    await dialog.message.fill(MESSAGE);

    await dialog.send.click();

    await expect(dialog.send).toHaveText('Sending…');
    await expect(dialog.send).toBeDisabled();
    await expect(dialog.message).toHaveAttribute('readonly', '');
    await expect(dialog.role).toBeDisabled();
    await expect(dialog.cancel).toBeEnabled();
    release();
    await expect(dialog.dialog).toHaveCount(0);
  });

  test('a failure keeps the inputs and offers "Try again"', async ({ page }) => {
    const id = createProject(createBuilder({ name: 'Daniel Reyes' }), { name: 'Psalter', lookingFor: ['contributor'] });
    await signedInAt(page, createBuilder(), id);
    const project = new ProjectPage(page);
    const dialog = new OfferToHelpDialog(page);
    await project.offerToHelp.click();
    await dialog.role.selectOption({ label: 'Contributors' });
    await dialog.message.fill(MESSAGE);
    await dialog.failNextSend(500);

    await dialog.send.click();

    await expect(dialog.alert).toContainText("We couldn't send your offer");
    await expect(dialog.message).toHaveValue(MESSAGE);
    await expect(dialog.role).toHaveValue('contributor');
    await expect(dialog.send).toHaveText('Try again');
    await dialog.send.click();
    await expect(dialog.dialog).toHaveCount(0);
  });

  test('a project looking for no one offers no way to help, and the owner has none', async ({ page }) => {
    const nobody = createProject(createBuilder({ name: 'Grace Liu' }), { name: 'Gather', lookingFor: [] });
    const owner = createBuilder({ name: 'Daniel Reyes' });
    const own = createProject(owner, { name: 'Psalter', lookingFor: ['contributor'] });
    const project = new ProjectPage(page);

    await signedInAt(page, createBuilder(), nobody);
    await expect(project.title).toHaveText('Gather');
    await expect(project.offerToHelp).toHaveCount(0);

    await page.context().clearCookies();
    await signedInAt(page, owner, own);
    await expect(project.title).toHaveText('Psalter');
    await expect(project.offerToHelp).toHaveCount(0);
  });
});
