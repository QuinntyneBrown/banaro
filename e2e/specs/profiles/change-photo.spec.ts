// Acceptance Test
// Traces to: L2-008
// Description:
// Given a member on /profile/edit, when they choose "Change photo", then the change-photo dialog opens
// with focus on "Choose a photo" and "Save photo" unavailable until a valid file is chosen.
// Given a JPEG of at least 480 × 480 px, when they choose it, then its name, size and a square preview
// show; when they save, the dialog is busy and Escape does not close it; once the scan passes, the
// dialog closes and the photo replaces the initials on the page and in the header.
// Given a file under 480 px or of another type, when chosen, then the invalid state names the problem
// and focus moves to "Choose a different photo". Given a server failure, then the failed state keeps
// the file and "Try again" resends it. Given a photo the scanner rejects, then the dialog says so.
// Given a member with a photo, when they choose "Remove photo", then the initials show again.

import { expect, type Page, test } from '@playwright/test';
import { resetRateLimits } from '../../fixtures/backend';
import { type BuilderMember, createBuilder } from '../../fixtures/builders';
import { runQueuedJobs } from '../../fixtures/worker';
import { AccountMenu } from '../../pages/account-menu';
import { ChangePhotoDialog } from '../../pages/change-photo.dialog';
import { ProfileEditPage } from '../../pages/profile-edit.page';
import { SignInPage } from '../../pages/sign-in.page';

async function editingProfile(page: Page, member: BuilderMember): Promise<ProfileEditPage> {
  const signIn = new SignInPage(page);
  await signIn.open('/about');
  await signIn.signIn(member.email, member.password);
  await expect(page).toHaveURL(/\/about$/);
  const edit = new ProfileEditPage(page);
  await edit.open();
  return edit;
}

/** Uploads the fixture photo through the dialog and lets the worker scan it. */
async function uploadPhoto(edit: ProfileEditPage, dialog: ChangePhotoDialog): Promise<void> {
  await edit.changePhoto.click();
  await dialog.choosePhoto('amara-harvest-day.jpg');
  await dialog.saveAndWaitForUpload();
  runQueuedJobs();
  await expect(dialog.dialog).toBeHidden({ timeout: 20_000 });
}

test.describe('change profile photo', () => {
  test.beforeEach(() => resetRateLimits());

  test('the dialog opens with focus on "Choose a photo" and nothing to save yet', async ({ page }) => {
    const edit = await editingProfile(page, createBuilder({ name: 'Amara Osei' }));
    const dialog = new ChangePhotoDialog(page);
    await expect(edit.initials).toHaveText('AO');

    await edit.changePhoto.click();

    await expect(dialog.dialog).toBeVisible();
    await expect(dialog.description).toHaveText('Builders see this on your profile and in the directory.');
    await expect(dialog.fileInput).toBeFocused();
    await expect(dialog.choose).toHaveText('Choose a photo');
    await expect(dialog.save).toHaveAttribute('aria-disabled', 'true');
    await expect(dialog.removePhoto).toHaveCount(0);
  });

  test('a valid photo uploads, is scanned and replaces the initials on the page and in the header', async ({
    page,
  }) => {
    const edit = await editingProfile(page, createBuilder());
    const dialog = new ChangePhotoDialog(page);
    const account = new AccountMenu(page);
    await edit.changePhoto.click();

    await dialog.choosePhoto('amara-harvest-day.jpg');

    await expect(dialog.fileName).toHaveText('amara-harvest-day.jpg');
    await expect(dialog.fileSize).toHaveText('13 KB');
    await expect(dialog.preview).toBeVisible();
    await expect(dialog.save).not.toHaveAttribute('aria-disabled', 'true');

    const release = await dialog.holdUpload();
    await dialog.save.click();
    await expect(dialog.save).toHaveText('Uploading…');
    await expect(dialog.progress).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog.dialog).toBeVisible();
    await release();

    runQueuedJobs();
    await expect(dialog.dialog).toBeHidden({ timeout: 20_000 });
    await expect(edit.photo).toBeVisible();
    await expect(edit.initials).toHaveCount(0);
    await expect(account.photo).toBeVisible();

    await page.reload();
    await expect(edit.photo).toBeVisible();
    await expect(account.photo).toBeVisible();
  });

  test('a photo under 480 px is refused in the dialog and focus moves to choose again', async ({ page }) => {
    const edit = await editingProfile(page, createBuilder());
    const dialog = new ChangePhotoDialog(page);
    await edit.changePhoto.click();

    await dialog.choosePhoto('small-photo.jpg');

    await expect(dialog.dropzone).toHaveAttribute('aria-invalid', 'true');
    await expect(dialog.error).toHaveText('That image is 300 × 300 pixels. Choose one at least 480 × 480.');
    await expect(dialog.choose).toHaveText('Choose a different photo');
    await expect(dialog.fileInput).toBeFocused();
    await expect(dialog.save).toHaveAttribute('aria-disabled', 'true');
  });

  test('a file of another type is refused and named', async ({ page }) => {
    const edit = await editingProfile(page, createBuilder());
    const dialog = new ChangePhotoDialog(page);
    await edit.changePhoto.click();

    await dialog.choosePhoto('team-offsite.heic');

    await expect(dialog.fileName).toHaveText('team-offsite.heic');
    await expect(dialog.error).toHaveText('That file is a HEIC. Choose a JPG, PNG or WebP image.');
  });

  test('a server failure keeps the photo selected and "Try again" resends it', async ({ page }) => {
    const edit = await editingProfile(page, createBuilder());
    const dialog = new ChangePhotoDialog(page);
    await edit.changePhoto.click();
    await dialog.choosePhoto('amara-harvest-day.jpg');
    await dialog.failNextUpload();

    await dialog.save.click();

    await expect(dialog.alert).toContainText("We couldn't upload your photo");
    await expect(dialog.alert).toContainText('Your photo is still selected. Check your connection and try again.');
    await expect(dialog.fileName).toHaveText('amara-harvest-day.jpg');
    await expect(dialog.save).toHaveText('Try again');

    await dialog.saveAndWaitForUpload();
    runQueuedJobs();
    await expect(dialog.dialog).toBeHidden({ timeout: 20_000 });
    await expect(edit.photo).toBeVisible();
  });

  test('a photo the scanner rejects is reported and the initials stay', async ({ page }) => {
    const edit = await editingProfile(page, createBuilder());
    const dialog = new ChangePhotoDialog(page);
    await edit.changePhoto.click();
    await dialog.choosePhoto('amara-harvest-day.jpg');
    await dialog.rejectScan();

    await dialog.save.click();

    await expect(dialog.error).toHaveText("We couldn't use that photo. Choose a different one.");
    await expect(dialog.choose).toHaveText('Choose a different photo');
    await expect(dialog.dialog).toBeVisible();
    await dialog.cancel.click();
    await expect(edit.initials).toBeVisible();
  });

  test('"Remove photo" brings the initials back', async ({ page }) => {
    // Uploads, scans and removes a photo: three round trips through the API and the worker.
    test.slow();
    const edit = await editingProfile(page, createBuilder({ name: 'Amara Osei' }));
    const dialog = new ChangePhotoDialog(page);
    const account = new AccountMenu(page);
    await uploadPhoto(edit, dialog);
    await expect(edit.photo).toBeVisible();

    await edit.changePhoto.click();
    await dialog.removePhoto.click();

    await expect(dialog.dialog).toBeHidden();
    await expect(edit.initials).toHaveText('AO');
    await expect(account.photo).toHaveCount(0);
    await page.reload();
    await expect(edit.initials).toHaveText('AO');
  });
});
