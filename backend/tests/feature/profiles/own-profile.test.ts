// Acceptance Test
// Traces to: L2-007, L2-044, L2-045
// Description: A member reads and replaces their own profile (name, headline, neighbourhood, bio,
// skills, experience, links, open-to, what they are looking for and what they are building). Invalid
// values answer 422 per field and change nothing; markup is stored as text; no route reaches another
// member's profile and fields outside the form are ignored.

import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it } from 'vitest';
import { GET, PUT } from '@/app/api/v1/me/profile/route';
import { nowStamp } from '@/src/clock';
import { deps } from '@/src/container';
import { orm } from '@/src/db/orm';
import { builders } from '@/src/db/schema/builders';
import type { User } from '@/src/db/schema/users';
import { ulid } from '@/src/ulid';
import { Browser } from '../../support/browser';
import { actingAs, createUser, neighbourhoodId, seedReferenceData } from '../../support/members';

let member: User;
let browser: Browser;

interface Profile {
  name: string;
  headline: string | null;
  neighbourhood_id: number;
  photo_url: string | null;
  skills: { name: string }[];
  experience: { organization: string | null; ended_on: string | null }[];
  links: { url: string }[];
  open_to: string[];
  looking_for: string | null;
  building: string | null;
  neighbourhoods: { name: string }[];
}

const builderMember = async (name: string) => {
  const user = await createUser({ name });
  await orm(deps().db)
    .insert(builders)
    .values({
      userId: user.id,
      publicId: ulid(),
      name,
      role: 'founder',
      neighbourhoodId: await neighbourhoodId('leslieville'),
      onboardingSavedSteps: ['about', 'skills', 'goals'],
      onboardingCompletedAt: nowStamp(),
    });
  return user;
};

const profile = async (overrides: Record<string, unknown> = {}) => ({
  name: 'Amara Osei',
  headline: 'Founder and product lead',
  neighbourhood_id: await neighbourhoodId('riverdale'),
  bio: 'Building Harvest, volunteer scheduling for GTA food banks.',
  skills: [{ name: 'Product strategy' }, { name: 'Rust' }],
  experience: [
    { title: 'Founder', organization: 'Harvest', started_on: '2024-03-01', ended_on: null },
    {
      title: 'Product manager',
      organization: 'Shopify',
      started_on: '2019-01-01',
      ended_on: '2024-02-01',
    },
  ],
  links: [{ label: 'Harvest', url: 'https://harvest.example.ca' }],
  open_to: ['co_founding'],
  looking_for: 'A technical co-founder who loves boring, reliable software.',
  building: 'Harvest, volunteer scheduling for GTA food banks.',
  ...overrides,
});

const save = async (overrides: Record<string, unknown> = {}) =>
  browser.put(PUT, '/api/v1/me/profile', { json: await profile(overrides) });

const read = async () => (await (await browser.get(GET, '/api/v1/me/profile')).json()) as Profile;

const builderOf = async (user: User) =>
  (await orm(deps().db).select().from(builders).where(eq(builders.userId, user.id)))[0];

const errorsOf = async (response: Response) =>
  ((await response.json()) as { errors: Record<string, string[]> }).errors;

describe('own profile', () => {
  beforeEach(async () => {
    await seedReferenceData();
    member = await builderMember('Amara Osei');
    browser = await actingAs(member);
  });

  it('gives a member their own profile with the neighbourhood list', async () => {
    const response = await browser.get(GET, '/api/v1/me/profile');

    expect(response.status).toBe(200);
    const body = (await response.json()) as Profile;
    expect(body.name).toBe('Amara Osei');
    expect(body.neighbourhood_id).toBe(await neighbourhoodId('leslieville'));
    expect(body.photo_url).toBeNull();
    expect(body.neighbourhoods).toContainEqual(expect.objectContaining({ name: 'Riverdale' }));
  });

  it('replaces the profile on save and reads it back', async () => {
    expect((await save()).status).toBe(200);

    const body = await read();
    expect(body.headline).toBe('Founder and product lead');
    expect(body.neighbourhood_id).toBe(await neighbourhoodId('riverdale'));
    expect(body.skills.map((skill) => skill.name)).toEqual(['Product strategy', 'Rust']);
    expect(body.experience[0].organization).toBe('Harvest');
    expect(body.experience[1].ended_on).toBe('2024-02-01');
    expect(body.links[0].url).toBe('https://harvest.example.ca');
    expect(body.open_to).toEqual(['co_founding']);
    expect(body.looking_for).toBe('A technical co-founder who loves boring, reliable software.');
    expect(body.building).toBe('Harvest, volunteer scheduling for GTA food banks.');
  });

  it('replaces experience and links on a second save rather than adding', async () => {
    expect((await save()).status).toBe(200);

    const response = await save({ experience: [], links: [] });

    expect(response.status).toBe(200);
    const body = (await response.json()) as Profile;
    expect(body.experience).toHaveLength(0);
    expect(body.links).toHaveLength(0);
  });

  it('answers 422 per field for invalid values and changes nothing', async () => {
    const response = await save({
      name: '',
      bio: 'a'.repeat(501),
      neighbourhood_id: 999999,
      links: [{ label: 'Site', url: 'javascript:alert(1)' }],
      experience: [{ title: 'Founder', started_on: '2024-03-01', ended_on: '2023-01-01' }],
    });

    expect(response.status).toBe(422);
    const errors = await errorsOf(response);
    expect(Object.keys(errors).sort()).toEqual([
      'bio',
      'experience.0.ended_on',
      'links.0.url',
      'name',
      'neighbourhood_id',
    ]);
    expect(errors.bio).toEqual(['Your bio is 501 characters. Shorten it to 500 or fewer.']);
    expect((await builderOf(member)).neighbourhoodId).toBe(await neighbourhoodId('leslieville'));
  });

  it('requires at least one way of working together', async () => {
    const response = await save({ open_to: [] });

    expect(response.status).toBe(422);
    expect((await errorsOf(response)).open_to).toEqual([
      'Choose at least one way you are open to working with others.',
    ]);
  });

  it('refuses more than 12 skills', async () => {
    const response = await save({
      skills: Array.from({ length: 13 }, (_, i) => ({ name: `Skill ${i + 1}` })),
    });

    expect(response.status).toBe(422);
    expect(Object.keys(await errorsOf(response))).toContain('skills');
  });

  it('keeps markup as text', async () => {
    expect((await save({ name: '<b>Amara</b>', bio: '<script>alert(1)</script>' })).status).toBe(
      200,
    );

    const builder = await builderOf(member);
    expect(builder.name).toBe('<b>Amara</b>');
    expect(builder.bio).toBe('<script>alert(1)</script>');
  });

  it('changes only the member profile and ignores extra fields', async () => {
    const other = await builderMember('Daniel Reyes');

    const response = await save({
      user_id: other.id,
      role: 'engineer',
      onboarding_completed_at: null,
    });

    expect(response.status).toBe(200);
    expect((await builderOf(other)).name).toBe('Daniel Reyes');
    const builder = await builderOf(member);
    expect(builder.role).toBe('founder');
    expect(builder.onboardingCompletedAt).not.toBeNull();
  });

  it('sends a member without a finished profile to onboarding', async () => {
    const newcomer = await actingAs(await createUser());

    const response = await newcomer.get(GET, '/api/v1/me/profile');

    expect(response.status).toBe(409);
    expect(((await response.json()) as { code: string }).code).toBe('onboarding_incomplete');
  });
});
