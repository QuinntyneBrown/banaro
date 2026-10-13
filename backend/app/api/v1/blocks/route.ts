import { blockedByMember } from '@/src/actions/trust-and-safety/blocks';
import { handle, verifiedStack } from '@/src/http/pipeline';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const stack = verifiedStack;

/** The member's own blocks; the blocker always comes from the session (L2-032, L2-044). */
export const GET = handle(stack, async (ctx) =>
  Response.json(await blockedByMember(ctx.deps.db, ctx.user!)),
);
