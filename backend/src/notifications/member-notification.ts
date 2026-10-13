import { randomUUID } from 'node:crypto';
import { and, eq, sql } from 'drizzle-orm';
import { nowStamp } from '../clock';
import type { Deps } from '../container';
import type { JobDefinition } from '../contracts/queue';
import { orm } from '../db/orm';
import { emailDeliveries, notifications, type NotificationData } from '../db/schema/notifications';
import { users, type User } from '../db/schema/users';
import { renderMail, webUrl, type MailContent } from '../mail/layout';
import { emailAllowed, type EmailCategory } from '../services/settings/email-preference-service';
import { issueUnsubscribeToken } from '../services/settings/unsubscribe-token-service';
import { isBlockedEitherWay, sqlBlockScope } from '../services/trust-and-safety/block-service';
import { t } from '../services/user-experience/catalogue-service';

/** The `notifiable_type` the Laravel API wrote; kept so existing rows and fixtures still match. */
export const MEMBER_NOTIFIABLE = 'App\\Models\\User';

export type NotificationMail = MailContent & { subject: string };

/**
 * Activity that concerns a member (L2-027, L2-029). It always writes the in-app row and sends
 * e-mail unless the member turned the category off; a null category is security-class and always
 * sends. Send it with `notifyMember`.
 */
export interface MemberNotification {
  /** Names the producer in the `type` column. */
  type: string;
  kind: string;
  category: EmailCategory | null;
  /** What selecting the notification opens. */
  subject: { type: string; id: string };
  /** Values the page puts in the sentence. */
  params: NotificationData['params'];
  /** The member who caused it, so a block hides it; null for system events. */
  actorUserId: number | null;
  /** The e-mail without its footer; delivery adds the unsubscribe link. */
  mail(member: User): NotificationMail;
}

/** A queued notification e-mail, rendered when it was queued. */
export interface DeliveryPayload {
  notificationId: string;
  userId: number;
  kind: string;
  category: EmailCategory | null;
  mail: NotificationMail;
}

/** The one way to tell a member about activity: a block in either direction drops it (L2-032). */
export async function notifyMember(
  deps: Deps,
  member: User,
  notification: MemberNotification,
): Promise<void> {
  const actor = notification.actorUserId;
  if (actor !== null && (await isBlockedEitherWay(deps.db, member.id, actor))) return;

  const id = randomUUID();
  const now = nowStamp();
  await orm(deps.db)
    .insert(notifications)
    .values({
      id,
      type: notification.type,
      notifiableType: MEMBER_NOTIFIABLE,
      notifiableId: member.id,
      data: {
        kind: notification.kind,
        subject: notification.subject,
        params: notification.params,
        actor_user_id: actor,
      },
      createdAt: now,
      updatedAt: now,
    });
  await deps.queue.dispatch(deliverNotification, {
    notificationId: id,
    userId: member.id,
    kind: notification.kind,
    category: notification.category,
    mail: notification.mail(member),
  });
}

/** The member's own rows, leaving out those whose actor is blocked either way (L2-032). */
export const visibleTo = (member: User) =>
  and(
    eq(notifications.notifiableType, MEMBER_NOTIFIABLE),
    eq(notifications.notifiableId, member.id),
    sqlBlockScope(member.id, sql`(${notifications.data}->>'actor_user_id')::bigint`),
  );

/** The one-click unsubscribe line and List-Unsubscribe headers (L2-029 criterion 3). */
function unsubscribeFooter(userId: number, category: EmailCategory) {
  const token = issueUnsubscribeToken(userId, category);
  const page = webUrl(`/unsubscribe?token=${token}`);
  const api = (process.env.APP_URL ?? 'http://localhost:8100').replace(/\/$/, '');
  const oneClick = `${api}/api/v1/email-preferences/unsubscribe?token=${token}`;
  const name = category.replace(/_(\w)/g, (_, letter: string) => letter.toUpperCase());
  return {
    footer: t('email.unsubscribe.line', {
      category: t(`email.unsubscribe.categories.${name}`),
      url: page,
    }),
    headers: {
      'List-Unsubscribe': `<${oneClick}>, <${page}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  };
}

/**
 * Sends a notification's e-mail. It records one delivery per notification id and sends nothing
 * once that row says sent, so a retried job never mails twice (L2-029 criterion 1).
 */
export const deliverNotification: JobDefinition<DeliveryPayload> = {
  name: 'DeliverNotification',
  queue: 'mail',
  // Five retries after the first attempt (L2-029 criterion 4).
  attempts: 6,
  backoff: [60, 300, 900, 3600, 10800],
  async handle({ notificationId, userId, category, mail }, deps) {
    if (category !== null && !(await emailAllowed(deps.db, userId, category))) return;
    const db = orm(deps.db);
    const [member] = await db.select().from(users).where(eq(users.id, userId));
    if (!member) return;

    await db
      .insert(emailDeliveries)
      .values({ notificationId, userId, category, createdAt: nowStamp(), updatedAt: nowStamp() })
      .onConflictDoNothing({ target: emailDeliveries.notificationId });
    const [delivery] = await db
      .select()
      .from(emailDeliveries)
      .where(eq(emailDeliveries.notificationId, notificationId));
    if (delivery.status === 'sent') return;

    await db
      .update(emailDeliveries)
      .set({ attempts: sql`${emailDeliveries.attempts} + 1`, updatedAt: nowStamp() })
      .where(eq(emailDeliveries.id, delivery.id));
    const { subject, ...content } = mail;
    const extra = category === null ? null : unsubscribeFooter(userId, category);
    await deps.mailer.send({
      to: member.email,
      subject,
      ...renderMail({ ...content, footer: extra?.footer }),
      ...(extra ? { headers: extra.headers } : {}),
    });
    await db
      .update(emailDeliveries)
      .set({ status: 'sent', sentAt: nowStamp(), updatedAt: nowStamp() })
      .where(eq(emailDeliveries.id, delivery.id));
  },
  /** After the last attempt: records the failure and logs it for the alert (L2-029, D-058). */
  async failed({ notificationId, kind }, deps, error) {
    await orm(deps.db)
      .update(emailDeliveries)
      .set({ status: 'failed', failedAt: nowStamp(), updatedAt: nowStamp() })
      .where(eq(emailDeliveries.notificationId, notificationId));
    deps.logger.error(
      { notification_id: notificationId, kind, error: error.name },
      'email.delivery_failed',
    );
  },
};
