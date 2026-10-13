import { bigserial, boolean, pgTable, smallint, timestamp, varchar } from 'drizzle-orm/pg-core';

/** Skills a builder lists; the twelve with `is_catalogue` are the onboarding catalogue (D-027). */
export const skills = pgTable('skills', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  name: varchar('name', { length: 40 }).notNull(),
  slug: varchar('slug', { length: 60 }).notNull(),
  normalizedName: varchar('normalized_name', { length: 40 }).notNull(),
  isCatalogue: boolean('is_catalogue').notNull().default(false),
  cataloguePosition: smallint('catalogue_position'),
  createdAt: timestamp('created_at', { precision: 0, mode: 'string' }),
  updatedAt: timestamp('updated_at', { precision: 0, mode: 'string' }),
});

/** Lower-case ASCII, trimmed: the key that makes "laravel " and "Laravel" one skill. */
export function normalizeSkill(name: string): string {
  return ascii(name.trim()).toLowerCase();
}

/** URL slug: ASCII, lower case, runs of other characters become one hyphen. */
export function slugify(text: string): string {
  return ascii(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function ascii(text: string): string {
  return text.normalize('NFKD').replace(/[̀-ͯ]/g, '');
}
