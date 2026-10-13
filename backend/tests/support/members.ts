import { eq, sql } from 'drizzle-orm';
import { nowStamp } from '../../src/clock';
import { deps } from '../../src/container';
import { builders } from '../../src/db/schema/builders';
import { neighbourhoods } from '../../src/db/schema/neighbourhoods';
import { seedReferenceData as seedReferenceDataInto } from '../../src/db/seeders/reference-data-seeder';
import { refreshBuilderSearchText } from '../../src/services/directory/builder-search-text';
import { ulid } from '../../src/ulid';
import { Session } from '../../src/http/session';
import { orm } from '../../src/db/orm';
import { users, type User } from '../../src/db/schema/users';
import { hashPassword } from '../../src/services/identity/password-policy';

import { Browser } from './browser';

export const PASSWORD = 'harvest-volunteers-2026';
let counter = 0;

/** An account; verified unless the caller says otherwise, like the Laravel user factory. */
export async function createUser(
  overrides: Partial<typeof users.$inferInsert> = {},
): Promise<User> {
  counter++;
  const [user] = await orm(deps().db)
    .insert(users)
    .values({
      name: 'Amara Osei',
      email: `member${counter}@harvest.example`,
      password: await hashPassword(PASSWORD),
      emailVerifiedAt: '2026-10-01 09:00:00',
      createdAt: '2026-10-01 09:00:00',
      updatedAt: '2026-10-01 09:00:00',
      ...overrides,
    })
    .returning();
  return user;
}

/** Neighbourhoods, their distances and the skill catalogue, as every environment has them. */
export async function seedReferenceData(): Promise<void> {
  await seedReferenceDataInto(orm(deps().db));
}

export async function neighbourhoodId(slug: string): Promise<number> {
  const [row] = await orm(deps().db)
    .select({ id: neighbourhoods.id })
    .from(neighbourhoods)
    .where(eq(neighbourhoods.slug, slug));
  return row.id;
}

/** A verified member with a finished profile, ready to use every member route. */
export async function createMember(
  name = 'Amara Osei',
  neighbourhood = 'riverdale',
): Promise<User> {
  const [{ count }] = await orm(deps().db)
    .select({ count: sql<number>`count(*)::int` })
    .from(neighbourhoods);
  if (count === 0) await seedReferenceData();
  const user = await createUser({ name });
  const [builder] = await orm(deps().db)
    .insert(builders)
    .values({
      userId: user.id,
      publicId: ulid(),
      name,
      role: 'engineer',
      neighbourhoodId: await neighbourhoodId(neighbourhood),
      openTo: ['co_founding'],
      onboardingSavedSteps: ['about', 'skills', 'goals'],
      onboardingCompletedAt: nowStamp(),
      lastActiveAt: nowStamp(),
      createdAt: nowStamp(),
      updatedAt: nowStamp(),
    })
    .returning();
  await refreshBuilderSearchText(deps().db, builder.id);
  return user;
}

/** A browser already signed in as the user, as Laravel's actingAs gave the PHP tests. */
export async function actingAs(user: User, browser = new Browser()): Promise<Browser> {
  const session = Session.start();
  session.data.userId = user.id;
  session.data.authenticatedAt = Math.floor(Date.now() / 1000);
  session.data.passwordHash = user.password;
  await session.save(deps().redis);
  for (const cookie of session.cookies()) {
    const [name, ...value] = cookie.split(';')[0].split('=');
    browser.cookies.set(name, value.join('='));
  }
  return browser;
}
