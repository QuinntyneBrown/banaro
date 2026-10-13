// Acceptance Test
// Traces to: L2-004, L2-029
// Description: Asking for a reset link answers the same for any well-formed address and e-mails a
// link only to a registered one; a link under 60 minutes old sets a compliant new password once,
// verifies the address, ends every session and sends a security e-mail; expired, used and tampered
// links change nothing; requests are limited to 5 per hour per address or IP.

import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST as forgotRoute } from '@/app/api/v1/forgot-password/route';
import { POST as checkRoute } from '@/app/api/v1/reset-password/check/route';
import { POST as resetRoute } from '@/app/api/v1/reset-password/route';
import { GET as session, POST as signIn } from '@/app/api/v1/session/route';
import { deps, setDeps } from '@/src/container';
import { orm } from '@/src/db/orm';
import { users, type User } from '@/src/db/schema/users';
import { sendPasswordResetLink } from '@/src/jobs/identity/send-password-reset-link';
import { sendMail } from '@/src/jobs/send-mail';
import { checkPassword } from '@/src/services/identity/password-policy';
import { createResetToken } from '@/src/services/identity/password-reset-tokens';
import { Browser } from '../../support/browser';
import { FakeQueue, InMemoryMailer } from '../../support/fakes';
import { actingAs, createUser } from '../../support/members';

const OLD = 'harvest-volunteers-2026';
const NEW = 'lanterns-on-queen-street';
let queue: FakeQueue;

const member = async (overrides = {}) => {
  const user = await createUser({
    name: 'Amara Osei',
    email: 'amara@harvest.example',
    ...overrides,
  });
  return user;
};

const forgot = (email: string, ip = '10.4.0.1') =>
  new Browser(ip).post(forgotRoute, '/api/v1/forgot-password', { json: { email } });

const reset = (token: string, overrides: Record<string, unknown> = {}, browser = new Browser()) =>
  browser.post(resetRoute, '/api/v1/reset-password', {
    json: {
      email: 'amara@harvest.example',
      token,
      password: NEW,
      password_confirmation: NEW,
      ...overrides,
    },
  });

const check = (token: string) =>
  new Browser().post(checkRoute, '/api/v1/reset-password/check', {
    json: { email: 'amara@harvest.example', token },
  });

const passwordOf = async (user: User) =>
  (await orm(deps().db).select().from(users).where(eq(users.id, user.id)))[0];

const errorsOf = async (response: Response) =>
  ((await response.json()) as { errors: Record<string, string[]> }).errors;

describe('password reset', () => {
  beforeEach(() => {
    queue = new FakeQueue();
    setDeps({ queue });
    vi.useFakeTimers({ toFake: ['Date'] });
  });

  afterEach(() => vi.useRealTimers());

  it('mails a link to a registered address and answers any address the same', async () => {
    await member();

    for (const email of ['Amara@Harvest.example', 'nobody@harvest.example']) {
      const response = await forgot(email);
      expect(response.status).toBe(202);
      expect(await response.json()).toEqual({});
    }

    const mailer = new InMemoryMailer();
    setDeps({ mailer });
    for (const email of queue.payloads(sendPasswordResetLink)) {
      await sendPasswordResetLink.handle(email, deps());
    }
    expect(mailer.sent).toHaveLength(1);
    expect(mailer.sent[0].to).toBe('amara@harvest.example');
    expect(mailer.sent[0].text).toContain('/reset-password?token=');
  });

  it('treats a malformed address as a field error', async () => {
    const response = await forgot('amara@');

    expect(response.status).toBe(422);
    expect(Object.keys(await errorsOf(response))).toEqual(['email']);
  });

  it('refuses more than five requests per address in an hour', async () => {
    for (let i = 1; i <= 5; i++) {
      expect((await forgot('nobody@harvest.example', `10.4.1.${i}`)).status).toBe(202);
    }

    const response = await forgot('nobody@harvest.example', '10.4.1.9');

    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBeTruthy();
  });

  it('refuses more than five requests per address of the client in an hour', async () => {
    for (let i = 1; i <= 5; i++) {
      expect((await forgot(`someone${i}@harvest.example`, '10.4.2.1')).status).toBe(202);
    }

    expect((await forgot('another@harvest.example', '10.4.2.1')).status).toBe(429);
  });

  it('checks out a fresh link and refuses an expired or tampered one', async () => {
    const token = await createResetToken(deps().db, await member());

    expect((await check(token)).status).toBe(204);
    const tampered = await check([...token].reverse().join(''));
    expect(tampered.status).toBe(422);
    expect(((await tampered.json()) as { code: string }).code).toBe('reset_link_invalid');

    vi.setSystemTime(Date.now() + 61 * 60 * 1000);
    expect(((await (await check(token)).json()) as { code: string }).code).toBe(
      'reset_link_invalid',
    );
  });

  it('sets the new password once from a fresh link', async () => {
    const user = await member();
    const token = await createResetToken(deps().db, user);

    expect((await reset(token)).status).toBe(204);
    expect(await checkPassword(NEW, (await passwordOf(user)).password)).toBe(true);

    const again = await reset(token, {
      password: 'another-good-password',
      password_confirmation: 'another-good-password',
    });
    expect(again.status).toBe(422);
    expect(((await again.json()) as { code: string }).code).toBe('reset_link_invalid');
  });

  it('changes nothing from an expired link', async () => {
    const user = await member();
    const token = await createResetToken(deps().db, user);
    vi.setSystemTime(Date.now() + 61 * 60 * 1000);

    const response = await reset(token);

    expect(response.status).toBe(422);
    expect(((await response.json()) as { code: string }).code).toBe('reset_link_invalid');
    expect(await checkPassword(OLD, (await passwordOf(user)).password)).toBe(true);
  });

  it('refuses short, common, mismatched and current passwords with specific messages', async () => {
    const token = await createResetToken(deps().db, await member());
    const passwordErrors = async (overrides: Record<string, unknown>) =>
      (await errorsOf(await reset(token, overrides))).password;

    expect(await passwordErrors({ password: 'short', password_confirmation: 'short' })).toContain(
      'Use at least 12 characters',
    );
    expect(
      await passwordErrors({ password: 'Unbelievable', password_confirmation: 'Unbelievable' }),
    ).toContain('That password is too common. Choose something harder to guess.');
    expect(await passwordErrors({ password_confirmation: 'something-else-entirely' })).toContain(
      "The two passwords don't match",
    );
    expect(await passwordErrors({ password: OLD, password_confirmation: OLD })).toContain(
      'Choose a different password. This one is your current password.',
    );
  });

  it('verifies an unverified address and queues a security e-mail', async () => {
    const user = await member({ emailVerifiedAt: null });

    expect((await reset(await createResetToken(deps().db, user))).status).toBe(204);

    expect((await passwordOf(user)).emailVerifiedAt).not.toBeNull();
    const mails = queue.payloads(sendMail);
    expect(mails.map((mail) => mail.subject)).toEqual(['Your Banaro password was changed']);
    expect(sendMail.queue).toBe('mail');
  });

  it('ends the session it was made in', async () => {
    const user = await member();
    const browser = new Browser();
    const signedIn = await browser.post(signIn, '/api/v1/session', {
      json: { email: 'amara@harvest.example', password: OLD },
    });
    expect(signedIn.status).toBe(200);

    expect((await reset(await createResetToken(deps().db, user), {}, browser)).status).toBe(204);

    expect(await (await browser.get(session, '/api/v1/session')).json()).toEqual({ member: null });
  });

  it('ends every other session on its next request', async () => {
    const user = await member();
    const elsewhere = await actingAs(user);

    expect((await reset(await createResetToken(deps().db, user))).status).toBe(204);

    expect(await (await elsewhere.get(session, '/api/v1/session')).json()).toEqual({
      member: null,
    });
  });
});
