import { eq } from 'drizzle-orm';
import { orm } from '../../db/orm';
import { canonicalEmail, users, type User } from '../../db/schema/users';
import { HttpError, type Ctx } from '../../http/pipeline';
import { sendMail } from '../../jobs/send-mail';
import { newSignInMail } from '../../mail/templates/identity';
import { browserName, recordSignIn } from '../../services/identity/sign-in-history';
import { checkPassword, PASSWORD_MAX } from '../../services/identity/password-policy';
import { signInThrottle } from '../../services/identity/sign-in-throttle';
import { clientIp } from '../../services/security/client-fingerprint';
import { t } from '../../services/user-experience/catalogue-service';

/** A cost-12 hash checked when no account matches, so unknown addresses take as long (L2-003). */
const DUMMY_HASH = '$2y$12$e8Ku5IasaXd00BF06JTnp.9czUns8UKaP3i9rloo8NiLkVTQaDJmW';

/**
 * Starts a session under a new identifier for matching credentials; anything else is one generic
 * failure that counts toward the throttle (L2-003).
 */
export async function signIn(email: string, password: string, ctx: Ctx): Promise<User> {
  const { cache } = ctx.deps;
  const ip = clientIp(ctx.req);
  await signInThrottle.check(cache, email, ip);

  const [user] = await orm(ctx.deps.db)
    .select()
    .from(users)
    .where(eq(users.email, canonicalEmail(email)));
  // Over-long passwords are a failed attempt, never an error that names the field (criterion 9).
  const tooLong = [...password].length > PASSWORD_MAX;
  const matches = await checkPassword(tooLong ? '' : password, user?.password ?? DUMMY_HASH);

  if (!user || tooLong || !matches) {
    await signInThrottle.recordFailure(cache, email, ip);
    throw new HttpError(422, {
      code: 'invalid_credentials',
      message: t('identity.signIn.errors.mismatch'),
    });
  }

  await signInThrottle.clearAccount(cache, email);
  const session = ctx.session!;
  session.regenerate();
  session.data.userId = user.id;
  session.data.authenticatedAt = Math.floor(Date.now() / 1000);
  session.data.passwordHash = user.password;
  ctx.user = user;

  // A new device on an account that signed in before gets a security e-mail (criterion 10).
  const userAgent = ctx.req.headers.get('User-Agent') ?? '';
  if (await recordSignIn(ctx.deps.db, user.id, userAgent, ip)) {
    await ctx.deps.queue.dispatch(
      sendMail,
      newSignInMail(user, new Date(), browserName(userAgent)),
    );
  }
  return user;
}
