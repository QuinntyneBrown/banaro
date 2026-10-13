import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import type pg from 'pg';

const instances = new WeakMap<pg.Pool, NodePgDatabase>();

/** The Drizzle query builder over a pool (ADR-0008). */
export function orm(pool: pg.Pool): NodePgDatabase {
  let db = instances.get(pool);
  if (!db) {
    db = drizzle(pool);
    instances.set(pool, db);
  }
  return db;
}
