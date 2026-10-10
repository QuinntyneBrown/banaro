const FALLBACK = '/dashboard';

/**
 * The path to land on after sign-in: the given value only when it is a path on this origin, so
 * `//host`, `/\host` and absolute URLs fall back to the dashboard (L2-003 criterion 6).
 */
export function safeReturnPath(value: string | null | undefined, fallback = FALLBACK): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
    return fallback;
  }
  try {
    const base = 'https://banaro.invalid';
    const url = new URL(value, base);
    return url.origin === base ? `${url.pathname}${url.search}${url.hash}` : fallback;
  } catch {
    return fallback;
  }
}
