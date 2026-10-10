import { type Locator, type Page } from '@playwright/test';
import { waitForApp } from './app';

/** Layout facts that hold on every screen: header navigation, page scroll and touch targets. */
export class Layout {
  readonly menuButton: Locator;
  readonly primaryNav: Locator;

  constructor(private readonly page: Page) {
    this.menuButton = page.locator('.header .menu-btn');
    this.primaryNav = page.getByRole('navigation', { name: 'Primary' });
  }

  async openMenu(): Promise<void> {
    await waitForApp(this.page);
    await this.menuButton.click();
  }

  async hasHorizontalScroll(): Promise<boolean> {
    return this.page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  }

  /** Visible links and buttons smaller than the given size, described for the failure message. */
  async smallTouchTargets(minimum: number): Promise<string[]> {
    return this.page.evaluate((min) => {
      const small: string[] = [];
      for (const el of Array.from(document.querySelectorAll<HTMLElement>('a, button'))) {
        const box = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        const visible = box.width > 0 && box.height > 0 && style.visibility !== 'hidden';
        const inline = style.display === 'inline' && el.closest('p, li, dd');
        const offscreen = box.bottom < 0 || el.classList.contains('skip-link');
        if (visible && !inline && !offscreen && (box.width < min || box.height < min)) {
          small.push(`${el.tagName.toLowerCase()} "${el.textContent?.trim()}" ${Math.round(box.width)}×${Math.round(box.height)}`);
        }
      }
      return small;
    }, minimum);
  }
}
