// Acceptance Test
// Traces to: L2-040
// Description: /about describes the mission, the four areas and Banaro's faith position in plain
// language, with a land acknowledgement and actions to join or get in touch.

import { expect, test } from '@playwright/test';
import { AboutPage } from '../../pages/about.page';
import { ServerHtml } from '../../pages/server-html';

test('a visitor reads about Banaro', async ({ page }) => {
  const about = new AboutPage(page);
  await about.open();

  await expect(about.title).toHaveText('Build with believers down the street');
  expect(await about.sectionTitles()).toEqual([
    'Why Banaro',
    'What you can do here',
    'Who it is for',
    'What we believe',
    'Where we are',
  ]);
  await expect(about.section('What you can do here')).toContainText('Find local builders by skill, role and neighbourhood.');
  await expect(about.section('What we believe')).toContainText('follow Jesus');
  await expect(page.getByRole('main')).toContainText('traditional territory of many nations');
  await expect(about.joinAction).toHaveAttribute('href', '/join');
  await expect(about.contactAction).toHaveAttribute('href', '/contact');
});

test('the about page is server-rendered with its own title', async ({ request }) => {
  const html = await ServerHtml.fetch(request, '/about');

  expect(html.title()).toBe('About · Banaro');
  expect(html.headline()).toBe('Build with believers down the street');
});
