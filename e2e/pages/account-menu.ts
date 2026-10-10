import { type Locator, type Page } from '@playwright/test';

/** Header account button and its menu (docs/mocks/dialogs/account-menu). */
export class AccountMenu {
  readonly trigger: Locator;
  readonly menu: Locator;
  readonly items: Locator;
  readonly signOut: Locator;
  readonly signInLink: Locator;

  constructor(private readonly page: Page) {
    this.trigger = page.locator('header').getByRole('button', { name: /^Your account/ });
    this.menu = page.getByRole('menu', { name: 'Your account' });
    this.items = this.menu.getByRole('menuitem');
    this.signOut = this.menu.getByRole('menuitem', { name: 'Sign out' });
    this.signInLink = page.locator('header').getByRole('link', { name: 'Sign in' });
  }

  async open(): Promise<void> {
    await this.trigger.click();
  }

  /** Opens the menu and follows one of its destinations. */
  async go(item: 'View profile' | 'Edit profile' | 'Settings' | 'Your projects'): Promise<void> {
    await this.open();
    await this.menu.getByRole('menuitem', { name: item }).click();
  }

  async signOutNow(): Promise<void> {
    await this.open();
    await this.signOut.click();
  }

  /** Makes sign-out requests fail with a server error until `restoreSignOut()`. */
  async breakSignOut(): Promise<void> {
    await this.page.route('**/api/v1/session', (route) =>
      route.request().method() === 'DELETE' ? route.fulfill({ status: 500, json: {} }) : route.continue(),
    );
  }

  async restoreSignOut(): Promise<void> {
    await this.page.unroute('**/api/v1/session');
  }
}
