import type { Deps } from '../../container';
import { HttpError } from '../../http/pipeline';
import {
  consumeVerificationLink,
  userForVerificationLink,
} from '../../services/identity/email-verification-service';
import { t } from '../../services/user-experience/catalogue-service';

/**
 * Verifies through a link. One code covers expired, unknown and used links, so the answer does not
 * say which check failed (L2-002 criterion 2). `link_known` says only whether the link was ever
 * issued, so the page can send someone with a made-up link to sign in instead (D-022). Opening a
 * link signs no one in (criterion 7).
 */
export async function verifyEmail(token: string, deps: Deps): Promise<void> {
  if (await consumeVerificationLink(deps.db, token)) return;
  throw new HttpError(422, {
    code: 'verification_link_invalid',
    message: t('identity.verify.errors.invalid'),
    link_known: (await userForVerificationLink(deps.db, token)) !== null,
  });
}
