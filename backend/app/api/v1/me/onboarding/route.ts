import { handle, verifiedStack } from '@/src/http/pipeline';
import { onboardingResource } from '@/src/http/resources/profiles/onboarding-resource';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const stack = verifiedStack;

/** The signed-in member's own onboarding; no route takes a builder id (L2-044). */
export const GET = handle(stack, async (ctx) =>
  Response.json(await onboardingResource(ctx.deps.db, ctx.user!)),
);
