# ADR-0004: Development Adapters for the Unsupplied Mail, Media and Scanning Vendors

**Date:** 2026-10-09
**Category:** integration
**Status:** Accepted (amended 2026-10-13 for ADR-0007)
**Deciders:** Quinntyne Brown, Claude

## Context

The detailed designs put the mail provider, the media scanner and the media storage behind contracts,
and leave each vendor as `<TO SUPPLY>`. Identity (the verification e-mail) and profiles (photo upload
and scanning) need working implementations before the vendors are chosen.

## Decision

Banaro uses these adapters until the vendors are chosen:

- **Mail:** `SmtpMailer` (Nodemailer), pointed at Mailpit in Docker Compose. Tests bind
  `InMemoryMailer`, which records each message for assertions.
- **Media storage:** a private local directory (`MEDIA_PATH`, `storage/media` in the image). Files get
  random names and are never served statically.
- **Media scanner:** `FakeMediaScanner` (`backend/src/integrations/fake-media-scanner.ts`), which
  implements the `MediaScanner` contract (`backend/src/contracts/media-scanner.ts`). It accepts every
  file except those that contain the EICAR test string.

## Options Considered

### Option 1: Development adapters behind the contracts
- **Pros:** features can be built and tested now, and swapping in a vendor only changes a binding.
- **Cons:** the fake scanner gives no real protection, so it must not reach production.

### Option 2: Wait for vendor selection
- **Pros:** no throwaway code.
- **Cons:** blocks identity and profiles, which every other feature builds on.

## Consequences

### Positive
- Every feature can be built and tested locally.

### Negative
- Before production, the fake scanner must be replaced and a mail vendor and a storage vendor chosen.

### Risks
- Deploying the fake scanner to production. To prevent this, `/health/ready` reports not ready in
  production while the fake scanner is bound.

## Implementation Notes

- Bind the contracts in `backend/src/container.ts`, choosing each implementation from configuration
  in `backend/src/config/banaro.ts`. Integration tests replace bindings with `setDeps()`.

## References

- `docs/detailed-designs/README.md` (External systems)
