// Acceptance Test
// Traces to: L2-016, L2-029, L2-044, L2-046
// Description:
// Given a project, when a member who is not its owner posts feedback of 10 to 1,000 characters, then
// it appears at the top of the project's feedback list with its author and time, the project's
// feedback count rises and the owner is notified. Feedback outside the limits is refused with 422 and
// nothing is posted. The owner cannot give feedback on their own project, and neither can a member in a
// blocked pair with the owner (403). A member who posts more than 10 pieces in an hour gets 429. The
// list is public, five at a time, and leaves out feedback from a member the viewer has blocked.

import { desc, eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET, POST } from '@/app/api/v1/projects/[project]/feedback/route';
import { deps, setDeps } from '@/src/container';
import { orm } from '@/src/db/orm';
import { blocks } from '@/src/db/schema/blocks';
import { notifications } from '@/src/db/schema/notifications';
import type { User } from '@/src/db/schema/users';
import { Browser } from '../../support/browser';
import { FakeQueue } from '../../support/fakes';
import { actingAs, createMember, createUser } from '../../support/members';
import { createProject, fresh } from '../../support/projects';

const GOOD = 'The review queue is lovely. Could the streak count be optional?';

interface FeedbackPage {
  items: { author: { name: string }; created_at: string }[];
  total: number;
  per_page: number;
  last_page: number;
}

const give = async (project: string, as: User, body: string = GOOD) =>
  (await actingAs(as)).post(POST, `/api/v1/projects/${project}/feedback`, {
    json: { body },
    params: { project },
  });

const list = (browser: Browser, project: string, query = '') =>
  browser.get(GET, `/api/v1/projects/${project}/feedback${query}`, { params: { project } });

const block = (blocker: User, blocked: User) =>
  orm(deps().db).insert(blocks).values({ blockerId: blocker.id, blockedId: blocked.id });

/** Toronto wall-clock time on 12 October 2026, which is UTC-4. */
const at = (hour: number, minute = 0) =>
  vi.setSystemTime(new Date(Date.UTC(2026, 9, 12, hour + 4, minute)));

describe('give feedback', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    setDeps({ queue: new FakeQueue() });
  });
  afterEach(() => vi.useRealTimers());

  it('puts feedback at the top, raises the count and notifies the owner', async () => {
    const owner = await createMember('Daniel Reyes');
    const project = await createProject(owner, 'Psalter');
    const first = await createMember('Hannah Kowalski');
    const second = await createMember('Noah Fischer');

    at(9);
    const posted = await give(
      project.publicId,
      first,
      'What happens when someone misses a week of reviews?',
    );
    expect(posted.status).toBe(201);
    expect(await posted.json()).toMatchObject({
      body: 'What happens when someone misses a week of reviews?',
      author: { name: 'Hannah Kowalski' },
    });
    at(10);
    expect((await give(project.publicId, second)).status).toBe(201);

    const response = await list(new Browser(), project.publicId);
    expect(response.status).toBe(200);
    const page = (await response.json()) as FeedbackPage;
    expect(page).toMatchObject({ total: 2, per_page: 5 });
    expect(page.items.map((item) => item.author.name)).toEqual(['Noah Fischer', 'Hannah Kowalski']);
    expect(page.items[0]).toHaveProperty('created_at');
    const stored = await fresh(project);
    expect(stored.feedbackCount).toBe(2);
    expect(stored.lastActivityAt).toBe('2026-10-12 10:00:00');
    const rows = await orm(deps().db)
      .select()
      .from(notifications)
      .where(eq(notifications.notifiableId, owner.id))
      .orderBy(desc(notifications.createdAt));
    expect(rows).toHaveLength(2);
    expect(rows[0].data.kind).toBe('feedback_received');
    expect(rows[0].data.subject).toEqual({ type: 'project', id: project.publicId });
  });

  it('refuses feedback outside 10 to 1,000 characters and posts nothing', async () => {
    const project = await createProject(await createMember('Owner'));
    const author = await createMember('Author');

    for (const body of ['', 'Too short', 'a'.repeat(1001)]) {
      const response = await give(project.publicId, author, body);
      expect(response.status).toBe(422);
      expect(Object.keys(((await response.json()) as { errors: object }).errors)).toEqual(['body']);
    }
    expect((await give(project.publicId, author, 'a'.repeat(1000))).status).toBe(201);
    expect((await fresh(project)).feedbackCount).toBe(1);
  });

  it('does not let the owner give feedback on their own project', async () => {
    const owner = await createMember('Owner');
    const project = await createProject(owner);

    const response = await give(project.publicId, owner);

    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({ code: 'feedback_not_allowed' });
    expect((await fresh(project)).feedbackCount).toBe(0);
  });

  it('does not let a blocked pair give feedback either way', async () => {
    const owner = await createMember('Owner');
    const project = await createProject(owner);
    const blocked = await createMember('Blocked');
    const blocker = await createMember('Blocker');
    await block(owner, blocked);
    await block(blocker, owner);

    expect((await give(project.publicId, blocked)).status).toBe(403);
    expect((await give(project.publicId, blocker)).status).toBe(403);
    expect((await fresh(project)).feedbackCount).toBe(0);
  });

  it('answers 429 to the eleventh piece in an hour', async () => {
    const owner = await createMember('Owner');
    const author = await createMember('Author');
    const projects = [];
    for (let i = 1; i <= 11; i++) projects.push(await createProject(owner, `Project ${i}`));

    for (const project of projects.slice(0, 10)) {
      expect((await give(project.publicId, author)).status).toBe(201);
    }
    const response = await give(projects[10].publicId, author);

    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).not.toBeNull();
  });

  it('lets only a signed-in verified member post, and answers 404 for a missing project', async () => {
    const project = await createProject(await createMember('Owner'));

    const visitor = await new Browser().post(
      POST,
      `/api/v1/projects/${project.publicId}/feedback`,
      {
        json: { body: GOOD },
        params: { project: project.publicId },
      },
    );
    expect(visitor.status).toBe(401);
    expect((await give(project.publicId, await createUser({ emailVerifiedAt: null }))).status).toBe(
      403,
    );
    expect((await give('a'.repeat(26), await createMember('Author'))).status).toBe(404);
  });

  it('lists feedback publicly five at a time without blocked authors', async () => {
    const owner = await createMember('Owner');
    const project = await createProject(owner);
    const viewer = await createMember('Viewer');
    const unwanted = await createMember('Unwanted Voice');
    at(8);
    expect(
      (await give(project.publicId, unwanted, 'A comment the viewer would rather not see.')).status,
    ).toBe(201);
    for (let i = 1; i <= 6; i++) {
      at(9, i);
      const author = await createMember(`Author ${i}`);
      expect(
        (await give(project.publicId, author, `Comment number ${i} on the project.`)).status,
      ).toBe(201);
    }
    await block(viewer, unwanted);

    const visitor = (await (await list(new Browser(), project.publicId)).json()) as FeedbackPage;
    expect(visitor.items).toHaveLength(5);
    expect(visitor).toMatchObject({ total: 7, last_page: 2 });
    const member = (await (
      await list(await actingAs(viewer), project.publicId, '?page=2')
    ).json()) as FeedbackPage;
    expect(member.total).toBe(6);
    expect(member.items.map((item) => item.author.name)).not.toContain('Unwanted Voice');
  });

  it('has no feedback list for a project the viewer cannot see', async () => {
    const owner = await createMember('Owner');
    const project = await createProject(owner);
    const viewer = await createMember('Viewer');
    await block(owner, viewer);

    expect((await list(await actingAs(viewer), project.publicId)).status).toBe(404);
    expect((await list(new Browser(), 'a'.repeat(26))).status).toBe(404);
  });
});
