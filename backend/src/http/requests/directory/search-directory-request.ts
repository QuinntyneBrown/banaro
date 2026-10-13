import { inArray } from 'drizzle-orm';
import type pg from 'pg';
import { z } from 'zod';
import { orm } from '../../../db/orm';
import { neighbourhoods } from '../../../db/schema/neighbourhoods';
import { skills } from '../../../db/schema/skills';
import { BUILDER_ROLES, OPEN_TO } from '../../../enums/profiles';
import { pageNumber, pageSize } from '../../validation/rules';

export const DIRECTORY_SORTS = ['best_match', 'nearest', 'recently_active', 'newest'] as const;
/** Sorts that need no viewer, so visitors may use them (D-042). */
const VISITOR_SORTS = ['recently_active', 'newest'] as const;
export const DISTANCES = ['5', '10', '25', '40', 'any'] as const;
const FILTER_KEYS = ['role', 'open_to', 'area', 'skills', 'distance'] as const;

const prohibited = (field: string) =>
  z
    .unknown()
    .optional()
    .refine((value) => value == null, { message: `The ${field} field is prohibited.` });

const knownValues = (db: pg.Pool, kind: 'area' | 'skills') =>
  z.array(z.string()).superRefine(async (values, issues) => {
    if (values.length === 0) return;
    const known = new Set(
      kind === 'area'
        ? (
            await orm(db)
              .selectDistinct({ value: neighbourhoods.area })
              .from(neighbourhoods)
              .where(inArray(neighbourhoods.area, values))
          ).map((row) => row.value)
        : (
            await orm(db)
              .select({ value: skills.slug })
              .from(skills)
              .where(inArray(skills.slug, values))
          ).map((row) => row.value),
    );
    values.forEach((value, i) => {
      if (!known.has(value)) {
        issues.addIssue({
          code: 'custom',
          path: [i],
          message: `The selected ${kind}.${i} is invalid.`,
        });
      }
    });
  });

const base = (sorts: readonly [string, ...string[]]) => ({
  q: z.string().max(100).nullish(),
  sort: z.enum(sorts).nullish(),
  page: pageNumber(),
  per_page: pageSize(),
});

/**
 * A member's directory query (L2-009, L2-010, L2-045): search term, sort, page, page size and the
 * facet filters, turned into the filters in force. Without a chosen distance a member sees builders
 * within 40 km (L2-010).
 */
export const MemberDirectoryRequest = (db: pg.Pool) =>
  z
    .object({
      ...base(DIRECTORY_SORTS),
      role: z.array(z.enum(BUILDER_ROLES)).nullish(),
      open_to: z.array(z.enum(OPEN_TO)).nullish(),
      area: knownValues(db, 'area').nullish(),
      skills: knownValues(db, 'skills').nullish(),
      distance: z.enum(DISTANCES).nullish(),
    })
    .transform(({ role, open_to, area, skills, distance, ...query }) => ({
      ...query,
      filters: {
        roles: [...new Set(role ?? [])],
        openTo: [...new Set(open_to ?? [])],
        areas: [...new Set(area ?? [])],
        skills: [...new Set(skills ?? [])],
        distanceKm: distance == null ? 40 : distance === 'any' ? null : Number(distance),
      },
    }));

/** A visitor's query: only the sorts that need no viewer, and no filters (D-042, D-044). */
export const VisitorDirectoryRequest = z.object({
  ...base(VISITOR_SORTS),
  ...Object.fromEntries(FILTER_KEYS.map((key) => [key, prohibited(key)])),
});
