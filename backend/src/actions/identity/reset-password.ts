import { randomBytes } from 'node:crypto';
import { eq } from 'drizzle-orm';
import type pg from 'pg';
import { nowStamp } from '../../clock';
import { orm } from '../../db/orm';
import { canonicalEmail, users, type User } from '../../db/schema/users';
import { HttpError, type Ctx } from '../../http/pipeline';
import { ValidationError } from '../../http/validation/validate';
import { sendMail } from '../../jobs/send-mail';
import { passwordChangedMail } from '../../mail/templates/identity';
import { checkPassword, hashPassword } from '../../services/identity/password-policy';
import { deleteResetToken, resetTokenIsValid } from '../../services/identity/password-reset-tokens';
import { t } from '../../services/user-experience/catalogue-service';

/** The account of an unexpired, unused link, or 422 `reset_link_invalid`. */
export async function userForResetLink(db: pg.Pool, email: string, token: string): Promise<User> {
  const [user] = await orm(db)
    .select()
    .from(users)
    .where(eq(users.email, canonicalEmail(email)));
  if (!user || !(await resetTokenIsValid(db, user, token))) {
    throw new HttpError(422, {
      code: 'reset_link_invalid',
      message: t('identity.reset.error.title'),
    });
  }
  return user;
}

/**
 * Sets a new password through a reset link under 60 minutes old, once (L2-004). The link proves
 * control of the address, so it also verifies it (criterion 8). The new hash ends every other
 * session on its next request, and this request's session ends at once (criterion 10).
 */
export async function resetPassword(
  email: string,
  token: string,
  password: string,
  ctx: Ctx,
): Promise<void> {
  const { db, queue } = ctx.deps;
  const user = await userForResetLink(db, email, token);
  if (await checkPassword(password, user.password)) {
    throw new ValidationError({ password: [t('identity.reset.errors.same')] });
  }

  const hash = await hashPassword(password);
  await orm(db).transaction(async (tx) => {
    await tx
      .update(users)
      .set({
        password: hash,
        rememberToken: randomBytes(45).toString('base64url').slice(0, 60),
        emailVerifiedAt: user.emailVerifiedAt ?? nowStamp(),
        updatedAt: nowStamp(),
      })
      .where(eq(users.id, user.id));
    await deleteResetToken(tx, user.email);
  });

  if (ctx.user) {
    ctx.session?.invalidate();
    ctx.user = null;
  }
  await queue.dispatch(sendMail, passwordChangedMail(user));
}
