import { type Locator, type Page } from '@playwright/test';

/** The toast region in the application shell (docs/mocks/notifications/toast). */
export class Toasts {
  readonly region: Locator;
  readonly all: Locator;

  constructor(page: Page) {
    this.region = page.locator('.toast-region');
    this.all = this.region.locator('.toast');
  }

  /** The toasts' titles, top of the stack first. */
  titles(): Promise<string[]> {
    return this.all
      .locator('.toast__title')
      .allTextContents()
      .then((t) => t.map((s) => s.trim()));
  }

  withTitle(title: string): Locator {
    return this.all.filter({ has: this.region.page().locator('.toast__title', { hasText: title }) });
  }

  variant(toast: Locator): Promise<string | null> {
    return toast
      .getAttribute('class')
      .then((c) => /toast--(\w+)/.exec(c ?? '')?.[1] ?? (c?.includes('toast') ? 'info' : null));
  }

  action(toast: Locator): Locator {
    return toast.locator('.toast__action');
  }

  dismiss(toast: Locator): Locator {
    return toast.getByRole('button', { name: 'Dismiss notification' });
  }
}
