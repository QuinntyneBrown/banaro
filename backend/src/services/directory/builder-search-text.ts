import { asc, eq } from 'drizzle-orm';
import type pg from 'pg';
import { orm } from '../../db/orm';
import { builderSkill, builders } from '../../db/schema/builders';
import { skills } from '../../db/schema/skills';

/** Lower case without accents, so "José" and "jose" match (L2-009 criterion 4). */
export function normalizeSearch(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * A prefix query for full-text search: each word of the term must start a word of the text. Only
 * letters and digits survive, so the term can never break out of the query syntax.
 */
export function prefixQuery(term: string): string | null {
  const words = normalizeSearch(term)
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
  return words.length === 0 ? null : words.map((word) => `${word}:*`).join(' & ');
}

/**
 * Rewrites a builder's search text from their name, headline, skills and what they are building, so
 * the directory finds them by any of these (L2-009 criterion 4).
 */
export async function refreshBuilderSearchText(db: pg.Pool, builderId: number): Promise<void> {
  const query = orm(db);
  const [builder] = await query.select().from(builders).where(eq(builders.id, builderId));
  if (!builder) return;
  const names = await query
    .select({ name: skills.name })
    .from(builderSkill)
    .innerJoin(skills, eq(skills.id, builderSkill.skillId))
    .where(eq(builderSkill.builderId, builderId))
    .orderBy(asc(builderSkill.position));
  const parts = [
    builder.name,
    builder.headline,
    builder.buildingSummary,
    ...names.map((s) => s.name),
  ];
  await query
    .update(builders)
    .set({ searchText: normalizeSearch(parts.filter(Boolean).join(' ')) })
    .where(eq(builders.id, builderId));
}
