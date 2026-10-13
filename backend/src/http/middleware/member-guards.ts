import { and, eq, isNotNull, isNull, lte, or } from 'drizzle-orm';
import { nowStamp } from '../../clock';
import { orm } from '../../db/orm';
import { builders } from '../../db/schema/builders';
import { t } from '../../services/user-experience/catalogue-service';
import { HttpError, type Middleware } from '../pipeline';

/**
 * Member features need a verified address: an unverified account gets 403 `email_unverified`, and
 * the app sends it to /verify-email (L2-002 criterion 4).
 */
export const requireVerifiedEmail: Middleware = async (ctx, next) => {
  if (ctx.user?.emailVerifiedAt == null) {
    throw new HttpError(403, {
      code: 'email_unverified',
      message: t('identity.verify.errors.unverified'),
    });
  }
  return next();
};

/**
 * Member features that work on a profile need a finished onboarding: until then the API answers
 * 409 `onboarding_incomplete` and the app routes to /welcome (L2-006 criterion 1).
 */
export const requireCompleteProfile: Middleware = async (ctx, next) => {
  const [builder] = await orm(ctx.deps.db)
    .select({ id: builders.id })
    .from(builders)
    .where(and(eq(builders.userId, ctx.user!.id), isNotNull(builders.onboardingCompletedAt)));
  if (!builder) {
    throw new HttpError(409, {
      code: 'onboarding_incomplete',
      message: t('profiles.onboarding.errors.incomplete'),
    });
  }
  return next();
};

const RECORD_EVERY_SECONDS = 60;

/**
 * Notes when a signed-in builder was last active, for "Online now" and "Recently active" (L2-009).
 * One conditional update writes at most once a minute.
 */
export const recordActivity: Middleware = async (ctx, next) => {
  if (ctx.user) {
    await orm(ctx.deps.db)
      .update(builders)
      .set({ lastActiveAt: nowStamp() })
      .where(
        and(
          eq(builders.userId, ctx.user.id),
          or(
            isNull(builders.lastActiveAt),
            lte(builders.lastActiveAt, nowStamp(-RECORD_EVERY_SECONDS)),
          ),
        ),
      );
  }
  return next();
};
