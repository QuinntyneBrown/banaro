// Acceptance Test
// Traces to: L2-037, L2-029
// Description:
// Given a signed unsubscribe link from an e-mail, when it is followed without a session, then the
// named category is turned off for the named member and the page can confirm it. Following the same
// link twice is harmless. Given a tampered link, or a link for an account that does not exist, then
// nothing changes and the API answers 422 with code invalid_unsubscribe_link.

import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { POST } from '@/app/api/v1/email-preferences/unsubscribe/route';
import { deps } from '@/src/container';
import { orm } from '@/src/db/orm';
import { users } from '@/src/db/schema/users';
import { emailAllowed } from '@/src/services/settings/email-preference-service';
import { issueUnsubscribeToken } from '@/src/services/settings/unsubscribe-token-service';
import { send } from '../../support/http';
import { createUser } from '../../support/members';

const unsubscribe = (token: string) =>
  send(POST, 'POST', '/api/v1/email-preferences/unsubscribe', { json: { token } });

const allowed = (userId: number, category: string) => emailAllowed(deps().db, userId, category);

describe('unsubscribe', () => {
  it('turns the category off without a session', async () => {
    const member = await createUser();

    const response = await unsubscribe(issueUnsubscribeToken(member.id, 'messages'));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ category: 'messages' });
    expect(await allowed(member.id, 'messages')).toBe(false);
    expect(await allowed(member.id, 'matches')).toBe(true);
  });

  it('takes the token from the query string, as a mail client posts it', async () => {
    const member = await createUser();
    const token = issueUnsubscribeToken(member.id, 'events');

    const response = await POST(
      new Request(`http://localhost:8100/api/v1/email-preferences/unsubscribe?token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'List-Unsubscribe=One-Click',
      }),
      { params: Promise.resolve(undefined) },
    );

    expect(response.status).toBe(200);
    expect(await allowed(member.id, 'events')).toBe(false);
  });

  it('is harmless when the same link is followed twice', async () => {
    const member = await createUser();
    const token = issueUnsubscribeToken(member.id, 'weekly_digest');

    expect((await unsubscribe(token)).status).toBe(200);
    const again = await unsubscribe(token);

    expect(again.status).toBe(200);
    expect(await again.json()).toEqual({ category: 'weekly_digest' });
  });

  it('changes nothing for a tampered link and answers 422', async () => {
    const member = await createUser();
    const token = issueUnsubscribeToken(member.id, 'messages');
    const [payload, signature] = token.split('.');
    const forged = `${Buffer.from(`${member.id}:events`).toString('base64url')}.${signature}`;

    for (const bad of [`${payload}.AAAA`, forged, 'garbage', '']) {
      expect((await unsubscribe(bad)).status).toBe(422);
    }
    expect(await (await unsubscribe(forged)).json()).toMatchObject({
      code: 'invalid_unsubscribe_link',
    });
    expect(await allowed(member.id, 'messages')).toBe(true);
    expect(await allowed(member.id, 'events')).toBe(true);
  });

  it('answers 422 for a link to an account that no longer exists', async () => {
    const member = await createUser();
    const token = issueUnsubscribeToken(member.id, 'messages');
    await orm(deps().db).delete(users).where(eq(users.id, member.id));

    const response = await unsubscribe(token);

    expect(response.status).toBe(422);
    expect(await response.json()).toMatchObject({ code: 'invalid_unsubscribe_link' });
  });

  it('limits the endpoint per address', async () => {
    for (let i = 0; i < 10; i++) expect((await unsubscribe('garbage')).status).toBe(422);

    expect((await unsubscribe('garbage')).status).toBe(429);
  });
});
