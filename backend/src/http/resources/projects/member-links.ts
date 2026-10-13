import { and, eq, inArray } from 'drizzle-orm';
import type pg from 'pg';
import { orm } from '../../../db/orm';
import { builders, profilePhotos } from '../../../db/schema/builders';
import { users } from '../../../db/schema/users';

export interface MemberLink {
  id: string | null;
  name: string | null;
  photo_url: string | null;
}

/** Members as feedback and offers show them: linked by profile id, with a ready photo. */
export async function memberLinks(db: pg.Pool, userIds: number[]): Promise<Map<number, MemberLink>> {
  if (userIds.length === 0) return new Map();
  const rows = await orm(db)
    .select({
      userId: users.id,
      userName: users.name,
      publicId: builders.publicId,
      name: builders.name,
      photoId: profilePhotos.id,
    })
    .from(users)
    .leftJoin(builders, eq(builders.userId, users.id))
    .leftJoin(
      profilePhotos,
      and(eq(profilePhotos.id, builders.photoId), eq(profilePhotos.status, 'ready')),
    )
    .where(inArray(users.id, userIds));
  return new Map(
    rows.map((row) => [
      row.userId,
      {
        id: row.publicId,
        name: row.name ?? row.userName,
        photo_url: row.photoId ? `/api/v1/photos/${row.photoId}` : null,
      },
    ]),
  );
}

export const unknownMember: MemberLink = { id: null, name: null, photo_url: null };
