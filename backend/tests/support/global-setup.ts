import pg from 'pg';
import { migrate } from '../../src/console/commands/migrate';

/** Brings banaro_test up to the latest migration once per run. */
export default async function setup(): Promise<void> {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    options: '-c timezone=America/Toronto',
  });
  try {
    await migrate(pool);
  } finally {
    await pool.end();
  }
}
