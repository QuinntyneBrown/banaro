// Acceptance Test
// Traces to: L2-053
// Description: Liveness answers without dependencies; readiness reports 503 with no detail when a
// dependency is unreachable.

import { Redis } from 'ioredis';
import pg from 'pg';
import { afterEach, describe, expect, it } from 'vitest';
import { GET as live } from '@/app/health/live/route';
import { GET as ready } from '@/app/health/ready/route';
import { resetDeps, setDeps } from '@/src/container';

// Next.js resolves `params` to undefined for a route without dynamic segments.
const call = (handler: typeof live, path: string) =>
  handler(new Request(`http://localhost:8100${path}`), { params: Promise.resolve(undefined) });

const unreachableDatabase = () =>
  new pg.Pool({ host: 'unreachable.invalid', connectionTimeoutMillis: 1000 });

const unreachableRedis = () =>
  new Redis({
    host: 'unreachable.invalid',
    lazyConnect: true,
    maxRetriesPerRequest: 0,
    retryStrategy: () => null,
  }).on('error', () => undefined);

describe('health', () => {
  afterEach(() => resetDeps());

  it('liveness returns ok without touching dependencies', async () => {
    setDeps({ db: unreachableDatabase(), cache: unreachableRedis() });

    const response = await call(live, '/health/live');

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'ok' });
  });

  it('readiness returns ready when the database, cache and queue are reachable', async () => {
    const response = await call(ready, '/health/ready');

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'ready' });
  });

  it('readiness returns 503 without detail when the database is unreachable', async () => {
    setDeps({ db: unreachableDatabase() });

    const response = await call(ready, '/health/ready');

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ status: 'unavailable' });
  });

  it('readiness returns 503 when the cache is unreachable', async () => {
    setDeps({ cache: unreachableRedis() });

    const response = await call(ready, '/health/ready');

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ status: 'unavailable' });
  });

  it('readiness returns 503 when the queue is unreachable', async () => {
    setDeps({ redis: unreachableRedis() });

    const response = await call(ready, '/health/ready');

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ status: 'unavailable' });
  });
});
