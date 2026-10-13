import { eq } from 'drizzle-orm';
import { orm } from '../../db/orm';
import { users } from '../../db/schema/users';
import type { Middleware } from '../pipeline';
import { readCookie, Session, SESSION_COOKIE } from '../session';

const STATEFUL = (process.env.STATEFUL_DOMAINS ?? 'localhost:4300,localhost:4301,localhost:8100')
  .split(',')
  .map((domain) => domain.trim());

function sessionMiddleware(always: boolean): Middleware {
  return async (ctx, next) => {
    if (!always && !isFirstParty(ctx.req)) return next();

    const redis = ctx.deps.redis;
    ctx.session =
      (await Session.load(redis, readCookie(ctx.req, SESSION_COOKIE))) ?? Session.start();
    const userId = ctx.session.data.userId;
    if (userId) {
      const [user] = await orm(ctx.deps.db).select().from(users).where(eq(users.id, userId));
      ctx.user = user ?? null;
    }

    const response = await next();
    await ctx.session.save(redis);
    for (const cookie of ctx.session.cookies()) response.headers.append('Set-Cookie', cookie);
    return response;
  };
}

/**
 * Starts or resumes the session of a first-party browser request, one whose Origin or Referer is a
 * Banaro Web address, and loads the signed-in account. Other requests have no session, so they can
 * only act as visitors (ADR-0011).
 */
export const session = sessionMiddleware(false);

/** Always starts a session, for the route that hands out the CSRF cookie. */
export const startSession = sessionMiddleware(true);

function isFirstParty(req: Request): boolean {
  const source = req.headers.get('Origin') ?? req.headers.get('Referer');
  if (!source) return false;
  try {
    return STATEFUL.includes(new URL(source).host);
  } catch {
    return false;
  }
}
