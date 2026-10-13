# ADR-0008: Drizzle ORM for Persistence

**Date:** 2026-10-13
**Category:** data
**Status:** Accepted
**Deciders:** Quinntyne Brown, Claude

## Context

ADR-0007 moves the backend to Node. Banaro's persistence relies on PostgreSQL 16 features
(ADR-0001): `tsvector` full-text search with GIN indexes, `jsonb` columns, a partial unique index,
and row locks (`SELECT ... FOR UPDATE`) for the project limit, single-use verification links and one
pending help offer per member.

The e2e fixtures insert rows with raw SQL, so table and column names, integer user ids and
`timestamp without time zone` columns in `America/Toronto` must stay as they are.

## Decision

Banaro uses Drizzle ORM with `drizzle-kit` SQL migrations.

- One module per table in `backend/src/db/schema/`, with the existing snake_case names. Row types are
  inferred from the schema.
- Migrations live in `backend/src/db/migrations/`. They run only through `banaro migrate`, never
  when a process starts (L2-054).
- The port starts from one hand-written baseline migration, `0000_baseline.sql`, that reproduces the
  final Laravel schema. It leaves out the tables that only Laravel used: `cache`, `cache_locks`,
  `jobs`, `job_batches`, `failed_jobs`, `sessions` and `migrations`. From the baseline on, every
  change is a new expand–contract migration.
- PostgreSQL-specific SQL (`to_tsquery`, `jsonb_exists`, the SQL twin of the match score) uses
  Drizzle's `sql` template tag with bound values, inside services.

## Options Considered

### Option 1: Drizzle (chosen)
- **Pros:** SQL stays visible; typed schema in TypeScript; `.for('update')`, `onConflictDoUpdate`
  and raw SQL fragments are first-class.
- **Cons:** younger than the alternatives; migrations are reviewed by hand.

### Option 2: Prisma
- **Pros:** widely known; generated client.
- **Cons:** row locks and full-text search need `$queryRaw`, and a separate schema language sits
  beside the TypeScript.

### Option 3: Kysely with node-pg-migrate
- **Pros:** the most control.
- **Cons:** the most hand-written code, with no schema definition to infer types from.

## Consequences

### Positive
- The schema, the queries and the row types live in one language.

### Negative
- The 22 Laravel migrations are replaced, not kept, so the history of the early schema lives only in
  git.

### Risks
- A baseline that differs from the Laravel schema would break the e2e fixtures. The baseline is
  checked against a `pg_dump --schema-only` of the Laravel schema before it lands.

## Implementation Notes

- The `pg` pool sets the session time zone to `America/Toronto` and returns `timestamp` values as
  strings, so nothing is shifted to the host time zone.
- Integration tests run against a real `banaro_test` database. They migrate it once and truncate the
  non-reference tables before each test.

## References

- ADR-0001, ADR-0007
- `docs/specs/L2.md` L2-054
