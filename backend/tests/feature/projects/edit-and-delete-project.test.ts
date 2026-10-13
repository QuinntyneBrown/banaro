// Acceptance Test
// Traces to: L2-014, L2-044, L2-045
// Description:
// Given the owner, when they save valid changes, then the project updates, its activity is refreshed
// and the new values are returned; invalid values answer 422 and change nothing. Given a member who is
// not the owner, when they update or delete it, then the API answers 403 and nothing changes. Given
// the owner deletes it, then the project and its "looking for" roles are removed and it answers 404.

import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DELETE, GET, PUT } from '@/app/api/v1/projects/[project]/route';
import { deps } from '@/src/container';
import { orm } from '@/src/db/orm';
import { projectLookingFor, projects } from '@/src/db/schema/projects';
import type { User } from '@/src/db/schema/users';
import { Browser } from '../../support/browser';
import { actingAs, createMember } from '../../support/members';
import { project, sharedProjectId } from '../../support/projects';

let amara: User;
let projectId: string;

const changes = (overrides: Record<string, unknown> = {}) =>
  project({ description: null, looking_for: ['technical_co_founder'], link: null, ...overrides });

const save = (browser: Browser, body: Record<string, unknown>) =>
  browser.put(PUT, `/api/v1/projects/${projectId}`, { json: body, params: { project: projectId } });

const remove = (browser: Browser) =>
  browser.delete(DELETE, `/api/v1/projects/${projectId}`, { params: { project: projectId } });

const stored = async () =>
  (await orm(deps().db).select().from(projects).where(eq(projects.publicId, projectId)))[0];

describe('edit and delete a project', () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-01T13:00:00Z'));
    amara = await createMember('Amara Osei');
    projectId = await sharedProjectId(amara, changes());
    vi.setSystemTime(new Date('2026-10-11T16:00:00Z'));
  });
  afterEach(() => vi.useRealTimers());

  it('saves the owner changes', async () => {
    const response = await save(
      await actingAs(amara),
      changes({
        name: 'Harvest Hands',
        stage: 'launched',
        looking_for: ['designer', 'advisor'],
        link: 'https://harvest.example.ca',
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      name: 'Harvest Hands',
      stage: 'launched',
      looking_for: ['advisor', 'designer'],
      link: 'https://harvest.example.ca',
    });
    expect((await stored()).lastActivityAt).toBe('2026-10-11 12:00:00');
  });

  it('refuses invalid changes and changes nothing', async () => {
    const response = await save(await actingAs(amara), changes({ name: '', link: 'ftp://x' }));

    expect(response.status).toBe(422);
    expect(Object.keys(((await response.json()) as { errors: object }).errors)).toEqual([
      'name',
      'link',
    ]);
    expect((await stored()).name).toBe('Harvest');
  });

  it('lets another member neither edit nor delete', async () => {
    const daniel = await actingAs(await createMember('Daniel Reyes'));

    expect((await save(daniel, changes({ name: 'Taken' }))).status).toBe(403);
    expect((await remove(daniel)).status).toBe(403);
    expect((await stored()).name).toBe('Harvest');
  });

  it('deletes the project and its roles for the owner', async () => {
    const { id } = await stored();

    expect((await remove(await actingAs(amara))).status).toBe(204);

    expect(await stored()).toBeUndefined();
    expect(
      await orm(deps().db).$count(projectLookingFor, eq(projectLookingFor.projectId, id)),
    ).toBe(0);
    const view = await new Browser().get(GET, `/api/v1/projects/${projectId}`, {
      params: { project: projectId },
    });
    expect(view.status).toBe(404);
  });

  it('needs a signed-in member', async () => {
    expect((await save(new Browser(), changes())).status).toBe(401);
    expect((await remove(new Browser())).status).toBe(401);
  });
});
