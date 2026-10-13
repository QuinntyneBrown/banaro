// Acceptance Test
// Traces to: L2-011, L2-036, L2-044, L2-045
// Description:
// Given /builders/{id}, when a member opens another builder's profile, then the API returns photo,
// name, role, neighbourhood, distance, match score with its reasons, skills, bio, experience, what
// they are building, open to, last-seen status and member since, with the actions the member may take.
// A sparse profile carries only its populated fields. An id that does not exist, an unfinished
// profile, or a members-only profile opened by a visitor all answer the same 404. Hidden fields are
// absent: online status, the neighbourhood under "City only", and the e-mail address unless shown.
// A visitor gets the reduced profile. The member's own profile is marked as theirs.

import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from '@/app/api/v1/builders/[builder]/route';
import { toStamp } from '@/src/clock';
import { deps } from '@/src/container';
import { orm } from '@/src/db/orm';
import { builderSkill, builders, experienceEntries, type Builder } from '@/src/db/schema/builders';
import { privacySettings } from '@/src/db/schema/settings';
import { skills } from '@/src/db/schema/skills';
import { users, type User } from '@/src/db/schema/users';
import { Browser } from '../../support/browser';
import { createBuilder, userOf, type BuilderOptions } from '../../support/directory';
import { actingAs, seedReferenceData } from '../../support/members';

type Profile = Record<string, unknown> & {
  neighbourhood: { name: string; area: string };
  match: { score: number; reasons: unknown[] };
  actions: Record<string, boolean>;
};

let viewer: User;
let viewerBuilder: Builder;

const builder = async (name: string, hood: string, options: BuilderOptions = {}) => {
  const created = await createBuilder(name, hood, { activeMinutesAgo: 2, ...options });
  await orm(deps().db)
    .update(users)
    .set({ email: `${name.toLowerCase().replace(/ /g, '.')}@harvest.example` })
    .where(eq(users.id, created.userId));
  await orm(deps().db)
    .update(builders)
    .set({ createdAt: toStamp(new Date('2026-03-14T14:00:00Z')) })
    .where(eq(builders.id, created.id));
  return created;
};

const daniel = async () => {
  const created = await builder('Daniel Reyes', 'riverdale', {
    extra: {
      headline: 'Full-stack engineer',
      bio: 'Ten years shipping Laravel apps.',
      buildingSummary: 'Psalter, scripture memory with spaced repetition',
      openTo: ['co_founding', 'advising'],
    },
  });
  const [laravel] = await orm(deps().db).select().from(skills).where(eq(skills.name, 'Laravel'));
  await orm(deps().db)
    .insert(builderSkill)
    .values({ builderId: created.id, skillId: laravel.id, position: 1 });
  await orm(deps().db).insert(experienceEntries).values({
    builderId: created.id,
    position: 1,
    title: 'Platform lead',
    organization: 'Northwind Logistics',
    startedOn: '2018-04-01',
    endedOn: '2026-03-31',
  });
  return created;
};

const open = async (target: Builder | string, as?: User) => {
  const id = typeof target === 'string' ? target : target.publicId!;
  const browser = as ? await actingAs(as) : new Browser();
  return browser.get(GET, `/api/v1/builders/${id}`, { params: { builder: id } });
};

const privacy = async (target: Builder, settings: Partial<typeof privacySettings.$inferInsert>) =>
  orm(deps().db)
    .insert(privacySettings)
    .values({ userId: target.userId, ...settings });

describe('view a builder profile', () => {
  beforeEach(async () => {
    await seedReferenceData();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-11T16:00:00Z'));
    viewerBuilder = await builder('Amara Osei', 'leslieville');
    viewer = await userOf(viewerBuilder);
  });

  afterEach(() => vi.useRealTimers());

  it('shows a member every populated field and the actions', async () => {
    const target = await daniel();

    const response = await open(target, viewer);

    expect(response.status).toBe(200);
    const profile = (await response.json()) as Profile;
    expect(profile.id).toBe(target.publicId);
    expect(profile.name).toBe('Daniel Reyes');
    expect(profile.role).toBe('engineer');
    expect(profile.headline).toBe('Full-stack engineer');
    expect(profile.photo_url).toBeNull();
    expect(profile.is_own).toBe(false);
    expect(profile.neighbourhood).toEqual({ name: 'Riverdale', area: 'Downtown Toronto' });
    expect(profile.distance_km).toBeCloseTo(1.5, 1);
    expect(profile.distance_from).toBe('Leslieville');
    expect(Number.isInteger(profile.match.score)).toBe(true);
    expect(profile.match.reasons).toContainEqual({ code: 'nearby', km: 1.5 });
    expect(profile.skills).toEqual(['Laravel']);
    expect(profile.bio).toBe('Ten years shipping Laravel apps.');
    expect(profile.experience).toEqual([
      {
        title: 'Platform lead',
        organization: 'Northwind Logistics',
        started_on: '2018-04-01',
        ended_on: '2026-03-31',
      },
    ]);
    expect(profile.building).toEqual({
      summary: 'Psalter, scripture memory with spaced repetition',
    });
    expect(profile.open_to).toEqual(['co_founding', 'advising']);
    expect(profile.online).toBe(true);
    expect(profile.member_since).toBe('2026-03-14');
    // Blocking exists (L2-032); messaging and reporting come later (D-048).
    expect(profile.actions).toEqual({ say_hello: false, report: false, block: true, edit: false });
    expect(profile).not.toHaveProperty('email');
  });

  it('carries only the populated fields of a sparse profile', async () => {
    const esther = await builder('Esther Nguyen', 'the-annex');

    const profile = (await (await open(esther, viewer)).json()) as Profile;

    for (const empty of ['bio', 'experience', 'building', 'skills', 'links']) {
      expect(profile, empty).not.toHaveProperty(empty);
    }
    expect(profile.name).toBe('Esther Nguyen');
  });

  it('answers the same 404 for missing, unfinished and hidden profiles', async () => {
    const unfinished = await builder('Not Finished', 'riverdale', { complete: false });
    const hidden = await builder('Private Builder', 'riverdale');

    const missing = await open('01jb0000000000000000000000', viewer);
    expect(missing.status).toBe(404);
    const message = ((await missing.json()) as { message: string }).message;
    for (const response of [await open(unfinished, viewer), await open(hidden)]) {
      expect(response.status).toBe(404);
      expect(((await response.json()) as { message: string }).message).toBe(message);
    }
    expect((await open('not-an-id')).status).toBe(404);
  });

  it('leaves hidden fields out', async () => {
    const target = await daniel();
    await privacy(target, { locationPrecision: 'city', showOnlineStatus: false });

    const profile = (await (await open(target, viewer)).json()) as Profile;

    expect(profile.neighbourhood).toEqual({ name: 'Downtown Toronto', area: 'Downtown Toronto' });
    expect(profile.distance_km).toBe(0);
    expect(profile).not.toHaveProperty('online');
    expect(profile).not.toHaveProperty('last_seen_at');
    expect(JSON.stringify(profile)).not.toContain('Riverdale');
  });

  it('shows the e-mail address only when the builder allows it', async () => {
    const target = await daniel();
    await privacy(target, { emailContact: true, profileVisibility: 'everyone' });

    expect(((await (await open(target, viewer)).json()) as Profile).email).toBe(
      'daniel.reyes@harvest.example',
    );
    expect(await (await open(target)).json()).not.toHaveProperty('email');
  });

  it('gives a visitor the reduced profile of a public builder', async () => {
    const target = await daniel();
    await privacy(target, { profileVisibility: 'everyone' });

    const response = await open(target);

    expect(response.status).toBe(200);
    expect(Object.keys((await response.json()) as object)).toEqual([
      'id',
      'name',
      'role',
      'headline',
      'neighbourhood',
      'skills',
      'photo_url',
      'is_own',
    ]);
  });

  it('marks the own profile and offers edit', async () => {
    const profile = (await (await open(viewerBuilder, viewer)).json()) as Profile;

    expect(profile.is_own).toBe(true);
    expect(profile.actions).toEqual({ say_hello: false, report: false, block: false, edit: true });
    expect(profile).not.toHaveProperty('match');
    expect(profile).not.toHaveProperty('distance_km');
  });
});
