import {
  deleteProject,
  findProject,
  updateProject,
  viewProject,
} from '@/src/actions/projects/projects';
import { apiStack, handle, profileStack } from '@/src/http/pipeline';
import { ShareProjectRequest } from '@/src/http/requests/projects/share-project-request';
import { projectResource } from '@/src/http/resources/projects/project-resource';
import { validate } from '@/src/http/validation/validate';
import { authorizeChange } from '@/src/policies/project-policy';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const stack = { GET: apiStack, PUT: profileStack, DELETE: profileStack };

/** Anyone may read a project (L2-013, D-051). */
export const GET = handle(stack.GET, async (ctx) => {
  const project = await viewProject(ctx.deps.db, ctx.user, ctx.params.project);
  return Response.json(await projectResource(ctx.deps.db, project, ctx.user));
});

/** Only the owner saves changes; anyone else gets 403 and nothing changes (L2-014). */
export const PUT = handle(stack.PUT, async (ctx) => {
  const input = await validate(ShareProjectRequest, ctx.req);
  const project = await findProject(ctx.deps.db, ctx.params.project);
  authorizeChange(ctx.user!, project);
  const updated = await updateProject(ctx.deps.db, project, input);
  return Response.json(await projectResource(ctx.deps.db, updated, ctx.user));
});

export const DELETE = handle(stack.DELETE, async (ctx) => {
  const project = await findProject(ctx.deps.db, ctx.params.project);
  authorizeChange(ctx.user!, project);
  await deleteProject(ctx.deps.db, project);
  return new Response(null, { status: 204 });
});
