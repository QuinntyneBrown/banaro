// Acceptance Test
// Traces to: L2-007, L2-028
// Description: A member edits their profile at /profile/edit: every field saves and survives a
// reload; invalid values show field errors; the save button is busy while saving and a success
// alert and toast confirm it; a failed load or save offers to try again and keeps what was typed;
// markup is shown as text; the loading state shows skeletons.

import { expect, type Page, test } from '@playwright/test';
import { resetRateLimits } from '../../fixtures/backend';
import { type BuilderMember, createBuilder } from '../../fixtures/builders';
import { AccountMenu } from '../../pages/account-menu';
import { ProfileEditPage } from '../../pages/profile-edit.page';
import { SignInPage } from '../../pages/sign-in.page';
import { Toasts } from '../../pages/toasts';

async function signInAs(page: Page, member: BuilderMember): Promise<void> {
  const signIn = new SignInPage(page);
  await signIn.open('/about');
  await signIn.signIn(member.email, member.password);
  await expect(page).toHaveURL(/\/about$/);
}

test.describe('edit own profile', () => {
  test.beforeEach(() => resetRateLimits());

  test('every field saves and survives a reload', async ({ page }) => {
    await signInAs(page, createBuilder({ name: 'Amara Osei' }));
    const edit = new ProfileEditPage(page);
    await edit.open();
    await expect(edit.name).toHaveValue('Amara Osei');

    await edit.headline.fill('Founder · Product');
    await edit.neighbourhood.selectOption({ label: 'Riverdale' });
    await edit.bio.fill('Building Harvest, volunteer scheduling for GTA food banks.');
    await edit.skillInput.fill('Product strategy');
    await edit.addSkill.click();
    await edit.skillInput.fill('Rust');
    await edit.skillInput.press('Enter');
    await edit.openTo('Advising').check();
    await edit.lookingFor.fill('A technical co-founder.');
    await edit.addExperience.click();
    await edit.experienceField(0, 'Role title').fill('Founder');
    await edit.experienceField(0, 'Organisation').fill('Harvest');
    await edit.experienceField(0, 'Started').fill('2024-03-01');
    await edit.addLink.click();
    await edit.linkField(0, 'Link name').fill('Harvest');
    await edit.linkField(0, 'Web address').fill('https://harvest.example.ca');
    await edit.save.click();

    await expect(edit.saved).toContainText('Profile saved');
    await expect(new Toasts(page).withTitle('Profile saved')).toBeVisible();
    await page.reload();
    await expect(edit.headline).toHaveValue('Founder · Product');
    await expect(edit.neighbourhood.locator('option:checked')).toHaveText('Riverdale');
    await expect(edit.skills).toHaveText(['Product strategy', 'Rust']);
    await expect(edit.openTo('Advising')).toBeChecked();
    await expect(edit.experienceField(0, 'Organisation')).toHaveValue('Harvest');
    await expect(edit.linkField(0, 'Web address')).toHaveValue('https://harvest.example.ca');
  });

  test('a removed skill is gone after saving', async ({ page }) => {
    await signInAs(page, createBuilder());
    const edit = new ProfileEditPage(page);
    await edit.open();
    await edit.skillInput.fill('Figma');
    await edit.skillInput.press('Enter');
    await edit.save.click();
    await expect(edit.saved).toBeVisible();

    await edit.removeSkill('Figma').click();
    await edit.save.click();

    await page.reload();
    await expect(edit.skills).toHaveCount(0);
  });

  test('invalid values show field errors and focus the summary', async ({ page }) => {
    await signInAs(page, createBuilder());
    const edit = new ProfileEditPage(page);
    await edit.open();

    await edit.name.fill('');
    await edit.bio.fill('a'.repeat(501));
    await edit.openTo('Co-founding').uncheck();
    await edit.save.click();

    expect(await edit.summaryErrors()).toEqual([
      'Enter your name so builders know who you are.',
      'Your bio is 501 characters. Shorten it to 500 or fewer.',
      'Choose at least one way you are open to working with others.',
    ]);
    await expect(edit.errorSummary).toBeFocused();
    await expect(edit.name).toHaveAttribute('aria-invalid', 'true');
    await expect(edit.bioCounter).toHaveText('501 / 500');
  });

  test('a malformed link is refused by the server and shown next to the field', async ({ page }) => {
    await signInAs(page, createBuilder());
    const edit = new ProfileEditPage(page);
    await edit.open();
    await edit.addLink.click();
    await edit.linkField(0, 'Link name').fill('Site');
    await edit.linkField(0, 'Web address').fill('ftp://harvest.example.ca');

    await edit.save.click();

    await expect(edit.errorSummary).toContainText('Enter a web address that starts with https://');
  });

  test('saving is busy and disables the buttons until the answer arrives', async ({ page }) => {
    await signInAs(page, createBuilder());
    const edit = new ProfileEditPage(page);
    await edit.open();
    const release = await edit.hold('PUT');

    await edit.save.click();

    await expect(edit.save).toHaveText('Saving…');
    await expect(edit.save).toBeDisabled();
    release();
    await expect(edit.saved).toBeVisible();
  });

  test('a failed save keeps what was typed and offers to try again', async ({ page }) => {
    await signInAs(page, createBuilder());
    const edit = new ProfileEditPage(page);
    await edit.open();
    await edit.headline.fill('Product lead');
    await edit.failNext('PUT');

    await edit.save.click();

    await expect(edit.alert).toContainText("We couldn't save your profile");
    await expect(edit.headline).toHaveValue('Product lead');
    await edit.alert.getByRole('button', { name: 'Try again' }).click();
    await expect(edit.saved).toBeVisible();
  });

  // Both arrive through the account menu: a client-side navigation, so the browser loads the
  // profile itself rather than receiving it in the server-rendered page.
  test('a failed load offers to try again', async ({ page }) => {
    await signInAs(page, createBuilder({ name: 'Amara Osei' }));
    const edit = new ProfileEditPage(page);
    await edit.failNext('GET');

    await new AccountMenu(page).go('Edit profile');

    await expect(edit.errorTitle).toHaveText("We couldn't load your profile");
    await edit.tryAgain.click();
    await expect(edit.name).toHaveValue('Amara Osei');
  });

  test('the loading state shows skeletons until the profile arrives', async ({ page }) => {
    await signInAs(page, createBuilder());
    const edit = new ProfileEditPage(page);
    const release = await edit.hold('GET');

    await new AccountMenu(page).go('Edit profile');

    await expect(edit.skeleton.first()).toBeVisible();
    await expect(edit.save).toHaveCount(0);
    release();
    await expect(edit.name).toBeVisible();
  });

  test('markup in a profile is shown as text', async ({ page }) => {
    await signInAs(page, createBuilder());
    const edit = new ProfileEditPage(page);
    await edit.open();

    await edit.name.fill('<b>Amara</b> Osei');
    await edit.save.click();
    await expect(edit.saved).toBeVisible();

    await page.reload();
    await expect(edit.name).toHaveValue('<b>Amara</b> Osei');
    await expect(page.getByRole('banner').getByText('<b>Amara</b>')).toBeVisible();
  });
});
