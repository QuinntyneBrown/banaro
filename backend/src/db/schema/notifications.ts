import { bigint, bigserial, jsonb, pgTable, smallint, uuid, varchar } from 'drizzle-orm/pg-core';
import { stamp } from './columns';

/** What the in-app row stores: the page builds the sentence from kind, subject and params (L2-027). */
export interface NotificationData {
  kind: string;
  subject: { type: string; id: string };
  params: Record<string, string | number | boolean | null>;
  actor_user_id: number | null;
}

/** A member's in-app notifications (L2-027). */
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey(),
  type: varchar('type', { length: 255 }).notNull(),
  notifiableType: varchar('notifiable_type', { length: 255 }).notNull(),
  notifiableId: bigint('notifiable_id', { mode: 'number' }).notNull(),
  data: jsonb('data').$type<NotificationData>().notNull(),
  readAt: stamp('read_at'),
  createdAt: stamp('created_at'),
  updatedAt: stamp('updated_at'),
});

export type Notification = typeof notifications.$inferSelect;

/** One row per notification e-mail, so a retried job never sends twice (L2-029 criterion 1). */
export const emailDeliveries = pgTable('email_deliveries', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  notificationId: uuid('notification_id').notNull(),
  userId: bigint('user_id', { mode: 'number' }).notNull(),
  category: varchar('category', { length: 32 }),
  status: varchar('status', { length: 16 }).notNull().default('queued'),
  attempts: smallint('attempts').notNull().default(0),
  sentAt: stamp('sent_at'),
  failedAt: stamp('failed_at'),
  createdAt: stamp('created_at'),
  updatedAt: stamp('updated_at'),
});
