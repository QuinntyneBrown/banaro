import { eq } from 'drizzle-orm';
import { orm } from '../db/orm';
import { builders, type Builder } from '../db/schema/builders';
import type { Ctx } from './pipeline';

/** The signed-in member's builder row; the profile stack guarantees there is one. */
export async function ownBuilder(ctx: Ctx): Promise<Builder> {
  const [builder] = await orm(ctx.deps.db)
    .select()
    .from(builders)
    .where(eq(builders.userId, ctx.user!.id));
  return builder;
}

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
