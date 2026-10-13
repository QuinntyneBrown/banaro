// Acceptance Test
// Traces to: L2-015, L2-032, L2-045
// Description:
// Given projects, when anyone browses them, then they are listed 12 per page with name, owner, summary,
// stage, "looking for" and feedback count, most recently active first. Search text, stages and roles
// narrow them: results match all filters, any value within a filter. A page past the end returns the
// last page. Projects of a member blocked either way are left out. Unknown values answer 422.

import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it } from 'vitest';
import { GET } from '@/app/api/v1/projects/route';
import { deps } from '@/src/container';
import { orm } from '@/src/db/orm';
import { blocks } from '@/src/db/schema/blocks';
import { builders } from '@/src/db/schema/builders';
import { projects } from '@/src/db/schema/projects';
import type { User } from '@/src/db/schema/users';
import { Browser } from '../../support/browser';
import { actingAs, createMember } from '../../support/members';
import { sharedProjectId } from '../../support/projects';

interface Card {
  name: string;
  owner: Record<string, unknown>;
  looking_for: string[];
}

let amara: User;

async function share(
  owner: User,
  name: string,
  stage: string,
  roles: string[],
  activeOn: string,
  summary = 'A product in progress',
) {
  const id = await sharedProjectId(owner, {
    name,
    summary,
    stage,
    looking_for: roles,
    description: null,
    link: null,
  });
  await orm(deps().db)
    .update(projects)
    .set({ lastActivityAt: `${activeOn} 00:00:00` })
    .where(eq(projects.publicId, id));
}

const browse = async (query = '', as?: User) =>
  (as ? await actingAs(as) : new Browser()).get(GET, `/api/v1/projects${query}`);

const names = async (query = '', as?: User) =>
  ((await (await browse(query, as)).json()) as { items: Card[] }).items.map((card) => card.name);

const errorKeys = async (response: Response) =>
  Object.keys(((await response.json()) as { errors: object }).errors);

describe('browse projects', () => {
  beforeEach(async () => {
    amara = await createMember('Amara Osei');
  });

  it('lists projects most recently active first with their card', async () => {
    await share(amara, 'Harvest', 'pilot', ['technical_co_founder'], '2026-10-10');
    await share(amara, 'Psalter', 'beta', [], '2026-10-11');
    const [owner] = await orm(deps().db)
      .select()
      .from(builders)
      .where(eq(builders.userId, amara.id));

    const response = await browse();

    expect(response.status).toBe(200);
    const page = (await response.json()) as { items: Card[] };
    expect(page.items.map((card) => card.name)).toEqual(['Psalter', 'Harvest']);
    expect(page).toMatchObject({ total: 2, page: 1, per_page: 12, last_page: 1 });
    const card = page.items[1];
    expect(Object.keys(card)).toEqual([
      'id',
      'name',
      'summary',
      'stage',
      'looking_for',
      'feedback_count',
      'owner',
    ]);
    expect(card.owner).toEqual({ id: owner.publicId, name: 'Amara Osei' });
    expect(card.looking_for).toEqual(['technical_co_founder']);
  });

  it('shows twelve a page and the last page for a page past the end', async () => {
    const daniel = await createMember('Daniel Reyes');
    for (let i = 1; i <= 7; i++) {
      await share(amara, `Amara ${i}`, 'idea', [], `2026-10-0${i}`);
      await share(daniel, `Daniel ${i}`, 'idea', [], `2026-09-0${i}`);
    }

    expect(await names()).toHaveLength(12);
    expect(await (await browse('?page=5')).json()).toMatchObject({
      page: 2,
      last_page: 2,
      total: 14,
    });
  });

  it('narrows the list by search, stages and roles', async () => {
    await share(
      amara,
      'Harvest',
      'pilot',
      ['technical_co_founder'],
      '2026-10-01',
      'Volunteer scheduling for food banks',
    );
    await share(amara, 'Psalter', 'beta', ['designer'], '2026-10-02', 'Scripture memory');
    await share(
      amara,
      'Gather',
      'idea',
      ['designer', 'advisor'],
      '2026-10-03',
      'Small groups that meet',
    );

    expect(await names('?q=food')).toEqual(['Harvest']);
    expect(await names('?q=psal')).toEqual(['Psalter']);
    expect(await names('?stage[]=pilot&stage[]=beta')).toEqual(['Psalter', 'Harvest']);
    expect(await names('?looking_for[]=designer')).toEqual(['Gather', 'Psalter']);
    expect(await names('?stage[]=beta&stage[]=pilot&looking_for[]=designer')).toEqual(['Psalter']);
    expect(await names('?q=nothing+like+this')).toEqual([]);
  });

  it('leaves out projects of a member blocked either way', async () => {
    const daniel = await createMember('Daniel Reyes');
    await share(daniel, 'Daniel project', 'idea', [], '2026-10-01');
    await share(amara, 'Amara project', 'idea', [], '2026-10-02');
    await orm(deps().db).insert(blocks).values({ blockerId: daniel.id, blockedId: amara.id });

    expect(await names('', amara)).toEqual(['Amara project']);
    expect(await names()).toEqual(['Amara project', 'Daniel project']);
  });

  it('refuses unknown values', async () => {
    expect(await errorKeys(await browse('?stage[]=scaling'))).toEqual(['stage.0']);
    expect(await errorKeys(await browse('?looking_for[]=astronaut'))).toEqual(['looking_for.0']);
    expect(await errorKeys(await browse('?page=0'))).toEqual(['page']);
  });
});
