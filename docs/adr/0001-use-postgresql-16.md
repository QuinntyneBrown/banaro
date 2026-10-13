# ADR-0001: Use PostgreSQL 16 for the Banaro Database

**Date:** 2026-10-09
**Category:** data
**Status:** Accepted (amended 2026-10-13 for ADR-0007 and ADR-0008)
**Deciders:** Quinntyne Brown, Claude

## Context

The detailed designs leave the Banaro database engine as `<TO SUPPLY>`, and the engine is needed
before the first migration lands. Banaro needs:

- text search across builder names, headlines and skills (L2-009)
- filtering on several dimensions (L2-010)
- ranked match suggestions (L2-022)
- reliable transactions for RSVP capacity and waitlist promotion (L2-020)

The backend's data layer (Drizzle ORM, ADR-0008) supports PostgreSQL, MySQL and SQLite.

## Decision

Banaro uses PostgreSQL 16 in every environment: local development, tests, CI and production.

## Options Considered

### Option 1: PostgreSQL 16
- **Pros:**
  - strong full-text search (`tsvector`, GIN indexes)
  - `jsonb`, plus partial and expression indexes
  - row locking for capacity-bound RSVPs
  - transactional DDL, so migrations are safer
- **Cons:** a little less common than MySQL on shared hosting.

### Option 2: MySQL 8
- **Pros:** widely hosted.
- **Cons:** weaker full-text search. No transactional DDL, so a failed migration can leave a
  half-applied schema.

### Option 3: SQLite
- **Pros:** no setup.
- **Cons:** a single writer, no shared server for the API and Worker replicas, and tests behave
  differently from production.

## Consequences

### Positive
- Directory search uses built-in full-text search, so no separate search service is needed.
- Tests run against the same engine as production.

### Negative
- Developers need a PostgreSQL server. Docker Compose provides one (ADR-0002).

### Risks
- PostgreSQL-specific SQL ties the code to the engine. We accept this, and keep that SQL inside
  services and migrations.

## Implementation Notes

- `DATABASE_URL` points at the `postgres:16` image in `docker-compose.yml`.
- Integration tests use a dedicated `banaro_test` database. The Vitest setup migrates it once and
  truncates the non-reference tables before each test.

## References

- `docs/detailed-designs/README.md` (Architecture baseline)
- ADR-0002
