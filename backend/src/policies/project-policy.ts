import type pg from 'pg';
import type { Project } from '../db/schema/projects';
import type { User } from '../db/schema/users';
import { HttpError, notFound } from '../http/pipeline';
import { isBlockedEitherWay } from '../services/trust-and-safety/block-service';
import { t } from '../services/user-experience/catalogue-service';

/** Only the owner changes or removes a project; anyone else gets 403 (L2-014 criterion 2). */
export function authorizeChange(user: User, project: Project): void {
  if (project.ownerId !== user.id) {
    throw new HttpError(403, { message: 'This action is unauthorized.' });
  }
}

/** A member who is not the owner, and not in a blocked pair with the owner (L2-016 criterion 6). */
export async function mayGiveFeedback(db: pg.Pool, user: User, project: Project): Promise<boolean> {
  return project.ownerId !== user.id && !(await isBlockedEitherWay(db, user.id, project.ownerId));
}

/** The 403 names itself, so the dialog can say why instead of showing a generic failure. */
export async function authorizeFeedback(db: pg.Pool, user: User, project: Project): Promise<void> {
  if (!(await mayGiveFeedback(db, user, project))) {
    throw new HttpError(403, {
      code: 'feedback_not_allowed',
      message: t('projects.feedback.notAllowed'),
    });
  }
}

/** Offers follow the feedback rule: not the owner, not a blocked pair (L2-017). */
export async function authorizeOffer(db: pg.Pool, user: User, project: Project): Promise<void> {
  if (!(await mayGiveFeedback(db, user, project))) {
    throw new HttpError(403, {
      code: 'offer_not_allowed',
      message: t('projects.offer.notAllowed'),
    });
  }
}

/** Only the owner reads a project's offers; anyone else is told it is not there (L2-044). */
export function authorizeViewOffers(user: User, project: Project): void {
  if (project.ownerId !== user.id) throw notFound();
}
