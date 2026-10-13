import { and, eq, isNull } from 'drizzle-orm';
import { deps } from '../../../../src/container';
import { orm } from '../../../../src/db/orm';
import { notifications } from '../../../../src/db/schema/notifications';
import type { User } from '../../../../src/db/schema/users';
import { notifyMember } from '../../../../src/notifications/member-notification';
import { probeNotification } from '../../../support/probe-notification';
import type { RouteOwnershipFixture, Scenario } from './ownership';

async function ownersNotification(owner: User): Promise<Scenario> {
  await notifyMember(deps(), owner, probeNotification('sentinel-subject'));
  const [row] = await orm(deps().db)
    .select()
    .from(notifications)
    .where(eq(notifications.notifiableId, owner.id));
  return {
    params: { notification: row.id },
    // The id is the caller's own input on a by-id route, so it is not a sentinel.
    sentinels: ['sentinel-subject', owner.email],
    intact: async () =>
      (await orm(deps().db).$count(
        notifications,
        and(eq(notifications.notifiableId, owner.id), isNull(notifications.readAt)),
      )) === 1,
  };
}

const withoutParams = async (owner: User): Promise<Scenario> => {
  const { sentinels, intact } = await ownersNotification(owner);
  return { sentinels, intact };
};

export const notificationsFixtures: RouteOwnershipFixture[] = [
  { route: 'GET /api/v1/notifications', expect: 'self_only', arrange: withoutParams },
  { route: 'GET /api/v1/notifications/unread-count', expect: 'self_only', arrange: withoutParams },
  { route: 'POST /api/v1/notifications/read-all', expect: 'self_only', arrange: withoutParams },
  // Another member's notification id answers 404 (L2-027 criterion 5, L2-044 criterion 1).
  {
    route: 'POST /api/v1/notifications/[notification]/read',
    expect: 'not_found',
    arrange: ownersNotification,
  },
];
