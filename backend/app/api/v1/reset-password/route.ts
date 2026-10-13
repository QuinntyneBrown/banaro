import { resetPassword } from '@/src/actions/identity/reset-password';
import { apiStack, handle } from '@/src/http/pipeline';
import { ResetPasswordRequest } from '@/src/http/requests/identity/password-reset-requests';
import { validate } from '@/src/http/validation/validate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const stack = apiStack;

export const POST = handle(stack, async (ctx) => {
  const { email, token, password } = await validate(ResetPasswordRequest, ctx.req);
  await resetPassword(email, token, password, ctx);
  return new Response(null, { status: 204 });
});
