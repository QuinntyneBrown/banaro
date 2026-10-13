import { nowStamp } from '../../../../src/clock';
import { deps } from '../../../../src/container';
import { orm } from '../../../../src/db/orm';
import { feedback, helpOffers, projectLookingFor } from '../../../../src/db/schema/projects';
import type { User } from '../../../../src/db/schema/users';
import { createMember } from '../../../support/members';
import { createProject } from '../../../support/projects';
import { snapshot, type RouteOwnershipFixture, type Scenario } from './ownership';

const BODY = {
  name: 'Hijacked',
  summary: 'Taking this project over.',
  stage: 'idea',
  looking_for: [],
};

async function lookingForContributor(owner: User) {
  const project = await createProject(owner);
  await orm(deps().db)
    .insert(projectLookingFor)
    .values({ projectId: project.id, role: 'contributor' });
  return project;
}

async function offerFrom(offererId: number, projectId: number, message: string) {
  await orm(deps().db).insert(helpOffers).values({
    projectId,
    offererId,
    role: 'contributor',
    message,
    status: 'pending',
    createdAt: nowStamp(),
    updatedAt: nowStamp(),
  });
}

async function ownersProject(owner: User): Promise<Scenario> {
  const project = await createProject(owner);
  return {
    params: { project: project.publicId },
    body: BODY,
    intact: await snapshot('projects', 'owner_id', owner.id),
  };
}

// Anyone but the owner may give feedback, so another member's call is allowed; what must hold is that
// the first member's own feedback is left alone (L2-016).
async function ownersFeedback(owner: User): Promise<Scenario> {
  const project = await createProject(await createMember('Project owner'));
  await orm(deps().db).insert(feedback).values({
    projectId: project.id,
    authorId: owner.id,
    body: 'Sentinel feedback text',
    createdAt: nowStamp(),
    updatedAt: nowStamp(),
  });
  return {
    params: { project: project.publicId },
    body: { body: 'Feedback from another member.' },
    sentinels: [owner.email],
    intact: await snapshot('feedback', 'author_id', owner.id),
  };
}

// A project the owner has been offered help on: another member may offer too, but cannot read the
// owner's offers (L2-017, L2-044).
async function ownersOffers(owner: User): Promise<Scenario> {
  const project = await lookingForContributor(owner);
  const helper = await createMember('Sentinel Helper');
  await offerFrom(helper.id, project.id, 'Sentinel offer message');
  return {
    params: { project: project.publicId },
    body: { role: 'contributor', message: 'An offer from another member.' },
    sentinels: ['Sentinel Helper', 'Sentinel offer message', owner.email],
    intact: await snapshot('help_offers', 'project_id', project.id),
  };
}

export const projectsFixtures: RouteOwnershipFixture[] = [
  {
    route: 'GET /api/v1/projects/[project]/help-offers',
    expect: 'not_found',
    arrange: ownersOffers,
  },
  {
    route: 'POST /api/v1/projects/[project]/help-offers',
    expect: 'self_only',
    arrange: async (owner) => {
      // Here the actor offers on the owner's project; the owner's own offers elsewhere stay put.
      const scenario = await ownersOffers(owner);
      const other = await lookingForContributor(await createMember('Other owner'));
      await offerFrom(owner.id, other.id, 'The owner’s own offer');
      return {
        params: scenario.params,
        body: scenario.body,
        sentinels: [owner.email],
        intact: await snapshot('help_offers', 'offerer_id', owner.id),
      };
    },
  },
  {
    route: 'POST /api/v1/projects/[project]/feedback',
    expect: 'self_only',
    arrange: ownersFeedback,
  },
  // Sharing creates a project for the caller; the owner's projects are untouched (L2-012).
  {
    route: 'POST /api/v1/projects',
    expect: 'self_only',
    arrange: async (owner) => {
      await createProject(owner);
      return { body: BODY, intact: await snapshot('projects', 'owner_id', owner.id) };
    },
  },
  // Only the owner changes or deletes a project: anyone else gets 403 (L2-014 criterion 2).
  { route: 'PUT /api/v1/projects/[project]', expect: 'forbidden', arrange: ownersProject },
  { route: 'DELETE /api/v1/projects/[project]', expect: 'forbidden', arrange: ownersProject },
];
