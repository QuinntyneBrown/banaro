import { Redis } from 'ioredis';
import pg from 'pg';
import type { Logger } from 'pino';
import { env } from './config/env';
import { createLogger } from './logging';

export interface Deps {
  db: pg.Pool;
  /** Sessions and queues. */
  redis: Redis;
  /** Cache entries and rate-limit counters. */
  cache: Redis;
  logger: Logger;
}

// Kept on globalThis so `next dev` reloads reuse one pool and one set of Redis connections.
const store = globalThis as unknown as { banaroDeps?: Deps; banaroOverrides?: Partial<Deps> };

const redisOptions = { lazyConnect: true, maxRetriesPerRequest: 1, connectTimeout: 2000 };

/** Shared clients. Nothing connects until first used. */
export function deps(): Deps {
  store.banaroDeps ??= {
    db: new pg.Pool({ connectionString: env.databaseUrl, connectionTimeoutMillis: 2000 }),
    redis: new Redis(env.redisUrl, { ...redisOptions, db: env.redisDb }),
    cache: new Redis(env.redisUrl, { ...redisOptions, db: env.redisCacheDb }),
    logger: createLogger(),
  };
  return { ...store.banaroDeps, ...store.banaroOverrides };
}

/** Replaces some dependencies, for tests. */
export function setDeps(overrides: Partial<Deps>): void {
  store.banaroOverrides = { ...store.banaroOverrides, ...overrides };
}

export function resetDeps(): void {
  store.banaroOverrides = {};
}
