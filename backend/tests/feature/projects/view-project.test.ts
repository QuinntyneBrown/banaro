// Acceptance Test
// Traces to: L2-013, L2-032, L2-044
// Description:
// Given a project, when anyone opens it, then the API returns its name, owner (with their profile id),
// summary, description, stage, "looking for", link and feedback count. The owner is told it is theirs.
// An id that does not exist answers 404, and so does a project whose owner and the member have blocked
// each other (D-052). Visitors may read every project (D-051).

import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it } from 'vitest';
import { GET } from '@/app/api/v1/projects/[project]/route';
import { deps } from '@/src/container';
import { orm } from '@/src/db/orm';
import { blocks } from '@/src/db/schema/blocks';
import { builders } from '@/src/db/schema/builders';
import type { User } from '@/src/db/schema/users';
import { Browser } from '../../support/browser';
import { actingAs, createMember } from '../../support/members';
import { sharedProjectId } from '../../support/projects';

let amara: User;
let projectId: string;

const view = (browser: Browser, id = projectId) =>
  browser.get(GET, `/api/v1/projects/${id}`, { params: { project: id } });

describe('view a project', () => {
  beforeEach(async () => {
    amara = await createMember('Amara Osei');
    projectId = await sharedProjectId(amara, {
      looking_for: ['technical_co_founder'],
    });
  });

  it('lets a visitor read the project', async () => {
    const [owner] = await orm(deps().db)
      .select()
      .from(builders)
      .where(eq(builders.userId, amara.id));

    const response = await view(new Browser());

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      id: projectId,
      name: 'Harvest',
      summary: 'Volunteer scheduling for GTA food banks',
      description: 'Six food banks use Harvest every week.',
      stage: 'pilot',
      looking_for: ['technical_co_founder'],
      link: 'https://harvest.example.ca',
      feedback_count: 0,
      owner: { id: owner.publicId, name: 'Amara Osei' },
      is_own: false,
    });
  });

  it('tells the owner it is theirs', async () => {
    expect(await (await view(await actingAs(amara))).json()).toMatchObject({ is_own: true });
  });

  it('answers 404 for a missing project', async () => {
    expect((await view(new Browser(), '01jb0000000000000000000000')).status).toBe(404);
    expect((await view(new Browser(), 'harvest')).status).toBe(404);
  });

  it('hides the project when a block stands either way', async () => {
    const daniel = await createMember('Daniel Reyes');
    await orm(deps().db).insert(blocks).values({ blockerId: amara.id, blockedId: daniel.id });

    expect((await view(await actingAs(daniel))).status).toBe(404);
  });
});
