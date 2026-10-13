import { clientHash, clientIp } from '../../services/security/client-fingerprint';
import { HttpError, type Ctx, type Middleware } from '../pipeline';

interface Limit {
  key: string;
  max: number;
  windowSeconds: number;
}

/** Named limits; each counts against a hashed client. */
const limiters: Record<string, (ctx: Ctx) => Limit[]> = {
  // Visitors write to the team at most 3 times an hour (L2-040 criterion 3).
  contact: (ctx) => [{ key: clientHash(`ip:${clientIp(ctx.req)}`), max: 3, windowSeconds: 3600 }],
};

/**
 * Answers 429 with Retry-After once a limit is used up; counters live in the Redis cache database,
 * shared by every API instance (L2-046).
 */
export function throttle(name: keyof typeof limiters): Middleware {
  return async (ctx, next) => {
    const redis = ctx.deps.cache;
    const limits = limiters[name](ctx).map((limit) => ({
      ...limit,
      key: `limiter:${name}:${limit.key}`,
    }));

    for (const limit of limits) {
      if (Number(await redis.get(limit.key)) >= limit.max) {
        const retryAfter = Math.max(await redis.ttl(limit.key), 1);
        ctx.deps.logger.warn(
          { route: ctx.route, client: clientHash(`ip:${clientIp(ctx.req)}`) },
          'rate_limit.exceeded',
        );
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
      const hits = await redis.incr(limit.key);
      if (hits === 1) await redis.expire(limit.key, limit.windowSeconds);
      remaining = Math.min(remaining, limit.max - hits);
    }
    const response = await next();
    response.headers.set('X-RateLimit-Limit', String(limits[0].max));
    response.headers.set('X-RateLimit-Remaining', String(remaining));
    return response;
  };
}
