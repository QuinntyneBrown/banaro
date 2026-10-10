// Acceptance Test
// Traces to: L2-042
// Description: /403 answers 403 with the forbidden page, which explains and offers the dashboard, a
// way back and a contact link, has one h1 and stays out of search results. Error pages send a
// signed-in member to the dashboard where a visitor is sent home.

import { expect, test } from '@playwright/test';
import { resetRateLimits } from '../../fixtures/backend';
import { createMember } from '../../fixtures/members';
import { ErrorPage } from '../../pages/error-page';
import { SignInPage } from '../../pages/sign-in.page';

test('the forbidden page explains and offers ways forward', async ({ page }) => {
  const forbidden = new ErrorPage(page);

  expect(await forbidden.open('/403')).toBe(403);

  await expect(forbidden.title).toHaveText("This one isn't yours to open");
  await expect(forbidden.headings).toHaveCount(1);
  await expect(page).toHaveTitle('No access · Banaro');
  await expect(forbidden.robots).toHaveAttribute('content', 'noindex');
  await expect(forbidden.action('Go to your dashboard')).toHaveAttribute('href', '/dashboard');
  await expect(forbidden.action('Go back')).toBeVisible();
  await expect(forbidden.action('Contact us')).toHaveAttribute('href', '/contact');
});

test('"Go back" returns to the previous page', async ({ page }) => {
  const forbidden = new ErrorPage(page);
  await forbidden.open('/about');
  await forbidden.open('/403');

  await forbidden.action('Go back').click();

  await expect(page).toHaveURL(/\/about$/);
});

test('error pages offer a signed-in member the dashboard instead of the home page', async ({
  page,
}) => {
  resetRateLimits();
  const member = createMember();
  const signIn = new SignInPage(page);
  await signIn.open('/about');
  await signIn.signIn(member.email, member.password);
  await expect(page).toHaveURL(/\/about$/);
  const notFound = new ErrorPage(page);

  await notFound.open('/no-such-page');

  await expect(notFound.action('Go to your dashboard')).toHaveAttribute('href', '/dashboard');
  await expect(notFound.action('Go to the home page')).toHaveCount(0);
});
