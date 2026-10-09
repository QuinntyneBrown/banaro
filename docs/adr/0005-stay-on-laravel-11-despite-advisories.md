# ADR-0005: Stay on Laravel 11 Despite Open Security Advisories

**Date:** 2026-10-09
**Category:** backend
**Status:** Accepted
**Deciders:** Quinntyne Brown, Claude

## Context

The architecture baseline (`docs/detailed-designs/README.md`, `AGENTS.md`) names Laravel 11 on PHP 8.3.
Laravel 11 is past its security-support window, so no 11.x release fixes these advisories:

- `PKSA-d5tc-s1qs-h781` (CVE-2026-102279): XSS in the debug page
- `PKSA-m5cs-t1y6-qpcs`: path confusion in temporary signed URLs
- `PKSA-3r5d-mb8f-1qw9` and `PKSA-mdq4-51ck-6kdq` (CVE-2026-48019): CRLF injection through the
  default `email` validation rule

Composer 2 blocks insecure packages by default, so `laravel/laravel:^11` will not install unless we
change that setting. Laravel 13 is the current supported major.

## Decision

Banaro stays on Laravel 11 as the baseline says. `backend/composer.json` sets
`config.audit.block-insecure` to `false`, and the code works around each advisory as follows.

## Options Considered

### Option 1: Laravel 11 with mitigations (chosen)
- **Pros:** matches the written baseline and designs.
- **Cons:** known, unpatched vulnerabilities, and the blocking setting also hides any new advisories.

### Option 2: Laravel 13
- **Pros:** supported and patched.
- **Cons:** the baseline documents would need updating.

## Consequences

### Positive
- The code matches the documents as written.

### Negative
- Each mitigation below is a rule that reviewers have to enforce.

### Risks
- Advisories published from now on also install silently. Run `composer audit` in CI and treat any
  advisory not listed here as a failure.

## Implementation Notes

- **Debug page XSS:** set `APP_DEBUG=false` everywhere except local development. Production errors
  return the generic 500 body that carries only the request ID (L2-053).
- **Signed URL path confusion:** e-mail verification and password reset do not rely on Laravel's
  signed URLs alone. Links carry a random single-use token, stored hashed and checked against the
  user and its expiry (L2-002, L2-004).
- **CRLF in the `email` rule:** e-mail fields validate with `email:rfc,strict` plus a rule that
  rejects any control character, so CR and LF never reach mail headers.
- Revisit this ADR when moving to a supported Laravel major. That move supersedes this ADR.

## References

- `composer audit` output, 2026-10-09
- `docs/specs/L2.md` L2-001, L2-002, L2-004, L2-053
