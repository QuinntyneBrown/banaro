// Acceptance Test
// Traces to: L2-040, L2-045
// Description: A visitor's contact message is validated and queued to the team; bots are
// discarded through the honeypot.

import { beforeEach, describe, expect, it } from 'vitest';
import { POST } from '@/app/api/v1/contact-messages/route';
import { setDeps } from '@/src/container';
import { deliverContactMessage } from '@/src/jobs/public-site/deliver-contact-message';
import { FakeQueue } from '../../support/fakes';
import { send } from '../../support/http';

let queue: FakeQueue;

const message = (overrides: Record<string, unknown> = {}) => ({
  name: 'Amara Osei',
  email: 'amara@harvest.example',
  topic: 'propose-event',
  message: 'Could our Saturday prayer group list a monthly breakfast on Banaro?',
  website: null,
  ...overrides,
});

const post = (json: unknown, ip = '10.0.0.1') =>
  send(POST, 'POST', '/api/v1/contact-messages', { json, headers: { 'X-Forwarded-For': ip } });

describe('contact messages', () => {
  beforeEach(() => {
    queue = new FakeQueue();
    setDeps({ queue });
  });

  it('queues a valid message to the team', async () => {
    const response = await post(message());

    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({});
    expect(queue.payloads(deliverContactMessage)).toEqual([
      {
        name: 'Amara Osei',
        email: 'amara@harvest.example',
        topic: 'propose-event',
        message: 'Could our Saturday prayer group list a monthly breakfast on Banaro?',
      },
    ]);
  });

  it('accepts each topic from the requirement', async () => {
    const topics = ['general', 'partnership', 'press', 'report-problem', 'propose-event'];
    for (const [i, topic] of topics.entries()) {
      expect((await post(message({ topic }), `10.0.0.${i}`)).status).toBe(202);
    }
  });

  it('returns 422 with an error per field for invalid input', async () => {
    const response = await post({
      name: '',
      email: 'amara@',
      topic: 'gossip',
      message: 'Too short',
    });

    expect(response.status).toBe(422);
    const body = (await response.json()) as { message: string; errors: Record<string, string[]> };
    expect(Object.keys(body.errors).sort()).toEqual(['email', 'message', 'name', 'topic']);
    expect(body.errors.name).toEqual(['Enter your name']);
    expect(body.errors.message).toEqual(['Use at least 10 characters']);
    expect(body.message).toBe('Enter your name (and 3 more errors)');
    expect(queue.pushed).toHaveLength(0);
  });

  it('allows messages of 10 to 2,000 characters', async () => {
    const tooLong = await post(message({ message: 'a'.repeat(2001) }));
    expect(tooLong.status).toBe(422);
    expect(((await tooLong.json()) as { errors: Record<string, string[]> }).errors.message).toEqual(
      ['Use 2,000 characters or fewer'],
    );

    expect((await post(message({ message: 'a'.repeat(2000) }))).status).toBe(202);
  });

  it('rejects an e-mail address with a line break', async () => {
    const response = await post(message({ email: 'amara@harvest.example\r\nBcc: x@y.example' }));

    expect(response.status).toBe(422);
    expect(Object.keys(((await response.json()) as { errors: object }).errors)).toEqual(['email']);
  });

  it('answers a filled honeypot as a success but discards the message', async () => {
    const response = await post(message({ website: 'https://spam.example' }));

    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({});
    expect(queue.pushed).toHaveLength(0);
  });
});
