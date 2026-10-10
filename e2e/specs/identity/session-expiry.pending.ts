// Acceptance Test
// Traces to: L2-005
// Description: When a member's session expires while they edit, the next save opens the
// session-expired dialog over the page with the typed input kept; signing back in closes it and
// retries the save once. A wrong password, a refused sign-in and a failure keep the dialog open;
// "Sign out" leaves for /sign-in; Escape does not close it; a second tab follows the first.

import { expect, type Page, test } from '@playwright/test';
import { resetRateLimits } from '../../fixtures/backend';
import { type BuilderMember, createBuilder } from '../../fixtures/builders';
import { ProfileEditPage } from '../../pages/profile-edit.page';
import { SessionExpiredDialog } from '../../pages/session-expired.dialog';
import { SignInPage } from '../../pages/sign-in.page';

async function editingProfile(page: Page, member: BuilderMember): Promise<ProfileEditPage> {
  const signIn = new SignInPage(page);
  await signIn.open('/about');
  await signIn.signIn(member.email, member.password);
  await expect(page).toHaveURL(/\/about$/);
  const edit = new ProfileEditPage(page);
  await edit.open();
  await edit.headline.fill('Kept while signed out');
  return edit;
}

test.describe('session expiry', () => {
  test.beforeEach(() => resetRateLimits());

  test('the dialog opens over the page, keeps the input and retries the save after sign-in', async ({
    page,
    context,
  }) => {
    const member = createBuilder();
    const edit = await editingProfile(page, member);
    const dialog = new SessionExpiredDialog(page);
    await SessionExpiredDialog.expire(context);

    await edit.save.click();

    await expect(dialog.dialog).toBeVisible();
    await expect(dialog.password).toBeFocused();
    await expect(dialog.email).toHaveValue(member.email);
    await expect(dialog.email).toHaveAttribute('readonly', '');
    await expect(edit.headline).toHaveValue('Kept while signed out');

    await dialog.signInWith(member.password);

    await expect(dialog.dialog).toBeHidden();
    await expect(edit.saved).toBeVisible();
    await page.reload();
    await expect(edit.headline).toHaveValue('Kept while signed out');
  });

  test('Escape does not close the dialog', async ({ page, context }) => {
    const member = createBuilder();
    const edit = await editingProfile(page, member);
    const dialog = new SessionExpiredDialog(page);
    await SessionExpiredDialog.expire(context);
    await edit.save.click();
    await expect(dialog.dialog).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(dialog.dialog).toBeVisible();
  });

  test('a wrong password keeps the dialog open and offers a reset in a new tab', async ({
    page,
    context,
  }) => {
    const member = createBuilder();
    const edit = await editingProfile(page, member);
    const dialog = new SessionExpiredDialog(page);
    await SessionExpiredDialog.expire(context);
    await edit.save.click();

    await dialog.signInWith('not-the-right-password');

    await expect(dialog.fieldError).toContainText("That password doesn't match. Try again, or");
    await expect(dialog.resetLink).toHaveAttribute('href', '/forgot-password');
    await expect(dialog.resetLink).toHaveAttribute('target', '_blank');
    await expect(dialog.password).toBeFocused();
    await expect(dialog.dialog).toBeVisible();
  });

  test('too many attempts name the wait and keep the dialog open', async ({ page, context }) => {
    const member = createBuilder();
    const edit = await editingProfile(page, member);
    const dialog = new SessionExpiredDialog(page);
    await SessionExpiredDialog.expire(context);
    await edit.save.click();
    await dialog.answerNextSignIn(429, { 'Retry-After': '240' });

    await dialog.signInWith(member.password);

    await expect(dialog.alert).toContainText('Too many sign-in attempts. Try again in 4 minutes.');
    await expect(dialog.dialog).toBeVisible();
  });

  test('a failure shows the failed state with "Try again"', async ({ page, context }) => {
    const member = createBuilder();
    const edit = await editingProfile(page, member);
    const dialog = new SessionExpiredDialog(page);
    await SessionExpiredDialog.expire(context);
    await edit.save.click();
    await dialog.answerNextSignIn(503);

    await dialog.signInWith(member.password);

    await expect(dialog.alert).toContainText("We couldn't sign you in");
    await expect(dialog.signBackIn).toHaveText('Try again');
    await dialog.signBackIn.click();
    await expect(dialog.dialog).toBeHidden();
    await expect(edit.saved).toBeVisible();
  });

  test('"Sign out" leaves for the sign-in page', async ({ page, context }) => {
    const member = createBuilder();
    const edit = await editingProfile(page, member);
    const dialog = new SessionExpiredDialog(page);
    await SessionExpiredDialog.expire(context);
    await edit.save.click();

    await dialog.signOut.click();

    await expect(page).toHaveURL(/\/sign-in$/);
    await expect(dialog.dialog).toBeHidden();
  });

  test('a second tab with the same expired session follows the first', async ({ context }) => {
    const member = createBuilder();
    const first = await context.newPage();
    const editFirst = await editingProfile(first, member);
    const second = await context.newPage();
    const editSecond = new ProfileEditPage(second);
    await editSecond.open();
    await editSecond.headline.fill('Typed in the second tab');
    await SessionExpiredDialog.expire(context);

    await editFirst.save.click();
    await editSecond.save.click();
    const dialogFirst = new SessionExpiredDialog(first);
    const dialogSecond = new SessionExpiredDialog(second);
    await expect(dialogFirst.dialog).toBeVisible();
    await expect(dialogSecond.dialog).toBeVisible();

    await dialogFirst.signInWith(member.password);

    await expect(dialogSecond.dialog).toBeHidden();
    await expect(editSecond.saved).toBeVisible();
  });
});
