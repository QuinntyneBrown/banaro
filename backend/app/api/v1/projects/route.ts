import { browseProjects, PROJECTS_PER_PAGE, shareProject } from '@/src/actions/projects/projects';
import { apiStack, handle, profileStack } from '@/src/http/pipeline';
import {
  BrowseProjectsRequest,
  ShareProjectRequest,
} from '@/src/http/requests/projects/share-project-request';
import { projectCards, projectResource } from '@/src/http/resources/projects/project-resource';
import { validate } from '@/src/http/validation/validate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const stack = { GET: apiStack, POST: profileStack };

/** Anyone may browse projects (L2-015). */
export const GET = handle(stack.GET, async (ctx) => {
  const input = await validate(BrowseProjectsRequest, ctx.req);
  const result = await browseProjects(ctx.deps.db, ctx.user, {
    term: input.q ?? null,
    stages: [...new Set(input.stage ?? [])],
    roles: [...new Set(input.looking_for ?? [])],
    page: input.page ?? 1,
  });
  return Response.json({
    items: await projectCards(ctx.deps.db, result.rows),
    total: result.total,
    page: result.page,
    per_page: PROJECTS_PER_PAGE,
    last_page: result.lastPage,
  });
});

/** Shares a project; the owner always comes from the session (L2-012). */
export const POST = handle(stack.POST, async (ctx) => {
  const input = await validate(ShareProjectRequest, ctx.req);
  const project = await shareProject(ctx.deps.db, ctx.user!, input);
  return Response.json(await projectResource(ctx.deps.db, project, ctx.user), { status: 201 });
});
