// Acceptance Test
// Traces to: L2-012, L2-044, L2-045
// Description:
// Given a member, when they share a project with a name (≤ 80), a one-line summary (≤ 140), an
// optional description (≤ 2,000), a stage, zero or more "looking for" roles and an optional http(s)
// link, then the project is created owned by them and returned with its id. A missing name, summary or
// stage, any value over its limit, an unknown stage or role, or a link that is not http(s) answers 422
// per field. A member who owns 10 projects gets 422 with code `project_limit`. An owner given in the
// body is ignored, and markup is stored as text.

import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it } from 'vitest';
import { POST } from '@/app/api/v1/projects/route';
import { deps } from '@/src/container';
import { orm } from '@/src/db/orm';
import { projects } from '@/src/db/schema/projects';
import type { User } from '@/src/db/schema/users';
import { Browser } from '../../support/browser';
import { createMember } from '../../support/members';
import { project, share } from '../../support/projects';

let amara: User;

const errorKeys = async (response: Response) =>
  Object.keys(((await response.json()) as { errors: object }).errors);

const stored = async (publicId: string) =>
  (await orm(deps().db).select().from(projects).where(eq(projects.publicId, publicId)))[0];

const projectCount = () => orm(deps().db).$count(projects);

describe('share a project', () => {
  beforeEach(async () => {
    amara = await createMember('Amara Osei');
  });

  it('creates a project the member then owns', async () => {
    const response = await share(amara);

    expect(response.status).toBe(201);
    const body = (await response.json()) as Record<string, unknown> & { id: string };
    expect(body).toMatchObject({
      name: 'Harvest',
      summary: 'Volunteer scheduling for GTA food banks',
      description: 'Six food banks use Harvest every week.',
      stage: 'pilot',
      looking_for: ['technical_co_founder', 'designer'],
      link: 'https://harvest.example.ca',
      feedback_count: 0,
      owner: { name: 'Amara Osei' },
      is_own: true,
    });
    expect(body.id).toMatch(/^[0-9a-z]{26}$/);
    const row = await stored(body.id);
    expect(row.ownerId).toBe(amara.id);
    expect(row.lastActivityAt).not.toBeNull();
  });

  it('accepts a project without description, link or roles', async () => {
    const response = await share(
      amara,
      project({ description: null, link: null, looking_for: [] }),
    );

    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({ description: null, link: null, looking_for: [] });
  });

  it('refuses missing and overlong values per field', async () => {
    expect(await errorKeys(await share(amara, { looking_for: [] }))).toEqual([
      'name',
      'summary',
      'stage',
    ]);
    expect(
      await errorKeys(
        await share(
          amara,
          project({
            name: 'n'.repeat(81),
            summary: 's'.repeat(141),
            description: 'd'.repeat(2001),
          }),
        ),
      ),
    ).toEqual(['name', 'summary', 'description']);
    expect(await errorKeys(await share(amara, project({ stage: 'scaling' })))).toEqual(['stage']);
    expect(await errorKeys(await share(amara, project({ looking_for: ['astronaut'] })))).toEqual([
      'looking_for.0',
    ]);
    expect(await projectCount()).toBe(0);
  });

  it('accepts only http and https links', async () => {
    for (const link of ['javascript:alert(1)', 'ftp://harvest.example.ca', 'harvest.example.ca']) {
      const response = await share(amara, project({ link }));
      expect(response.status).toBe(422);
      expect(await errorKeys(response)).toEqual(['link']);
    }
    expect((await share(amara, project({ link: 'http://harvest.example.ca' }))).status).toBe(201);
  });

  it('tells a member with ten projects about the limit', async () => {
    for (let i = 1; i <= 10; i++) {
      expect((await share(amara, project({ name: `Project ${i}` }))).status).toBe(201);
    }

    const response = await share(amara, project({ name: 'One more' }));

    expect(response.status).toBe(422);
    expect(await response.json()).toMatchObject({ code: 'project_limit' });
    expect(await projectCount()).toBe(10);
  });

  it('ignores an owner in the body and keeps markup as text', async () => {
    const other = await createMember('Daniel Reyes');

    const response = await share(amara, project({ owner_id: other.id, name: '<b>Harvest</b>' }));

    expect(response.status).toBe(201);
    const body = (await response.json()) as { id: string; name: string };
    expect((await stored(body.id)).ownerId).toBe(amara.id);
    expect(body.name).toBe('<b>Harvest</b>');
  });

  it('needs a signed-in member', async () => {
    const response = await new Browser().post(POST, '/api/v1/projects', { json: project() });

    expect(response.status).toBe(401);
  });
});
