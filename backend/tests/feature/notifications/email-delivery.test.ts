// Acceptance Test
// Traces to: L2-029, L2-037
// Description:
// Given a notification that is sent twice with the same id, as a queue retry does, when the mail
// channel runs, then one e-mail is delivered. Given a notification with an e-mail category, then its
// e-mail carries a working one-click unsubscribe link for that category, in the body and in the
// List-Unsubscribe headers. Given security e-mail with no category, then it has no unsubscribe link.
// Given the mail provider fails, then the delivery is recorded as failed and the failure is logged
// with the notification id.

import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { deps, setDeps } from '@/src/container';
import { orm } from '@/src/db/orm';
import { emailDeliveries } from '@/src/db/schema/notifications';
import type { User } from '@/src/db/schema/users';
import { createLogger } from '@/src/logging';
import {
  deliverNotification,
  notifyMember,
  type DeliveryPayload,
} from '@/src/notifications/member-notification';
import { verifyUnsubscribeToken } from '@/src/services/settings/unsubscribe-token-service';
import { FakeQueue, InMemoryMailer } from '../../support/fakes';
import { createUser } from '../../support/members';
import { probeNotification } from '../../support/probe-notification';
import type { EmailCategory } from '@/src/services/settings/email-preference-service';

class BrokenMailer extends InMemoryMailer {
  async send(): Promise<void> {
    throw new Error('provider down');
  }
}

/** The delivery that notifying the member queues. */
const queued = async (member: User, category: EmailCategory | null = 'project_activity') => {
  const queue = new FakeQueue();
  setDeps({ queue });
  await notifyMember(deps(), member, probeNotification('p1', category));
  return queue.payloads(deliverNotification)[0];
};

const deliveryOf = async (payload: DeliveryPayload) =>
  (
    await orm(deps().db)
      .select()
      .from(emailDeliveries)
      .where(eq(emailDeliveries.notificationId, payload.notificationId))
  )[0];

describe('e-mail delivery', () => {
  it('delivers one e-mail when the same notification is sent twice', async () => {
    const member = await createUser();
    const mailer = new InMemoryMailer();
    setDeps({ mailer });
    const payload = await queued(member);

    await deliverNotification.handle(payload, deps());
    await deliverNotification.handle(payload, deps());

    expect(mailer.sent).toHaveLength(1);
    const delivery = await deliveryOf(payload);
    expect(delivery.status).toBe('sent');
    expect(delivery.sentAt).not.toBeNull();
    expect(delivery.userId).toBe(member.id);
    expect(delivery.category).toBe('project_activity');
  });

  it('carries a working unsubscribe link and headers on a categorised e-mail', async () => {
    const member = await createUser();
    const mailer = new InMemoryMailer();
    setDeps({ mailer });

    await deliverNotification.handle(await queued(member), deps());

    const [mail] = mailer.sent;
    expect(mail.headers?.['List-Unsubscribe-Post']).toBe('List-Unsubscribe=One-Click');
    const token = /token=([^>\s&]+)/.exec(mail.headers?.['List-Unsubscribe'] ?? '')![1];
    const link = await verifyUnsubscribeToken(deps().db, token);
    expect(link?.user.id).toBe(member.id);
    expect(link?.category).toBe('project_activity');
    expect(mail.html).toContain(token);
  });

  it('puts no unsubscribe link on security e-mail', async () => {
    const member = await createUser();
    const mailer = new InMemoryMailer();
    setDeps({ mailer });
    const payload = await queued(member, null);

    await deliverNotification.handle(payload, deps());

    const [mail] = mailer.sent;
    expect(mail.headers ?? {}).not.toHaveProperty('List-Unsubscribe');
    expect(mail.html?.toLowerCase()).not.toContain('unsubscribe');
    expect((await deliveryOf(payload)).category).toBeNull();
  });

  it('records a failed delivery and logs it with the notification id', async () => {
    const member = await createUser();
    const lines: Record<string, unknown>[] = [];
    setDeps({
      mailer: new BrokenMailer(),
      logger: createLogger({ write: (line: string) => lines.push(JSON.parse(line)) }, 'info'),
    });
    const payload = await queued(member);

    await expect(deliverNotification.handle(payload, deps())).rejects.toThrow('provider down');
    await deliverNotification.failed!(payload, deps(), new Error('provider down'));

    const delivery = await deliveryOf(payload);
    expect(delivery.status).toBe('failed');
    expect(delivery.failedAt).not.toBeNull();
    expect(delivery.attempts).toBe(1);
    const failures = lines.filter((line) => line.msg === 'email.delivery_failed');
    expect(failures).toHaveLength(1);
    expect(failures[0].notification_id).toBe(payload.notificationId);
  });

  it('delivers once when a retry follows a failed attempt', async () => {
    const member = await createUser();
    setDeps({ mailer: new BrokenMailer() });
    const payload = await queued(member);
    await expect(deliverNotification.handle(payload, deps())).rejects.toThrow();

    const mailer = new InMemoryMailer();
    setDeps({ mailer });
    await deliverNotification.handle(payload, deps());
    await deliverNotification.handle(payload, deps());

    expect(mailer.sent).toHaveLength(1);
    const delivery = await deliveryOf(payload);
    expect(delivery.status).toBe('sent');
    expect(delivery.attempts).toBe(2);
  });
});
