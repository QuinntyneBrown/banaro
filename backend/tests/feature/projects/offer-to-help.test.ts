// Acceptance Test
// Traces to: L2-017, L2-029, L2-044
// Description:
// Given a project that is looking for roles, when a member who is not its owner offers help in one of
// those roles with a message of 10 to 1,000 characters, then the offer is recorded as pending and the
// owner is notified. A role the project is not looking for, or a bad message, is refused with 422 and
// nothing is recorded. A second open offer from the same member answers 409 offer_pending. The owner
// and a blocked pair are refused with 403. Only the owner lists a project's offers, open ones first;
// everyone else gets 404.

import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET, POST } from '@/app/api/v1/projects/[project]/help-offers/route';
import { deps, setDeps } from '@/src/container';
import { orm } from '@/src/db/orm';
import { blocks } from '@/src/db/schema/blocks';
import { notifications } from '@/src/db/schema/notifications';
import { helpOffers, projectLookingFor, type Project } from '@/src/db/schema/projects';
import type { User } from '@/src/db/schema/users';
import { Browser } from '../../support/browser';
import { FakeQueue } from '../../support/fakes';
import { actingAs, createMember, createUser } from '../../support/members';
import { createProject } from '../../support/projects';

const MESSAGE = 'I can review the TypeScript code on weekends and help with tests.';

interface OfferPage {
  items: { offerer: { name: string }; status: string }[];
  total: number;
}

async function lookingProject(owner: User, roles = ['contributor', 'advisor']): Promise<Project> {
  const project = await createProject(owner, 'Psalter');
  await orm(deps().db)
    .insert(projectLookingFor)
    .values(roles.map((role) => ({ projectId: project.id, role })));
  return project;
}

const post = async (projectId: string, as: User, json: Record<string, unknown>) =>
  (await actingAs(as)).post(POST, `/api/v1/projects/${projectId}/help-offers`, {
    json,
    params: { project: projectId },
  });

const offer = (project: Project, as: User, role = 'contributor', message = MESSAGE) =>
  post(project.publicId, as, { role, message });

const list = (browser: Browser, project: Project) =>
  browser.get(GET, `/api/v1/projects/${project.publicId}/help-offers`, {
    params: { project: project.publicId },
  });

const offerCount = (project: Project) =>
  orm(deps().db).$count(helpOffers, eq(helpOffers.projectId, project.id));

const errorKeys = async (response: Response) =>
  Object.keys(((await response.json()) as { errors: object }).errors);

describe('offer to help', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    setDeps({ queue: new FakeQueue() });
  });
  afterEach(() => vi.useRealTimers());

  it('records an offer for a looking-for role and notifies the owner', async () => {
    const owner = await createMember('Daniel Reyes');
    const project = await lookingProject(owner);
    const helper = await createMember('Amara Osei');

    const response = await offer(project, helper);

    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({
      role: 'contributor',
      message: MESSAGE,
      status: 'pending',
      offerer: { name: 'Amara Osei' },
      conversation_id: null,
    });
    const rows = await orm(deps().db)
      .select()
      .from(notifications)
      .where(eq(notifications.notifiableId, owner.id));
    expect(rows).toHaveLength(1);
    expect(rows[0].data.kind).toBe('help_offered');
    expect(rows[0].data.subject).toEqual({ type: 'project', id: project.publicId });
    expect(await offerCount(project)).toBe(1);
  });

  it('refuses a role the project is not looking for, or a bad message, with 422', async () => {
    const project = await lookingProject(await createMember('Owner'), ['contributor']);
    const helper = await createMember('Helper');

    expect(await errorKeys(await offer(project, helper, 'designer'))).toEqual(['role']);
    expect(await errorKeys(await offer(project, helper, 'nonsense'))).toEqual(['role']);
    expect(await errorKeys(await offer(project, helper, 'contributor', 'Too short'))).toEqual([
      'message',
    ]);
    expect(await errorKeys(await offer(project, helper, 'contributor', 'a'.repeat(1001)))).toEqual([
      'message',
    ]);
    expect(await errorKeys(await post(project.publicId, helper, {}))).toEqual(['role', 'message']);
    expect(await offerCount(project)).toBe(0);
  });

  it('answers 409 offer_pending to a second open offer', async () => {
    const project = await lookingProject(await createMember('Owner'));
    const helper = await createMember('Helper');
    expect((await offer(project, helper)).status).toBe(201);

    const second = await offer(project, helper, 'advisor');

    expect(second.status).toBe(409);
    expect(await second.json()).toMatchObject({ code: 'offer_pending' });
    expect(await offerCount(project)).toBe(1);
    expect((await offer(project, await createMember('Another helper'))).status).toBe(201);
  });

  it('does not let the owner or a blocked pair offer', async () => {
    const owner = await createMember('Owner');
    const project = await lookingProject(owner);
    const blocked = await createMember('Blocked');
    const blocker = await createMember('Blocker');
    await orm(deps().db)
      .insert(blocks)
      .values([
        { blockerId: owner.id, blockedId: blocked.id },
        { blockerId: blocker.id, blockedId: owner.id },
      ]);

    const own = await offer(project, owner);
    expect(own.status).toBe(403);
    expect(await own.json()).toMatchObject({ code: 'offer_not_allowed' });
    expect((await offer(project, blocked)).status).toBe(403);
    expect((await offer(project, blocker)).status).toBe(403);
    expect(await offerCount(project)).toBe(0);
  });

  it('lists offers to the owner only, open ones first, and answers 404 to others', async () => {
    const owner = await createMember('Daniel Reyes');
    const project = await lookingProject(owner);
    vi.setSystemTime(new Date('2026-10-12T13:00:00Z'));
    expect((await offer(project, await createMember('First Helper'))).status).toBe(201);
    vi.setSystemTime(new Date('2026-10-12T14:00:00Z'));
    const second = await createMember('Second Helper');
    expect((await offer(project, second, 'advisor')).status).toBe(201);
    await orm(deps().db)
      .update(helpOffers)
      .set({ status: 'declined' })
      .where(eq(helpOffers.offererId, second.id));

    const response = await list(await actingAs(owner), project);

    expect(response.status).toBe(200);
    const page = (await response.json()) as OfferPage;
    expect(page.total).toBe(2);
    expect(page.items.map((item) => item.offerer.name)).toEqual(['First Helper', 'Second Helper']);
    expect(page.items.map((item) => item.status)).toEqual(['pending', 'declined']);
    expect((await list(await actingAs(await createMember('Stranger')), project)).status).toBe(404);
    expect((await list(new Browser(), project)).status).toBe(401);
  });

  it('needs a signed-in verified member and an existing project', async () => {
    const project = await lookingProject(await createMember('Owner'));
    const body = { role: 'contributor', message: MESSAGE };

    const visitor = await new Browser().post(
      POST,
      `/api/v1/projects/${project.publicId}/help-offers`,
      { json: body, params: { project: project.publicId } },
    );
    expect(visitor.status).toBe(401);
    expect((await offer(project, await createUser({ emailVerifiedAt: null }))).status).toBe(403);
    expect((await post('a'.repeat(26), await createMember('Helper'), body)).status).toBe(404);
  });
});
