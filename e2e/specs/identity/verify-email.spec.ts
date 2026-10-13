// Acceptance Test
// Traces to: L2-002, L2-028
// Description: Opening a fresh link confirms the e-mail without signing in and leads to the
// profile set-up through sign-in; expired, used and unknown links show the error state with a way
// forward; an unverified member who signs in lands here and can resend, which raises a toast that
// closes after 6 seconds unless the pointer rests on it; a 429 names the wait.

import { expect, test } from '@playwright/test';
import { resetRateLimits } from '../../fixtures/backend';
import { createMember } from '../../fixtures/members';
import {
  isVerified,
  unknownVerificationLink,
  verificationLink,
} from '../../fixtures/verification';
import { SignInPage } from '../../pages/sign-in.page';
import { Toasts } from '../../pages/toasts';
import { VerifyEmailPage } from '../../pages/verify-email.page';

const SENT = 'If this address still needs confirming, a new link is on its way.';

test.describe('verify e-mail', () => {
  test.beforeEach(() => resetRateLimits());

  test('a fresh link confirms the e-mail and leads to set-up through sign-in', async ({ page }) => {
    const member = createMember({ verified: false });
    const verify = new VerifyEmailPage(page);

    await verify.open(verificationLink(member.id));

    await expect(verify.title).toHaveText('E-mail confirmed');
    expect(isVerified(member.id)).toBe(true);
    await expect(verify.setUpProfile).toHaveAttribute('href', '/sign-in?returnTo=%2Fwelcome');
  });

  test('an expired link changes nothing and offers a new link or sign-in', async ({ page }) => {
    const member = createMember({ verified: false });
    const verify = new VerifyEmailPage(page);

    await verify.open(verificationLink(member.id, { ageHours: 25 }));

    await expect(verify.title).toHaveText("We couldn't confirm that link");
    await expect(verify.sendNewLink).toBeVisible();
    await expect(verify.backToSignIn).toHaveAttribute('href', '/sign-in');
    expect(isVerified(member.id)).toBe(false);
  });

  test('a link works once', async ({ page }) => {
    const member = createMember({ verified: false });
    const verify = new VerifyEmailPage(page);
    const link = verificationLink(member.id);
    await verify.open(link);
    await expect(verify.title).toHaveText('E-mail confirmed');

    await verify.open(link);

    await expect(verify.title).toHaveText("We couldn't confirm that link");
  });

  test('an expired link can ask for a new one', async ({ page }) => {
    const member = createMember({ verified: false });
    const verify = new VerifyEmailPage(page);
    await verify.open(verificationLink(member.id, { ageHours: 30 }));

    await verify.sendNewLink.click();

    await expect(new Toasts(page).withTitle(SENT)).toBeVisible();
  });

  test('a link that names no account sends "Send a new link" to sign-in', async ({ page }) => {
    const verify = new VerifyEmailPage(page);
    await verify.open(unknownVerificationLink());
    await expect(verify.title).toHaveText("We couldn't confirm that link");

    await verify.sendNewLink.click();

    await expect(page).toHaveURL(/\/sign-in\?returnTo=%2Fverify-email$/);
  });

  test('an unverified member lands here after sign-in and can resend', async ({ page }) => {
    const member = createMember({ verified: false });
    const signIn = new SignInPage(page);
    const verify = new VerifyEmailPage(page);
    const toasts = new Toasts(page);
    await signIn.open();
    await signIn.signIn(member.email, member.password);
    await expect(page).toHaveURL(/\/verify-email$/);
    await expect(verify.title).toHaveText('Confirm your e-mail');
    await expect(verify.sub).toContainText(member.email);

    await verify.resend.click();

    const toast = toasts.withTitle(SENT);
    await expect(toast).toBeVisible();
    await expect(toast).toHaveAttribute('role', 'status');
    await toast.hover();
    await page.waitForTimeout(7_000);
    await expect(toast).toBeVisible();
    await page.mouse.move(0, 0);
    await expect(toast).toHaveCount(0, { timeout: 8_000 });
  });

  test('too many resends name the wait in whole minutes', async ({ page }) => {
    const member = createMember({ verified: false });
    const signIn = new SignInPage(page);
    const verify = new VerifyEmailPage(page);
    await signIn.open('/verify-email');
    await signIn.signIn(member.email, member.password);
    await expect(verify.title).toHaveText('Confirm your e-mail');
    await verify.throttleNextResend(3_000);

    await verify.resend.click();

    await expect(verify.alert).toContainText(
      "You've asked for too many links. Try again in 50 minutes.",
    );
  });
});
