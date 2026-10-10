// Acceptance Test
// Traces to: L2-042
// Description: An unhandled browser error shows the server-error page without internal detail or a
// reference ID; the page has one h1, a title, a Try again action and is kept out of search results.

import { expect, test } from '@playwright/test';
import { ErrorPage } from '../../pages/error-page';
import { HomePage } from '../../pages/home.page';

test('an unhandled browser error shows the server-error page', async ({ page }) => {
  const home = new HomePage(page);
  await home.open();
  const errorPage = new ErrorPage(page);

  await errorPage.throwUnhandledError();

  await expect(errorPage.title).toHaveText('Something went wrong on our side');
  await expect(errorPage.headings).toHaveCount(1);
  await expect(page).toHaveTitle('Something went wrong · Banaro');
  await expect(errorPage.robots).toHaveAttribute('content', 'noindex');
  await expect(errorPage.referenceId).toHaveCount(0);
  await expect(page.getByRole('main')).not.toContainText('Unhandled test error');
  await expect(errorPage.action('Try again')).toBeVisible();
  await expect(errorPage.action('Go to the home page')).toHaveAttribute('href', '/');
});

test('/500 shows the server-error page', async ({ page }) => {
  const errorPage = new ErrorPage(page);
  await errorPage.open('/500');

  await expect(errorPage.title).toHaveText('Something went wrong on our side');
});
