import { beforeEach } from 'vitest';
import { deps, resetDeps } from '../../src/container';

// Each test starts with the real dependencies and empty test Redis databases (14 and 15).
beforeEach(async () => {
  resetDeps();
  await deps().redis.flushdb();
  await deps().cache.flushdb();
});
