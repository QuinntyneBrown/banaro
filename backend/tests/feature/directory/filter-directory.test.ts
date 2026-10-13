// Acceptance Test
// Traces to: L2-010, L2-045
// Description:
// Given filters for role, open to, neighbourhood or city, distance and skills, when a member applies
// them, then results match every group (AND) and any value within a group (OR), and each option
// carries its count among builders matching the other groups. Without a distance the member sees
// builders within 40 km of their neighbourhood; 5, 10, 25 and 40 km and "anywhere" change that.
// Values outside the known sets are rejected, and visitors cannot filter (D-044).

import { beforeEach, describe, expect, it } from 'vitest';
import { GET } from '@/app/api/v1/builders/route';
import type { User } from '@/src/db/schema/users';
import { Browser } from '../../support/browser';
import { createBuilder, userOf } from '../../support/directory';
import { actingAs, seedReferenceData } from '../../support/members';

interface Facets {
  role: Record<string, number>;
  open_to: Record<string, number>;
  area: Record<string, number>;
  skills: { slug: string; name: string; count: number }[];
}

interface Page {
  items: { name: string }[];
  meta: { facets: Facets | null; distance_km: number | null };
}

let viewer: User;

const builder = (
  name: string,
  hood: string,
  role: string,
  openTo = ['co_founding'],
  skills: string[] = [],
) => createBuilder(name, hood, { role, openTo, skills, activeMinutesAgo: 0 });

const query = (params: Record<string, string | string[]>) => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) value.forEach((item) => search.append(`${key}[]`, item));
    else search.append(key, value);
  }
  return search.toString();
};

const browse = async (params: Record<string, string | string[]>, as = viewer) =>
  (await actingAs(as)).get(GET, `/api/v1/builders?${query(params)}`);

const names = async (response: Response) =>
  ((await response.json()) as Page).items.map((card) => card.name).sort();

const errorKeys = async (response: Response) =>
  Object.keys(((await response.json()) as { errors: object }).errors);

const cast = async () => {
  await builder('Daniel Reyes', 'riverdale', 'engineer', ['co_founding'], ['Laravel', 'Angular']);
  await builder('Grace Liu', 'markham', 'designer', ['contributing'], ['Figma']);
  await builder('Noah Fischer', 'the-annex', 'engineer', ['advising', 'contributing'], ['Swift']);
  await builder(
    'Ruth Alvarez',
    'scarborough',
    'founder',
    ['co_founding', 'advising'],
    ['Product strategy'],
  );
};

describe('filter the directory', () => {
  beforeEach(async () => {
    await seedReferenceData();
    viewer = await userOf(await builder('Amara Osei', 'leslieville', 'founder'));
  });

  it('combines options within a group with OR and groups with AND', async () => {
    await cast();

    expect(await names(await browse({ role: ['engineer', 'designer'] }))).toEqual([
      'Daniel Reyes',
      'Grace Liu',
      'Noah Fischer',
    ]);
    expect(
      await names(await browse({ role: ['engineer', 'designer'], open_to: ['contributing'] })),
    ).toEqual(['Grace Liu', 'Noah Fischer']);
    expect(await names(await browse({ area: ['Downtown Toronto'] }))).toEqual([
      'Daniel Reyes',
      'Noah Fischer',
    ]);
    expect(await names(await browse({ skills: ['laravel', 'figma'] }))).toEqual([
      'Daniel Reyes',
      'Grace Liu',
    ]);
    expect(await names(await browse({ open_to: ['advising'] }))).toEqual([
      'Noah Fischer',
      'Ruth Alvarez',
    ]);
  });

  it('counts each option among builders matching the other groups', async () => {
    await cast();

    const page = (await (
      await browse({ role: ['engineer'], open_to: ['contributing'] })
    ).json()) as Page;
    const facets = page.meta.facets!;

    // Role counts ignore the role filter but keep "open to contributing".
    expect(facets.role).toEqual({
      founder: 0,
      engineer: 1,
      designer: 1,
      product_manager: 0,
      other: 0,
    });
    // Open-to counts keep the engineer filter.
    expect(facets.open_to).toEqual({ co_founding: 1, advising: 1, contributing: 1 });
    // Area and skill counts keep both filters.
    expect(facets.area['Downtown Toronto']).toBe(1);
    expect(facets.area.Markham).toBe(0);
    const skills = Object.fromEntries(facets.skills.map((skill) => [skill.slug, skill]));
    expect(skills.swift).toEqual({ slug: 'swift', name: 'Swift', count: 1 });
    expect(skills.laravel.count).toBe(0);
    expect(facets.skills).toHaveLength(12);
  });

  it('shows members builders within 40 km without a distance', async () => {
    const oakville = await userOf(await builder('Joel Tanaka', 'oakville', 'engineer'));
    await builder('Near Ajax', 'ajax', 'engineer');
    await builder('Mid Mississauga', 'mississauga', 'engineer');
    await builder('Next door', 'oakville', 'engineer');

    const fallback = await browse({}, oakville);
    const fallbackPage = (await fallback.clone().json()) as Page;
    expect((await names(fallback)).filter((name) => name !== 'Amara Osei')).toEqual([
      'Mid Mississauga',
      'Next door',
    ]);
    expect(fallbackPage.meta.distance_km).toBe(40);

    expect(await names(await browse({ distance: '5' }, oakville))).not.toContain('Mid Mississauga');
    expect(await names(await browse({ distance: '5' }, oakville))).toContain('Next door');
    const anywhere = await browse({ distance: 'any' }, oakville);
    const anywherePage = (await anywhere.clone().json()) as Page;
    expect(await names(anywhere)).toContain('Near Ajax');
    expect(anywherePage.meta.distance_km).toBeNull();
  });

  it('rejects values outside the known sets', async () => {
    expect(await errorKeys(await browse({ role: ['astronaut'] }))).toEqual(['role.0']);
    expect(await errorKeys(await browse({ open_to: ['hiring'] }))).toEqual(['open_to.0']);
    expect(await errorKeys(await browse({ area: ['Atlantis'] }))).toEqual(['area.0']);
    expect(await errorKeys(await browse({ skills: ['no-such-skill'] }))).toEqual(['skills.0']);
    expect(await errorKeys(await browse({ distance: '7' }))).toEqual(['distance']);
  });

  it('lets visitors neither filter nor see counts', async () => {
    await cast();
    const visitor = new Browser();

    const filtered = await visitor.get(GET, '/api/v1/builders?role[]=engineer');
    expect(filtered.status).toBe(422);
    expect(await errorKeys(filtered)).toEqual(['role']);
    const response = await visitor.get(GET, '/api/v1/builders');
    expect(response.status).toBe(200);
    const page = (await response.json()) as Page;
    expect(page.meta.facets).toBeNull();
    expect(page.meta.distance_km).toBeNull();
  });
});
