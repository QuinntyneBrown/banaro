import { markNotificationRead } from '@/src/actions/notifications/notifications';
import { handle, verifiedStack } from '@/src/http/pipeline';
import { notificationResource } from '@/src/http/resources/notifications/notification-resource';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const stack = verifiedStack;

/** Marks one of the member's own notifications read; another member's answers 404 (L2-027). */
export const POST = handle(stack, async (ctx) =>
  Response.json(
    notificationResource(
      await markNotificationRead(ctx.deps.db, ctx.user!, ctx.params.notification),
    ),
  ),
);
