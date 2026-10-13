// Acceptance Test
// Traces to: L2-003, L2-029
// Description: A sign-in from a browser and IP network the account has not used in the last 90
// days queues the security e-mail "New sign-in to your Banaro account" with the time and browser;
// the account's first sign-in and a familiar device send none.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DELETE, POST } from '@/app/api/v1/session/route';
import { setDeps } from '@/src/container';
import { sendMail } from '@/src/jobs/send-mail';
import { Browser } from '../../support/browser';
import { FakeQueue } from '../../support/fakes';
import { createUser, PASSWORD } from '../../support/members';

const CHROME =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const FIREFOX =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.6; rv:143.0) Gecko/20100101 Firefox/143.0';

let queue: FakeQueue;

const signIn = async (userAgent: string, ip: string) => {
  const browser = new Browser(ip);
  const headers = { 'User-Agent': userAgent };
  const response = await browser.post(POST, '/api/v1/session', {
    json: { email: 'amara@harvest.example', password: PASSWORD },
    headers,
  });
  expect(response.status).toBe(200);
  expect((await browser.delete(DELETE, '/api/v1/session', { headers })).status).toBe(204);
};

const alerts = () =>
  queue.payloads(sendMail).filter((mail) => mail.subject === 'New sign-in to your Banaro account');

describe('new sign-in alert', () => {
  beforeEach(async () => {
    queue = new FakeQueue();
    setDeps({ queue });
    vi.useFakeTimers({ toFake: ['Date'] });
    await createUser({ name: 'Amara Osei', email: 'amara@harvest.example' });
  });

  afterEach(() => vi.useRealTimers());

  it('sends no alert for the first sign-in', async () => {
    await signIn(CHROME, '203.0.113.10');

    expect(queue.pushed).toHaveLength(0);
  });

  it('sends no alert for a familiar browser on a familiar network', async () => {
    await signIn(CHROME, '203.0.113.10');
    await signIn(CHROME, '203.0.113.77');

    expect(queue.pushed).toHaveLength(0);
  });

  it('queues the alert with the time and browser for a new browser', async () => {
    await signIn(CHROME, '203.0.113.10');
    vi.setSystemTime(new Date('2026-10-09T22:30:00Z'));

    await signIn(FIREFOX, '203.0.113.10');

    const [alert] = alerts();
    expect(alert.to).toBe('amara@harvest.example');
    expect(alert.text).toContain('Firefox on macOS');
    expect(alert.text).toContain('Friday 9 October 2026 at 6:30 pm');
  });

  it('queues the alert for a new network', async () => {
    await signIn(CHROME, '203.0.113.10');
    await signIn(CHROME, '198.51.100.20');

    expect(alerts()).toHaveLength(1);
  });

  it('counts a device unused for more than 90 days as new', async () => {
    await signIn(CHROME, '203.0.113.10');
    vi.setSystemTime(Date.now() + 91 * 24 * 3600 * 1000);

    await signIn(CHROME, '203.0.113.10');

    expect(alerts()).toHaveLength(1);
  });

  it('sends the alert as security e-mail on the mail queue', async () => {
    await signIn(CHROME, '203.0.113.10');
    await signIn(FIREFOX, '198.51.100.20');

    expect(alerts()).toHaveLength(1);
    expect(sendMail.queue).toBe('mail');
  });
});
