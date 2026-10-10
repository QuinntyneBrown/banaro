// Acceptance Test
// Traces to: L2-003
// Description: A member signs in at /sign-in and lands on the dashboard or a safe return path; wrong
// details get one generic message; an invalid form never calls the API; a 429 names the wait; and
// "Sign out" in the account menu closes the menu, ends the session and shows the signed-out state.

import { expect, test } from '@playwright/test';
import { resetRateLimits } from '../../fixtures/backend';
import { createMember } from '../../fixtures/members';
import { AccountMenu } from '../../pages/account-menu';
import { SignInPage } from '../../pages/sign-in.page';

test.describe('sign in and sign out', () => {
  test.beforeEach(() => resetRateLimits());

  test('valid details land on the dashboard and the header shows the account', async ({ page }) => {
    const member = createMember({ name: 'Amara Osei' });
    const signIn = new SignInPage(page);
    await signIn.open();

    await signIn.signIn(member.email, member.password);

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(new AccountMenu(page).trigger).toHaveAccessibleName('Your account, Amara Osei');
  });

  test('a same-origin return path is honoured and another origin is ignored', async ({ page }) => {
    const member = createMember();
    const signIn = new SignInPage(page);

    await signIn.open('/about');
    await signIn.signIn(member.email, member.password);
    await expect(page).toHaveURL(/\/about$/);

    await page.context().clearCookies();
    await signIn.open('//evil.example/steal');
    await signIn.signIn(member.email, member.password);
    await expect(page).toHaveURL(/localhost:\d+\/dashboard$/);
  });

  test('wrong details show one generic message and keep the e-mail', async ({ page }) => {
    const member = createMember();
    const signIn = new SignInPage(page);
    await signIn.open();

    await signIn.signIn(member.email, 'not-the-right-password');

    await expect(signIn.alert).toContainText("Those details don't match");
    await expect(signIn.alert).toContainText('Check your e-mail and password and try again');
    await expect(signIn.alert).not.toContainText(/password is wrong|unknown e-mail/i);
    await expect(signIn.email).toHaveValue(member.email);
    await expect(signIn.password).toBeFocused();
    await expect(signIn.submit).toHaveText('Try again');
  });

  test('an invalid form shows field errors without calling the API', async ({ page }) => {
    const signIn = new SignInPage(page);
    await signIn.open();
    const requests = signIn.countSignInRequests();

    await signIn.email.fill('amara@');
    await signIn.submit.click();

    expect(await signIn.summaryErrors()).toEqual([
      'Enter your e-mail address in the form name@example.com',
      'Enter your password',
    ]);
    await expect(signIn.email).toBeFocused();
    expect(requests()).toBe(0);
  });

  test('too many attempts name the wait in whole minutes and keep the e-mail', async ({ page }) => {
    const signIn = new SignInPage(page);
    await signIn.open();
    await signIn.throttleNextAttempt(125);

    await signIn.signIn('amara@harvest.example', 'whatever-it-was-2026');

    await expect(signIn.alert).toContainText('Too many sign-in attempts. Try again in 3 minutes.');
    await expect(signIn.email).toHaveValue('amara@harvest.example');
  });

  test('the account menu moves focus to its first item and Escape returns it', async ({ page }) => {
    const member = createMember();
    const signIn = new SignInPage(page);
    await signIn.open('/about');
    await signIn.signIn(member.email, member.password);
    const menu = new AccountMenu(page);

    await menu.trigger.focus();
    await page.keyboard.press('Enter');

    await expect(menu.menu).toBeVisible();
    await expect(menu.items).toHaveText([
      'View profile',
      'Edit profile',
      'Settings',
      'Your projects',
      'Sign out',
    ]);
    await expect(menu.items.first()).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(menu.menu).toBeHidden();
    await expect(menu.trigger).toBeFocused();
  });

  test('sign out closes the menu, ends the session and shows the signed-out state', async ({
    page,
  }) => {
    const member = createMember();
    const signIn = new SignInPage(page);
    await signIn.open('/about');
    await signIn.signIn(member.email, member.password);
    const menu = new AccountMenu(page);

    await menu.open();
    await menu.signOut.click();

    await expect(menu.menu).toBeHidden();
    await expect(signIn.title).toHaveText("You're signed out");
    await expect(signIn.title).toBeFocused();
    await expect(menu.signInLink).toBeVisible();

    await page.reload();
    await expect(menu.signInLink).toBeVisible();
    await expect(menu.trigger).toHaveCount(0);
  });

  test('the signed-out state cannot be reached from a link', async ({ page }) => {
    const signIn = new SignInPage(page);
    await page.goto('/sign-in?signedOut=true');

    await expect(signIn.title).toHaveText('Sign in');
  });
});
