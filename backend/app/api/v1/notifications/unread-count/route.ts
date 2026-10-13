import { countUnreadNotifications } from '@/src/actions/notifications/notifications';
import { handle, verifiedStack } from '@/src/http/pipeline';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const stack = verifiedStack;

/** How many of the member's notifications are unread (L2-027). */
export const GET = handle(stack, async (ctx) =>
  Response.json({ count: await countUnreadNotifications(ctx.deps.db, ctx.user!) }),
);
