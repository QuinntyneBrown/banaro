import type { Redis } from 'ioredis';

export const MAINTENANCE_KEY = 'banaro:maintenance';

/**
 * Puts every API instance into maintenance mode; the release pipeline runs it (L2-043 criterion 8).
 * `retry` is the number of seconds clients are told to wait.
 */
export async function maintenanceOn(redis: Redis, retry: number): Promise<void> {
  await redis.set(MAINTENANCE_KEY, JSON.stringify({ retry }));
}

export async function maintenanceOff(redis: Redis): Promise<void> {
  await redis.del(MAINTENANCE_KEY);
}
