import { and, eq } from 'drizzle-orm';
import type pg from 'pg';
import { orm } from '../../db/orm';
import { neighbourhoodDistances } from '../../db/schema/neighbourhoods';

/** Kilometres between neighbourhood centroids, from the precomputed table (L2-009). */
export async function distanceBetween(
  db: pg.Pool,
  from: number | null,
  to: number | null,
): Promise<number | null> {
  if (from === null || to === null) return null;
  const [row] = await orm(db)
    .select({ km: neighbourhoodDistances.km })
    .from(neighbourhoodDistances)
    .where(and(eq(neighbourhoodDistances.fromId, from), eq(neighbourhoodDistances.toId, to)));
  return row ? Number(row.km) : null;
}
