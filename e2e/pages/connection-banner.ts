import { type BrowserContext, type Locator, type Page } from '@playwright/test';

/** Connection banner above the header (docs/mocks/notifications/connection-banner). */
export class ConnectionBanner {
  readonly banner: Locator;
  readonly dismiss: Locator;
  readonly tryAgain: Locator;

  constructor(private readonly page: Page) {
    this.banner = page.locator('.banner[data-banner="connection"]');
    this.dismiss = this.banner.getByRole('button', { name: 'Dismiss banner' });
    this.tryAgain = this.banner.getByRole('button', { name: 'Try again' });
  }

  variant(): Promise<string | null> {
    return this.banner.getAttribute('data-variant');
  }

  /** Makes the API unreachable for this page while the browser still reports online. */
  async blockApi(): Promise<void> {
    await this.page.route(/\/(api|health|sanctum)\//, (route) => route.abort('connectionrefused'));
  }

  async unblockApi(): Promise<void> {
    await this.page.unroute(/\/(api|health|sanctum)\//);
  }

  static async goOffline(context: BrowserContext): Promise<void> {
    await context.setOffline(true);
  }

  static async goOnline(context: BrowserContext): Promise<void> {
    await context.setOffline(false);
  }
}
