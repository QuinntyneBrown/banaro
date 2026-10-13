import { and, eq, inArray } from 'drizzle-orm';
import type pg from 'pg';
import { isoStamp } from '../../../clock';
import { orm } from '../../../db/orm';
import { builders, profilePhotos } from '../../../db/schema/builders';
import type { Feedback } from '../../../db/schema/projects';
import { users } from '../../../db/schema/users';

/**
 * Feedback with its authors linked by profile id. The text is plain; the page encodes it on output
 * (L2-045 criterion 5).
 */
export async function feedbackResources(db: pg.Pool, rows: Feedback[]) {
  if (rows.length === 0) return [];
  const authors = new Map(
    (
      await orm(db)
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
        .where(
          inArray(
            users.id,
            rows.map((row) => row.authorId),
          ),
        )
    ).map((author) => [author.userId, author]),
  );
  return rows.map((row) => {
    const author = authors.get(row.authorId);
    return {
      id: String(row.id),
      body: row.body,
      created_at: row.createdAt ? isoStamp(row.createdAt) : null,
      author: {
        id: author?.publicId ?? null,
        name: author?.name ?? author?.userName ?? null,
        photo_url: author?.photoId ? `/api/v1/photos/${author.photoId}` : null,
      },
    };
  });
}
