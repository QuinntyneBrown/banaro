import { and, eq } from 'drizzle-orm';
import { orm } from '@/src/db/orm';
import { profilePhotos } from '@/src/db/schema/builders';
import { UUID } from '@/src/http/own-builder';
import { apiStack, handle, notFound } from '@/src/http/pipeline';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const stack = apiStack;

/** A ready photo; one in quarantine, rejected or replaced answers 404 (L2-008, L2-009). */
export const GET = handle(stack, async (ctx) => {
  if (!UUID.test(ctx.params.photo)) throw notFound();
  const [photo] = await orm(ctx.deps.db)
    .select()
    .from(profilePhotos)
    .where(and(eq(profilePhotos.id, ctx.params.photo), eq(profilePhotos.status, 'ready')));
  if (!photo) throw notFound();
  const contents = await ctx.deps.media.get(photo.path);
  return new Response(new Uint8Array(contents), {
    headers: {
      'Content-Type': 'image/webp',
      'Content-Length': String(contents.length),
      'Cache-Control': 'private, max-age=3600',
    },
  });
});
