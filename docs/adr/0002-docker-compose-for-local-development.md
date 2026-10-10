# ADR-0002: Run the Backend Locally with Docker Compose

**Date:** 2026-10-09
**Category:** infrastructure
**Status:** Accepted
**Deciders:** Quinntyne Brown, Claude

## Context

The Banaro API and Banaro Worker run from one `banaro-api` image (Laravel 11 on PHP 8.3). They depend
on PostgreSQL (ADR-0001), Redis and a mail server.

Developer machines, including Windows ones, may not have PHP, Composer, PostgreSQL or Redis
installed. Native PHP on Windows also behaves differently from the Linux image that runs in
production.

## Decision

A root `docker-compose.yml` defines the local backend: `api`, `worker`, `postgres`, `redis` and
`mailpit`. Every backend command (Composer, Artisan, PHPUnit) runs inside the `api` service, for
example `docker compose run --rm api php artisan test`. The Angular workspace and Playwright run on
the host with Node.

## Options Considered

### Option 1: Docker Compose for the whole backend
- **Pros:** one command starts everything. Uses the same PHP build as production, and no PHP is
  needed on the host.
- **Cons:** file I/O through bind mounts is slower on Windows, and the first build has to pull images.

### Option 2: Native PHP and Composer on each machine
- **Pros:** the fastest file access, and familiar to Laravel developers.
- **Cons:** versions drift between machines and production, and PHP extensions are awkward to install
  on Windows.

## Consequences

### Positive
- Local development, CI and production share one image definition (`backend/Dockerfile`).

### Negative
- Backend commands are longer to type, because they use the `docker compose run --rm api ...` form.

### Risks
- Windows line endings or file permissions on bind mounts. `.gitattributes` keeps LF line endings for
  backend files.

## Implementation Notes

- The `api` service listens on `http://localhost:8100`. The Angular dev server proxies `/api` and
  `/sanctum` to it, so cookies stay first-party.
- Migrations never run when a container starts (L2-054). Run them with
  `docker compose run --rm api php artisan migrate`.

## References

- ADR-0001
- `docs/specs/L2.md` L2-054
