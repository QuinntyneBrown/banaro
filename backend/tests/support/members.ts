import { deps } from '../../src/container';
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
