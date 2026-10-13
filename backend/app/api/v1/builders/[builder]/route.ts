import { viewBuilderProfile } from '@/src/actions/directory/view-builder-profile';
import { apiStack, handle } from '@/src/http/pipeline';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const stack = apiStack;

/** One builder's profile for members and, when it is open to everyone, visitors (L2-011). */
export const GET = handle(stack, async (ctx) =>
  Response.json(await viewBuilderProfile(ctx.deps.db, ctx.params.builder, ctx.user)),
);
