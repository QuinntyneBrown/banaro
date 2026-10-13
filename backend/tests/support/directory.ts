import { eq } from 'drizzle-orm';
import { nowStamp, toStamp } from '../../src/clock';
import { deps } from '../../src/container';
import { orm } from '../../src/db/orm';
import { builderSkill, builders, type Builder } from '../../src/db/schema/builders';
import { normalizeSkill, skills, slugify } from '../../src/db/schema/skills';
import { users, type User } from '../../src/db/schema/users';
import { refreshBuilderSearchText } from '../../src/services/directory/builder-search-text';
import { ulid } from '../../src/ulid';
import { createUser, neighbourhoodId } from './members';

export interface BuilderOptions {
  role?: string;
  openTo?: string[];
  /** Skill names; catalogue skills are found, others created. */
  skills?: string[];
  activeMinutesAgo?: number | null;
  joined?: string;
  complete?: boolean;
  extra?: Partial<typeof builders.$inferInsert>;
}

/** A builder with a profile in a neighbourhood, for the directory tests. */
export async function createBuilder(
  name: string,
  hood: string,
  options: BuilderOptions = {},
): Promise<Builder> {
  const db = orm(deps().db);
  const user = await createUser({ name });
  const minutes = options.activeMinutesAgo;
  const [builder] = await db
    .insert(builders)
    .values({
      userId: user.id,
      publicId: ulid(),
      name,
      role: options.role ?? 'engineer',
      headline: `${name} headline`,
      neighbourhoodId: await neighbourhoodId(hood),
      openTo: options.openTo ?? ['co_founding'],
      onboardingSavedSteps: ['about', 'skills', 'goals'],
      onboardingCompletedAt: options.complete === false ? null : nowStamp(),
      lastActiveAt: minutes === undefined || minutes === null ? null : nowStamp(-minutes * 60),
      createdAt: options.joined ? toStamp(new Date(`${options.joined}T12:00:00Z`)) : nowStamp(),
      updatedAt: nowStamp(),
      ...options.extra,
    })
    .returning();

  for (const [i, skill] of (options.skills ?? []).entries()) {
    const normalized = normalizeSkill(skill);
    let [row] = await db.select().from(skills).where(eq(skills.normalizedName, normalized));
    if (!row) {
      [row] = await db
        .insert(skills)
        .values({ name: skill, slug: slugify(skill), normalizedName: normalized })
        .returning();
    }
    await db
      .insert(builderSkill)
      .values({ builderId: builder.id, skillId: row.id, position: i + 1 });
  }
  await refreshBuilderSearchText(deps().db, builder.id);
  return builder;
}

/** The account behind a builder. */
export async function userOf(builder: Builder): Promise<User> {
  return (await orm(deps().db).select().from(users).where(eq(users.id, builder.userId)))[0];
}
