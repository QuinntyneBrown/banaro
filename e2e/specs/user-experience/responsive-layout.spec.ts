// Acceptance Test
// Traces to: L2-049
// Description: Below 576 px the page is one column with navigation behind a menu button, no
// horizontal scroll and touch targets of at least 44 × 44 px; from 768 px the areas sit in two columns.

import { expect, test } from '@playwright/test';
import { HomePage } from '../../pages/home.page';
import { Layout } from '../../pages/layout';

test.describe('responsive layout', () => {
  test('at 360 px the home page has a menu button, no horizontal scroll and large touch targets', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    const home = new HomePage(page);
    const layout = new Layout(page);
    await home.open();

    await expect(layout.menuButton).toBeVisible();
    await expect(layout.primaryNav).toBeHidden();
    expect(await layout.hasHorizontalScroll()).toBe(false);
    expect(await layout.smallTouchTargets(44)).toEqual([]);
    expect(await home.areaColumns()).toBe(1);

    await layout.openMenu();
    await expect(layout.primaryNav.getByRole('link', { name: 'Builders' })).toBeVisible();
  });

  test('at 768 px the four areas are in two columns', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    const home = new HomePage(page);
    await home.open();

    expect(await home.areaColumns()).toBe(2);
  });
});
