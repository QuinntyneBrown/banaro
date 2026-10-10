import { type Page } from '@playwright/test';

/** Makes the API look unavailable to one browser page, without touching the shared API. */
export class ApiSimulator {
  constructor(private readonly page: Page) {}

  /** Every API request answers as the API does in maintenance mode. */
  async maintenance(retryAfterSeconds: number): Promise<void> {
    await this.page.route('**/api/v1/**', async (route) => {
      if (route.request().url().includes('/api/v1/i18n/')) return route.continue();
      const back = new Date(Date.now() + retryAfterSeconds * 1000).toISOString().replace(/\.\d{3}Z$/, 'Z');
      await route.fulfill({
        status: 503,
        headers: { 'Retry-After': String(retryAfterSeconds), 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'maintenance', expectedBackAt: back }),
      });
    });
  }

  async restore(): Promise<void> {
    await this.page.unroute('**/api/v1/**');
  }
}
