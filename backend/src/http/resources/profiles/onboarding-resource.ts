import { asc, eq } from 'drizzle-orm';
import type pg from 'pg';
import { orm } from '../../../db/orm';
import { builderSkill, builders } from '../../../db/schema/builders';
import { neighbourhoods } from '../../../db/schema/neighbourhoods';
import { skills } from '../../../db/schema/skills';
import type { User } from '../../../db/schema/users';
import { BUILDER_ROLES } from '../../../enums/profiles';
import { nextStep } from '../../../services/profiles/onboarding-service';

/** Onboarding progress: the next step, the saved answers, and the lists the steps choose from. */
export async function onboardingResource(db: pg.Pool, user: User) {
  const query = orm(db);
  const [builder] = await query.select().from(builders).where(eq(builders.userId, user.id));
  const chosen = builder
    ? await query
        .select({ id: skills.id, name: skills.name })
        .from(builderSkill)
        .innerJoin(skills, eq(skills.id, builderSkill.skillId))
        .where(eq(builderSkill.builderId, builder.id))
        .orderBy(asc(builderSkill.position))
    : [];

  return {
    next_step: nextStep(builder),
    completed: builder?.onboardingCompletedAt != null,
    about: {
      name: builder?.name ?? user.name,
      neighbourhood_id: builder?.neighbourhoodId ?? null,
      role: builder?.role ?? null,
    },
    skills: chosen,
    goals: {
      open_to: builder?.openTo ?? [],
      building: builder?.buildingSummary ?? null,
    },
    roles: BUILDER_ROLES,
    neighbourhoods: await query
      .select({ id: neighbourhoods.id, name: neighbourhoods.name, area: neighbourhoods.area })
      .from(neighbourhoods)
      .orderBy(asc(neighbourhoods.name)),
    skill_catalogue: await query
      .select({ id: skills.id, name: skills.name })
      .from(skills)
      .where(eq(skills.isCatalogue, true))
      .orderBy(asc(skills.cataloguePosition)),
  };
}
