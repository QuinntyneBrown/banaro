# ADR-0011: Redis Sessions with a Double-Submit CSRF Cookie

**Date:** 2026-10-13
**Category:** backend
**Status:** Accepted
**Deciders:** Quinntyne Brown, Claude

## Context

Laravel Sanctum authenticated the Banaro Web applications as first-party, stateful clients. Its
contract is built into the Angular `api` library, both proxies and the e2e suite:

- session cookie `banaro_session` (`HttpOnly`, `Secure`, `SameSite=Lax`), stored in Redis
- `XSRF-TOKEN` cookie echoed in the `X-XSRF-TOKEN` header, fetched from `GET /sanctum/csrf-cookie`
- status 419 on a CSRF mismatch, which the frontend's session recovery handles
- 30-day idle and 90-day absolute session lifetimes (L2-005)

Moving to Node (ADR-0007) removes Sanctum.

## Decision

Banaro keeps the contract exactly and implements it in the `handle()` request pipeline.

- Sessions live in Redis under `banaro:session:{id}`. The idle lifetime is the key's expiry, and
  `authenticated_at` in the session enforces the absolute lifetime.
- `banaro_session` carries the random session id, signed with a key derived from `APP_KEY`.
- The CSRF token is stored in the session and set as the `XSRF-TOKEN` cookie, which is not
  `HttpOnly`. Every `POST`, `PUT`, `PATCH` and `DELETE` must echo it in `X-XSRF-TOKEN`, compared in
  constant time, or gets 419.
- `email/verify`, `reset-password/check` and `email-preferences/unsubscribe` are exempt from the
  CSRF check (D-021, D-055). Each authenticates by a secret in its link and writes no session.
- Signing in rotates the session id and the CSRF token. Signing out deletes the session.
- `GET /sanctum/csrf-cookie` keeps its path, so the frontend does not change.

## Options Considered

### Option 1: Keep the contract in a session middleware (chosen)
- **Pros:** no frontend, proxy or e2e change; the session stays server-side and revocable.
- **Cons:** the `/sanctum` path names a library that is no longer used.

### Option 2: iron-session (sealed cookie sessions)
- **Pros:** no Redis read per request.
- **Cons:** sessions cannot be revoked server-side, which ending other sessions after a password
  change needs.

### Option 3: Auth.js (next-auth)
- **Pros:** a maintained library.
- **Cons:** built for Next.js pages, not for an Angular client; a different cookie and CSRF
  contract.

## Consequences

### Positive
- The frontend's `csrf.ts`, `session-recovery.ts` and `forward-request-cookies.ts` work unchanged.

### Negative
- Session and CSRF code is Banaro's to maintain and test.

### Risks
- A weak comparison or a missing exemption check would open CSRF. The integration suite covers 419
  on state-changing routes and the three exemptions.

## References

- ADR-0007
- `docs/implementation-decisions.md` D-021, D-055
- `docs/specs/L2.md` L2-003, L2-005, L2-045
