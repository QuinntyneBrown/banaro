import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

export const LOCALES = ['en-CA'];
const DEFAULT_LOCALE = 'en-CA';

const cache = new Map<string, Record<string, string>>();

/**
 * Every key of a locale, flattened to dotted keys and sorted. Each file in
 * resources/i18n/{locale}/ is the first key segment, so common.json holds the common.* keys.
 */
export function catalogue(locale: string): Record<string, string> {
  let flat = cache.get(locale);
  if (!flat) {
    const dir = path.join(process.cwd(), 'resources/i18n', locale);
    const entries: [string, string][] = [];
    for (const file of readdirSync(dir).filter((name) => name.endsWith('.json'))) {
      const group = file.slice(0, -'.json'.length);
      flatten(JSON.parse(readFileSync(path.join(dir, file), 'utf8')), group, entries);
    }
    flat = Object.fromEntries(entries.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
    cache.set(locale, flat);
  }
  return flat;
}

/** Server-side text from the same catalogue as the browser; `{name}` placeholders are replaced. */
export function t(key: string, params: Record<string, string | number> = {}): string {
  const text = catalogue(DEFAULT_LOCALE)[key] ?? key;
  return text.replace(/\{(\w+)\}/g, (match, name) =>
    name in params ? String(params[name]) : match,
  );
}

function flatten(value: unknown, prefix: string, into: [string, string][]): void {
  if (value !== null && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) flatten(child, `${prefix}.${key}`, into);
  } else {
    into.push([prefix, String(value)]);
  }
}
