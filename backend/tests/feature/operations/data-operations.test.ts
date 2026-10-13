// Acceptance Test
// Traces to: L2-054
// Description: The API never runs migrations when it serves requests, and the seed command leaves the
// same database state when it runs twice.

import { describe, expect, it } from 'vitest';
import { GET as live } from '@/app/health/live/route';
import { GET as ready } from '@/app/health/ready/route';
import { deps } from '@/src/container';
import { migrate } from '@/src/console/commands/migrate';
import { seed } from '@/src/console/commands/seed';

const call = (handler: typeof live, path: string) =>
  handler(new Request(`http://localhost:8100${path}`), { params: Promise.resolve(undefined) });

async function tableExists(name: string): Promise<boolean> {
  const { rows } = await deps().db.query('select to_regclass($1) is not null as exists', [name]);
  return rows[0].exists;
}

/** Row count of every table. */
async function snapshot(): Promise<Record<string, number>> {
  const { rows } = await deps().db.query(
    "select tablename from pg_tables where schemaname = 'public' order by tablename",
  );
  const counts: Record<string, number> = {};
  for (const { tablename } of rows) {
    const result = await deps().db.query(`select count(*)::int as n from "${tablename}"`);
    counts[tablename] = result.rows[0].n;
  }
  return counts;
}

describe('data operations', () => {
  it('serving requests does not run migrations', async () => {
    const db = deps().db;
    await db.query(
      'drop schema public cascade; create schema public; drop schema if exists drizzle cascade',
    );

    expect((await call(live, '/health/live')).status).toBe(200);
    await call(ready, '/health/ready');

    expect(await tableExists('drizzle.__drizzle_migrations')).toBe(false);
    expect(await tableExists('public.users')).toBe(false);

    await migrate(db);
    expect(await tableExists('public.users')).toBe(true);
  });

  it('seeding twice leaves the same state', async () => {
    await seed(deps().db);
    const first = await snapshot();

    await seed(deps().db);

    expect(await snapshot()).toEqual(first);
    expect(first.neighbourhoods).toBe(21);
    expect(first.neighbourhood_distances).toBe(21 * 21);
    expect(first.skills).toBeGreaterThanOrEqual(12);
  });
});
