import { and, eq, or, sql, type SQL } from 'drizzle-orm';
import type pg from 'pg';
import { orm } from '../../db/orm';
import { blocks } from '../../db/schema/blocks';

/**
 * The one block rule for every subsystem (L2-032, L2-044 criterion 5): a block in either direction
 * hides two members from each other everywhere the server lists or shows them.
 */
export async function isBlockedEitherWay(
  db: pg.Pool,
  userA: number,
  userB: number,
): Promise<boolean> {
  const [row] = await orm(db)
    .select({ id: blocks.id })
    .from(blocks)
    .where(
      or(
        and(eq(blocks.blockerId, userA), eq(blocks.blockedId, userB)),
        and(eq(blocks.blockerId, userB), eq(blocks.blockedId, userA)),
      ),
    )
    .limit(1);
  return row !== undefined;
}

/** A condition that leaves out rows whose user is blocked by, or has blocked, the viewer. */
export function sqlBlockScope(viewerUserId: number, userColumn: SQL): SQL {
  return sql`NOT EXISTS (SELECT 1 FROM blocks WHERE (blocks.blocker_id = ${viewerUserId} AND blocks.blocked_id = ${userColumn}) OR (blocks.blocked_id = ${viewerUserId} AND blocks.blocker_id = ${userColumn}))`;
}
