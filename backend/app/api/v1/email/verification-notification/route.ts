import { resendVerificationEmail } from '@/src/actions/identity/resend-verification-email';
import { apiStack, handle } from '@/src/http/pipeline';
import { ResendVerificationEmailRequest } from '@/src/http/requests/identity/verify-email-request';
import { validate } from '@/src/http/validation/validate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const stack = apiStack;

/** The same 202 whether a link was sent or not (L2-002 criterion 5). */
export const POST = handle(stack, async (ctx) => {
  const { token, email } = await validate(ResendVerificationEmailRequest, ctx.req);
  await resendVerificationEmail(token, email, ctx);
  return Response.json({}, { status: 202 });
});
