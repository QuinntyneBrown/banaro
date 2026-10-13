// Acceptance Test
// Traces to: L2-027, L2-029, L2-044
// Description:
// Given a member with notifications, when they list them, then they come newest first with kind,
// subject, parameters and an unread marker, 12 to a page and never more than 50. Given unread ones,
// then the unread count is exact. Marking one read leaves the rest unread and is harmless when
// repeated, and marking all read clears the count. Another member's notification is never reachable
// (404). A notification keeps its in-app row when the member has turned its e-mail category off, but
// sends no e-mail. A notification caused by a member who is blocked either way is not delivered and
// not listed.

import { and, desc, eq, isNull } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET as listRoute } from '@/app/api/v1/notifications/route';
import { GET as countRoute } from '@/app/api/v1/notifications/unread-count/route';
import { POST as readAllRoute } from '@/app/api/v1/notifications/read-all/route';
import { POST as readRoute } from '@/app/api/v1/notifications/[notification]/read/route';
import { PUT as preference } from '@/app/api/v1/settings/email-preferences/[category]/route';
import { deps, setDeps } from '@/src/container';
import { orm } from '@/src/db/orm';
import { blocks } from '@/src/db/schema/blocks';
import { notifications } from '@/src/db/schema/notifications';
import type { User } from '@/src/db/schema/users';
import { notifyMember } from '@/src/notifications/member-notification';
import {
  EMAIL_CATEGORIES,
  type EmailCategory,
} from '@/src/services/settings/email-preference-service';
import { Browser } from '../../support/browser';
import { InMemoryMailer, SyncQueue } from '../../support/fakes';
import { actingAs, createUser } from '../../support/members';
import { probeNotification } from '../../support/probe-notification';

interface Item {
  id: string;
  kind: string;
  subject: { type: string; id: string };
  params: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

interface Page {
  items: Item[];
  total: number;
  page: number;
  per_page: number;
  last_page: number;
}

const notify = (
  member: User,
  subjectId = 'p1',
  category: EmailCategory | null = 'project_activity',
  actor?: User,
) => notifyMember(deps(), member, probeNotification(subjectId, category, actor?.id ?? null));

const sentMail = () => (deps().mailer as InMemoryMailer).sent.length;

const rowsOf = (member: User) =>
  orm(deps().db)
    .select()
    .from(notifications)
    .where(eq(notifications.notifiableId, member.id))
    .orderBy(desc(notifications.createdAt));

const unreadOf = async (member: User) =>
  orm(deps().db).$count(
    notifications,
    and(eq(notifications.notifiableId, member.id), isNull(notifications.readAt)),
  );

const markRead = async (member: User, id: string) =>
  (await actingAs(member)).post(readRoute, `/api/v1/notifications/${id}/read`, {
    params: { notification: id },
  });

const list = async (member: User, path = '/api/v1/notifications') =>
  (await (await actingAs(member)).get(listRoute, path)).json() as Promise<Page>;

const unreadCount = async (member: User) =>
  (await (await actingAs(member)).get(countRoute, '/api/v1/notifications/unread-count')).json();

describe('in-app notifications', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    setDeps({ queue: new SyncQueue(), mailer: new InMemoryMailer() });
  });
  afterEach(() => vi.useRealTimers());

  it('lists notifications newest first with unread markers', async () => {
    const member = await createUser();
    for (const [i, subject] of ['first', 'second', 'third'].entries()) {
      vi.setSystemTime(new Date(Date.UTC(2026, 9, 12, 13, i)));
      await notify(member, subject);
    }
    const [latest] = await rowsOf(member);
    expect((await markRead(member, latest.id)).status).toBe(200);

    const page = await list(member);

    expect(page).toMatchObject({ total: 3, page: 1, per_page: 12 });
    expect(page.items.map((item) => item.subject.id)).toEqual(['third', 'second', 'first']);
    expect(page.items[0].read_at).not.toBeNull();
    expect(page.items[1].read_at).toBeNull();
    expect(page.items[0]).toMatchObject({
      kind: 'feedback_received',
      subject: { type: 'project' },
      params: { title: 'Psalter' },
    });
    expect(page.items[0]).toHaveProperty('created_at');
  });

  it('counts only unread rows', async () => {
    const member = await createUser();
    for (const subject of ['a', 'b', 'c']) await notify(member, subject);
    await notify(await createUser(), 'someone else');

    expect(await unreadCount(member)).toEqual({ count: 3 });
    const [row] = await rowsOf(member);
    expect((await markRead(member, row.id)).status).toBe(200);
    expect(await unreadCount(member)).toEqual({ count: 2 });
  });

  it('marks only one row read and keeps the first time when repeated', async () => {
    const member = await createUser();
    await notify(member, 'a');
    await notify(member, 'b');
    const [target] = await rowsOf(member);

    vi.setSystemTime(new Date('2026-10-12T14:00:00Z'));
    const first = ((await (await markRead(member, target.id)).json()) as Item).read_at;
    vi.setSystemTime(new Date('2026-10-12T15:00:00Z'));
    const second = ((await (await markRead(member, target.id)).json()) as Item).read_at;

    expect(first).not.toBeNull();
    expect(second).toBe(first);
    expect(await unreadOf(member)).toBe(1);
  });

  it('clears the count when all are marked read', async () => {
    const member = await createUser();
    const other = await createUser();
    await notify(member, 'a');
    await notify(member, 'b');
    await notify(other, 'c');

    const response = await (
      await actingAs(member)
    ).post(readAllRoute, '/api/v1/notifications/read-all');

    expect(response.status).toBe(204);
    expect(await unreadCount(member)).toEqual({ count: 0 });
    expect(await unreadOf(other)).toBe(1);
  });

  it('answers 404 for another member notification and leaves it unread', async () => {
    const owner = await createUser();
    const intruder = await createUser();
    await notify(owner, 'secret');
    const [row] = await rowsOf(owner);

    expect((await markRead(intruder, row.id)).status).toBe(404);
    expect(await unreadOf(owner)).toBe(1);
    expect((await list(intruder)).total).toBe(0);
  });

  it('keeps the in-app row but sends no mail when the e-mail category is off', async () => {
    const member = await createUser();
    await notify(member, 'on');
    expect(sentMail()).toBe(1);

    const off = await (
      await actingAs(member)
    ).put(preference, '/api/v1/settings/email-preferences/project_activity', {
      json: { enabled: false },
      params: { category: 'project_activity' },
    });
    expect(off.status).toBe(200);
    await notify(member, 'off');

    expect(sentMail()).toBe(1);
    expect(await rowsOf(member)).toHaveLength(2);
  });

  it('always sends the mail of a notification without a category', async () => {
    const member = await createUser();
    const browser = await actingAs(member);
    for (const category of EMAIL_CATEGORIES) {
      await browser.put(preference, `/api/v1/settings/email-preferences/${category}`, {
        json: { enabled: false },
        params: { category },
      });
    }

    await notify(member, 'security', null);

    expect(sentMail()).toBe(1);
  });

  it('neither delivers nor lists a notification from a blocked member', async () => {
    const member = await createUser();
    const actor = await createUser();
    const stranger = await createUser();
    await notify(member, 'before block', 'project_activity', actor);
    await notify(member, 'unrelated', 'project_activity', stranger);
    await orm(deps().db).insert(blocks).values({ blockerId: member.id, blockedId: actor.id });

    await notify(member, 'after block', 'project_activity', actor);

    expect((await list(member)).items.map((item) => item.subject.id)).toEqual(['unrelated']);
    expect(await rowsOf(member)).toHaveLength(2);
    expect(await unreadCount(member)).toEqual({ count: 1 });
  });

  it('pages 12 by default and caps the page size at 50', async () => {
    const member = await createUser();
    for (let i = 0; i < 55; i++) await notify(member, `n${i}`);

    const fallback = await list(member);
    expect(fallback.items).toHaveLength(12);
    expect(fallback).toMatchObject({ total: 55, last_page: 5 });
    const capped = await list(member, '/api/v1/notifications?per_page=500');
    expect(capped.items).toHaveLength(50);
    expect(capped.per_page).toBe(50);
    expect((await list(member, '/api/v1/notifications?page=2')).page).toBe(2);
  });

  it('needs a signed-in, verified member', async () => {
    const visitor = new Browser();

    expect((await visitor.get(listRoute, '/api/v1/notifications')).status).toBe(401);
    expect((await visitor.get(countRoute, '/api/v1/notifications/unread-count')).status).toBe(401);
    expect((await visitor.post(readAllRoute, '/api/v1/notifications/read-all')).status).toBe(401);
    const unverified = await actingAs(await createUser({ emailVerifiedAt: null }));
    expect((await unverified.get(listRoute, '/api/v1/notifications')).status).toBe(403);
  });
});
