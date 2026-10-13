import { updateOwnProfile } from '@/src/actions/profiles/update-own-profile';
import { handle, profileStack } from '@/src/http/pipeline';
import { UpdateOwnProfileRequest } from '@/src/http/requests/profiles/update-own-profile-request';
import { ownProfileResource } from '@/src/http/resources/profiles/own-profile-resource';
import { validate } from '@/src/http/validation/validate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const stack = profileStack;

/** The signed-in member's own profile; no route takes a builder id (L2-044 criterion 1). */
export const GET = handle(stack, async (ctx) =>
  Response.json(await ownProfileResource(ctx.deps.db, ctx.user!)),
);

export const PUT = handle(stack, async (ctx) => {
  const profile = await validate(UpdateOwnProfileRequest(ctx.deps.db), ctx.req);
  await updateOwnProfile(ctx.deps.db, ctx.user!, profile);
  return Response.json(await ownProfileResource(ctx.deps.db, ctx.user!));
});
