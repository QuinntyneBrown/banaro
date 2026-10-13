/** Reads configuration from the environment when first used, so `next build` needs none. */
export const env = {
  get appEnv() {
    return process.env.APP_ENV ?? 'local';
  },
  get databaseUrl() {
    return process.env.DATABASE_URL ?? 'postgres://banaro:banaro@postgres:5432/banaro';
  },
  get redisUrl() {
    return process.env.REDIS_URL ?? 'redis://redis:6379';
  },
  /** Sessions and queues. */
  get redisDb() {
    return Number(process.env.REDIS_DB ?? 0);
  },
  /** Cache entries and rate-limit counters; the e2e fixtures flush this database. */
  get redisCacheDb() {
    return Number(process.env.REDIS_CACHE_DB ?? 1);
  },
  get logLevel() {
    return process.env.LOG_LEVEL ?? 'info';
  },
};
