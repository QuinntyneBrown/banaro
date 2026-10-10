import { type Locator, type Page } from '@playwright/test';

/** Header account button and its menu (docs/mocks/dialogs/account-menu). */
export class AccountMenu {
  readonly trigger: Locator;
  readonly menu: Locator;
  readonly items: Locator;
  readonly signOut: Locator;
  readonly signInLink: Locator;

  constructor(page: Page) {
    this.trigger = page.locator('header').getByRole('button', { name: /^Your account/ });
    this.menu = page.getByRole('menu', { name: 'Your account' });
    this.items = this.menu.getByRole('menuitem');
    this.signOut = this.menu.getByRole('menuitem', { name: 'Sign out' });
    this.signInLink = page.locator('header').getByRole('link', { name: 'Sign in' });
  }

  async open(): Promise<void> {
    await this.trigger.click();
  }
}
