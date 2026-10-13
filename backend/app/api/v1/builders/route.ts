import { and, eq, isNotNull } from 'drizzle-orm';
import {
  NO_FILTERS,
  searchDirectory,
  type DirectorySort,
} from '@/src/actions/directory/search-directory';
import { orm } from '@/src/db/orm';
import { builders } from '@/src/db/schema/builders';
import { apiStack, handle } from '@/src/http/pipeline';
import {
  MemberDirectoryRequest,
  VisitorDirectoryRequest,
} from '@/src/http/requests/directory/search-directory-request';
import { loadCards, memberCard, publicCard } from '@/src/http/resources/directory/builder-cards';
import { parseQuery } from '@/src/http/validation/query';
import { validateInput } from '@/src/http/validation/validate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const stack = apiStack;

/** The builder directory for members and visitors (L2-009, L2-010). */
export const GET = handle(stack, async (ctx) => {
  // A signed-in account with a finished profile gets the member view (D-042).
  const [viewer] = ctx.user
    ? await orm(ctx.deps.db)
        .select()
        .from(builders)
        .where(and(eq(builders.userId, ctx.user.id), isNotNull(builders.onboardingCompletedAt)))
    : [];
  const query = parseQuery(ctx.req);
  const input = viewer
    ? await validateInput(MemberDirectoryRequest(ctx.deps.db), query)
    : { ...(await validateInput(VisitorDirectoryRequest, query)), filters: NO_FILTERS };
  const perPage = input.per_page ?? 12;

  const result = await searchDirectory(
    ctx.deps.db,
    viewer ?? null,
    input.q ?? null,
    (input.sort ?? (viewer ? 'best_match' : 'recently_active')) as DirectorySort,
    input.page ?? 1,
    perPage,
    input.filters,
  );
  const cards = await loadCards(
    ctx.deps.db,
    result.rows.map((row) => row.id),
  );
  return Response.json({
    items: cards.map(({ builder, context }, i) =>
      viewer ? memberCard(builder, context, result.rows[i]) : publicCard(builder, context),
    ),
    total: result.total,
    page: result.page,
    per_page: perPage,
    last_page: result.lastPage,
    // Members only: option counts and the distance limit in force (L2-010).
    meta: { facets: result.facets, distance_km: viewer ? input.filters.distanceKm : null },
  });
});
