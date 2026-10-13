import { and, desc, eq, isNull } from 'drizzle-orm';
import type pg from 'pg';
import { nowStamp } from '../../clock';
import { orm } from '../../db/orm';
import { notifications, type Notification } from '../../db/schema/notifications';
import type { User } from '../../db/schema/users';
import { notFound } from '../../http/pipeline';
import { UUID } from '../../http/own-builder';
import { visibleTo } from '../../notifications/member-notification';

/** The member's notifications, newest first, without those caused by a blocked member (L2-027). */
export async function listNotifications(db: pg.Pool, member: User, page: number, perPage: number) {
  const where = visibleTo(member);
  const total = await orm(db).$count(notifications, where);
  const rows = await orm(db)
    .select()
    .from(notifications)
    .where(where)
    .orderBy(desc(notifications.createdAt), desc(notifications.id))
    .limit(perPage)
    .offset((page - 1) * perPage);
  return { rows, total, lastPage: Math.max(1, Math.ceil(total / perPage)) };
}

/** How many of the member's visible notifications are unread (L2-027). */
export function countUnreadNotifications(db: pg.Pool, member: User): Promise<number> {
  return orm(db).$count(notifications, and(visibleTo(member), isNull(notifications.readAt)));
}

/** Marks every unread notification of the member read (L2-027). */
export async function markAllNotificationsRead(db: pg.Pool, member: User): Promise<void> {
  const now = nowStamp();
  await orm(db)
    .update(notifications)
    .set({ readAt: now, updatedAt: now })
    .where(and(visibleTo(member), isNull(notifications.readAt)));
}

/** Marks one of the member's own notifications read; repeating it keeps the first time (L2-027). */
export async function markNotificationRead(
  db: pg.Pool,
  member: User,
  id: string,
): Promise<Notification> {
  if (!UUID.test(id)) throw notFound();
  const where = and(visibleTo(member), eq(notifications.id, id));
  const [row] = await orm(db).select().from(notifications).where(where);
  if (!row) throw notFound();
  if (row.readAt !== null) return row;

  const now = nowStamp();
  const [read] = await orm(db)
    .update(notifications)
    .set({ readAt: now, updatedAt: now })
    .where(where)
    .returning();
  return read;
}
