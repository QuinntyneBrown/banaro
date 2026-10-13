import { and, desc, eq, isNotNull } from 'drizzle-orm';
import type pg from 'pg';
import { isoStamp, nowStamp } from '../../clock';
import { orm } from '../../db/orm';
import { blocks } from '../../db/schema/blocks';
import { builders, profilePhotos } from '../../db/schema/builders';
import { users, type User } from '../../db/schema/users';
import { HttpError, notFound } from '../../http/pipeline';
import { t } from '../../services/user-experience/catalogue-service';

type BlockRow = typeof blocks.$inferSelect;

/** One row of the member's blocked list (L2-032 criterion 3). */
async function blockedBuilderResource(db: pg.Pool, block: BlockRow) {
  const [row] = await orm(db)
    .select({ builder: builders, accountName: users.name, photoStatus: profilePhotos.status })
    .from(users)
    .leftJoin(builders, eq(builders.userId, users.id))
    .leftJoin(profilePhotos, eq(profilePhotos.id, builders.photoId))
    .where(eq(users.id, block.blockedId));
  return {
    builder_id: row?.builder?.publicId ?? null,
    name: row?.builder?.name ?? row?.accountName ?? null,
    photo_url:
      row?.builder?.photoId && row.photoStatus === 'ready'
        ? `/api/v1/photos/${row.builder.photoId}`
        : null,
    blocked_at: block.createdAt ? isoStamp(block.createdAt) : null,
  };
}

/**
 * Blocks a builder for the member (L2-032 criterion 1). A missing builder and one who has already
 * blocked the member answer the same 404, so no block is revealed; blocking again changes nothing;
 * nobody is told.
 */
export async function blockBuilder(db: pg.Pool, member: User, publicId: string) {
  const query = orm(db);
  const [builder] = /^[0-9a-z]{26}$/.test(publicId)
    ? await query
        .select()
        .from(builders)
        .where(and(eq(builders.publicId, publicId), isNotNull(builders.onboardingCompletedAt)))
    : [];
  if (!builder) throw notFound();
  if (builder.userId === member.id) {
    throw new HttpError(422, {
      code: 'cannot_block_self',
      message: t('trustAndSafety.block.errors.self'),
    });
  }
  const [theirs] = await query
    .select({ id: blocks.id })
    .from(blocks)
    .where(and(eq(blocks.blockerId, builder.userId), eq(blocks.blockedId, member.id)));
  if (theirs) throw notFound();

  await query
    .insert(blocks)
    .values({ blockerId: member.id, blockedId: builder.userId, createdAt: nowStamp() })
    .onConflictDoNothing();
  const [block] = await query
    .select()
    .from(blocks)
    .where(and(eq(blocks.blockerId, member.id), eq(blocks.blockedId, builder.userId)));
  return blockedBuilderResource(db, block);
}

/**
 * Removes the member's own block (L2-032 criterion 3). Visibility returns both ways unless the
 * other member holds a block of their own.
 */
export async function unblockBuilder(db: pg.Pool, member: User, publicId: string): Promise<void> {
  const query = orm(db);
  const [builder] = await query.select().from(builders).where(eq(builders.publicId, publicId));
  const deleted = builder
    ? await query
        .delete(blocks)
        .where(and(eq(blocks.blockerId, member.id), eq(blocks.blockedId, builder.userId)))
        .returning({ id: blocks.id })
    : [];
  if (deleted.length === 0) throw notFound();
}

/** The member's own blocks, newest first, for the blocked list. */
export async function blockedByMember(db: pg.Pool, member: User) {
  const rows = await orm(db)
    .select()
    .from(blocks)
    .where(eq(blocks.blockerId, member.id))
    .orderBy(desc(blocks.createdAt), desc(blocks.id));
  return Promise.all(rows.map((row) => blockedBuilderResource(db, row)));
}
