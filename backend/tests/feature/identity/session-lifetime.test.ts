// Acceptance Test
// Traces to: L2-005
// Description: A session expires after 30 days without activity and, however active, 90 days after
// sign-in; a request without a session answers 401 with code `unauthenticated`, which the app turns
// into the session-expired dialog.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DELETE, GET, POST } from '@/app/api/v1/session/route';
import type { User } from '@/src/db/schema/users';
import { Browser } from '../../support/browser';
import { createUser, PASSWORD } from '../../support/members';

const DAY = 24 * 3600 * 1000;
let user: User;
let browser: Browser;
let signedInAt: number;

const signedIn = async () => {
  const body = (await (await browser.get(GET, '/api/v1/session')).json()) as {
    member: { id: number } | null;
  };
  return body.member?.id === user.id;
};

describe('session lifetime', () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    user = await createUser({ email: 'amara@harvest.example' });
    browser = new Browser();
    const response = await browser.post(POST, '/api/v1/session', {
      json: { email: 'amara@harvest.example', password: PASSWORD },
    });
    expect(response.status).toBe(200);
    signedInAt = Date.now();
  });

  afterEach(() => vi.useRealTimers());

  it('keeps the session with activity within 30 days', async () => {
    vi.setSystemTime(signedInAt + 29 * DAY);

    expect(await signedIn()).toBe(true);
  });

  it('ends the session after 30 days without activity', async () => {
    vi.setSystemTime(signedInAt + 30 * DAY + 60 * 1000);

    expect(await signedIn()).toBe(false);
  });

  it('ends an active session 90 days after sign-in', async () => {
    for (const day of [25, 50, 75]) {
      vi.setSystemTime(signedInAt + day * DAY);
      expect(await signedIn()).toBe(true);
    }

    // Only 16 days idle, but 91 days since sign-in.
    vi.setSystemTime(signedInAt + 91 * DAY);

    expect(await signedIn()).toBe(false);
  });

  it('answers 401 with a code on a member route without a session', async () => {
    expect((await browser.delete(DELETE, '/api/v1/session')).status).toBe(204);

    const response = await browser.delete(DELETE, '/api/v1/session');

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      code: 'unauthenticated',
      message: 'Your session has expired.',
    });
  });
});
