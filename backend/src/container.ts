import { Redis } from 'ioredis';
import pg from 'pg';
import type { Logger } from 'pino';
import { env } from './config/env';
import type { Mailer } from './contracts/mailer';
import type { JobQueue } from './contracts/queue';
import { SmtpMailer } from './integrations/smtp-mailer';
import { createLogger } from './logging';
import { BullQueue } from './queue/bull-queue';

export interface Deps {
  db: pg.Pool;
  /** Sessions and queues. */
  redis: Redis;
  /** Cache entries and rate-limit counters. */
  cache: Redis;
  logger: Logger;
  queue: JobQueue;
  mailer: Mailer;
}

// Kept on globalThis so `next dev` reloads reuse one pool and one set of Redis connections.
const store = globalThis as unknown as { banaroDeps?: Deps; banaroOverrides?: Partial<Deps> };

// `timestamp without time zone` columns hold Toronto wall-clock time, as the e2e fixtures write it
// (ADR-0008). Read them as strings so nothing shifts them to the host's zone.
pg.types.setTypeParser(pg.types.builtins.TIMESTAMP, (value) => value);

const redisOptions = { lazyConnect: true, maxRetriesPerRequest: 1, connectTimeout: 2000 };

/** Shared clients. Nothing connects until first used. */
export function deps(): Deps {
  store.banaroDeps ??= {
    db: new pg.Pool({
      connectionString: env.databaseUrl,
      connectionTimeoutMillis: 2000,
      options: '-c timezone=America/Toronto',
    }),
    redis: new Redis(env.redisUrl, { ...redisOptions, db: env.redisDb }),
    cache: new Redis(env.redisUrl, { ...redisOptions, db: env.redisCacheDb }),
    logger: createLogger(),
    queue: new BullQueue(),
    mailer: new SmtpMailer(),
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
