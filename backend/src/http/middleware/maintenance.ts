import { MAINTENANCE_KEY } from '../../console/commands/maintenance';
import { HttpError } from '../errors';
import type { Middleware } from '../pipeline';

/**
 * While maintenance mode is on, every API request answers 503 with Retry-After and a body the web
 * app recognises (L2-043). The catalogue stays available: the maintenance page needs its text
 * (D-016). Health routes are not on the API stack, so they always answer.
 */
export const maintenance: Middleware = async (ctx, next) => {
  if (ctx.route.startsWith('/api/v1/i18n/')) return next();

  const flag = await ctx.deps.redis.get(MAINTENANCE_KEY);
  if (flag === null) return next();

  // The response time plus `retry`: the same moment the Retry-After header names (D-017).
  const { retry } = JSON.parse(flag) as { retry: number };
  const expectedBackAt = new Date(Date.now() + retry * 1000)
    .toISOString()
    .replace(/\.\d{3}Z$/, 'Z');
  throw new HttpError(
    503,
    { code: 'maintenance', expectedBackAt },
    { 'Retry-After': String(retry) },
  );
};
