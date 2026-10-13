import type { Deps } from '../../container';

/** One dependency the API needs before it takes traffic. */
interface HealthCheck {
  name: string;
  passes(deps: Deps): Promise<unknown>;
}

const checks: HealthCheck[] = [
  { name: 'database', passes: (deps) => deps.db.query('select 1') },
  { name: 'cache', passes: (deps) => deps.cache.ping() },
  { name: 'queue', passes: (deps) => deps.redis.ping() },
];

const TIMEOUT_MS = 3000;

/**
 * Runs each check in turn and stops at the first failure. The failure detail goes to the log,
 * never to the caller (L2-053 criterion 2).
 */
export async function isReady(deps: Deps): Promise<boolean> {
  for (const check of checks) {
    try {
      await Promise.race([
        check.passes(deps),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timed out')), TIMEOUT_MS)),
      ]);
    } catch (error) {
      deps.logger.warn({ check: check.name, error: String(error) }, 'readiness check failed');
      return false;
    }
  }
  return true;
}
