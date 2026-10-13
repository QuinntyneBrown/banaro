import { saveOnboardingStep } from '@/src/actions/profiles/save-onboarding-step';
import { handle, verifiedStack } from '@/src/http/pipeline';
import { onboardingResource } from '@/src/http/resources/profiles/onboarding-resource';
import { GoalsRequest } from '@/src/http/requests/profiles/onboarding-requests';
import { validate } from '@/src/http/validation/validate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const stack = verifiedStack;

/** Saves the goals step on its own (L2-006). */
export const PUT = handle(stack, async (ctx) => {
  await saveOnboardingStep(ctx.deps.db, ctx.user!, {
    step: 'goals',
    ...(await validate(GoalsRequest, ctx.req)),
  });
  return Response.json(await onboardingResource(ctx.deps.db, ctx.user!));
});
