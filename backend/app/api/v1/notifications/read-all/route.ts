import { markAllNotificationsRead } from '@/src/actions/notifications/notifications';
import { handle, verifiedStack } from '@/src/http/pipeline';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const stack = verifiedStack;

/** Marks all of the member's notifications read (L2-027). */
export const POST = handle(stack, async (ctx) => {
  await markAllNotificationsRead(ctx.deps.db, ctx.user!);
  return new Response(null, { status: 204 });
});
