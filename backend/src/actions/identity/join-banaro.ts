import { eq } from 'drizzle-orm';
import { nowStamp } from '../../clock';
import type { Deps } from '../../container';
import { isUniqueViolation } from '../../db/errors';
import { orm } from '../../db/orm';
import { canonicalEmail, users } from '../../db/schema/users';
import { sendMail } from '../../jobs/send-mail';
import { accountExistsMail, verifyEmailMail } from '../../mail/templates/identity';
import { issueVerificationLink } from '../../services/identity/email-verification-service';
import { hashPassword } from '../../services/identity/password-policy';

export const CODE_OF_CONDUCT_VERSION = process.env.BANARO_CODE_OF_CONDUCT_VERSION ?? '2026-09-01';

/**
 * Creates an unverified account and queues the verification e-mail; for a registered address it
 * creates nothing and tells the owner instead. Both paths hash the password, so they take similar
 * time (L2-001).
 */
export async function joinBanaro(
  name: string,
  rawEmail: string,
  password: string,
  deps: Deps,
): Promise<void> {
  const email = canonicalEmail(rawEmail);
  const hash = await hashPassword(password);
  const db = orm(deps.db);

  const tellOwner = async () => {
    const [existing] = await db.select().from(users).where(eq(users.email, email));
    if (existing) await deps.queue.dispatch(sendMail, accountExistsMail(existing));
  };

  const [found] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  if (found) return tellOwner();

  let user;
  try {
    [user] = await db
      .insert(users)
      .values({
        name,
        email,
        password: hash,
        codeOfConductVersion: CODE_OF_CONDUCT_VERSION,
        codeOfConductAcceptedAt: nowStamp(),
        createdAt: nowStamp(),
        updatedAt: nowStamp(),
      })
      .returning();
  } catch (error) {
    // A concurrent join won the race: treat it as the registered-address path.
    if (isUniqueViolation(error)) return tellOwner();
    throw error;
  }

  const link = await issueVerificationLink(deps.db, user.id);
  await deps.queue.dispatch(sendMail, verifyEmailMail(user, link));
}
