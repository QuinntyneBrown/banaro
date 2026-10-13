import { nowStamp } from '../../../../src/clock';
import { deps } from '../../../../src/container';
import { orm } from '../../../../src/db/orm';
import type { User } from '../../../../src/db/schema/users';
import { emailPreferences } from '../../../../src/services/settings/email-preference-service';
import { snapshot, type RouteOwnershipFixture, type Scenario } from './ownership';

const privacy = async (owner: User): Promise<Scenario> => ({
  body: {
    profile_visibility: 'everyone',
    location_precision: 'city',
    email_contact: true,
    show_online_status: false,
    list_in_attendees: true,
  },
  sentinels: [owner.email],
  intact: await snapshot('privacy_settings', 'user_id', owner.id),
});

const preferences = async (owner: User): Promise<Scenario> => {
  await orm(deps().db).insert(emailPreferences).values({
    userId: owner.id,
    category: 'messages',
    enabled: false,
    createdAt: nowStamp(),
    updatedAt: nowStamp(),
  });
  return {
    params: { category: 'messages' },
    body: { enabled: true },
    sentinels: [owner.email],
    intact: await snapshot('email_preferences', 'user_id', owner.id),
  };
};

// Settings routes name no record: they read or change the signed-in member's own settings (L2-036,
// L2-037).
export const settingsFixtures: RouteOwnershipFixture[] = [
  { route: 'GET /api/v1/settings/privacy', expect: 'self_only', arrange: privacy },
  { route: 'PUT /api/v1/settings/privacy', expect: 'self_only', arrange: privacy },
  { route: 'GET /api/v1/settings/email-preferences', expect: 'self_only', arrange: preferences },
  {
    route: 'PUT /api/v1/settings/email-preferences/[category]',
    expect: 'self_only',
    arrange: preferences,
  },
];
