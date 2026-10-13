// Acceptance Test
// Traces to: L2-003, L2-045
// Description: A member signs in with e-mail and password and signs out. Wrong details get one
// generic answer, guessing is throttled per account and per IP, the session identifier changes on
// sign-in, and state-changing requests need the CSRF token.

import { describe, expect, it } from 'vitest';
import { DELETE, GET, POST } from '@/app/api/v1/session/route';
import { Browser } from '../../support/browser';
import { createUser, PASSWORD } from '../../support/members';

const member = (overrides = {}) =>
  createUser({ name: 'Amara Osei', email: 'amara@harvest.example', ...overrides });

const signIn = (browser: Browser, overrides: Record<string, unknown> = {}) =>
  browser.post(POST, '/api/v1/session', {
    json: { email: 'Amara@Harvest.example', password: PASSWORD, ...overrides },
  });

const sessionCookie = (browser: Browser) => browser.cookies.get('banaro_session');

describe('session', () => {
  it('gives a visitor no member', async () => {
    const response = await new Browser().get(GET, '/api/v1/session');

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ member: null });
  });

  it('starts a session for valid credentials and returns the member', async () => {
    const user = await member();
    const browser = new Browser();

    const response = await signIn(browser);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      member: {
        id: user.id,
        name: 'Amara Osei',
        email: 'amara@harvest.example',
        email_verified: true,
        onboarding_complete: false,
        builder_id: null,
        photo_url: null,
      },
    });
    const again = (await (await browser.get(GET, '/api/v1/session')).json()) as {
      member: { id: number };
    };
    expect(again.member.id).toBe(user.id);
  });

  it('issues a new session identifier at sign-in', async () => {
    await member();
    const browser = new Browser();
    await browser.get(GET, '/api/v1/session');
    const before = sessionCookie(browser);

    expect((await signIn(browser)).status).toBe(200);

    expect(sessionCookie(browser)).toBeTruthy();
    expect(sessionCookie(browser)).not.toBe(before);
  });

  it('lets an unverified account sign in and reports it unverified', async () => {
    await member({ emailVerifiedAt: null });

    const body = (await (await signIn(new Browser())).json()) as {
      member: { email_verified: boolean };
    };

    expect(body.member.email_verified).toBe(false);
  });

  it('gives a wrong password and an unknown e-mail the same generic answer', async () => {
    await member();
    const browser = new Browser();

    const wrongPassword = await signIn(browser, { password: 'not-the-right-one' });
    browser.ip = '10.2.0.2';
    const unknownEmail = await signIn(browser, { email: 'nobody@harvest.example' });

    for (const response of [wrongPassword, unknownEmail]) {
      expect(response.status).toBe(422);
      expect(await response.json()).toEqual({
        code: 'invalid_credentials',
        message: "Those details don't match",
      });
    }
    expect(await (await browser.get(GET, '/api/v1/session')).json()).toEqual({ member: null });
  });

  it('treats a password over 128 characters as a failed attempt with the generic answer', async () => {
    await member();

    const response = await signIn(new Browser(), { password: 'p'.repeat(129) });

    expect(response.status).toBe(422);
    expect(((await response.json()) as { code: string }).code).toBe('invalid_credentials');
  });

  it('gives empty or malformed fields field errors', async () => {
    const response = await signIn(new Browser(), { email: 'amara@', password: '' });

    expect(response.status).toBe(422);
    const body = (await response.json()) as { errors: Record<string, string[]> };
    expect(Object.keys(body.errors).sort()).toEqual(['email', 'password']);
  });

  it('throttles five failures for one account with Retry-After', async () => {
    await member();
    for (let i = 1; i <= 5; i++) {
      const response = await signIn(new Browser(`10.2.1.${i}`), {
        password: `wrong-password-${i}`,
      });
      expect(response.status).toBe(422);
    }

    const response = await signIn(new Browser('10.2.1.9'));

    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBeTruthy();
    expect(((await response.json()) as { code: string }).code).toBe('too_many_attempts');
  });

  it('throttles twenty failures from one address even across accounts', async () => {
    const browser = new Browser('10.2.2.1');
    for (let i = 1; i <= 20; i++) {
      expect((await signIn(browser, { email: `guess${i}@harvest.example` })).status).toBe(422);
    }
    await member();

    const response = await signIn(browser);

    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBeTruthy();
  });

  it('clears the account failures after a successful sign-in', async () => {
    await member();
    const browser = new Browser();
    for (let i = 1; i <= 4; i++) await signIn(browser, { password: `wrong-password-${i}` });

    expect((await signIn(browser)).status).toBe(200);
    expect((await browser.delete(DELETE, '/api/v1/session')).status).toBe(204);
    expect((await signIn(browser, { password: 'wrong-again' })).status).toBe(422);
    expect((await signIn(browser)).status).toBe(200);
  });

  it('destroys the session at sign-out', async () => {
    await member();
    const browser = new Browser();
    await signIn(browser);

    expect((await browser.delete(DELETE, '/api/v1/session')).status).toBe(204);

    expect(await (await browser.get(GET, '/api/v1/session')).json()).toEqual({ member: null });
  });

  it('requires a session to sign out', async () => {
    const response = await new Browser().delete(DELETE, '/api/v1/session');

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      code: 'unauthenticated',
      message: 'Your session has expired.',
    });
  });

  it('sets an HttpOnly, Secure, SameSite=Lax session cookie and a readable CSRF cookie', async () => {
    await member();

    const cookies = (await signIn(new Browser())).headers.getSetCookie();

    const session = cookies.find((cookie) => cookie.startsWith('banaro_session='))!;
    expect(session).toMatch(/; httponly/i);
    expect(session).toMatch(/; secure/i);
    expect(session).toMatch(/; samesite=lax/i);
    const csrf = cookies.find((cookie) => cookie.startsWith('XSRF-TOKEN='))!;
    expect(csrf).not.toMatch(/httponly/i);
  });

  it('answers 419 to a state-changing request with a wrong CSRF token', async () => {
    await member();
    const browser = new Browser();
    expect((await signIn(browser)).status).toBe(200);

    const forged = await browser.delete(DELETE, '/api/v1/session', {
      headers: { 'X-XSRF-TOKEN': 'not-the-token' },
    });

    expect(forged.status).toBe(419);
    expect(await forged.json()).toEqual({ message: 'CSRF token mismatch.' });
    expect(
      ((await (await browser.get(GET, '/api/v1/session')).json()) as { member: unknown }).member,
    ).not.toBeNull();
  });
});
