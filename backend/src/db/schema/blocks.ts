import { bigint, bigserial, pgTable } from 'drizzle-orm/pg-core';
import { stamp } from './columns';

/** One member blocking another; it hides the two from each other everywhere (L2-032). */
export const blocks = pgTable('blocks', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  blockerId: bigint('blocker_id', { mode: 'number' }).notNull(),
  blockedId: bigint('blocked_id', { mode: 'number' }).notNull(),
  createdAt: stamp('created_at'),
});
