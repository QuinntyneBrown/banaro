// Acceptance Test
// Traces to: L2-051
// Description: The theme follows the system with no stored choice, the server HTML carries a stored
// choice so there is no flash, and the t shortcut switches the theme and remembers it across reloads.

import { expect, test } from '@playwright/test';
import { HomePage } from '../../pages/home.page';
import { ServerHtml } from '../../pages/server-html';
import { Theme } from '../../pages/theme';

test.describe('theming', () => {
  test('follows the system theme when no choice is stored', async ({ browser, request }) => {
    for (const colorScheme of ['light', 'dark'] as const) {
      const context = await browser.newContext({ colorScheme });
      const page = await context.newPage();
      await new HomePage(page).open();

      const theme = new Theme(page);
      expect(await theme.attribute()).toBeNull();
      expect(await theme.painted()).toBe(colorScheme);
      await context.close();
    }

    expect((await ServerHtml.fetch(request, '/')).themeAttribute()).toBeUndefined();
  });

  test('the t shortcut switches the theme and the choice survives a reload', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    const home = new HomePage(page);
    const theme = new Theme(page);
    await home.open();

    await theme.toggleWithShortcut();
    expect(await theme.attribute()).toBe('dark');
    expect(await theme.painted()).toBe('dark');

    await page.reload();
    expect(await theme.attribute()).toBe('dark');
    expect(await theme.painted()).toBe('dark');

    await theme.toggleWithShortcut();
    expect(await theme.painted()).toBe('light');
  });

  test('the server renders a stored choice into the HTML', async ({ playwright, baseURL }) => {
    const request = await playwright.request.newContext({
      baseURL,
      extraHTTPHeaders: { Cookie: 'bn-theme=dark' },
    });

    expect((await ServerHtml.fetch(request, '/')).themeAttribute()).toBe('dark');
    await request.dispose();
  });
});
