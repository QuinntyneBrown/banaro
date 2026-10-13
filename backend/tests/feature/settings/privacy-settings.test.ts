// Acceptance Test
// Traces to: L2-036, L2-009, L2-044, L2-045
// Description:
// Given a new account, when it reads its privacy settings, then the profile is for members only,
// online status is on, attendee listing is off, location shows the neighbourhood and e-mail contact
// is off. Given the privacy section, when the member saves all five settings, then each is stored and
// enforced on every API response: a members-only profile is left out of the signed-out directory,
// "City only" shows the city and a distance rounded to the nearest 5 km and never the neighbourhood,
// and hidden online status is absent from the card. Invalid values are refused.

import { beforeEach, describe, expect, it } from 'vitest';
import { GET as directory } from '@/app/api/v1/builders/route';
import { GET, PUT } from '@/app/api/v1/settings/privacy/route';
import type { User } from '@/src/db/schema/users';
import { Browser } from '../../support/browser';
import { createBuilder, userOf } from '../../support/directory';
import { actingAs, createMember } from '../../support/members';

let viewer: User;

const settings = (overrides: Record<string, unknown> = {}) => ({
  profile_visibility: 'everyone',
  location_precision: 'neighbourhood',
  email_contact: false,
  show_online_status: true,
  list_in_attendees: false,
  ...overrides,
});

const save = async (user: User, body: Record<string, unknown>) =>
  (await actingAs(user)).put(PUT, '/api/v1/settings/privacy', { json: body });

interface Card {
  name: string;
  neighbourhood: { name: string; area: string };
  distance_km: number;
  online?: boolean;
  last_seen_at?: string;
}

/** The card a member, or a visitor, finds for a name. */
const cardFor = async (name: string, as?: User): Promise<Card | undefined> => {
  // Members look anywhere, so distance never hides the builder; visitors cannot filter.
  const query = `q=${encodeURIComponent(name)}${as ? '&distance=any' : ''}`;
  const browser = as ? await actingAs(as) : new Browser();
  const response = await browser.get(directory, `/api/v1/builders?${query}`);
  expect(response.status).toBe(200);
  return ((await response.json()) as { items: Card[] }).items.find((card) => card.name === name);
};

const errorKeys = async (response: Response) =>
  Object.keys(((await response.json()) as { errors: object }).errors);

describe('privacy settings', () => {
  beforeEach(async () => {
    viewer = await createMember('Amara Osei', 'leslieville');
  });

  it('starts a new account members-only, online status on and attendee listing off', async () => {
    const response = await (await actingAs(viewer)).get(GET, '/api/v1/settings/privacy');

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      profile_visibility: 'members',
      location_precision: 'neighbourhood',
      email_contact: false,
      show_online_status: true,
      list_in_attendees: false,
    });
  });

  it('stores all five settings on save', async () => {
    const saved = settings({
      profile_visibility: 'everyone',
      location_precision: 'city',
      email_contact: true,
      show_online_status: false,
      list_in_attendees: true,
    });

    const response = await save(viewer, saved);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(saved);
    expect(
      await (await (await actingAs(viewer)).get(GET, '/api/v1/settings/privacy')).json(),
    ).toEqual(saved);
  });

  it('requires and checks every setting', async () => {
    const empty = await save(viewer, {});
    expect(empty.status).toBe(422);
    expect((await errorKeys(empty)).sort()).toEqual([
      'email_contact',
      'list_in_attendees',
      'location_precision',
      'profile_visibility',
      'show_online_status',
    ]);
    expect(await errorKeys(await save(viewer, settings({ profile_visibility: 'nobody' })))).toEqual(
      ['profile_visibility'],
    );
    expect(await errorKeys(await save(viewer, settings({ location_precision: 'street' })))).toEqual(
      ['location_precision'],
    );
    expect(await errorKeys(await save(viewer, settings({ show_online_status: 'maybe' })))).toEqual([
      'show_online_status',
    ]);
  });

  it('lets only a signed-in member read or save their own settings', async () => {
    const visitor = new Browser();

    expect((await visitor.get(GET, '/api/v1/settings/privacy')).status).toBe(401);
    expect((await visitor.put(PUT, '/api/v1/settings/privacy', { json: settings() })).status).toBe(
      401,
    );
  });

  it('leaves a members-only profile out of the signed-out directory', async () => {
    const open = await createBuilder('Open Builder', 'riverdale', { activeMinutesAgo: 0 });
    await createBuilder('Private Builder', 'riverdale', { activeMinutesAgo: 0 });
    expect(
      (await save(await userOf(open), settings({ profile_visibility: 'everyone' }))).status,
    ).toBe(200);

    expect(await cardFor('Open Builder')).toBeDefined();
    expect(await cardFor('Private Builder')).toBeUndefined();
    expect(await cardFor('Private Builder', viewer)).toBeDefined();
  });

  it('shows only the city and a distance rounded to 5 km for "City only"', async () => {
    const annex = await createBuilder('Annex Builder', 'the-annex', { activeMinutesAgo: 0 });
    expect((await save(await userOf(annex), settings({ location_precision: 'city' }))).status).toBe(
      200,
    );

    const card = (await cardFor('Annex Builder', viewer))!;

    expect(card.neighbourhood).toEqual({ name: 'Downtown Toronto', area: 'Downtown Toronto' });
    expect(card.distance_km).toBe(5);
    expect(JSON.stringify(card.neighbourhood)).not.toContain('Annex');
  });

  it('leaves hidden online status off the card', async () => {
    const quiet = await createBuilder('Quiet Builder', 'riverdale', { activeMinutesAgo: 0 });
    expect((await save(await userOf(quiet), settings({ show_online_status: false }))).status).toBe(
      200,
    );

    const card = (await cardFor('Quiet Builder', viewer))!;

    expect(card).not.toHaveProperty('online');
    expect(card).not.toHaveProperty('last_seen_at');
  });
});
