import { beforeEach } from 'vitest';
import { deps, resetDeps } from '../../src/container';

let tables: string | undefined;

// Each test starts with the real dependencies, empty tables and empty test Redis databases (14 and
// 15), as Laravel's RefreshDatabase gave the PHP tests.
beforeEach(async () => {
  resetDeps();
  const { db, redis, cache } = deps();
  if (!tables) {
    const { rows } = await db.query(
      "select string_agg(format('%I', tablename), ', ') as list from pg_tables where schemaname = 'public'",
    );
    tables = rows[0].list ?? '';
  }
  if (tables) await db.query(`truncate ${tables} restart identity cascade`);
  await redis.flushdb();
  await cache.flushdb();
});
