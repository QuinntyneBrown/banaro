import { type Page } from '@playwright/test';
import { waitForApp } from './app';

/** The document theme, read from any screen. */
export class Theme {
  constructor(private readonly page: Page) {}

  /** `data-theme` on `<html>`, or null when the theme follows the system. */
  attribute(): Promise<string | null> {
    return this.page.locator('html').getAttribute('data-theme');
  }

  /** Which theme the canvas is painted in, judged from its background luminance. */
  async painted(): Promise<'light' | 'dark'> {
    const rgb = await this.page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    const [r, g, b] = (rgb.match(/\d+(\.\d+)?/g) ?? []).map(Number);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b < 128 ? 'dark' : 'light';
  }

  /** Presses the `t` shortcut with focus outside any text field. */
  async toggleWithShortcut(): Promise<void> {
    await waitForApp(this.page);
    await this.page.locator('body').click({ position: { x: 1, y: 1 } });
    await this.page.keyboard.press('t');
  }
}
