import { createHash } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { orm } from '../../db/orm';
import { canonicalEmail, users, type User } from '../../db/schema/users';
import { HttpError, type Ctx } from '../../http/pipeline';
import { rateLimiter } from '../../http/rate-limiter';
import { sendMail } from '../../jobs/send-mail';
import { verifyEmailMail } from '../../mail/templates/identity';
import {
  issueVerificationLink,
  userForVerificationLink,
} from '../../services/identity/email-verification-service';
import { clientIp } from '../../services/security/client-fingerprint';
import { t } from '../../services/user-experience/catalogue-service';

const PER_HOUR = 3;

/**
 * Sends a new link to an unverified account found from the session, then a link's token, then the
 * address. Verified and unknown accounts get nothing, and every accepted request looks the same; at
 * most 3 per hour per account or identifier (L2-002 criteria 3, 5 and 6).
 */
export async function resendVerificationEmail(
  token: string | null | undefined,
  rawEmail: string | null | undefined,
  ctx: Ctx,
): Promise<void> {
  const { db, cache, queue } = ctx.deps;
  const email = rawEmail ? canonicalEmail(rawEmail) : null;
  let user: User | null = ctx.user;
  if (!user && token) user = await userForVerificationLink(db, token);
  if (!user && email) {
    [user = null] = await orm(db).select().from(users).where(eq(users.email, email));
  }

  const identifier = user
    ? `user:${user.id}`
    : `anon:${createHash('sha256')
        .update(token ?? email ?? clientIp(ctx.req))
        .digest('hex')}`;
  const key = `verification-resend:${identifier}`;
  if (await rateLimiter.tooManyAttempts(cache, key, PER_HOUR)) {
    const seconds = await rateLimiter.availableIn(cache, key);
    throw new HttpError(
      429,
      {
        code: 'too_many_requests',
        message: t('identity.verify.errors.tooMany', { minutes: Math.ceil(seconds / 60) }),
      },
      { 'Retry-After': String(seconds) },
    );
  }
  await rateLimiter.hit(cache, key, 3600);

  if (user && user.emailVerifiedAt === null) {
    const link = await issueVerificationLink(db, user.id);
    await queue.dispatch(sendMail, verifyEmailMail(user, link));
  }
}
