import { POST as shareRoute } from '../../app/api/v1/projects/route';
import type { User } from '../../src/db/schema/users';
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
