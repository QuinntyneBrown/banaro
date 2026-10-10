// Acceptance Test
// Traces to: L2-039, L2-052
// Description: A visitor sees the home page's static sections, with text from the en-CA
// catalogue, and crawlers receive the headline, title, description and canonical link without script.

import { expect, test } from '@playwright/test';
import { HomePage } from '../../pages/home.page';
import { ServerHtml } from '../../pages/server-html';

test.describe('home page for a visitor', () => {
  test('shows the hero, the four areas, the testimonial, the matching invitation and the footer', async ({ page }) => {
    const home = new HomePage(page);
    await home.open();

    await expect(home.headline).toHaveText('Build what matters, with believers down the street.');
    await expect(home.lead).toContainText('Banaro connects Christian founders, engineers, designers and product managers');
    await expect(home.joinAction).toHaveAttribute('href', '/join');
    await expect(home.browseAction).toHaveAttribute('href', '/builders');
    expect(await home.areaTitles()).toEqual([
      'Builder directory',
      'Project showcase',
      'Meetups and events',
      'Co-founder matching',
    ]);
    await expect(home.testimonial).toHaveText(
      '“Within a week I was advising two founders, both a streetcar ride from my house.”',
    );
    await expect(home.verse).toContainText('Two are better than one');
    await expect(home.startMatching()).toHaveAttribute('href', '/matching');
    await expect(home.footer).toContainText('Made in Toronto. © 2026 Banaro.');
    await expect(home.footerLink('Code of conduct')).toHaveAttribute('href', '/code-of-conduct');
  });

  test('is server-rendered with the headline, title, description and canonical link', async ({ request, baseURL }) => {
    const html = await ServerHtml.fetch(request, '/');

    expect(html.headline()).toBe('Build what matters, with believers down the street.');
    expect(html.title()).toBe('Banaro · Christian product builders in Toronto and the GTA');
    expect(html.metaDescription()).toContain('Banaro connects Christian founders');
    expect(html.canonical()).toBe(`${baseURL}/`);
  });
});
