import { eq } from 'drizzle-orm';
import type { JobDefinition } from '../../contracts/queue';
import { orm } from '../../db/orm';
import { canonicalEmail, users } from '../../db/schema/users';
import { resetPasswordMail } from '../../mail/templates/identity';
import { createResetToken } from '../../services/identity/password-reset-tokens';

/**
 * Looks the address up off the request path, so the answer and its timing never depend on whether
 * it is registered (L2-004 criterion 1). A new token replaces any earlier one.
 */
export const sendPasswordResetLink: JobDefinition<string> = {
  name: 'SendPasswordResetLink',
  queue: 'mail',
  attempts: 5,
  backoff: [10, 60, 300, 900],
  async handle(email, deps) {
    const [user] = await orm(deps.db)
      .select()
      .from(users)
      .where(eq(users.email, canonicalEmail(email)));
    if (!user) return;
    await deps.mailer.send(resetPasswordMail(user, await createResetToken(deps.db, user)));
  },
};
