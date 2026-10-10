// Acceptance Test
// Traces to: L2-001, L2-034
// Description: A visitor joins from /join through the invalid, submitting and success states; the
// code-of-conduct consent opens in a new tab, and a common password is refused.

import { expect, test } from '@playwright/test';
import { resetRateLimits } from '../../fixtures/backend';
import { STRONG_PASSWORD, uniqueEmail } from '../../fixtures/people';
import { JoinPage } from '../../pages/join.page';

test.beforeEach(() => resetRateLimits());

test('an invalid submission lists each problem and focuses the first invalid field', async ({ page }) => {
  const join = new JoinPage(page);
  await join.open();

  await join.fill({ email: 'amara@', password: 'short12' });
  await join.submit.click();

  expect(await join.summaryErrors()).toEqual([
    'Enter your full name',
    'Enter an e-mail address like name@example.com',
    'Use at least 12 characters (you have 7)',
    'Agree to the code of conduct to join',
  ]);
  await expect(join.errorSummary).toHaveAttribute('role', 'alert');
  await expect(join.name).toBeFocused();
  await expect(join.agree).toHaveAttribute('aria-invalid', 'true');
});

test('the code-of-conduct consent opens in a new tab', async ({ page }) => {
  const join = new JoinPage(page);
  await join.open();

  await expect(join.codeOfConductLink).toHaveAttribute('href', '/code-of-conduct');
  await expect(join.codeOfConductLink).toHaveAttribute('target', '_blank');
});

test('a valid submission shows the submitting state, then "Check your e-mail"', async ({ page }) => {
  const join = new JoinPage(page);
  const email = uniqueEmail();
  await join.open();
  await join.fill({ name: 'Amara Osei', email, password: STRONG_PASSWORD, agree: true });
  const release = await join.holdSubmission();

  await join.submit.click();
  await expect(join.submit).toBeDisabled();
  await expect(join.submit).toHaveText('Creating your account…');

  release();
  await expect(join.title).toHaveText('Check your e-mail');
  await expect(page.getByRole('main')).toContainText(`We sent a confirmation link to ${email}`);
  await expect(join.confirmedAction).toHaveAttribute('href', '/sign-in');
});

test('a common password is refused next to the field', async ({ page }) => {
  const join = new JoinPage(page);
  await join.open();
  await join.fill({ name: 'Amara Osei', email: uniqueEmail(), password: 'Unbelievable', agree: true });

  await join.submit.click();

  await expect(join.errorSummary).toContainText('That password is too common. Choose something harder to guess.');
  await expect(join.password).toHaveAttribute('aria-invalid', 'true');
});
