import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  computed,
  inject,
  Injectable,
  InjectionToken,
  PLATFORM_ID,
  REQUEST,
  signal,
} from '@angular/core';

export type ThemePreference = 'light' | 'dark' | 'system';
export type Theme = 'light' | 'dark';

/** Called after the preference changes, so an application can store it for a signed-in member. */
export const THEME_SYNC = new InjectionToken<(preference: ThemePreference) => void>('THEME_SYNC');

const COOKIE = 'bn-theme';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * Owns the theme preference. `data-theme` on `<html>` selects the token set; without it the tokens
 * follow `prefers-color-scheme`. On the server the cookie is read from the request, so the HTML
 * carries the stored theme and there is no flash (L2-051).
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly sync = inject(THEME_SYNC, { optional: true });
  private readonly systemDark = signal(false);

  readonly preference = signal<ThemePreference>('system');
  readonly effective = computed<Theme>(() => {
    const preference = this.preference();
    if (preference !== 'system') return preference;
    return this.systemDark() ? 'dark' : 'light';
  });

  constructor() {
    const stored = this.readCookie(this.browser ? this.document.cookie : this.requestCookie());
    if (stored) this.apply(stored);

    if (this.browser) {
      const media = this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)');
      if (media) {
        this.systemDark.set(media.matches);
        media.addEventListener('change', (event) => this.systemDark.set(event.matches));
      }
    }
  }

  toggle(): void {
    this.set(this.effective() === 'dark' ? 'light' : 'dark');
  }

  /** Applies a preference, stores it in the cookie and syncs it; `quiet` skips the sync. */
  set(preference: ThemePreference, { quiet = false } = {}): void {
    this.apply(preference);
    if (this.browser) {
      this.document.cookie =
        preference === 'system'
          ? `${COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`
          : `${COOKIE}=${preference}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax${this.secure()}`;
    }
    if (!quiet) this.sync?.(preference);
  }

  private apply(preference: ThemePreference): void {
    this.preference.set(preference);
    const root = this.document.documentElement;
    if (preference === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', preference);
  }

  private requestCookie(): string {
    return inject(REQUEST, { optional: true })?.headers.get('cookie') ?? '';
  }

  private readCookie(cookies: string): Theme | undefined {
    const value = cookies
      .split(';')
      .map((part) => part.trim().split('='))
      .find(([name]) => name === COOKIE)?.[1];
    return value === 'light' || value === 'dark' ? value : undefined;
  }

  private secure(): string {
    return this.document.location.protocol === 'https:' ? '; Secure' : '';
  }
}
