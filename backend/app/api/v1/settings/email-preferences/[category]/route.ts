import { z } from 'zod';
import { handle, verifiedStack } from '@/src/http/pipeline';
import { booleanField } from '@/src/http/validation/rules';
import { validateInput } from '@/src/http/validation/validate';
import {
  EMAIL_CATEGORIES,
  setEmailPreference,
} from '@/src/services/settings/email-preference-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const stack = verifiedStack;

/** One category and its new value (L2-037 criterion 1, L2-045). */
const SetEmailPreferenceRequest = z.object({
  category: z.enum(EMAIL_CATEGORIES),
  enabled: booleanField(),
});

/** Saves one category on its own (L2-037 criterion 1). */
export const PUT = handle(stack, async (ctx) => {
  const body = (await ctx.req.json().catch(() => ({}))) as Record<string, unknown>;
  const { category, enabled } = await validateInput(SetEmailPreferenceRequest, {
    ...body,
    category: ctx.params.category,
  });
  return Response.json(await setEmailPreference(ctx.deps.db, ctx.user!.id, category, enabled));
});
