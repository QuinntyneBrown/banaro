import { eq } from 'drizzle-orm';
import type pg from 'pg';
import { nowStamp } from '../../clock';
import { orm } from '../../db/orm';
import { builderSkill, builders } from '../../db/schema/builders';
import { users, type User } from '../../db/schema/users';
import type { OnboardingStep } from '../../enums/profiles';
import { builderFor } from '../../services/profiles/onboarding-service';
import { resolveSkills, type SkillEntry } from '../../services/profiles/skill-catalogue';

export type StepAnswers =
  | { step: 'about'; name: string; neighbourhood_id: number; role: string }
  | { step: 'skills'; skills: SkillEntry[] }
  | { step: 'goals'; open_to: string[]; building?: string | null };

/**
 * Saves one step whole, or nothing, and records it as saved so it survives leaving (L2-006
 * criteria 2, 3 and 6). Only the parsed answers of that step are written.
 */
export async function saveOnboardingStep(
  db: pg.Pool,
  user: User,
  answers: StepAnswers,
): Promise<void> {
  await orm(db).transaction(async (tx) => {
    const builder = await builderFor(tx, user);
    const changes: Partial<typeof builders.$inferInsert> = {};

    if (answers.step === 'about') {
      Object.assign(changes, {
        name: answers.name,
        neighbourhoodId: answers.neighbourhood_id,
        role: answers.role,
      });
      // One name everywhere: the header and e-mails use the account's.
      await tx
        .update(users)
        .set({ name: answers.name, updatedAt: nowStamp() })
        .where(eq(users.id, user.id));
    } else if (answers.step === 'skills') {
      const ids = await resolveSkills(tx, answers.skills);
      await tx.delete(builderSkill).where(eq(builderSkill.builderId, builder.id));
      if (ids.length > 0) {
        await tx
          .insert(builderSkill)
          .values(ids.map((skillId, i) => ({ builderId: builder.id, skillId, position: i + 1 })));
      }
    } else {
      Object.assign(changes, {
        openTo: [...new Set(answers.open_to)],
        buildingSummary: answers.building ?? null,
      });
    }

    const saved = builder.onboardingSavedSteps;
    const step: OnboardingStep = answers.step;
    await tx
      .update(builders)
      .set({
        ...changes,
        onboardingSavedSteps: saved.includes(step) ? saved : [...saved, step],
        updatedAt: nowStamp(),
      })
      .where(eq(builders.id, builder.id));
  });
}
