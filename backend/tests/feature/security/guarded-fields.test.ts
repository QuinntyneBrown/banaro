// Acceptance Test
// Traces to: L2-044
// Description:
// Given a request body that carries fields the member may not set, such as owner_id, user_id, role
// or verified_at, when it is received, then those fields are ignored: a shared project belongs to
// the member who sent it, and another member's settings and profile are never written.

import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { PUT as ownProfile } from '@/app/api/v1/me/profile/route';
import { PUT as privacy } from '@/app/api/v1/settings/privacy/route';
import { deps } from '@/src/container';
import { orm } from '@/src/db/orm';
import { builders } from '@/src/db/schema/builders';
import { projects } from '@/src/db/schema/projects';
import { privacySettings } from '@/src/db/schema/settings';
import { users } from '@/src/db/schema/users';
import { actingAs, createMember } from '../../support/members';
import { share } from '../../support/projects';

const builderOf = async (userId: number) =>
  (await orm(deps().db).select().from(builders).where(eq(builders.userId, userId)))[0];

describe('guarded fields', () => {
  it('gives a shared project to the member who sent it', async () => {
    const victim = await createMember('Victim');
    const attacker = await createMember('Attacker');

    const response = await share(attacker, {
      name: 'Mine',
      summary: 'Sent by the attacker.',
      stage: 'idea',
      looking_for: [],
      owner_id: victim.id,
      feedback_count: 99,
      public_id: 'z'.repeat(26),
    });

    expect(response.status).toBe(201);
    const [project] = await orm(deps().db).select().from(projects).where(eq(projects.name, 'Mine'));
    expect(project.ownerId).toBe(attacker.id);
    expect(project.feedbackCount).toBe(0);
    expect(project.publicId).not.toBe('z'.repeat(26));
  });

  it('never writes another member privacy settings', async () => {
    const victim = await createMember('Victim');
    const attacker = await createMember('Attacker');

    const response = await (
      await actingAs(attacker)
    ).put(privacy, '/api/v1/settings/privacy', {
      json: {
        profile_visibility: 'everyone',
        location_precision: 'city',
        email_contact: true,
        show_online_status: false,
        list_in_attendees: true,
        user_id: victim.id,
      },
    });

    expect(response.status).toBe(200);
    const countFor = (userId: number) =>
      orm(deps().db).$count(privacySettings, eq(privacySettings.userId, userId));
    expect(await countFor(victim.id)).toBe(0);
    expect(await countFor(attacker.id)).toBe(1);
  });

  it('never changes roles, verification or owner through a profile save', async () => {
    const victim = await createMember('Victim');
    const attacker = await createMember('Attacker');
    const victimBuilder = await builderOf(victim.id);

    await (
      await actingAs(attacker)
    ).put(ownProfile, '/api/v1/me/profile', {
      json: {
        user_id: victim.id,
        builder_id: victimBuilder.id,
        role: 'engineer',
        verified_at: null,
        email_verified_at: null,
        is_admin: true,
        public_id: victimBuilder.publicId,
      },
    });

    const [after] = await orm(deps().db).select().from(users).where(eq(users.id, attacker.id));
    expect(after.emailVerifiedAt).toBe(attacker.emailVerifiedAt);
    expect(await builderOf(victim.id)).toEqual(victimBuilder);
    expect((await builderOf(attacker.id)).publicId).not.toBe(victimBuilder.publicId);
  });
});
