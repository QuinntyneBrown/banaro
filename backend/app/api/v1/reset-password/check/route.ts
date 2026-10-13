import { userForResetLink } from '@/src/actions/identity/reset-password';
import { apiStack, handle } from '@/src/http/pipeline';
import { CheckResetLinkRequest } from '@/src/http/requests/identity/password-reset-requests';
import { validate } from '@/src/http/validation/validate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const stack = apiStack;

/** Whether a reset link still works; the page asks during server-side rendering (D-021). */
export const POST = handle(stack, async (ctx) => {
  const { email, token } = await validate(CheckResetLinkRequest, ctx.req);
  await userForResetLink(ctx.deps.db, email, token);
  return new Response(null, { status: 204 });
});
