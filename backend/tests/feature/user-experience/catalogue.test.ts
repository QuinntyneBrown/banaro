// Acceptance Test
// Traces to: L2-052
// Description: Visitors receive the en-CA translation catalogue from /api/v1/i18n/en-CA, with ETag
// revalidation; unsupported locales answer 404.

import { describe, expect, it } from 'vitest';
import { GET } from '@/app/api/v1/i18n/[locale]/route';
import { t } from '@/src/services/user-experience/catalogue-service';

const get = (locale: string, headers: Record<string, string> = {}) =>
  GET(new Request(`http://localhost:8100/api/v1/i18n/${locale}`, { headers }), {
    params: Promise.resolve({ locale }),
  });

describe('translation catalogue', () => {
  it('gives a visitor the en-CA catalogue as a flat key map', async () => {
    const response = await get('en-CA');

    expect(response.status).toBe(200);
    expect(response.headers.get('ETag')).toBeTruthy();
    expect(response.headers.get('Cache-Control')).toContain('public');
    const catalogue = (await response.json()) as Record<string, string>;
    expect(catalogue['common.brand']).toBe('Banaro');
    for (const key of Object.keys(catalogue)) {
      expect(key).toMatch(/^[a-z][A-Za-z0-9]*(\.[A-Za-z0-9]+)+$/);
    }
  });

  it('answers 304 for a matching ETag', async () => {
    const etag = (await get('en-CA')).headers.get('ETag')!;

    const response = await get('en-CA', { 'If-None-Match': etag });

    expect(response.status).toBe(304);
    expect(await response.text()).toBe('');
  });

  it('answers 404 for an unsupported locale', async () => {
    expect((await get('fr-CA')).status).toBe(404);
    expect((await get('..%2F..%2Fconfig')).status).toBe(404);
    expect((await get('../../config')).status).toBe(404);
  });

  it('uses the same catalogue for server-side text', () => {
    expect(t('common.brand')).toBe('Banaro');
  });
});
