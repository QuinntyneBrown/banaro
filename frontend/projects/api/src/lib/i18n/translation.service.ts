import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Catalogue, I18N_API } from './i18n-api';

export type TranslationParams = Record<string, string | number>;

/**
 * Holds the loaded catalogue and turns keys into text. Texts use `{name}` placeholders and an ICU
 * `plural` subset: `{count, plural, one {# going} other {# going}}`.
 */
@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly api = inject(I18N_API);
  private readonly catalogue = signal<Catalogue>({});
  private locale = 'en-CA';

  async load(locale: string): Promise<void> {
    this.locale = locale;
    try {
      this.catalogue.set(await firstValueFrom(this.api.catalogue(locale)));
    } catch (error) {
      // Render with keys rather than fail to boot; the fallback page is an open point of L2-052.
      console.error(`Could not load the ${locale} catalogue`, error);
    }
  }

  t(key: string, params: TranslationParams = {}): string {
    const text = this.catalogue()[key];
    if (text === undefined) {
      console.warn(`Missing translation key: ${key}`);
      return key;
    }
    return this.format(text, params);
  }

  private format(text: string, params: TranslationParams): string {
    const rules = new Intl.PluralRules(this.locale);
    const withPlurals = text.replace(
      /\{(\w+), plural, ((?:[=\w]+ \{[^{}]*\}\s*)+)\}/g,
      (_match, name: string, cases: string) => {
        const count = Number(params[name] ?? 0);
        const options = new Map(
          [...cases.matchAll(/([=\w]+) \{([^{}]*)\}/g)].map((m) => [m[1], m[2]] as const),
        );
        const chosen =
          options.get(`=${count}`) ??
          options.get(rules.select(count)) ??
          options.get('other') ??
          '';
        return chosen.replace(/#/g, new Intl.NumberFormat(this.locale).format(count));
      },
    );
    return withPlurals.replace(/\{(\w+)\}/g, (match, name: string) =>
      name in params ? String(params[name]) : match,
    );
  }
}
