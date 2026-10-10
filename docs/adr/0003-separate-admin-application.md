# ADR-0003: Keep the Administrator Area as a Separate Angular Application

**Date:** 2026-10-09
**Category:** frontend
**Status:** Accepted
**Deciders:** Quinntyne Brown, Claude

## Context

Administrators moderate reports (L2-033) under `/admin`. Members and visitors should not download
administrator code, and the moderation screens should not count against the public bundle budgets
(L2-048). The Angular workspace already has an `admin` project next to `banaro`.

## Decision

The administrator area is the `admin` application in the `frontend/` workspace, served by the
`banaro-web` image under `/admin`. It shares the `components` and `api` libraries with `banaro`, and
never imports from the `banaro` application.

## Options Considered

### Option 1: Separate `admin` application
- **Pros:** no administrator code in the public bundle, separate budgets, and a clear security
  boundary in review.
- **Cons:** adds a second build and a second Playwright project.

### Option 2: Lazy-loaded `/admin` routes inside `banaro`
- **Pros:** one build.
- **Cons:** administrator chunks still ship with the public app's assets, and state shared between
  the two areas leaks more easily.

## Consequences

### Positive
- The public bundle stays small, and administrator code is reviewed in one place.

### Negative
- Shell pieces that both applications use must live in the `components` library.

### Risks
- None from this split for access control. The API stays the authority, and the admin app grants
  nothing the API does not already allow.

## Implementation Notes

- `angular.json` builds `admin` with `baseHref` set to `/admin/`.
- Playwright has an `admin` project, with page objects under `e2e/pages/admin/`.

## References

- `AGENTS.md` (Target folder structure)
- `docs/mocks/README.md` (Open questions)
