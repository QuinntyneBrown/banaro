import { deps } from '../../src/container';
import { orm } from '../../src/db/orm';
import { users, type User } from '../../src/db/schema/users';
import { hashPassword } from '../../src/services/identity/password-policy';

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
