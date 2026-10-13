import { sql, type SQL } from 'drizzle-orm';
import type pg from 'pg';
import { orm } from '../../db/orm';
import type { Builder } from '../../db/schema/builders';
import { OPEN_TO, BUILDER_ROLES } from '../../enums/profiles';
import { prefixQuery } from '../../services/directory/builder-search-text';
import { sqlMatchScore } from '../../services/matching/match-score-service';
import { sqlShownDistance } from '../../services/settings/privacy-service';
import { sqlBlockScope } from '../../services/trust-and-safety/block-service';

export type DirectorySort = 'best_match' | 'nearest' | 'recently_active' | 'newest';

/** The facet filters (L2-010): options within a group combine with OR, groups with AND. */
export interface DirectoryFilters {
  roles: string[];
  openTo: string[];
  areas: string[];
  /** Skill slugs. */
  skills: string[];
  /** Kilometres, or null for anywhere (always the case for visitors). */
  distanceKm: number | null;
}

export const NO_FILTERS: DirectoryFilters = {
  roles: [],
  openTo: [],
  areas: [],
  skills: [],
  distanceKm: null,
};

export interface DirectoryRow {
  id: number;
  distanceKm: number | null;
  matchScore: number | null;
}

const list = (values: string[]) =>
  sql.join(
    values.map((value) => sql`${value}`),
    sql`, `,
  );
const distance = sqlShownDistance(sql`nd.km`);

/** The scoped, searched and filtered builders, as FROM and WHERE (L2-009, L2-010). */
function filtered(viewer: Builder | null, term: string | null, filters: DirectoryFilters): SQL {
  const where: SQL[] = [sql`builders.onboarding_completed_at IS NOT NULL`];
  let from = sql`FROM builders LEFT JOIN privacy_settings ps ON ps.user_id = builders.user_id`;

  if (viewer === null) {
    // Privacy: members-only profiles stay out of the signed-out directory (L2-036).
    where.push(sql`COALESCE(ps.profile_visibility, 'members') = 'everyone'`);
  } else {
    where.push(sql`builders.id <> ${viewer.id}`);
    // Blocks hide both members from each other, in results and counts alike (L2-032).
    where.push(sqlBlockScope(viewer.userId, sql`builders.user_id`));
    from = sql`${from} LEFT JOIN neighbourhood_distances nd ON nd.to_id = builders.neighbourhood_id AND nd.from_id = ${viewer.neighbourhoodId}`;
  }

  const tsQuery = term === null ? null : prefixQuery(term);
  if (term !== null && term.trim() !== '' && tsQuery === null) {
    // Nothing searchable is left of the term, so nothing can match it.
    where.push(sql`false`);
  } else if (tsQuery !== null) {
    where.push(
      sql`to_tsvector('simple', builders.search_text) @@ to_tsquery('simple', ${tsQuery})`,
    );
  }

  if (filters.roles.length) where.push(sql`builders.role IN (${list(filters.roles)})`);
  if (filters.openTo.length) {
    where.push(sql`jsonb_exists_any(builders.open_to, ARRAY[${list(filters.openTo)}]::text[])`);
  }
  if (filters.areas.length) {
    where.push(
      sql`builders.neighbourhood_id IN (SELECT id FROM neighbourhoods WHERE area IN (${list(filters.areas)}))`,
    );
  }
  if (filters.skills.length) {
    where.push(
      sql`EXISTS (SELECT 1 FROM builder_skill bs JOIN skills s ON s.id = bs.skill_id WHERE bs.builder_id = builders.id AND s.slug IN (${list(filters.skills)}))`,
    );
  }
  if (viewer !== null && filters.distanceKm !== null) {
    where.push(sql`${distance} <= ${filters.distanceKm}`);
  }
  return sql`${from} WHERE ${sql.join(where, sql` AND `)}`;
}

const ORDER: Record<DirectorySort, SQL> = {
  best_match: sql`match_score DESC, builders.last_active_at DESC NULLS LAST`,
  nearest: sql`${distance} ASC NULLS LAST`,
  recently_active: sql`builders.last_active_at DESC NULLS LAST`,
  newest: sql`builders.created_at DESC`,
};

/**
 * One page of the builder directory: finished profiles other than the viewer, matched against the
 * term and filters, ordered by the sort with the builder id breaking ties, and clamped to the last
 * page. For a member each row carries its distance and match score, and the page the option counts.
 */
export async function searchDirectory(
  db: pg.Pool,
  viewer: Builder | null,
  term: string | null,
  sort: DirectorySort,
  page: number,
  perPage: number,
  filters: DirectoryFilters,
) {
  const query = orm(db);
  const scope = filtered(viewer, term, filters);
  const { rows: counted } = await query.execute<{ n: number }>(
    sql`SELECT count(*)::int AS n ${scope}`,
  );
  const total = counted[0].n;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  page = Math.min(page, lastPage);

  const extra =
    viewer === null
      ? sql`, NULL AS distance_km, NULL AS match_score`
      : sql`, ${distance} AS distance_km, ${sqlMatchScore(distance, sql`builders.last_active_at`)} AS match_score`;
  const { rows } = await query.execute<{
    id: number;
    distance_km: string | null;
    match_score: string | null;
  }>(
    sql`SELECT builders.id::int AS id ${extra} ${scope} ORDER BY ${ORDER[sort]}, builders.id LIMIT ${perPage} OFFSET ${(page - 1) * perPage}`,
  );

  return {
    rows: rows.map(
      (row): DirectoryRow => ({
        id: row.id,
        distanceKm: row.distance_km === null ? null : Number(row.distance_km),
        matchScore: row.match_score === null ? null : Number(row.match_score),
      }),
    ),
    total,
    page,
    lastPage,
    facets: viewer === null ? null : await countFacets(db, viewer, term, filters),
  };
}

/**
 * Option counts (L2-010 criterion 1): each group's options among builders matching every other
 * group, from the same scoped query as the results.
 */
async function countFacets(
  db: pg.Pool,
  viewer: Builder,
  term: string | null,
  filters: DirectoryFilters,
) {
  const query = orm(db);
  const counts = async (statement: SQL) =>
    Object.fromEntries(
      (await query.execute<{ option: string; n: number }>(statement)).rows.map((row) => [
        row.option,
        row.n,
      ]),
    );

  const roles = await counts(
    sql`SELECT builders.role AS option, count(*)::int AS n ${filtered(viewer, term, { ...filters, roles: [] })} GROUP BY builders.role`,
  );
  const openTo = await counts(
    sql`SELECT o.option, count(b.*)::int AS n FROM unnest(ARRAY[${list([...OPEN_TO])}]::text[]) AS o(option) LEFT JOIN (SELECT builders.open_to ${filtered(viewer, term, { ...filters, openTo: [] })}) b ON jsonb_exists(b.open_to, o.option) GROUP BY o.option`,
  );
  const areas = await counts(
    sql`SELECT fh.area AS option, count(*)::int AS n FROM (SELECT builders.neighbourhood_id ${filtered(viewer, term, { ...filters, areas: [] })}) b JOIN neighbourhoods fh ON fh.id = b.neighbourhood_id GROUP BY fh.area`,
  );
  const skills = await counts(
    sql`SELECT fs.slug AS option, count(*)::int AS n FROM (SELECT builders.id ${filtered(viewer, term, { ...filters, skills: [] })}) b JOIN builder_skill fbs ON fbs.builder_id = b.id JOIN skills fs ON fs.id = fbs.skill_id WHERE fs.is_catalogue GROUP BY fs.slug`,
  );
  const areaOrder = (
    await query.execute<{ area: string }>(
      sql`SELECT area FROM neighbourhoods GROUP BY area ORDER BY min(id)`,
    )
  ).rows;
  const catalogue = (
    await query.execute<{ slug: string; name: string }>(
      sql`SELECT slug, name FROM skills WHERE is_catalogue ORDER BY catalogue_position`,
    )
  ).rows;

  return {
    role: Object.fromEntries(BUILDER_ROLES.map((role) => [role, roles[role] ?? 0])),
    open_to: Object.fromEntries(OPEN_TO.map((choice) => [choice, openTo[choice] ?? 0])),
    area: Object.fromEntries(areaOrder.map(({ area }) => [area, areas[area] ?? 0])),
    skills: catalogue.map(({ slug, name }) => ({ slug, name, count: skills[slug] ?? 0 })),
  };
}
