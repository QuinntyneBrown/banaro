import { completeOnboarding } from '@/src/actions/profiles/complete-onboarding';
import { handle, verifiedStack } from '@/src/http/pipeline';
import { onboardingResource } from '@/src/http/resources/profiles/onboarding-resource';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const stack = verifiedStack;

export const POST = handle(stack, async (ctx) => {
  await completeOnboarding(ctx.deps.db, ctx.user!);
  return Response.json(await onboardingResource(ctx.deps.db, ctx.user!));
});
