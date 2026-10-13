# ADR-0002: Run the Backend Locally with Docker Compose

**Date:** 2026-10-09
**Category:** infrastructure
**Status:** Accepted (amended 2026-10-13 for ADR-0007)
**Deciders:** Quinntyne Brown, Claude

## Context

The Banaro API and Banaro Worker run from one `banaro-api` image (Next.js on Node 22, ADR-0007).
They depend on PostgreSQL (ADR-0001), Redis and a mail server.

Developer machines, including Windows ones, may not have PostgreSQL or Redis installed, and native
modules such as `sharp` and `bcrypt` are built for the platform they install on. A backend that runs
on the host can therefore behave differently from the Linux image that runs in production.

## Decision

A root `docker-compose.yml` defines the local backend: `api`, `worker`, `scheduler`, `postgres`,
`redis` and `mailpit`. Every backend command runs inside the `api` service, for example
`docker compose run --rm api npm test` or `docker compose run --rm api npm run banaro -- migrate`.
The Angular workspace and Playwright run on the host with Node.

## Options Considered

### Option 1: Docker Compose for the whole backend
- **Pros:** one command starts everything. Uses the same Node build and native modules as
  production, and needs no PostgreSQL or Redis on the host.
- **Cons:** file I/O through bind mounts is slower on Windows, and the first build has to pull images.

### Option 2: Native Node, PostgreSQL and Redis on each machine
- **Pros:** the fastest file access and the shortest commands.
- **Cons:** database and Redis versions drift between machines and production, and native modules
  differ by platform.

## Consequences

### Positive
- Local development, CI and production share one image definition (`backend/Dockerfile`).

### Negative
- Backend commands are longer to type, because they use the `docker compose run --rm api ...` form.

### Risks
- Windows line endings or file permissions on bind mounts. `.gitattributes` keeps LF line endings for
  backend files.
- `node_modules` built on Windows must not reach the Linux container. The `api` service keeps its
  `node_modules` in a named volume, not the bind mount.

## Implementation Notes

- The `api` service listens on `http://localhost:8100`. The Angular dev server and SSR server proxy
  `/api`, `/sanctum` and `/health` to it, so cookies stay first-party (ADR-0011).
- Migrations never run when a container starts (L2-054). Run them with
  `docker compose run --rm api npm run banaro -- migrate --seed`.
- Amended 2026-10-13: the commands were Composer, Artisan and PHPUnit until ADR-0007.

## References

- ADR-0001, ADR-0007
- `docs/specs/L2.md` L2-054
