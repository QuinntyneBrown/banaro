import { BuilderRole, OpenTo } from './profiles';

/** Orders of the directory (L2-009). Visitors may use only `recently_active` and `newest`. */
export type DirectorySort = 'best_match' | 'nearest' | 'recently_active' | 'newest';

export const MEMBER_SORTS: readonly DirectorySort[] = [
  'best_match',
  'nearest',
  'recently_active',
  'newest',
];
export const VISITOR_SORTS: readonly DirectorySort[] = ['recently_active', 'newest'];

/** Distance options of the filter (L2-010 criterion 2); `null` leaves the 40 km default. */
export type DistanceOption = 5 | 10 | 25 | 40 | 'any';
export const DISTANCE_OPTIONS: readonly DistanceOption[] = [5, 10, 25, 40, 'any'];

/** The facet filters (L2-010). Options within a group combine with OR, groups with AND. */
export interface DirectoryFilters {
  role: BuilderRole[];
  openTo: OpenTo[];
  area: string[];
  /** Skill slugs. */
  skills: string[];
  distance: DistanceOption | null;
}

export const NO_FILTERS: DirectoryFilters = {
  role: [],
  openTo: [],
  area: [],
  skills: [],
  distance: null,
};

/** A directory query, as it sits in the URL. */
export interface DirectoryQuery {
  q?: string;
  sort?: DirectorySort;
  page?: number;
  perPage?: number;
  filters?: DirectoryFilters;
}

/** Option counts among builders matching the other groups (L2-010 criterion 1). */
export interface DirectoryFacets {
  role: Record<BuilderRole, number>;
  openTo: Record<OpenTo, number>;
  area: Record<string, number>;
  skills: { slug: string; name: string; count: number }[];
}

/**
 * One builder card. Member-only facts are absent for a visitor (L2-009 criterion 6), so they are
 * optional here.
 */
export interface BuilderCardSummary {
  id: string;
  name: string;
  role: BuilderRole | null;
  headline: string | null;
  neighbourhood: { name: string; area: string } | null;
  skills: string[];
  photoUrl: string | null;
  distanceKm?: number | null;
  matchScore?: number | null;
  building?: string | null;
  openTo?: OpenTo[];
  online?: boolean;
  lastSeenAt?: string | null;
}

/** One page of results and where it sits in the whole (L2-009 criteria 1 and 5). */
export interface DirectoryResultPage {
  items: BuilderCardSummary[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
  /** Members only: option counts, and the distance limit in force (null: anywhere). */
  facets: DirectoryFacets | null;
  distanceKm: number | null;
}
