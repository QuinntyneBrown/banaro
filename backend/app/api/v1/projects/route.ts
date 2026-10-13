import { shareProject } from '@/src/actions/projects/projects';
import { handle, profileStack } from '@/src/http/pipeline';
import { ShareProjectRequest } from '@/src/http/requests/projects/share-project-request';
import { projectResource } from '@/src/http/resources/projects/project-resource';
import { validate } from '@/src/http/validation/validate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const stack = { POST: profileStack };

/** Shares a project; the owner always comes from the session (L2-012). */
export const POST = handle(stack.POST, async (ctx) => {
  const input = await validate(ShareProjectRequest, ctx.req);
  const project = await shareProject(ctx.deps.db, ctx.user!, input);
  return Response.json(await projectResource(ctx.deps.db, project, ctx.user), { status: 201 });
});
