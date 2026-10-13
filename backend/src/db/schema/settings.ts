import { bigint, boolean, pgTable, varchar } from 'drizzle-orm/pg-core';
import { stamp } from './columns';

/** A member's privacy choices (L2-036). Accounts without a row read the defaults. */
export const privacySettings = pgTable('privacy_settings', {
  userId: bigint('user_id', { mode: 'number' }).primaryKey(),
  profileVisibility: varchar('profile_visibility', { length: 16 }).notNull().default('members'),
  locationPrecision: varchar('location_precision', { length: 16 })
    .notNull()
    .default('neighbourhood'),
  emailContact: boolean('email_contact').notNull().default(false),
  showOnlineStatus: boolean('show_online_status').notNull().default(true),
  listInAttendees: boolean('list_in_attendees').notNull().default(false),
  createdAt: stamp('created_at'),
  updatedAt: stamp('updated_at'),
});

export type PrivacySettings = Pick<
  typeof privacySettings.$inferSelect,
  | 'profileVisibility'
  | 'locationPrecision'
  | 'emailContact'
  | 'showOnlineStatus'
  | 'listInAttendees'
>;

/** The defaults of a new account (L2-036 criterion 4, D-046). */
export const PRIVACY_DEFAULTS: PrivacySettings = {
  profileVisibility: 'members',
  locationPrecision: 'neighbourhood',
  emailContact: false,
  showOnlineStatus: true,
  listInAttendees: false,
};
