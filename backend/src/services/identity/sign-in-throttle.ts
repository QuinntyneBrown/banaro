import { createHash } from 'node:crypto';
import type { Redis } from 'ioredis';
import { canonicalEmail } from '../../db/schema/users';
import { HttpError } from '../../http/pipeline';
import { rateLimiter } from '../../http/rate-limiter';
import { t } from '../user-experience/catalogue-service';

const WINDOW_SECONDS = 15 * 60;
const PER_ACCOUNT = 5;
const PER_IP = 20;

const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');
const accountKey = (email: string) => `sign-in:account:${sha256(canonicalEmail(email))}`;
const ipKey = (ip: string) => `sign-in:ip:${sha256(ip)}`;

/**
 * Limits credential guessing: 5 failures per account or 20 per IP address in 15 minutes
 * (L2-003 criterion 3). Unknown addresses count the same way, so a 429 reveals nothing about which
 * addresses are registered.
 */
export const signInThrottle = {
  async check(redis: Redis, email: string, ip: string): Promise<void> {
    const limits: [string, number][] = [
      [accountKey(email), PER_ACCOUNT],
      [ipKey(ip), PER_IP],
    ];
    for (const [key, max] of limits) {
      if (await rateLimiter.tooManyAttempts(redis, key, max)) {
        const seconds = await rateLimiter.availableIn(redis, key);
        throw new HttpError(
          429,
          {
            code: 'too_many_attempts',
            message: t('identity.signIn.errors.tooMany', { minutes: Math.ceil(seconds / 60) }),
          },
          { 'Retry-After': String(seconds) },
        );
      }
    }
  },

  async recordFailure(redis: Redis, email: string, ip: string): Promise<void> {
    await rateLimiter.hit(redis, accountKey(email), WINDOW_SECONDS);
    await rateLimiter.hit(redis, ipKey(ip), WINDOW_SECONDS);
  },

  async clearAccount(redis: Redis, email: string): Promise<void> {
    await rateLimiter.clear(redis, accountKey(email));
  },
};
