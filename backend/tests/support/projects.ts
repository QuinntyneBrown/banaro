import { eq } from 'drizzle-orm';
import { POST as shareRoute } from '../../app/api/v1/projects/route';
import { nowStamp } from '../../src/clock';
import { deps } from '../../src/container';
import { orm } from '../../src/db/orm';
import { projects, type Project } from '../../src/db/schema/projects';
import type { User } from '../../src/db/schema/users';
import { ulid } from '../../src/ulid';
import { actingAs } from './members';

/** A valid project to share; tests override the fields they are about. */
export const project = (overrides: Record<string, unknown> = {}) => ({
  name: 'Harvest',
  summary: 'Volunteer scheduling for GTA food banks',
  description: 'Six food banks use Harvest every week.',
  stage: 'pilot',
  looking_for: ['technical_co_founder', 'designer'],
  link: 'https://harvest.example.ca',
  ...overrides,
});

/** Shares a project as the member through the API. */
export const share = async (member: User, body: Record<string, unknown> = project()) =>
  (await actingAs(member)).post(shareRoute, '/api/v1/projects', { json: body });

/** Shares a project and returns its public id. */
export async function sharedProjectId(
  member: User,
  overrides: Record<string, unknown> = {},
): Promise<string> {
  const response = await share(member, project(overrides));
  if (response.status !== 201) throw new Error(`share answered ${response.status}`);
  return ((await response.json()) as { id: string }).id;
}

/** A project stored straight in the table, as the PHP tests' `project()` helper made it. */
export async function createProject(owner: User, name = 'Psalter'): Promise<Project> {
  const now = nowStamp();
  const [row] = await orm(deps().db)
    .insert(projects)
    .values({
      publicId: ulid(),
      ownerId: owner.id,
      name,
      summary: 'A quiet place to read the psalms together.',
      stage: 'prototype',
      lastActivityAt: now,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return row;
}

/** The project as stored now. */
export const fresh = async (project: Project) =>
  (await orm(deps().db).select().from(projects).where(eq(projects.id, project.id)))[0];
