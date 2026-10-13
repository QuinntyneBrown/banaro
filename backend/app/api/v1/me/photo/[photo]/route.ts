import { and, eq } from 'drizzle-orm';
import { orm } from '@/src/db/orm';
import { profilePhotos } from '@/src/db/schema/builders';
import { ownBuilder, UUID } from '@/src/http/own-builder';
import { handle, notFound, profileStack } from '@/src/http/pipeline';
import { profilePhotoResource } from '@/src/http/resources/profiles/profile-photo-resource';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const stack = profileStack;

/** An upload's progress, found only among the member's own photos (L2-044 criterion 1). */
export const GET = handle(stack, async (ctx) => {
  if (!UUID.test(ctx.params.photo)) throw notFound();
  const builder = await ownBuilder(ctx);
  const [photo] = await orm(ctx.deps.db)
    .select()
    .from(profilePhotos)
    .where(and(eq(profilePhotos.id, ctx.params.photo), eq(profilePhotos.builderId, builder.id)));
  if (!photo) throw notFound();
  return Response.json(profilePhotoResource(photo));
});
