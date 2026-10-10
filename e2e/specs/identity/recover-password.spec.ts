// Acceptance Test
// Traces to: L2-004
// Description: Any well-formed address on /forgot-password shows the same success state; a malformed
// one is caught before any request; a 429 names the wait. A fresh reset link lets the member choose a
// new password and sign in with it; an expired link offers a new one; mismatched and current
// passwords show their specific problems.

import { expect, test } from '@playwright/test';
import { resetRateLimits } from '../../fixtures/backend';
import { createBuilder } from '../../fixtures/builders';
import { resetLink } from '../../fixtures/password-reset';
import { ForgotPasswordPage } from '../../pages/forgot-password.page';
import { ResetPasswordPage } from '../../pages/reset-password.page';
import { SignInPage } from '../../pages/sign-in.page';

const NEW_PASSWORD = 'lanterns-on-queen-street';

test.describe('recover a forgotten password', () => {
  test.beforeEach(() => resetRateLimits());

  test('any well-formed address shows the same success state and can be sent again', async ({
    page,
  }) => {
    const forgot = new ForgotPasswordPage(page);
    await forgot.open();

    await forgot.request('nobody@harvest.example');

    await expect(forgot.title).toHaveText('Check your e-mail');
    await expect(forgot.sub).toHaveText(
      'If an account exists for nobody@harvest.example, a reset link is on its way. It works for 60 minutes.',
    );
    const requests = forgot.countRequests();
    await forgot.sendAgain.click();
    await expect.poll(requests).toBe(1);
    await expect(forgot.title).toHaveText('Check your e-mail');
  });

  test('a malformed address is caught without a request', async ({ page }) => {
    const forgot = new ForgotPasswordPage(page);
    await forgot.open();
    const requests = forgot.countRequests();

    await forgot.request('amara@');

    await expect(forgot.errorSummary).toContainText('Enter an e-mail address like name@example.com');
    await expect(forgot.email).toBeFocused();
    expect(requests()).toBe(0);
  });

  test('too many requests name the wait in whole minutes', async ({ page }) => {
    const forgot = new ForgotPasswordPage(page);
    await forgot.open();
    await forgot.throttleNextRequest(1_800);

    await forgot.request('amara@harvest.example');

    await expect(forgot.alert).toContainText('Too many requests. Try again in 30 minutes.');
  });

  test('a fresh link sets a new password that then signs in', async ({ page }) => {
    const member = createBuilder();
    const reset = new ResetPasswordPage(page);
    await reset.open(resetLink(member));
    await expect(reset.sub).toHaveText(`Choose a new password for ${member.email}.`);

    await reset.choose(NEW_PASSWORD);

    await expect(reset.title).toHaveText('Password updated');
    await reset.signIn.click();
    const signIn = new SignInPage(page);
    await signIn.signIn(member.email, NEW_PASSWORD);
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('an expired link offers a new one', async ({ page }) => {
    const member = createBuilder();
    const reset = new ResetPasswordPage(page);

    await reset.open(resetLink(member, { ageMinutes: 61 }));

    await expect(reset.title).toHaveText('This link has expired');
    await expect(reset.sendNewLink).toHaveAttribute('href', '/forgot-password');
  });

  test('mismatched and current passwords show their specific problems', async ({ page }) => {
    const member = createBuilder();
    const reset = new ResetPasswordPage(page);
    await reset.open(resetLink(member));

    await reset.choose(NEW_PASSWORD, 'lanterns-on-king-street');
    expect(await reset.summaryErrors()).toEqual(["The two passwords don't match"]);

    await reset.choose(member.password);
    await expect(reset.errorSummary).toContainText(
      'Choose a different password. This one is your current password.',
    );
    await expect(reset.password).toBeFocused();
  });
});
