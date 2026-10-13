import type { Redis } from 'ioredis';

/**
 * Fixed-window attempt counters in the Redis cache database, shared by every API instance. The
 * window starts at the first attempt, as Laravel's limiter did.
 */
export const rateLimiter = {
  async tooManyAttempts(redis: Redis, key: string, max: number): Promise<boolean> {
    return Number(await redis.get(key)) >= max;
  },

  async hit(redis: Redis, key: string, windowSeconds: number): Promise<number> {
    const hits = await redis.incr(key);
    if (hits === 1) await redis.expire(key, windowSeconds);
    return hits;
  },

  /** Seconds until the window ends. */
  async availableIn(redis: Redis, key: string): Promise<number> {
    return Math.max(await redis.ttl(key), 1);
  },

  async clear(redis: Redis, key: string): Promise<void> {
    await redis.del(key);
  },
};
