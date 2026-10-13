// Acceptance Test
// Traces to: L2-045
// Description:
// Given any response from the API, when it is sent, then it carries Strict-Transport-Security,
// X-Content-Type-Options: nosniff, Referrer-Policy: strict-origin-when-cross-origin, a
// Permissions-Policy that restricts unused features, and a Content-Security-Policy that allows no
// script at all. This holds for successful responses, error responses, and the health endpoints.

import { describe, expect, it } from 'vitest';
import { GET as unknownRoute } from '@/app/api/v1/[...path]/route';
import { GET as catalogue } from '@/app/api/v1/i18n/[locale]/route';
import { GET as ownProfile } from '@/app/api/v1/me/profile/route';
import { GET as live } from '@/app/health/live/route';
import { GET as ready } from '@/app/health/ready/route';
import { Browser } from '../../support/browser';

function expectHardened(response: Response) {
  expect(response.headers.get('Strict-Transport-Security')).toContain('max-age=');
  expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
  expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
  expect(response.headers.get('Permissions-Policy')).toContain('camera=()');
  const csp = response.headers.get('Content-Security-Policy') ?? '';
  expect(csp).toContain("default-src 'none'");
  expect(csp).not.toContain('script-src');
  expect(csp).not.toContain("'unsafe-inline'");
}

describe('security headers', () => {
  it('are on every JSON response', async () => {
    const response = await new Browser().get(catalogue, '/api/v1/i18n/en-CA', {
      params: { locale: 'en-CA' },
    });

    expect(response.status).toBe(200);
    expectHardened(response);
  });

  it('are on error responses too', async () => {
    const browser = new Browser();
    const missing = await browser.get(unknownRoute, '/api/v1/does-not-exist', {
      params: { path: ['does-not-exist'] } as unknown as Record<string, string>,
    });
    expect(missing.status).toBe(404);
    expect(await missing.json()).toEqual({
      message: 'The route api/v1/does-not-exist could not be found.',
    });
    expectHardened(missing);

    const unauthenticated = await browser.get(ownProfile, '/api/v1/me/profile');
    expect(unauthenticated.status).toBe(401);
    expectHardened(unauthenticated);
  });

  it('are on the health endpoints as well', async () => {
    const browser = new Browser();
    const liveness = await browser.get(live, '/health/live');
    expect(liveness.status).toBe(200);
    expectHardened(liveness);
    expectHardened(await browser.get(ready, '/health/ready'));
  });
});
