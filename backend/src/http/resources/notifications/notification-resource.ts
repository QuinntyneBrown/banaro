import { isoStamp } from '../../../clock';
import type { Notification } from '../../../db/schema/notifications';

/** One notification as the page reads it (L2-027). */
export const notificationResource = (row: Notification) => ({
  id: row.id,
  kind: row.data.kind,
  subject: row.data.subject,
  params: row.data.params ?? {},
  read_at: row.readAt ? isoStamp(row.readAt) : null,
  created_at: row.createdAt ? isoStamp(row.createdAt) : null,
});
