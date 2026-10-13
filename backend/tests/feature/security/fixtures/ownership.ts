import { deps } from '../../../../src/container';
import type { User } from '../../../../src/db/schema/users';

/** What another member must get when they call a route with a record that belongs to someone else. */
export type Expectation =
  /** The record is hidden: 404, so its existence is not revealed (L2-044 criterion 1). */
  | 'not_found'
  /** The record may be known but is not theirs to change: 403 (L2-014 criterion 2). */
  | 'forbidden'
  /** The route acts on the caller's own data only; nothing of the owner appears or changes. */
  | 'self_only';

/** One owner's data prepared for a route, and how to tell afterwards that it was left alone. */
export interface Scenario {
  /** Route parameters that name the owner's record. */
  params?: Record<string, string>;
  /** A valid request body, so validation never hides the ownership check. */
  body?: Record<string, unknown>;
  /** Strings from the owner's data that must never appear in the response. */
  sentinels?: string[];
  /** True while the owner's data is unchanged. */
  intact?: () => Promise<boolean>;
}

/** The cross-user case for one authenticated route, keyed like `PUT /api/v1/projects/[project]`. */
export interface RouteOwnershipFixture {
  route: string;
  expect: Expectation;
  arrange: (owner: User) => Promise<Scenario>;
}

/** Captures rows now and answers later whether they are exactly as they were. */
export async function snapshot(
  table: string,
  column: string,
  value: number | string,
): Promise<() => Promise<boolean>> {
  const rows = async () =>
    JSON.stringify(
      (
        await deps().db.query(
          `select row_to_json(t)::text as row from ${table} t where ${column} = $1`,
          [value],
        )
      ).rows
        .map((row: { row: string }) => row.row)
        .sort(),
    );
  const before = await rows();
  return async () => (await rows()) === before;
}
