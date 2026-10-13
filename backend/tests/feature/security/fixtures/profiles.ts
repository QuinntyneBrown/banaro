import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { nowStamp } from '../../../../src/clock';
import { deps } from '../../../../src/container';
import { orm } from '../../../../src/db/orm';
import { builders, profilePhotos } from '../../../../src/db/schema/builders';
import type { User } from '../../../../src/db/schema/users';
import { snapshot, type RouteOwnershipFixture } from './ownership';

const own = async (owner: User) => ({
  sentinels: [owner.email, owner.name],
  intact: await snapshot('builders', 'user_id', owner.id),
});

// These routes name no record: they read or change the signed-in member's own profile (L2-006 to
// L2-008).
const ownProfileRoutes = [
  'GET /api/v1/me/onboarding',
  'PUT /api/v1/me/onboarding/about',
  'PUT /api/v1/me/onboarding/skills',
  'PUT /api/v1/me/onboarding/goals',
  'POST /api/v1/me/onboarding/complete',
  'GET /api/v1/me/profile',
  'PUT /api/v1/me/profile',
  'POST /api/v1/me/photo',
  'DELETE /api/v1/me/photo',
];

export const profilesFixtures: RouteOwnershipFixture[] = [
  ...ownProfileRoutes.map((route) => ({ route, expect: 'self_only' as const, arrange: own })),
  // Another member's photo id answers 404 (L2-044 criterion 1).
  {
    route: 'GET /api/v1/me/photo/[photo]',
    expect: 'not_found',
    arrange: async (owner) => {
      const [builder] = await orm(deps().db)
        .select()
        .from(builders)
        .where(eq(builders.userId, owner.id));
      const [photo] = await orm(deps().db)
        .insert(profilePhotos)
        .values({
          id: randomUUID(),
          builderId: builder.id,
          path: `media/${'a'.repeat(20)}`,
          status: 'ready',
          createdAt: nowStamp(),
          updatedAt: nowStamp(),
        })
        .returning();
      return { params: { photo: photo.id }, sentinels: [photo.path] };
    },
  },
];
