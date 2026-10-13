import { removeProfilePhoto, uploadProfilePhoto } from '@/src/actions/profiles/profile-photo';
import { throttle } from '@/src/http/middleware/throttle';
import { ownBuilder } from '@/src/http/own-builder';
import { handle, profileStack } from '@/src/http/pipeline';
import { profilePhotoResource } from '@/src/http/resources/profiles/profile-photo-resource';
import { checkUpload } from '@/src/services/profiles/photo-processor';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const stack = { POST: [...profileStack, throttle('photo-upload')], DELETE: profileStack };

/** The member's own profile photo (L2-008); answers 202 while the scan runs. */
export const POST = handle(stack.POST, async (ctx) => {
  const form = await ctx.req.formData().catch(() => new FormData());
  const photo = form.get('photo');
  const crop = Object.fromEntries(
    ['x', 'y', 'size'].map((key) => [key, String(form.get(`crop[${key}]`) ?? '')]),
  );
  const upload = await checkUpload(photo instanceof File ? photo : null, crop);
  const stored = await uploadProfilePhoto(
    await ownBuilder(ctx),
    upload.contents,
    upload.crop,
    ctx.deps,
  );
  return Response.json(profilePhotoResource(stored), { status: 202 });
});

export const DELETE = handle(stack.DELETE, async (ctx) => {
  await removeProfilePhoto(await ownBuilder(ctx), ctx.deps);
  return new Response(null, { status: 204 });
});
