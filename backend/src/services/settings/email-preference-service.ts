import { eq } from 'drizzle-orm';
import { bigint, bigserial, boolean, pgTable, varchar } from 'drizzle-orm/pg-core';
import type pg from 'pg';
import { nowStamp } from '../../clock';
import { orm } from '../../db/orm';
import { stamp } from '../../db/schema/columns';

/** The e-mail a member can switch off (L2-037). Security e-mail is not a category: it always sends. */
export const EMAIL_CATEGORIES = [
  'matches',
  'messages',
  'events',
  'project_activity',
  'weekly_digest',
] as const;
export type EmailCategory = (typeof EMAIL_CATEGORIES)[number];

export const emailPreferences = pgTable('email_preferences', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  userId: bigint('user_id', { mode: 'number' }).notNull(),
  category: varchar('category', { length: 32 }).notNull(),
  enabled: boolean('enabled').notNull(),
  createdAt: stamp('created_at'),
  updatedAt: stamp('updated_at'),
});

/** All five categories; one the member never changed is on (L2-037, D-054). */
export async function emailPreferencesOf(
  db: pg.Pool,
  userId: number,
): Promise<Record<EmailCategory, boolean>> {
  const stored = new Map(
    (await orm(db).select().from(emailPreferences).where(eq(emailPreferences.userId, userId))).map(
      (row) => [row.category, row.enabled],
    ),
  );
  return Object.fromEntries(
    EMAIL_CATEGORIES.map((category) => [category, stored.get(category) ?? true]),
  ) as Record<EmailCategory, boolean>;
}

export async function emailAllowed(
  db: pg.Pool,
  userId: number,
  category: string,
): Promise<boolean> {
  return (await emailPreferencesOf(db, userId))[category as EmailCategory] ?? true;
}

/** Saves one category on its own and returns all five (L2-037 criterion 1). */
export async function setEmailPreference(
  db: pg.Pool,
  userId: number,
  category: EmailCategory,
  enabled: boolean,
) {
  await orm(db)
    .insert(emailPreferences)
    .values({ userId, category, enabled, createdAt: nowStamp(), updatedAt: nowStamp() })
    .onConflictDoUpdate({
      target: [emailPreferences.userId, emailPreferences.category],
      set: { enabled, updatedAt: nowStamp() },
    });
  return emailPreferencesOf(db, userId);
}
