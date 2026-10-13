import { bigint, bigserial, pgTable, varchar } from 'drizzle-orm/pg-core';
import { stamp } from './columns';

/** The account: credentials and e-mail. The public profile is the builder row. */
export const users = pgTable('users', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  emailVerifiedAt: stamp('email_verified_at'),
  password: varchar('password', { length: 255 }).notNull(),
  rememberToken: varchar('remember_token', { length: 100 }),
  createdAt: stamp('created_at'),
  updatedAt: stamp('updated_at'),
  codeOfConductVersion: varchar('code_of_conduct_version', { length: 255 }),
  codeOfConductAcceptedAt: stamp('code_of_conduct_accepted_at'),
});

export type User = typeof users.$inferSelect;

/** Devices an account signed in from, hashed (L2-003 criterion 10). */
export const signIns = pgTable('sign_ins', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  userId: bigint('user_id', { mode: 'number' }).notNull(),
  deviceHash: varchar('device_hash', { length: 64 }).notNull(),
  createdAt: stamp('created_at').notNull(),
});

/** E-mail addresses are unique ignoring case and surrounding space (L2-001 criterion 3). */
export function canonicalEmail(email: string): string {
  return email.trim().toLowerCase();
}
