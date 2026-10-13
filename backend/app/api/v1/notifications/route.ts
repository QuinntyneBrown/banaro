import { listNotifications } from '@/src/actions/notifications/notifications';
import { handle, verifiedStack } from '@/src/http/pipeline';
import { ListNotificationsRequest } from '@/src/http/requests/notifications/list-notifications-request';
import { notificationResource } from '@/src/http/resources/notifications/notification-resource';
import { validate } from '@/src/http/validation/validate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const stack = verifiedStack;

/** The member's own notifications, newest first (L2-027 criterion 1). */
export const GET = handle(stack, async (ctx) => {
  const { page, perPage } = await validate(ListNotificationsRequest, ctx.req);
  const result = await listNotifications(ctx.deps.db, ctx.user!, page, perPage);
  return Response.json({
    items: result.rows.map(notificationResource),
    total: result.total,
    page,
    per_page: perPage,
    last_page: result.lastPage,
  });
});
