import { handle, verifiedStack } from '@/src/http/pipeline';
import { UpdatePrivacyRequest } from '@/src/http/requests/settings/update-privacy-request';
import { validate } from '@/src/http/validation/validate';
import { privacyOf, privacyResource, savePrivacy } from '@/src/services/settings/privacy-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const stack = verifiedStack;

/** The signed-in member's own privacy settings; no route names another account (L2-036, L2-044). */
export const GET = handle(stack, async (ctx) =>
  Response.json(privacyResource(await privacyOf(ctx.deps.db, ctx.user!.id))),
);

/** Always 200: the settings exist from the start, even before their first save stores a row. */
export const PUT = handle(stack, async (ctx) => {
  const settings = await validate(UpdatePrivacyRequest, ctx.req);
  return Response.json(privacyResource(await savePrivacy(ctx.deps.db, ctx.user!.id, settings)));
});
