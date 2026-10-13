// Acceptance Test
// Traces to: L2-002
// Description: A verification link verifies the account once within 24 hours; expired, unknown and
// used links change nothing; a resend queues a new link that ends earlier ones, is limited to 3 per
// hour, and answers 202 whether or not anything was sent.

import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET as session } from '@/app/api/v1/session/route';
import { POST as verifyRoute } from '@/app/api/v1/email/verify/route';
import { POST as resendRoute } from '@/app/api/v1/email/verification-notification/route';
import { deps, setDeps } from '@/src/container';
import { orm } from '@/src/db/orm';
import { users, type User } from '@/src/db/schema/users';
import { sendMail } from '@/src/jobs/send-mail';
import { issueVerificationLink } from '@/src/services/identity/email-verification-service';
import { Browser } from '../../support/browser';
import { FakeQueue } from '../../support/fakes';
import { actingAs, createUser } from '../../support/members';

let queue: FakeQueue;

const unverified = () =>
  createUser({ name: 'Amara Osei', email: 'amara@harvest.example', emailVerifiedAt: null });

/** Issues a link and returns its token, as the e-mail would carry it. */
const tokenFor = async (user: User) =>
  new URL(await issueVerificationLink(deps().db, user.id)).searchParams.get('token')!;

const verify = (token: string, browser = new Browser()) =>
  browser.post(verifyRoute, '/api/v1/email/verify', { json: { token } });

const resend = (body: Record<string, unknown> = {}, browser = new Browser()) =>
  browser.post(resendRoute, '/api/v1/email/verification-notification', { json: body });

const verifiedAt = async (user: User) =>
  (await orm(deps().db).select().from(users).where(eq(users.id, user.id)))[0].emailVerifiedAt;

const linksSentTo = (email: string) =>
  queue.payloads(sendMail).filter((mail) => mail.to === email).length;

const travel = (seconds: number) => vi.setSystemTime(Date.now() + seconds * 1000);

describe('e-mail verification', () => {
  beforeEach(() => {
    queue = new FakeQueue();
    setDeps({ queue });
    vi.useFakeTimers({ toFake: ['Date'] });
  });

  afterEach(() => vi.useRealTimers());

  it('verifies the account from a fresh link without signing in', async () => {
    const user = await unverified();
    const browser = new Browser();

    const response = await verify(await tokenFor(user), browser);

    expect(response.status).toBe(204);
    expect(await verifiedAt(user)).not.toBeNull();
    expect(await (await browser.get(session, '/api/v1/session')).json()).toEqual({ member: null });
  });

  it('changes nothing for a link older than 24 hours', async () => {
    const user = await unverified();
    const token = await tokenFor(user);
    travel(24 * 3600 + 60);

    const response = await verify(token);

    expect(response.status).toBe(422);
    expect(await response.json()).toMatchObject({
      code: 'verification_link_invalid',
      link_known: true,
    });
    expect(await verifiedAt(user)).toBeNull();
  });

  it('changes nothing for a tampered link', async () => {
    const user = await unverified();
    const token = await tokenFor(user);

    const response = await verify([...token].reverse().join(''));

    expect(response.status).toBe(422);
    expect(await response.json()).toMatchObject({
      code: 'verification_link_invalid',
      link_known: false,
    });
    expect(await verifiedAt(user)).toBeNull();
  });

  it('works once', async () => {
    const user = await unverified();
    const token = await tokenFor(user);

    expect((await verify(token)).status).toBe(204);
    const again = await verify(token);

    expect(again.status).toBe(422);
    expect(((await again.json()) as { code: string }).code).toBe('verification_link_invalid');
  });

  it('treats a malformed token as a field error', async () => {
    const response = await verify('');

    expect(response.status).toBe(422);
    expect(Object.keys(((await response.json()) as { errors: object }).errors)).toEqual(['token']);
  });

  it('lets a signed-in member ask for a new link, which ends earlier links', async () => {
    const user = await unverified();
    const old = await tokenFor(user);

    const response = await resend({}, await actingAs(user));

    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({});
    expect(linksSentTo('amara@harvest.example')).toBe(1);
    expect((await verify(old)).status).toBe(422);
  });

  it('still identifies the account from a used or expired link for a resend', async () => {
    const user = await unverified();
    const token = await tokenFor(user);
    travel(2 * 24 * 3600);

    expect((await resend({ token })).status).toBe(202);

    expect(linksSentTo('amara@harvest.example')).toBe(1);
  });

  it('sends nothing for a verified or unknown account and still answers 202', async () => {
    const verified = await createUser({ email: 'noah@harvest.example' });

    for (const email of ['noah@harvest.example', 'nobody@harvest.example']) {
      const response = await resend({ email });
      expect(response.status).toBe(202);
      expect(await response.json()).toEqual({});
    }

    expect(queue.pushed).toHaveLength(0);
    expect(await verifiedAt(verified)).not.toBeNull();
  });

  it('allows no more than three resends an hour per account', async () => {
    const user = await unverified();
    const browser = await actingAs(user);
    for (let i = 0; i < 3; i++) expect((await resend({}, browser)).status).toBe(202);

    const response = await resend({}, browser);

    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBeTruthy();
    expect(linksSentTo('amara@harvest.example')).toBe(3);
  });

  it('limits unknown addresses the same way', async () => {
    for (let i = 0; i < 3; i++) {
      expect((await resend({ email: 'nobody@harvest.example' })).status).toBe(202);
    }

    expect((await resend({ email: 'NOBODY@harvest.example' })).status).toBe(429);
  });
});
