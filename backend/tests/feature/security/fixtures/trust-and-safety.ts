import { eq } from 'drizzle-orm';
import { deps } from '../../../../src/container';
import { orm } from '../../../../src/db/orm';
import { blocks } from '../../../../src/db/schema/blocks';
import { builders } from '../../../../src/db/schema/builders';
import type { User } from '../../../../src/db/schema/users';
import { createMember } from '../../../support/members';
import { snapshot, type RouteOwnershipFixture, type Scenario } from './ownership';

// The owner has blocked a third member. Another member must neither see nor lift that block (L2-032).
async function ownersBlock(owner: User): Promise<Scenario> {
  const third = await createMember('Blocked Sentinel');
  await orm(deps().db).insert(blocks).values({ blockerId: owner.id, blockedId: third.id });
  const [builder] = await orm(deps().db)
    .select()
    .from(builders)
    .where(eq(builders.userId, third.id));
  // The third member is the caller's own input on PUT and DELETE, so only the owner's e-mail is a
  // sentinel.
  return {
    params: { builder: builder.publicId! },
    sentinels: [owner.email],
    intact: await snapshot('blocks', 'blocker_id', owner.id),
  };
}

export const trustAndSafetyFixtures: RouteOwnershipFixture[] = [
  {
    route: 'GET /api/v1/blocks',
    expect: 'self_only',
    arrange: async (owner) => {
      const scenario = await ownersBlock(owner);
      // The list shows the caller's own blocks: the owner's blocked member must not appear in it.
      return {
        sentinels: [...(scenario.sentinels ?? []), 'Blocked Sentinel'],
        intact: scenario.intact,
      };
    },
  },
  { route: 'PUT /api/v1/blocks/[builder]', expect: 'self_only', arrange: ownersBlock },
  { route: 'DELETE /api/v1/blocks/[builder]', expect: 'self_only', arrange: ownersBlock },
];
