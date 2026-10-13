import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { nowStamp } from '../../clock';
import { builders, type Builder } from '../../db/schema/builders';
import type { User } from '../../db/schema/users';
import { ONBOARDING_STEPS } from '../../enums/profiles';
import { ulid } from '../../ulid';

/** The member's profile, started on first use with the account's name. */
export async function builderFor(db: NodePgDatabase, user: User): Promise<Builder> {
  const [existing] = await db.select().from(builders).where(eq(builders.userId, user.id));
  if (existing) return existing;
  const [created] = await db
    .insert(builders)
    .values({
      userId: user.id,
      publicId: ulid(),
      name: user.name,
      createdAt: nowStamp(),
      updatedAt: nowStamp(),
    })
    .returning();
  return created;
}

/** The first step not yet saved, or `finish` (L2-006 criteria 1, 5 and 6). */
export function nextStep(builder: Builder | undefined): string {
  const saved = builder?.onboardingSavedSteps ?? [];
  return ONBOARDING_STEPS.find((step) => !saved.includes(step)) ?? 'finish';
}

export function isReady(builder: Builder | undefined): builder is Builder {
  return (
    builder !== undefined &&
    nextStep(builder) === 'finish' &&
    builder.role !== null &&
    builder.neighbourhoodId !== null
  );
}
