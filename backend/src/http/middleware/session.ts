import { eq } from 'drizzle-orm';
import { orm } from '../../db/orm';
import { users } from '../../db/schema/users';
import type { Middleware } from '../pipeline';
import { readCookie, Session, SESSION_COOKIE } from '../session';

const ABSOLUTE_LIFETIME_SECONDS =
  Number(process.env.BANARO_SESSION_ABSOLUTE_LIFETIME_DAYS ?? 90) * 24 * 3600;

const STATEFUL = (process.env.STATEFUL_DOMAINS ?? 'localhost:4300,localhost:4301,localhost:8100')
  .split(',')
  .map((domain) => domain.trim());

function sessionMiddleware(always: boolean): Middleware {
  return async (ctx, next) => {
    if (!always && !isFirstParty(ctx.req)) return next();

    const redis = ctx.deps.redis;
    ctx.session =
      (await Session.load(redis, readCookie(ctx.req, SESSION_COOKIE))) ?? Session.start();
    // However active, a session ends 90 days after sign-in (L2-005 criterion 5).
    const signedInAt = ctx.session.data.authenticatedAt;
    if (signedInAt && Date.now() / 1000 - signedInAt > ABSOLUTE_LIFETIME_SECONDS) {
      ctx.session.invalidate();
    }
    const userId = ctx.session.data.userId;
    if (userId) {
      const [user] = await orm(ctx.deps.db).select().from(users).where(eq(users.id, userId));
      ctx.user = user ?? null;
      // A changed password ends every session that began before the change (L2-004 criterion 10).
      if (user && ctx.session.data.passwordHash !== user.password) {
        ctx.session.invalidate();
        ctx.user = null;
      }
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
