import { and, desc, eq, sql } from 'drizzle-orm';
import type pg from 'pg';
import { nowStamp } from '../../clock';
import type { Deps } from '../../container';
import { orm } from '../../db/orm';
import { feedback, projects, type Feedback, type Project } from '../../db/schema/projects';
import { users, type User } from '../../db/schema/users';
import { notifyMember } from '../../notifications/member-notification';
import { feedbackReceivedNotification } from '../../notifications/projects/feedback-received-notification';
import { sqlBlockScope } from '../../services/trust-and-safety/block-service';

/**
 * Stores a member's feedback on a project, counts it, moves the project's last activity and tells
 * the owner once the transaction has committed (L2-016 criterion 1).
 */
export async function giveFeedback(
  deps: Deps,
  author: User,
  project: Project,
  body: string,
): Promise<Feedback> {
  const [row, updated] = await orm(deps.db).transaction(async (tx) => {
    const now = nowStamp();
    const [created] = await tx
      .insert(feedback)
      .values({ projectId: project.id, authorId: author.id, body, createdAt: now, updatedAt: now })
      .returning();
    const [counted] = await tx
      .update(projects)
      .set({ feedbackCount: sql`${projects.feedbackCount} + 1`, lastActivityAt: now })
      .where(eq(projects.id, project.id))
      .returning();
    return [created, counted] as const;
  });
  const [owner] = await orm(deps.db).select().from(users).where(eq(users.id, project.ownerId));
  await notifyMember(deps, owner, feedbackReceivedNotification(updated, author));
  return row;
}

/**
 * A page of a project's feedback, newest first, without feedback from a member the viewer has
 * blocked or who has blocked the viewer (L2-016, L2-032).
 */
export async function listProjectFeedback(
  db: pg.Pool,
  project: Project,
  viewer: User | null,
  page: number,
  perPage: number,
) {
  const where = and(
    eq(feedback.projectId, project.id),
    viewer ? sqlBlockScope(viewer.id, sql`${feedback.authorId}`) : undefined,
  );
  const total = await orm(db).$count(feedback, where);
  const rows = await orm(db)
    .select()
    .from(feedback)
    .where(where)
    .orderBy(desc(feedback.createdAt), desc(feedback.id))
    .limit(perPage)
    .offset((page - 1) * perPage);
  return { rows, total, lastPage: Math.max(1, Math.ceil(total / perPage)) };
}
