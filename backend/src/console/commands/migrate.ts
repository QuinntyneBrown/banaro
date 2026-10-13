import path from 'node:path';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate as runMigrations } from 'drizzle-orm/node-postgres/migrator';
import type pg from 'pg';

const LOCK = 7_420_054; // any constant; one advisory lock key for migrations

/**
 * Applies pending migrations. Only the pipeline and developers run it; the API never does
 * (L2-054 criterion 1). An advisory lock keeps two runs from migrating at once.
 */
export async function migrate(pool: pg.Pool): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('select pg_advisory_lock($1)', [LOCK]);
    await runMigrations(drizzle(client), {
      migrationsFolder: path.join(process.cwd(), 'src/db/migrations'),
    });
  } finally {
    await client.query('select pg_advisory_unlock($1)', [LOCK]).catch(() => undefined);
    client.release();
  }
}
