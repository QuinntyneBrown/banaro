import { eq } from 'drizzle-orm';
import type pg from 'pg';
import { nowStamp } from '../../clock';
import { orm } from '../../db/orm';
import { builders } from '../../db/schema/builders';
import type { User } from '../../db/schema/users';
import { HttpError } from '../../http/pipeline';
import { refreshBuilderSearchText } from '../../services/directory/builder-search-text';
import { isReady, nextStep } from '../../services/profiles/onboarding-service';
import { t } from '../../services/user-experience/catalogue-service';

/**
 * Marks the profile complete once every step is saved (L2-006 criterion 5). Finishing again
 * changes nothing.
 */
export async function completeOnboarding(db: pg.Pool, user: User): Promise<void> {
  const [builder] = await orm(db).select().from(builders).where(eq(builders.userId, user.id));
  if (!isReady(builder)) {
    throw new HttpError(422, {
      code: 'onboarding_incomplete',
      message: t('profiles.onboarding.errors.incomplete'),
      next_step: nextStep(builder),
    });
  }
  if (builder.onboardingCompletedAt === null) {
    await orm(db)
      .update(builders)
      .set({ onboardingCompletedAt: nowStamp(), updatedAt: nowStamp() })
      .where(eq(builders.id, builder.id));
    // The builder joins the directory, findable by name and skills (L2-009).
    await refreshBuilderSearchText(db, builder.id);
  }
}
