import type { Deps } from '../../container';
import { FakeMediaScanner } from '../../integrations/fake-media-scanner';

/** One dependency the API needs before it takes traffic. */
interface HealthCheck {
  name: string;
  passes(deps: Deps): Promise<unknown>;
}

const checks: HealthCheck[] = [
  { name: 'database', passes: (deps) => deps.db.query('select 1') },
  { name: 'cache', passes: (deps) => deps.cache.ping() },
  { name: 'queue', passes: (deps) => deps.redis.ping() },
  // The development scanner never takes production traffic (ADR-0004).
  {
    name: 'media-scanner',
    passes: async (deps) => {
      if (process.env.APP_ENV === 'production' && deps.scanner instanceof FakeMediaScanner) {
        throw new Error('the development media scanner is bound');
      }
    },
  },
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
