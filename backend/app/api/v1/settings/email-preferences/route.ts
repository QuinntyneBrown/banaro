import { handle, verifiedStack } from '@/src/http/pipeline';
import { emailPreferencesOf } from '@/src/services/settings/email-preference-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const stack = verifiedStack;

/** The signed-in member's own e-mail categories; no route names another account (L2-037, L2-044). */
export const GET = handle(stack, async (ctx) =>
  Response.json(await emailPreferencesOf(ctx.deps.db, ctx.user!.id)),
);
