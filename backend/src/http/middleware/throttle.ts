import { canonicalEmail } from '../../db/schema/users';
import { clientHash, clientIp } from '../../services/security/client-fingerprint';
import { HttpError, type Ctx, type Middleware } from '../pipeline';
import { rateLimiter } from '../rate-limiter';

interface Limit {
  key: string;
  max: number;
  windowSeconds: number;
}

const byIp = (ctx: Ctx) => clientHash(`ip:${clientIp(ctx.req)}`);

/** The `email` field of a JSON body, read without using up the body. */
async function emailOf(req: Request): Promise<string> {
  const body = (await req
    .clone()
    .json()
    .catch(() => ({}))) as { email?: unknown };
  return canonicalEmail(typeof body.email === 'string' ? body.email : '');
}

/** Named limits; each counts against a hashed client. */
const limiters: Record<string, (ctx: Ctx) => Limit[] | Promise<Limit[]>> = {
  // Visitors write to the team at most 3 times an hour (L2-040 criterion 3).
  contact: (ctx) => [{ key: byIp(ctx), max: 3, windowSeconds: 3600 }],
  // Join: 5 attempts per address in 10 minutes (L2-001 criterion 6).
  join: (ctx) => [{ key: byIp(ctx), max: 5, windowSeconds: 600 }],
  // Reset links: 5 per hour per e-mail address and 5 per hour per client; unknown addresses count
  // too (L2-004 criterion 5).
  'password-reset': async (ctx) => [
    { key: `email:${clientHash(await emailOf(ctx.req))}`, max: 5, windowSeconds: 3600 },
    { key: `ip:${byIp(ctx)}`, max: 5, windowSeconds: 3600 },
  ],
};

/**
 * Answers 429 with Retry-After once a limit is used up; counters live in the Redis cache database,
 * shared by every API instance (L2-046).
 */
export function throttle(name: keyof typeof limiters): Middleware {
  return async (ctx, next) => {
    const redis = ctx.deps.cache;
    const limits = (await limiters[name](ctx)).map((limit) => ({
      ...limit,
      key: `limiter:${name}:${limit.key}`,
    }));

    for (const limit of limits) {
      if (await rateLimiter.tooManyAttempts(redis, limit.key, limit.max)) {
        const retryAfter = await rateLimiter.availableIn(redis, limit.key);
        ctx.deps.logger.warn({ route: ctx.route, client: byIp(ctx) }, 'rate_limit.exceeded');
        throw new HttpError(
          429,
          { message: 'Too Many Attempts.' },
          {
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(limit.max),
            'X-RateLimit-Remaining': '0',
          },
        );
      }
    }

    let remaining = Infinity;
    for (const limit of limits) {
      const hits = await rateLimiter.hit(redis, limit.key, limit.windowSeconds);
      remaining = Math.min(remaining, limit.max - hits);
    }
    const response = await next();
    response.headers.set('X-RateLimit-Limit', String(limits[0].max));
    response.headers.set('X-RateLimit-Remaining', String(remaining));
    return response;
  };
}
