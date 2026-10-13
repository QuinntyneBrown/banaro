// Acceptance Test
// Traces to: L2-034
// Description: Anyone can read the full code of conduct at /code-of-conduct without signing in, with
// a table of contents that jumps to each section and a contact route for concerns.

import { expect, test } from '@playwright/test';
import { CodeOfConductPage } from '../../pages/code-of-conduct.page';

const SECTIONS = [
  'Be kind and be honest',
  'Faith-aligned, and welcoming',
  'Ask before you reach out',
  'Keep people safe',
  'If something goes wrong',
];

test('a visitor reads the full code of conduct with a table of contents', async ({ page }) => {
  const code = new CodeOfConductPage(page);

  expect(await code.open()).toBe(200);

  await expect(code.title).toHaveText('Code of conduct');
  await expect(code.lastUpdated).toHaveText('1 September 2026');
  expect(await code.sections.allTextContents()).toEqual(SECTIONS);
  expect(await code.contentsEntries()).toEqual(SECTIONS);
  await expect(page).toHaveTitle('Code of conduct · Banaro');
});

test('a contents entry jumps to its section', async ({ page }) => {
  const code = new CodeOfConductPage(page);
  await code.open();

  await code.jumpTo('Keep people safe');

  await expect(page).toHaveURL(/#keep-people-safe$/);
  await expect(code.section('Keep people safe')).toBeInViewport();
});

test('concerns have a contact route', async ({ page }) => {
  const code = new CodeOfConductPage(page);
  await code.open();

  await expect(code.contactLink).toHaveAttribute('href', '/contact');
});
