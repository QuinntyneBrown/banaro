import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

const repo = resolve(import.meta.dirname, '../..');

/** Runs an artisan command in the API container (ADR-0002). */
export function artisan(...args: string[]): string {
  return execFileSync('docker', ['compose', 'exec', '-T', 'api', 'php', 'artisan', ...args], {
    cwd: repo,
    encoding: 'utf8',
  });
}

/** Clears rate-limit counters (they live in the cache) so each test starts within its limits. */
export function resetRateLimits(): void {
  artisan('cache:clear');
}
