import { eq, like } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { nowStamp } from '../../clock';
import { normalizeSkill, skills, slugify } from '../../db/schema/skills';

export interface SkillEntry {
  id?: number | null;
  name?: string | null;
}

/**
 * Turns `{id}` (a catalogue skill) and `{name}` (any skill) entries into skill ids in order,
 * dropping repeats however they are written; custom names are found or created (L2-006, L2-007).
 */
export async function resolveSkills(db: NodePgDatabase, entries: SkillEntry[]): Promise<number[]> {
  const ids: number[] = [];
  for (const entry of entries) {
    if (entry.id) {
      ids.push(entry.id);
      continue;
    }
    const name = (entry.name ?? '').trim();
    const normalized = normalizeSkill(name);
    const [existing] = await db.select().from(skills).where(eq(skills.normalizedName, normalized));
    if (existing) {
      ids.push(existing.id);
      continue;
    }
    const [created] = await db
      .insert(skills)
      .values({
        name,
        slug: await uniqueSlug(db, name),
        normalizedName: normalized,
        createdAt: nowStamp(),
        updatedAt: nowStamp(),
      })
      .returning();
    ids.push(created.id);
  }
  return [...new Set(ids)];
}

async function uniqueSlug(db: NodePgDatabase, name: string): Promise<string> {
  const base = slugify(name.replace('/', ' ')) || 'skill';
  const taken = new Set(
    (
      await db
        .select({ slug: skills.slug })
        .from(skills)
        .where(like(skills.slug, `${base}%`))
    ).map((row) => row.slug),
  );
  let slug = base;
  for (let i = 2; taken.has(slug); i++) slug = `${base}-${i}`;
  return slug;
}
