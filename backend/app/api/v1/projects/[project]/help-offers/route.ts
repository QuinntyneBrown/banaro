import { listHelpOffers, offerToHelp } from '@/src/actions/projects/help-offers';
import { findProject } from '@/src/actions/projects/projects';
import { handle, profileStack } from '@/src/http/pipeline';
import {
  ListHelpOffersRequest,
  OfferToHelpRequest,
} from '@/src/http/requests/projects/help-offer-requests';
import { helpOfferResources } from '@/src/http/resources/projects/help-offer-resource';
import { lookingForOf } from '@/src/http/resources/projects/project-resource';
import { validate } from '@/src/http/validation/validate';
import { authorizeOffer, authorizeViewOffers } from '@/src/policies/project-policy';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const stack = { GET: profileStack, POST: profileStack };

/** Only the owner reads a project's offers (L2-017 criterion 4). */
export const GET = handle(stack.GET, async (ctx) => {
  const project = await findProject(ctx.deps.db, ctx.params.project);
  authorizeViewOffers(ctx.user!, project);
  const { page, perPage } = await validate(ListHelpOffersRequest, ctx.req);
  const result = await listHelpOffers(ctx.deps.db, project, page, perPage);
  return Response.json({
    items: await helpOfferResources(ctx.deps.db, result.rows),
    total: result.total,
    page,
    per_page: perPage,
    last_page: result.lastPage,
  });
});

/** A member who is not the owner offers to fill one of the project's roles (L2-017). */
export const POST = handle(stack.POST, async (ctx) => {
  const project = await findProject(ctx.deps.db, ctx.params.project);
  await authorizeOffer(ctx.deps.db, ctx.user!, project);
  const roles = await lookingForOf(ctx.deps.db, project.id);
  const input = await validate(OfferToHelpRequest(roles), ctx.req);
  const offer = await offerToHelp(ctx.deps, ctx.user!, project, input.role, input.message);
  const [resource] = await helpOfferResources(ctx.deps.db, [offer]);
  return Response.json(resource, { status: 201 });
});
