import { and, eq } from 'drizzle-orm';
import type { Deps } from '../../../container';
import { orm } from '../../../db/orm';
import { builders, profilePhotos } from '../../../db/schema/builders';
import type { User } from '../../../db/schema/users';

/** The signed-in member, or `null` for a visitor. */
export async function sessionResource(user: User | null, deps: Deps) {
  if (!user) return { member: null };
  const [row] = await orm(deps.db)
    .select({ builder: builders, photoId: profilePhotos.id })
    .from(builders)
    .leftJoin(
      profilePhotos,
      and(eq(profilePhotos.id, builders.photoId), eq(profilePhotos.status, 'ready')),
    )
    .where(eq(builders.userId, user.id));
  return {
    member: {
      id: user.id,
      name: user.name,
      email: user.email,
      email_verified: user.emailVerifiedAt !== null,
      // Member pages wait for a finished onboarding (L2-006 criterion 1).
      onboarding_complete: row?.builder.onboardingCompletedAt != null,
      builder_id: row?.builder.publicId ?? null,
      // The header avatar shows the photo, or initials when there is none (L2-008).
      photo_url: row?.photoId ? `/api/v1/photos/${row.photoId}` : null,
    },
  };
}
