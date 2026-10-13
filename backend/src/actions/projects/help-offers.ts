import { and, desc, eq, sql } from 'drizzle-orm';
import type pg from 'pg';
import { nowStamp } from '../../clock';
import type { Deps } from '../../container';
import { orm } from '../../db/orm';
import { helpOffers, projects, type HelpOffer, type Project } from '../../db/schema/projects';
import { users, type User } from '../../db/schema/users';
import { HttpError } from '../../http/pipeline';
import { notifyMember } from '../../notifications/member-notification';
import { helpOfferedNotification } from '../../notifications/projects/help-offered-notification';
import { t } from '../../services/user-experience/catalogue-service';

/**
 * Records a member's offer to help and tells the owner (L2-017 criterion 1). The project row is
 * locked first, so two offers from one member at once cannot both be recorded (criterion 3).
 */
export async function offerToHelp(
  deps: Deps,
  offerer: User,
  project: Project,
  role: string,
  message: string,
): Promise<HelpOffer> {
  const offer = await orm(deps.db).transaction(async (tx) => {
    await tx
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.id, project.id))
      .for('update');
    const open = await tx.$count(
      helpOffers,
      and(
        eq(helpOffers.projectId, project.id),
        eq(helpOffers.offererId, offerer.id),
        eq(helpOffers.status, 'pending'),
      ),
    );
    if (open > 0) {
      throw new HttpError(409, { code: 'offer_pending', message: t('projects.offer.pending') });
    }
    const now = nowStamp();
    const [created] = await tx
      .insert(helpOffers)
      .values({
        projectId: project.id,
        offererId: offerer.id,
        role,
        message,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return created;
  });
  const [owner] = await orm(deps.db).select().from(users).where(eq(users.id, project.ownerId));
  await notifyMember(deps, owner, helpOfferedNotification(project, offerer));
  return offer;
}

/** A project's offers, open ones first and then newest first (L2-017 criterion 4). */
export async function listHelpOffers(db: pg.Pool, project: Project, page: number, perPage: number) {
  const where = eq(helpOffers.projectId, project.id);
  const total = await orm(db).$count(helpOffers, where);
  const rows = await orm(db)
    .select()
    .from(helpOffers)
    .where(where)
    .orderBy(
      sql`(${helpOffers.status} = 'pending') desc`,
      desc(helpOffers.createdAt),
      desc(helpOffers.id),
    )
    .limit(perPage)
    .offset((page - 1) * perPage);
  return { rows, total, lastPage: Math.max(1, Math.ceil(total / perPage)) };
}
