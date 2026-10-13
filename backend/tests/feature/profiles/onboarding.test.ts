// Acceptance Test
// Traces to: L2-006, L2-002, L2-044
// Description: A verified member works through three onboarding steps (about, skills, goals). Each
// step saves on its own and survives leaving; role and neighbourhood are required; up to 12 skills
// are kept in order; the open-to choices are stored; finishing marks the profile complete. Only a
// verified member's own profile is touched, and an unverified member is refused.

import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it } from 'vitest';
import { GET as progressRoute } from '@/app/api/v1/me/onboarding/route';
import { PUT as aboutRoute } from '@/app/api/v1/me/onboarding/about/route';
import { PUT as skillsRoute } from '@/app/api/v1/me/onboarding/skills/route';
import { PUT as goalsRoute } from '@/app/api/v1/me/onboarding/goals/route';
import { POST as completeRoute } from '@/app/api/v1/me/onboarding/complete/route';
import { GET as sessionRoute } from '@/app/api/v1/session/route';
import { deps } from '@/src/container';
import { orm } from '@/src/db/orm';
import { builders } from '@/src/db/schema/builders';
import { skills as skillTable } from '@/src/db/schema/skills';
import { users, type User } from '@/src/db/schema/users';
import { Browser } from '../../support/browser';
import { actingAs, createUser, neighbourhoodId, seedReferenceData } from '../../support/members';

let member: User;
let browser: Browser;

interface Progress {
  next_step: string;
  completed: boolean;
  about: { name: string; role: string | null; neighbourhood_id: number | null };
  skills: { id: number; name: string }[];
  goals: { open_to: string[]; building: string | null };
  roles: string[];
  neighbourhoods: { id: number; name: string; area: string }[];
  skill_catalogue: { id: number; name: string }[];
}

const about = async (overrides: Record<string, unknown> = {}) =>
  browser.put(aboutRoute, '/api/v1/me/onboarding/about', {
    json: {
      name: 'Amara Osei',
      neighbourhood_id: await neighbourhoodId('leslieville'),
      role: 'founder',
      ...overrides,
    },
  });

const saveSkills = (skills: unknown[]) =>
  browser.put(skillsRoute, '/api/v1/me/onboarding/skills', { json: { skills } });

const goals = (body: Record<string, unknown>) =>
  browser.put(goalsRoute, '/api/v1/me/onboarding/goals', { json: body });

const progress = async () =>
  (await (await browser.get(progressRoute, '/api/v1/me/onboarding')).json()) as Progress;

const complete = () => browser.post(completeRoute, '/api/v1/me/onboarding/complete');

const builderOf = async (user: User) =>
  (await orm(deps().db).select().from(builders).where(eq(builders.userId, user.id)))[0];

const skillId = async (slug: string) =>
  (await orm(deps().db).select().from(skillTable).where(eq(skillTable.slug, slug)))[0].id;

const errorsOf = async (response: Response) =>
  ((await response.json()) as { errors: Record<string, string[]> }).errors;

describe('onboarding', () => {
  beforeEach(async () => {
    await seedReferenceData();
    member = await createUser({ name: 'Amara Osei' });
    browser = await actingAs(member);
  });

  it('starts a new member on the about step with the lists to choose from', async () => {
    const body = await progress();

    expect(body.next_step).toBe('about');
    expect(body.completed).toBe(false);
    expect(body.about.name).toBe('Amara Osei');
    expect(body.roles).toEqual(['founder', 'engineer', 'designer', 'product_manager', 'other']);
    expect(body.skill_catalogue).toHaveLength(12);
    expect(body.skill_catalogue[0].name).toBe('React');
    expect(body.neighbourhoods).toContainEqual(
      expect.objectContaining({ name: 'Leslieville', area: 'Downtown Toronto' }),
    );
  });

  it('refuses a visitor and tells an unverified member to verify', async () => {
    expect((await new Browser().get(progressRoute, '/api/v1/me/onboarding')).status).toBe(401);

    const unverified = await actingAs(await createUser({ emailVerifiedAt: null }));
    const response = await unverified.get(progressRoute, '/api/v1/me/onboarding');

    expect(response.status).toBe(403);
    expect(((await response.json()) as { code: string }).code).toBe('email_unverified');
  });

  it('requires role and neighbourhood and saves nothing without them', async () => {
    const response = await about({ role: null, neighbourhood_id: null });

    expect(response.status).toBe(422);
    expect(Object.keys(await errorsOf(response)).sort()).toEqual(['neighbourhood_id', 'role']);
    expect((await progress()).next_step).toBe('about');
  });

  it('refuses an unknown neighbourhood or role', async () => {
    const response = await about({ neighbourhood_id: 999999, role: 'astronaut' });

    expect(response.status).toBe(422);
    expect(Object.keys(await errorsOf(response)).sort()).toEqual(['neighbourhood_id', 'role']);
  });

  it('saves the about step and moves on to skills', async () => {
    const response = await about({ name: 'Amara K. Osei' });

    expect(response.status).toBe(200);
    expect(((await response.json()) as Progress).next_step).toBe('skills');
    const builder = await builderOf(member);
    expect(builder.name).toBe('Amara K. Osei');
    expect(builder.role).toBe('founder');
    expect(builder.neighbourhoodId).toBe(await neighbourhoodId('leslieville'));
    const [account] = await orm(deps().db).select().from(users).where(eq(users.id, member.id));
    expect(account.name).toBe('Amara K. Osei');
  });

  it('ignores fields outside the step', async () => {
    const other = await createUser();

    expect(
      (await about({ user_id: other.id, onboarding_completed_at: '2026-10-01T00:00:00Z' })).status,
    ).toBe(200);

    const builder = await builderOf(member);
    expect(builder.userId).toBe(member.id);
    expect(builder.onboardingCompletedAt).toBeNull();
    expect(await builderOf(other)).toBeUndefined();
  });

  it('keeps up to 12 skills in order, mixing catalogue and custom', async () => {
    await about();

    const response = await saveSkills([
      { name: 'Rust' },
      { id: await skillId('figma') },
      { id: await skillId('react') },
      { name: 'rust' },
    ]);

    expect(response.status).toBe(200);
    const body = (await response.json()) as Progress;
    expect(body.next_step).toBe('goals');
    expect(body.skills.map((skill) => skill.name)).toEqual(['Rust', 'Figma', 'React']);
  });

  it('refuses a 13th skill with an explanation', async () => {
    await about();

    const response = await saveSkills(
      Array.from({ length: 13 }, (_, i) => ({ name: `Skill ${i + 1}` })),
    );

    expect(response.status).toBe(422);
    expect((await errorsOf(response)).skills).toEqual([
      'Choose up to 12 skills. Remove one to add another.',
    ]);
  });

  it('saves the open-to choices on the goals step', async () => {
    await about();
    await saveSkills([]);

    const response = await goals({
      open_to: ['co_founding', 'advising'],
      building: 'Harvest, volunteer scheduling for GTA food banks.',
    });

    expect(response.status).toBe(200);
    const body = (await response.json()) as Progress;
    expect(body.next_step).toBe('finish');
    expect(body.goals.open_to).toEqual(['co_founding', 'advising']);
    expect(body.goals.building).toBe('Harvest, volunteer scheduling for GTA food banks.');

    const refused = await goals({ open_to: ['lurking'] });
    expect(refused.status).toBe(422);
    expect(Object.keys(await errorsOf(refused))).toEqual(['open_to.0']);
  });

  it('keeps saved steps when the member leaves and comes back', async () => {
    await about();

    const body = await progress();

    expect(body.next_step).toBe('skills');
    expect(body.about.role).toBe('founder');
    expect(body.about.neighbourhood_id).toBe(await neighbourhoodId('leslieville'));
  });

  it('names the missing step when finishing before every step is saved', async () => {
    await about();

    const response = await complete();

    expect(response.status).toBe(422);
    expect(await response.json()).toMatchObject({
      code: 'onboarding_incomplete',
      next_step: 'skills',
    });
  });

  it('marks the profile complete once', async () => {
    await about();
    await saveSkills([]);
    await goals({ open_to: ['contributing'] });

    const response = await complete();
    expect(response.status).toBe(200);
    expect(((await response.json()) as Progress).completed).toBe(true);
    const completedAt = (await builderOf(member)).onboardingCompletedAt;
    expect(completedAt).not.toBeNull();

    expect((await complete()).status).toBe(200);
    expect((await builderOf(member)).onboardingCompletedAt).toBe(completedAt);
  });

  it('reports onboarding and the public profile id in the session', async () => {
    const before = (await (await browser.get(sessionRoute, '/api/v1/session')).json()) as {
      member: { onboarding_complete: boolean; builder_id: string | null };
    };
    expect(before.member.onboarding_complete).toBe(false);
    expect(before.member.builder_id).toBeNull();

    await about();
    await saveSkills([]);
    await goals({ open_to: [] });
    await complete();

    const after = (await (await browser.get(sessionRoute, '/api/v1/session')).json()) as {
      member: { onboarding_complete: boolean; builder_id: string };
    };
    expect(after.member.onboarding_complete).toBe(true);
    expect(after.member.builder_id).toBe((await builderOf(member)).publicId);
    expect(after.member.builder_id).toMatch(/^[0-9a-hjkmnp-tv-z]{26}$/);
  });
});
