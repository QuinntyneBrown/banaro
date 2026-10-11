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

/** A directory query, as it sits in the URL. */
export interface DirectoryQuery {
  q?: string;
  sort?: DirectorySort;
  page?: number;
  perPage?: number;
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
}
