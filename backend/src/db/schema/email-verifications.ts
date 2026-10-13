import { bigint, bigserial, pgTable, varchar } from 'drizzle-orm/pg-core';
import { stamp } from './columns';

/** Verification links: only the SHA-256 of each token is stored (D-018). */
export const emailVerifications = pgTable('email_verifications', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  userId: bigint('user_id', { mode: 'number' }).notNull(),
  tokenHash: varchar('token_hash', { length: 64 }).notNull(),
  expiresAt: stamp('expires_at').notNull(),
  usedAt: stamp('used_at'),
  createdAt: stamp('created_at').notNull(),
});
