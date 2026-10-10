// Acceptance Test
// Traces to: L2-042
// Description: An unknown URL answers 404 with the not-found page, which searches the directory and
// links to the directory and home, has one h1 and a title, and is kept out of search results.

import { expect, test } from '@playwright/test';
import { ErrorPage } from '../../pages/error-page';

test('an unknown URL shows the not-found page with a 404 status', async ({ page }) => {
  const notFound = new ErrorPage(page);
  const status = await notFound.open('/no-such-page');

  expect(status).toBe(404);
  await expect(notFound.title).toHaveText("We can't find that page");
  await expect(notFound.headings).toHaveCount(1);
  await expect(page).toHaveTitle('Page not found · Banaro');
  await expect(notFound.robots).toHaveAttribute('content', 'noindex');
  await expect(notFound.action('Browse builders')).toHaveAttribute('href', '/builders');
  await expect(notFound.action('Go to the home page')).toHaveAttribute('href', '/');
});

test('/404 shows the same page', async ({ page }) => {
  const notFound = new ErrorPage(page);
  await notFound.open('/404');

  await expect(notFound.title).toHaveText("We can't find that page");
});

test('searching from the not-found page opens the directory with the query', async ({ page }) => {
  const notFound = new ErrorPage(page);
  await notFound.open('/no-such-page');

  await notFound.searchFor('Rust engineer');

  await expect(page).toHaveURL(/\/builders\?q=Rust(\+|%20)engineer$/);
});
