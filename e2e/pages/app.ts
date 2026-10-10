import { type Page } from '@playwright/test';

/** Waits until the application has hydrated in the browser and handles input. */
export async function waitForApp(page: Page): Promise<void> {
  await page.locator('html[data-app-ready]').waitFor({ state: 'attached' });
}
