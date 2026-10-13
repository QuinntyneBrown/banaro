import { signIn } from '@/src/actions/identity/sign-in';
import { signOut } from '@/src/actions/identity/sign-out';
import { apiStack, handle, memberStack } from '@/src/http/pipeline';
import { SignInRequest } from '@/src/http/requests/identity/sign-in-request';
import { sessionResource } from '@/src/http/resources/identity/session-resource';
import { validate } from '@/src/http/validation/validate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const stack = { GET: apiStack, POST: apiStack, DELETE: memberStack };

/** The signed-in member, or null: visitors read their empty session (L2-003). */
export const GET = handle(stack.GET, async (ctx) =>
  Response.json(await sessionResource(ctx.user, ctx.deps)),
);

export const POST = handle(stack.POST, async (ctx) => {
  const { email, password } = await validate(SignInRequest, ctx.req);
  return Response.json(await sessionResource(await signIn(email, password, ctx), ctx.deps));
});

export const DELETE = handle(stack.DELETE, async (ctx) => {
  signOut(ctx);
  return new Response(null, { status: 204 });
});
