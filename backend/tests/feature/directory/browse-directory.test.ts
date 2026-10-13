// Acceptance Test
// Traces to: L2-009, L2-022, L2-044, L2-045, L2-047
// Description:
// Given builders with finished profiles, when a member opens the directory, then it returns 12 per
// page with the total and, for each builder, the card a member sees: photo, name, role, neighbourhood,
// distance, match score, skills, what they are building, what they are open to and online status.
// The viewer and unfinished profiles are left out. Best match (the default) orders by score, then by
// recent activity; Nearest, Recently active and Newest re-order. Search matches names and skills case-
// and accent-insensitively and by prefix. A page past the end answers with the last page. A visitor
// gets the reduced card without match, distance, online status or facts, and only the sorts that need
// no viewer. Signed-in requests record activity at most once a minute.

import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from '@/app/api/v1/builders/route';
import { PUT as saveProfile } from '@/app/api/v1/me/profile/route';
import { GET as sessionRoute } from '@/app/api/v1/session/route';
import { deps } from '@/src/container';
import { orm } from '@/src/db/orm';
import { builders, type Builder } from '@/src/db/schema/builders';
import { privacySettings } from '@/src/db/schema/settings';
import type { User } from '@/src/db/schema/users';
import { distanceBetween } from '@/src/services/directory/distance-service';
import { matchScore } from '@/src/services/matching/match-score-service';
import { Browser } from '../../support/browser';
import { createBuilder, userOf } from '../../support/directory';
import { actingAs, neighbourhoodId, seedReferenceData } from '../../support/members';

interface Card {
  id: string;
  name: string;
  role: string;
  headline: string;
  neighbourhood: { name: string; area: string };
  distance_km?: number;
  match_score?: number;
  skills: string[];
  building?: string | null;
  open_to?: string[];
  online?: boolean;
  last_seen_at?: string | null;
  photo_url: string | null;
}

interface Page {
  items: Card[];
  total: number;
  page: number;
  per_page: number;
  last_page: number;
}

let viewer: User;
let viewerBuilder: Builder;

const query = (params: Record<string, string | number | string[]>) => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    for (const item of Array.isArray(value) ? value : [value]) {
      search.append(Array.isArray(value) ? `${key}[]` : key, String(item));
    }
  }
  return search.toString();
};

const browse = async (params: Record<string, string | number | string[]> = {}, asMember = true) => {
  const browser = asMember ? await actingAs(viewer) : new Browser();
  return browser.get(GET, `/api/v1/builders?${query(params)}`);
};

const names = async (response: Response) =>
  ((await response.json()) as Page).items.map((card) => card.name);

const errorKeys = async (response: Response) =>
  Object.keys(((await response.json()) as { errors: object }).errors);

describe('browse the directory', () => {
  beforeEach(async () => {
    await seedReferenceData();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-11T16:00:00Z'));
    viewerBuilder = await createBuilder('Amara Osei', 'leslieville', { activeMinutesAgo: 0 });
    viewer = await userOf(viewerBuilder);
  });

  afterEach(() => vi.useRealTimers());

  it('gives a member twelve member cards with the total, leaving out themselves and unfinished profiles', async () => {
    for (let i = 1; i <= 13; i++) {
      await createBuilder(`Builder ${i}`, 'riverdale', { activeMinutesAgo: i * 60 });
    }
    await createBuilder('Not Finished', 'riverdale', { complete: false });

    const response = await browse();

    expect(response.status).toBe(200);
    const page = (await response.json()) as Page;
    expect(page).toMatchObject({ total: 13, page: 1, per_page: 12, last_page: 2 });
    expect(page.items).toHaveLength(12);
    const listed = page.items.map((card) => card.name);
    expect(listed).not.toContain('Amara Osei');
    expect(listed).not.toContain('Not Finished');
  });

  it('carries every fact on the member card', async () => {
    const daniel = await createBuilder('Daniel Reyes', 'riverdale', {
      skills: ['Laravel', 'Angular', 'PostgreSQL'],
      activeMinutesAgo: 2,
      extra: {
        headline: 'Full-stack engineer',
        buildingSummary: 'Psalter',
        openTo: ['co_founding', 'advising'],
      },
    });

    const [card] = ((await (await browse()).json()) as Page).items;

    expect(card.id).toBe(daniel.publicId);
    expect(card.name).toBe('Daniel Reyes');
    expect(card.role).toBe('engineer');
    expect(card.headline).toBe('Full-stack engineer');
    expect(card.neighbourhood).toEqual({ name: 'Riverdale', area: 'Downtown Toronto' });
    expect(card.distance_km).toBeCloseTo(1.4, 0);
    expect(Number.isInteger(card.match_score)).toBe(true);
    expect(card.skills).toEqual(['Laravel', 'Angular', 'PostgreSQL']);
    expect(card.building).toBe('Psalter');
    expect(card.open_to).toEqual(['co_founding', 'advising']);
    expect(card.online).toBe(true);
    expect(card.last_seen_at).toBe('2026-10-11T11:58:00-04:00');
    expect(card.photo_url).toBeNull();
  });

  it('orders by best match by default, then by recent activity', async () => {
    await createBuilder('Near and active', 'riverdale', { activeMinutesAgo: 10 });
    await createBuilder('Far and active', 'oakville', { activeMinutesAgo: 10 });
    await createBuilder('Near and idle', 'riverdale', { activeMinutesAgo: 60 * 24 * 90 });
    await createBuilder('Same score, less recent', 'riverdale', { activeMinutesAgo: 20 });

    const page = (await (await browse()).json()) as Page;

    const byName = Object.fromEntries(page.items.map((card) => [card.name, card]));
    const scores = page.items.map((card) => card.match_score!);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
    // Equal scores fall back to the most recently active first.
    expect(byName['Near and active'].match_score).toBe(
      byName['Same score, less recent'].match_score,
    );
    expect(page.items.slice(0, 2).map((card) => card.name)).toEqual([
      'Near and active',
      'Same score, less recent',
    ]);
    // Each score is the one the matching service gives that builder.
    for (const name of ['Far and active', 'Near and idle']) {
      const [candidate] = await orm(deps().db)
        .select()
        .from(builders)
        .where(eq(builders.name, name));
      const km = await distanceBetween(
        deps().db,
        viewerBuilder.neighbourhoodId,
        candidate.neighbourhoodId,
      );
      expect(byName[name].match_score).toBe(matchScore(km, candidate.lastActiveAt).value);
    }
    expect(byName['Near and active'].match_score).toBeGreaterThan(
      byName['Far and active'].match_score!,
    );
    expect(byName['Near and active'].match_score).toBeGreaterThan(
      byName['Near and idle'].match_score!,
    );
  });

  it('re-orders by nearest, recently active and newest', async () => {
    await createBuilder('Oakville builder', 'oakville', {
      activeMinutesAgo: 1,
      joined: '2026-09-01',
    });
    await createBuilder('Riverdale builder', 'riverdale', {
      activeMinutesAgo: 300,
      joined: '2026-10-01',
    });
    await createBuilder('Annex builder', 'the-annex', {
      activeMinutesAgo: 30,
      joined: '2026-08-01',
    });

    expect(await names(await browse({ sort: 'nearest' }))).toEqual([
      'Riverdale builder',
      'Annex builder',
      'Oakville builder',
    ]);
    expect(await names(await browse({ sort: 'recently_active' }))).toEqual([
      'Oakville builder',
      'Annex builder',
      'Riverdale builder',
    ]);
    expect(await names(await browse({ sort: 'newest' }))).toEqual([
      'Riverdale builder',
      'Oakville builder',
      'Annex builder',
    ]);
  });

  it('matches names and skills by prefix without regard to case or accents', async () => {
    await createBuilder('José Martín', 'riverdale', { skills: ['Product strategy'] });
    await createBuilder('Daniel Reyes', 'riverdale', { skills: ['Laravel'] });
    await createBuilder('Esther Nguyen', 'riverdale', { skills: ['Figma'] });

    expect(await names(await browse({ q: 'jose' }))).toEqual(['José Martín']);
    expect(await names(await browse({ q: 'MARTIN' }))).toEqual(['José Martín']);
    expect(await names(await browse({ q: 'dan' }))).toEqual(['Daniel Reyes']);
    expect(await names(await browse({ q: 'larav' }))).toEqual(['Daniel Reyes']);
    expect(await names(await browse({ q: 'product strat' }))).toEqual(['José Martín']);
    expect(await names(await browse({ q: "'; drop table builders; --" }))).toEqual([]);
  });

  it('refreshes what search finds when a profile is saved', async () => {
    const esther = await userOf(
      await createBuilder('Esther Nguyen', 'riverdale', { skills: ['Figma'] }),
    );

    const saved = await (
      await actingAs(esther)
    ).put(saveProfile, '/api/v1/me/profile', {
      json: {
        name: 'Esther Nguyen',
        headline: null,
        neighbourhood_id: await neighbourhoodId('riverdale'),
        bio: null,
        skills: [{ name: 'Rust' }],
        experience: [],
        links: [],
        open_to: ['advising'],
        looking_for: null,
        building: null,
      },
    });
    expect(saved.status).toBe(200);

    expect(await names(await browse({ q: 'rust' }))).toEqual(['Esther Nguyen']);
    expect(await names(await browse({ q: 'figma' }))).toEqual([]);
  });

  it('answers a page past the end with the last page', async () => {
    for (let i = 1; i <= 14; i++) {
      await createBuilder(`Builder ${i}`, 'riverdale', { activeMinutesAgo: i });
    }

    const response = await browse({ page: 9, sort: 'recently_active' });

    const page = (await response.json()) as Page;
    expect(page).toMatchObject({ page: 2, last_page: 2, total: 14 });
    expect(page.items.map((card) => card.name)).toEqual(['Builder 13', 'Builder 14']);
  });

  it('gives a visitor the reduced card and only sorts that need no viewer', async () => {
    const daniel = await createBuilder('Daniel Reyes', 'riverdale', {
      skills: ['Laravel'],
      activeMinutesAgo: 2,
      extra: { buildingSummary: 'Psalter' },
    });
    // Visitors see only profiles open to everyone (L2-036 criterion 2).
    await orm(deps().db)
      .insert(privacySettings)
      .values({ userId: daniel.userId, profileVisibility: 'everyone' });

    const response = await browse({}, false);

    expect(response.status).toBe(200);
    const card = ((await response.json()) as Page).items.find(
      (item) => item.name === 'Daniel Reyes',
    )!;
    expect(Object.keys(card)).toEqual([
      'id',
      'name',
      'role',
      'headline',
      'neighbourhood',
      'skills',
      'photo_url',
    ]);
    expect(card.neighbourhood).toEqual({ name: 'Riverdale', area: 'Downtown Toronto' });
    expect((await browse({ sort: 'newest' }, false)).status).toBe(200);
    expect(await errorKeys(await browse({ sort: 'best_match' }, false))).toEqual(['sort']);
    expect(await errorKeys(await browse({ sort: 'nearest' }, false))).toEqual(['sort']);
  });

  it('rejects invalid queries', async () => {
    expect(await errorKeys(await browse({ sort: 'alphabetical' }))).toEqual(['sort']);
    expect(await errorKeys(await browse({ page: 0 }))).toEqual(['page']);
    expect(await errorKeys(await browse({ per_page: 51 }))).toEqual(['per_page']);
    expect(await errorKeys(await browse({ q: 'a'.repeat(101) }))).toEqual(['q']);
  });

  it('records activity of signed-in requests at most once a minute', async () => {
    const daniel = await createBuilder('Daniel Reyes', 'riverdale', { activeMinutesAgo: 600 });
    const browser = await actingAs(await userOf(daniel));
    const lastActive = async () =>
      (await orm(deps().db).select().from(builders).where(eq(builders.id, daniel.id)))[0]
        .lastActiveAt;

    vi.setSystemTime(new Date('2026-10-11T16:00:30Z'));
    expect((await browser.get(sessionRoute, '/api/v1/session')).status).toBe(200);
    expect(await lastActive()).toBe('2026-10-11 12:00:30');

    vi.setSystemTime(new Date('2026-10-11T16:01:00Z'));
    await browser.get(sessionRoute, '/api/v1/session');
    expect(await lastActive()).toBe('2026-10-11 12:00:30');

    vi.setSystemTime(new Date('2026-10-11T16:01:31Z'));
    await browser.get(sessionRoute, '/api/v1/session');
    expect(await lastActive()).toBe('2026-10-11 12:01:31');
  });
});
