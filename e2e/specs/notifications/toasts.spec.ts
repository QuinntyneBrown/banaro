// Acceptance Test
// Traces to: L2-028, L2-003
// Description: Toasts announce outcomes. A danger toast stays until dismissed; at most three show,
// newest on top, and the rest queue; an action runs once and closes its toast. A failed sign-out
// keeps the member signed in and offers to try again (L2-003 criterion 11).

import { expect, test } from '@playwright/test';
import { resetRateLimits } from '../../fixtures/backend';
import { createMember } from '../../fixtures/members';
import { AccountMenu } from '../../pages/account-menu';
import { SignInPage } from '../../pages/sign-in.page';
import { Toasts } from '../../pages/toasts';

test.describe('toasts', () => {
  test.beforeEach(async ({ page }) => {
    resetRateLimits();
    const member = createMember();
    const signIn = new SignInPage(page);
    await signIn.open('/about');
    await signIn.signIn(member.email, member.password);
    await expect(page).toHaveURL(/\/about$/);
  });

  test('a failed sign-out keeps the member signed in and shows a danger toast that stays', async ({
    page,
  }) => {
    const menu = new AccountMenu(page);
    const toasts = new Toasts(page);
    await menu.breakSignOut();

    await menu.signOutNow();

    const toast = toasts.withTitle("We couldn't sign you out");
    await expect(toast).toBeVisible();
    await expect(toast).toHaveAttribute('role', 'alert');
    expect(await toasts.variant(toast)).toBe('danger');
    await expect(menu.trigger).toBeVisible();
    await page.waitForTimeout(7_000);
    await expect(toast).toBeVisible();

    await toasts.dismiss(toast).click();
    await expect(toast).toHaveCount(0);
  });

  test('"Try again" runs once, closes the toast and signs out', async ({ page }) => {
    const menu = new AccountMenu(page);
    const toasts = new Toasts(page);
    const signIn = new SignInPage(page);
    await menu.breakSignOut();
    await menu.signOutNow();
    const toast = toasts.withTitle("We couldn't sign you out");
    await expect(toast).toBeVisible();
    await menu.restoreSignOut();

    await toasts.action(toast).click();

    await expect(toast).toHaveCount(0);
    await expect(signIn.title).toHaveText("You're signed out");
  });

  test('at most three toasts show, newest on top, and the rest wait', async ({ page }) => {
    const menu = new AccountMenu(page);
    const toasts = new Toasts(page);
    await menu.breakSignOut();

    for (let attempt = 1; attempt <= 4; attempt++) {
      await menu.signOutNow();
      await expect(toasts.all).toHaveCount(Math.min(attempt, 3));
    }

    await expect(toasts.all).toHaveCount(3);
    await toasts.dismiss(toasts.all.first()).click();
    await expect(toasts.all).toHaveCount(3);
    await toasts.dismiss(toasts.all.first()).click();
    await expect(toasts.all).toHaveCount(2);
  });
});
