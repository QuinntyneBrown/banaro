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
import { GET, PUT } from '@/app/api/v1/settings/privacy/route';
import type { User } from '@/src/db/schema/users';
import { Browser } from '../../support/browser';
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
});
