import { joinBanaro } from '@/src/actions/identity/join-banaro';
import { throttle } from '@/src/http/middleware/throttle';
import { apiStack, handle } from '@/src/http/pipeline';
import { JoinBanaroRequest } from '@/src/http/requests/identity/join-banaro-request';
import { validate } from '@/src/http/validation/validate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const stack = [...apiStack, throttle('join')];

/** Visitors join. The same 202 whether or not the address was new (L2-001 criterion 3). */
export const POST = handle(stack, async (ctx) => {
  const { name, email, password } = await validate(JoinBanaroRequest, ctx.req);
  await joinBanaro(name, email, password, ctx.deps);
  return Response.json({}, { status: 202 });
});
