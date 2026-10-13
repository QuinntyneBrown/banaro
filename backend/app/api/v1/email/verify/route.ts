import { verifyEmail } from '@/src/actions/identity/verify-email';
import { apiStack, handle } from '@/src/http/pipeline';
import { VerifyEmailRequest } from '@/src/http/requests/identity/verify-email-request';
import { validate } from '@/src/http/validation/validate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const stack = apiStack;

/** Opens a verification link; the page calls it during server-side rendering (D-021). */
export const POST = handle(stack, async (ctx) => {
  const { token } = await validate(VerifyEmailRequest, ctx.req);
  await verifyEmail(token, ctx.deps);
  return new Response(null, { status: 204 });
});
