import { giveFeedback, listProjectFeedback } from '@/src/actions/projects/feedback';
import { findProject, viewProject } from '@/src/actions/projects/projects';
import { throttle } from '@/src/http/middleware/throttle';
import { apiStack, handle, profileStack } from '@/src/http/pipeline';
import {
  GiveFeedbackRequest,
  ListProjectFeedbackRequest,
} from '@/src/http/requests/projects/feedback-requests';
import { feedbackResources } from '@/src/http/resources/projects/feedback-resource';
import { validate } from '@/src/http/validation/validate';
import { authorizeFeedback } from '@/src/policies/project-policy';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const stack = { GET: apiStack, POST: [...profileStack, throttle('project-feedback')] };

/** Anyone reads a project's feedback; a project the viewer cannot see has none (L2-016, D-052). */
export const GET = handle(stack.GET, async (ctx) => {
  const project = await viewProject(ctx.deps.db, ctx.user, ctx.params.project);
  const { page, perPage } = await validate(ListProjectFeedbackRequest, ctx.req);
  const result = await listProjectFeedback(ctx.deps.db, project, ctx.user, page, perPage);
  return Response.json({
    items: await feedbackResources(ctx.deps.db, result.rows),
    total: result.total,
    page,
    per_page: perPage,
    last_page: result.lastPage,
  });
});

/** A member who is not the owner adds feedback; at most 10 an hour (L2-016). */
export const POST = handle(stack.POST, async (ctx) => {
  const project = await findProject(ctx.deps.db, ctx.params.project);
  await authorizeFeedback(ctx.deps.db, ctx.user!, project);
  const { body } = await validate(GiveFeedbackRequest, ctx.req);
  const row = await giveFeedback(ctx.deps, ctx.user!, project, body);
  const [resource] = await feedbackResources(ctx.deps.db, [row]);
  return Response.json(resource, { status: 201 });
});
