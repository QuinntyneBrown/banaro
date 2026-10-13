import { drizzle } from 'drizzle-orm/node-postgres';
import type pg from 'pg';
import { seedReferenceData } from '../../db/seeders/reference-data-seeder';

/** Seeds what every environment needs. Safe to run again (L2-054 criterion 3). */
export async function seed(pool: pg.Pool): Promise<void> {
  await seedReferenceData(drizzle(pool));
}
