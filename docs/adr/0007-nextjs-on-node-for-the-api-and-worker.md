# ADR-0007: Next.js on Node for the Banaro API and Banaro Worker

**Date:** 2026-10-13
**Category:** backend
**Status:** Accepted
**Deciders:** Quinntyne Brown, Claude

## Context

The Banaro API and Banaro Worker were a Laravel 11 application on PHP 8.3. Laravel 11 is past its
security-support window, and ADR-0005 accepted four unpatched advisories with mitigations that
reviewers had to enforce. ADR-0005 also said that moving off Laravel 11 supersedes it.

Every other part of the repository is TypeScript on Node: the Angular workspace, the Playwright
suite, the component perf test and its runner. The PHP toolchain ran only inside Docker (ADR-0002),
so each contributor kept a second language, package manager and test runner for one container.

## Decision

The Banaro API and Banaro Worker are rewritten as one Next.js application on Node 22, written in
strict TypeScript, in `backend/`. Next.js serves only the API; the Angular workspace stays the
frontend.

- Route handlers under `backend/app/api/v1/**/route.ts`, `backend/app/health/*` and
  `backend/app/sanctum/csrf-cookie` are the HTTP surface. They validate, call one action and return a
  resource shape.
- Domain code lives in `backend/src`: actions, services, jobs, policies, notifications, the Drizzle
  schema (ADR-0008) and the request pipeline.
- The request pipeline is a `handle()` wrapper composed in every route handler. Next.js middleware is
  not used: it runs in a restricted runtime, cannot share the database and Redis clients, and cannot
  be called in-process by the integration tests.
- One `banaro-api` image runs the API (`node server.js`), the worker (`node dist/worker.js`), the
  scheduler (`node dist/scheduler.js`) and the CLI (`node dist/cli.js`).
- The HTTP contract does not change. That includes the Sanctum-era cookie names, the
  `/sanctum/csrf-cookie` path and status 419 (ADR-0011), the error and pagination shapes, and every
  table and column name.

## Options Considered

### Option 1: Laravel 13
- **Pros:** supported and patched; the code and designs mostly carry over.
- **Cons:** keeps a second language and toolchain for one container.

### Option 2: NestJS or Fastify
- **Pros:** purpose-built API frameworks with mature plugin ecosystems.
- **Cons:** another framework to learn beside Angular, with no benefit the project needs over route
  handlers and a small pipeline.

### Option 3: Next.js route handlers (chosen)
- **Pros:** one language and toolchain across the repository; standard `Request` and `Response`
  handlers that tests call in-process; a standalone server build for a small image.
- **Cons:** Next.js is a full-stack framework, and only its routing and server are used here. Each
  route must opt out of caching and the Edge runtime.

## Consequences

### Positive
- No PHP, Composer or unpatched framework advisories.
- Contributors need only Node and Docker.

### Negative
- Every backend feature is ported, and its integration tests are ported from PHPUnit to Vitest.

### Risks
- Next.js caches `GET` route handlers unless told not to. Every `route.ts` exports
  `runtime = 'nodejs'` and `dynamic = 'force-dynamic'`.
- Route modules can be loaded more than once. Database and Redis clients are singletons on
  `globalThis`, and BullMQ workers are created only in `src/worker.ts`.

## Implementation Notes

- Pin exact versions in `backend/package.json`.
- `next.config.ts` sets `output: 'standalone'`, lists native and server-only packages in
  `serverExternalPackages`, and turns off `poweredByHeader`.

## References

- ADR-0005 (superseded by this record)
- ADR-0008, ADR-0009, ADR-0010, ADR-0011
- `docs/detailed-designs/README.md` (Architecture baseline)
