import { ParamMap } from '@angular/router';
import {
  BuilderRole,
  DirectoryFilters,
  DISTANCE_OPTIONS,
  DistanceOption,
  NO_FILTERS,
  OpenTo,
} from 'api';

const ROLES: readonly BuilderRole[] = [
  'founder',
  'engineer',
  'designer',
  'product_manager',
  'other',
];
const OPEN_TO: readonly OpenTo[] = ['co_founding', 'advising', 'contributing'];

function list(params: ParamMap, key: string): string[] {
  return (params.get(key) ?? '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

/**
 * Turns the URL into directory filters and back (L2-010 criterion 3): `role`, `openTo`, `area` and
 * `skills` hold comma-separated values, and `distance` one option. Unknown roles, open-to values
 * and distances are dropped, so a tampered link degrades to fewer filters; areas and skills are
 * checked by the API.
 */
export function decodeFilters(params: ParamMap): DirectoryFilters {
  const distance = params.get('distance');
  const parsed = distance === 'any' ? 'any' : Number(distance);
  return {
    role: list(params, 'role').filter((r): r is BuilderRole => ROLES.includes(r as BuilderRole)),
    openTo: list(params, 'openTo').filter((o): o is OpenTo => OPEN_TO.includes(o as OpenTo)),
    area: list(params, 'area'),
    skills: list(params, 'skills').filter((s) => /^[a-z0-9-]+$/.test(s)),
    distance: DISTANCE_OPTIONS.includes(parsed as DistanceOption)
      ? (parsed as DistanceOption)
      : null,
  };
}

/** Query parameters for the filters; an empty group removes its key. */
export function encodeFilters(filters: DirectoryFilters): Record<string, string | null> {
  const join = (values: readonly string[]) => (values.length ? values.join(',') : null);
  return {
    role: join(filters.role),
    openTo: join(filters.openTo),
    area: join(filters.area),
    skills: join(filters.skills),
    distance: filters.distance === null ? null : String(filters.distance),
  };
}

export function hasFilters(filters: DirectoryFilters): boolean {
  return JSON.stringify(encodeFilters(filters)) !== JSON.stringify(encodeFilters(NO_FILTERS));
}
