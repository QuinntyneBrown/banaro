// Acceptance Test
// Traces to: L2-046
// Description:
// Given any client, when it makes more than 120 API requests in a minute, then the API answers 429
// with Retry-After. The limit is per signed-in member, and per hashed address for anonymous clients.
// Health checks are never limited. When a limit is exceeded, the log records the route and a hashed
// client identifier, never the raw address.

import { describe, expect, it } from 'vitest';
import { GET as catalogue } from '@/app/api/v1/i18n/[locale]/route';
import { GET as live } from '@/app/health/live/route';
import { setDeps } from '@/src/container';
import type { User } from '@/src/db/schema/users';
import { createLogger } from '@/src/logging';
import { Browser } from '../../support/browser';
import { actingAs, createUser } from '../../support/members';

const URL = '/api/v1/i18n/en-CA';

const get = (browser: Browser) => browser.get(catalogue, URL, { params: { locale: 'en-CA' } });

async function hit(times: number, browser: Browser) {
  for (let i = 0; i < times; i++) expect((await get(browser)).status).toBe(200);
}

const member = async (user: User) => actingAs(user, new Browser('203.0.113.7'));

describe('the API rate limit', () => {
  it('answers the 121st request in a minute with 429 and Retry-After', async () => {
    const browser = new Browser('203.0.113.7');
    await hit(120, browser);

    const response = await get(browser);

    expect(response.status).toBe(429);
    expect(Number(response.headers.get('Retry-After'))).toBeGreaterThan(0);
  });

  it('counts each member on their own', async () => {
    const first = await member(await createUser());
    const second = await member(await createUser());
    await hit(120, first);

    expect((await get(first)).status).toBe(429);
    expect((await get(second)).status).toBe(200);
  });

  it('counts anonymous clients per address', async () => {
    await hit(120, new Browser('203.0.113.7'));

    expect((await get(new Browser('203.0.113.7'))).status).toBe(429);
    expect((await get(new Browser('203.0.113.8'))).status).toBe(200);
  });

  it('logs a breach with the route and a hashed client, never the address', async () => {
    const lines: Record<string, unknown>[] = [];
    setDeps({
      logger: createLogger({ write: (line: string) => lines.push(JSON.parse(line)) }, 'info'),
    });
    const browser = new Browser('203.0.113.7');
    await hit(120, browser);

    expect((await get(browser)).status).toBe(429);

    const breaches = lines.filter((line) => line.msg === 'rate_limit.exceeded');
    expect(breaches).toHaveLength(1);
    expect(breaches[0].route).toBe('/api/v1/i18n/[locale]');
    expect(breaches[0].client).toMatch(/^[0-9a-f]{64}$/);
    expect(JSON.stringify(breaches)).not.toContain('203.0.113.7');
  });

  it('never limits health checks', async () => {
    const browser = new Browser('203.0.113.7');
    for (let i = 0; i < 130; i++)
      expect((await browser.get(live, '/health/live')).status).toBe(200);
  });
});
