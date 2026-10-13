import { bigint, bigserial, integer, pgTable, text, varchar } from 'drizzle-orm/pg-core';
import { stamp } from './columns';

/** A product a member shares (L2-012). */
export const projects = pgTable('projects', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  publicId: varchar('public_id', { length: 26 }).notNull(),
  ownerId: bigint('owner_id', { mode: 'number' }).notNull(),
  name: varchar('name', { length: 80 }).notNull(),
  summary: varchar('summary', { length: 140 }).notNull(),
  description: text('description'),
  stage: varchar('stage', { length: 16 }).notNull(),
  link: varchar('link', { length: 2048 }),
  feedbackCount: integer('feedback_count').notNull().default(0),
  lastActivityAt: stamp('last_activity_at'),
  /** Accent-free name and summary that browse searches (L2-015 criterion 2). */
  searchText: text('search_text').notNull().default(''),
  createdAt: stamp('created_at'),
  updatedAt: stamp('updated_at'),
});

export type Project = typeof projects.$inferSelect;

/** The roles a project is looking for (L2-012). */
export const projectLookingFor = pgTable('project_looking_for', {
  projectId: bigint('project_id', { mode: 'number' }).notNull(),
  role: varchar('role', { length: 32 }).notNull(),
});
