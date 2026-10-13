import { blockBuilder, unblockBuilder } from '@/src/actions/trust-and-safety/blocks';
import { handle, verifiedStack } from '@/src/http/pipeline';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const stack = verifiedStack;

export const PUT = handle(stack, async (ctx) =>
  Response.json(await blockBuilder(ctx.deps.db, ctx.user!, ctx.params.builder)),
);

export const DELETE = handle(stack, async (ctx) => {
  await unblockBuilder(ctx.deps.db, ctx.user!, ctx.params.builder);
  return new Response(null, { status: 204 });
});
