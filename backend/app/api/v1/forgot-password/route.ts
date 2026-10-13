import { throttle } from '@/src/http/middleware/throttle';
import { apiStack, handle } from '@/src/http/pipeline';
import { PasswordResetLinkRequest } from '@/src/http/requests/identity/password-reset-requests';
import { validate } from '@/src/http/validation/validate';
import { sendPasswordResetLink } from '@/src/jobs/identity/send-password-reset-link';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const stack = [...apiStack, throttle('password-reset')];

/** The same 202 for any well-formed address; the worker decides whether to e-mail (L2-004). */
export const POST = handle(stack, async (ctx) => {
  const { email } = await validate(PasswordResetLinkRequest, ctx.req);
  await ctx.deps.queue.dispatch(sendPasswordResetLink, email);
  return Response.json({}, { status: 202 });
});
