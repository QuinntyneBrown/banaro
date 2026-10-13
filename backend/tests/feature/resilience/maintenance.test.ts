// Acceptance Test
// Traces to: L2-043
// Description: In maintenance mode the API answers 503 with Retry-After and the expected time back,
// health and the translation catalogue still answer, and the worker runs no queued jobs.

import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET as live } from '@/app/health/live/route';
import { GET as ready } from '@/app/health/ready/route';
import { GET as catalogue } from '@/app/api/v1/i18n/[locale]/route';
import { maintenanceOff, maintenanceOn } from '@/src/console/commands/maintenance';
import { deps, setDeps } from '@/src/container';
import { deliverContactMessage } from '@/src/jobs/public-site/deliver-contact-message';
import { work } from '@/src/queue/work';
import { InMemoryMailer } from '../../support/fakes';
import { apiStack, handle } from '@/src/http/pipeline';

const anyApiRoute = handle(apiStack, async () => Response.json({ ok: true }));

const call = (handler: typeof live, path: string, params?: Record<string, string>) =>
  handler(new Request(`http://localhost:8100${path}`, { method: 'GET' }), {
    params: Promise.resolve(params),
  });

describe('maintenance mode', () => {
  afterEach(async () => {
    await maintenanceOff(deps().redis);
    vi.useRealTimers();
  });

  it('answers 503 with Retry-After and the expected time back', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-10T14:00:00Z'));
    await maintenanceOn(deps().redis, 1800);

    const response = await call(anyApiRoute, '/api/v1/contact-messages');

    expect(response.status).toBe(503);
    expect(response.headers.get('Retry-After')).toBe('1800');
    expect(response.headers.get('X-Request-Id')).toBeTruthy();
    expect(await response.json()).toEqual({
      code: 'maintenance',
      expectedBackAt: '2026-10-10T14:30:00Z',
    });
  });

  it('still answers health and the translation catalogue', async () => {
    await maintenanceOn(deps().redis, 600);

    expect((await call(live, '/health/live')).status).toBe(200);
    expect((await call(ready, '/health/ready')).status).toBe(200);
    expect((await call(catalogue, '/api/v1/i18n/en-CA', { locale: 'en-CA' })).status).toBe(200);
  });

  it('answers normally once maintenance ends', async () => {
    await maintenanceOn(deps().redis, 600);
    await maintenanceOff(deps().redis);

    expect((await call(anyApiRoute, '/api/v1/contact-messages')).status).toBe(200);
  });

  it('runs no queued jobs until maintenance ends', async () => {
    const mailer = new InMemoryMailer();
    setDeps({ mailer });
    await maintenanceOn(deps().redis, 600);
    await deps().queue.dispatch(deliverContactMessage, {
      name: 'Amara Osei',
      email: 'amara@harvest.example',
      topic: 'general',
      message: 'Hello from the tests.',
    });

    expect(await work(deps(), 'mail', { once: true })).toBe(0);
    expect(mailer.sent).toHaveLength(0);

    await maintenanceOff(deps().redis);
    expect(await work(deps(), 'mail', { once: true })).toBe(1);
    expect(mailer.sent).toHaveLength(1);
  });
});
