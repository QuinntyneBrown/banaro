// Acceptance Test
// Traces to: L2-037, L2-029, L2-044
// Description:
// Given a new account, when the member reads their e-mail preferences, then Matches, Messages,
// Events, Project activity and Weekly digest are all on. Given the member turns one category off,
// then only that category changes and each category saves on its own. Invalid categories and values
// are refused, and only a signed-in, verified member reads or changes their own preferences.

import { describe, expect, it } from 'vitest';
import { GET } from '@/app/api/v1/settings/email-preferences/route';
import { PUT } from '@/app/api/v1/settings/email-preferences/[category]/route';
import { deps } from '@/src/container';
import type { User } from '@/src/db/schema/users';
import { emailAllowed } from '@/src/services/settings/email-preference-service';
import { Browser } from '../../support/browser';
import { actingAs, createUser } from '../../support/members';

const ALL_ON = {
  matches: true,
  messages: true,
  events: true,
  project_activity: true,
  weekly_digest: true,
};

const set = async (member: User, category: string, json: Record<string, unknown>) =>
  (await actingAs(member)).put(PUT, `/api/v1/settings/email-preferences/${category}`, {
    json,
    params: { category },
  });

const read = async (member: User) =>
  (await actingAs(member)).get(GET, '/api/v1/settings/email-preferences');

const errorKeys = async (response: Response) =>
  Object.keys(((await response.json()) as { errors: object }).errors);

describe('e-mail preferences', () => {
  it('starts a new account with every category on', async () => {
    const response = await read(await createUser());

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(ALL_ON);
  });

  it('turns one category off and leaves the others unchanged', async () => {
    const member = await createUser();

    const first = await set(member, 'messages', { enabled: false });
    expect(first.status).toBe(200);
    expect(await first.json()).toEqual({ ...ALL_ON, messages: false });
    expect(await (await set(member, 'events', { enabled: false })).json()).toEqual({
      ...ALL_ON,
      messages: false,
      events: false,
    });
    expect(await (await set(member, 'messages', { enabled: true })).json()).toEqual({
      ...ALL_ON,
      events: false,
    });

    expect(await emailAllowed(deps().db, member.id, 'events')).toBe(false);
    expect(await emailAllowed(deps().db, member.id, 'messages')).toBe(true);
  });

  it('refuses an unknown category or a value that is not true or false', async () => {
    const member = await createUser();

    expect(await errorKeys(await set(member, 'newsletter', { enabled: false }))).toEqual([
      'category',
    ]);
    expect(await errorKeys(await set(member, 'messages', { enabled: 'maybe' }))).toEqual([
      'enabled',
    ]);
    expect(await errorKeys(await set(member, 'messages', {}))).toEqual(['enabled']);
  });

  it('never lets one member change another member preferences', async () => {
    const owner = await createUser();
    const other = await createUser();

    expect((await set(other, 'matches', { enabled: false })).status).toBe(200);

    expect(await (await read(owner)).json()).toEqual(ALL_ON);
  });

  it('needs a signed-in, verified member', async () => {
    const visitor = new Browser();

    expect((await visitor.get(GET, '/api/v1/settings/email-preferences')).status).toBe(401);
    const put = await visitor.put(PUT, '/api/v1/settings/email-preferences/matches', {
      json: { enabled: false },
      params: { category: 'matches' },
    });
    expect(put.status).toBe(401);
    expect((await read(await createUser({ emailVerifiedAt: null }))).status).toBe(403);
  });
});
