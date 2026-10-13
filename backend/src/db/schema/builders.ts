import {
  bigint,
  bigserial,
  char,
  date,
  jsonb,
  pgTable,
  smallint,
  text,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { stamp } from './columns';

/** The public profile of a member. */
export const builders = pgTable('builders', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  userId: bigint('user_id', { mode: 'number' }).notNull(),
  createdAt: stamp('created_at'),
  updatedAt: stamp('updated_at'),
  publicId: char('public_id', { length: 26 }),
  name: varchar('name', { length: 100 }),
  role: varchar('role', { length: 30 }),
  headline: varchar('headline', { length: 80 }),
  neighbourhoodId: bigint('neighbourhood_id', { mode: 'number' }),
  bio: text('bio'),
  openTo: jsonb('open_to').$type<string[]>().notNull().default([]),
  buildingSummary: varchar('building_summary', { length: 280 }),
  lookingFor: varchar('looking_for', { length: 400 }),
  onboardingSavedSteps: jsonb('onboarding_saved_steps').$type<string[]>().notNull().default([]),
  onboardingCompletedAt: stamp('onboarding_completed_at'),
  photoId: uuid('photo_id'),
  lastActiveAt: stamp('last_active_at'),
  searchText: text('search_text').notNull().default(''),
});

export type Builder = typeof builders.$inferSelect;

/** A builder's skills, in the order the builder chose them. */
export const builderSkill = pgTable('builder_skill', {
  builderId: bigint('builder_id', { mode: 'number' }).notNull(),
  skillId: bigint('skill_id', { mode: 'number' }).notNull(),
  position: smallint('position').notNull(),
});

/** Roles a builder has held, newest first by position. */
export const experienceEntries = pgTable('experience_entries', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  builderId: bigint('builder_id', { mode: 'number' }).notNull(),
  position: smallint('position').notNull(),
  title: varchar('title', { length: 100 }).notNull(),
  organization: varchar('organization', { length: 100 }),
  startedOn: date('started_on').notNull(),
  endedOn: date('ended_on'),
  createdAt: stamp('created_at'),
  updatedAt: stamp('updated_at'),
});

/** Links on a profile, in order. */
export const profileLinks = pgTable('profile_links', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  builderId: bigint('builder_id', { mode: 'number' }).notNull(),
  position: smallint('position').notNull(),
  label: varchar('label', { length: 60 }).notNull(),
  url: varchar('url', { length: 2048 }).notNull(),
  createdAt: stamp('created_at'),
  updatedAt: stamp('updated_at'),
});

/** A builder's photo; only a `ready` one is shown (L2-008). */
export const profilePhotos = pgTable('profile_photos', {
  id: uuid('id').primaryKey(),
  builderId: bigint('builder_id', { mode: 'number' }).notNull(),
  path: varchar('path', { length: 255 }).notNull(),
  status: varchar('status', { length: 16 }).notNull(),
  scannedAt: stamp('scanned_at'),
  createdAt: stamp('created_at'),
  updatedAt: stamp('updated_at'),
});
