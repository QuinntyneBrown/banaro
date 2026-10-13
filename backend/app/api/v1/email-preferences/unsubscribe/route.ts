import { z } from 'zod';
import { throttle } from '@/src/http/middleware/throttle';
import { apiStack, handle, HttpError } from '@/src/http/pipeline';
import { validate } from '@/src/http/validation/validate';
import { setEmailPreference } from '@/src/services/settings/email-preference-service';
import { verifyUnsubscribeToken } from '@/src/services/settings/unsubscribe-token-service';
import { t } from '@/src/services/user-experience/catalogue-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const stack = [...apiStack, throttle('unsubscribe')];

/**
 * A missing or empty token is not a validation error: like a forged one it answers 422
 * `invalid_unsubscribe_link` (L2-037 criterion 3).
 */
const UnsubscribeRequest = z.object({ token: z.string().max(512).nullish() });

/** Anonymous: the signed token in the link is the credential (L2-037 criteria 2 and 3). */
export const POST = handle(stack, async (ctx) => {
  const { token } = await validate(UnsubscribeRequest, ctx.req);
  const link = await verifyUnsubscribeToken(ctx.deps.db, token ?? '');
  if (!link) {
    throw new HttpError(422, {
      code: 'invalid_unsubscribe_link',
      message: t('settings.unsubscribe.invalid'),
    });
  }
  await setEmailPreference(ctx.deps.db, link.user.id, link.category, false);
  return Response.json({ category: link.category });
});
