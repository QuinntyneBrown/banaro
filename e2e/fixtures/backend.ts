import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

const repo = resolve(import.meta.dirname, '../..');

function compose(...args: string[]): string {
  return execFileSync('docker', ['compose', 'exec', '-T', ...args], { cwd: repo, encoding: 'utf8' });
}

/** Runs a Banaro CLI command in the API container (ADR-0002). Slow: prefer `sql` for test data. */
export function banaro(...args: string[]): string {
  return compose('api', 'npm', 'run', '--silent', 'banaro', '--', ...args);
}

/** Runs SQL against the Banaro database and returns the unaligned, tuples-only output. */
export function sql(statement: string): string {
  return compose('postgres', 'psql', '-U', 'banaro', '-d', 'banaro', '-qtAX', '-c', statement).trim();
}

/** Clears rate-limit counters (they live in the Redis cache database) so each test starts within its limits. */
export function resetRateLimits(): void {
  compose('redis', 'redis-cli', '-n', '1', 'FLUSHDB');
}

/** `now()` as the API stores it: a timestamp without zone in the app's time zone (America/Toronto). */
export const NOW = "(now() AT TIME ZONE 'America/Toronto')";
