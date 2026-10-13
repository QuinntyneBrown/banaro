# ADR-0006: GD for Profile Photo Processing

**Date:** 2026-10-11
**Category:** integration
**Status:** Accepted
**Deciders:** Quinntyne Brown, Claude

## Context

The `change-profile-photo` design decodes an uploaded JPEG, PNG or WebP, applies a square crop,
resizes it to 480 × 480 px and encodes a new WebP, so that no metadata (GPS EXIF included) survives
(L2-008 criteria 1 and 4). It leaves the image library as `<TO SUPPLY>`.

## Decision

Banaro processes photos with PHP's bundled GD extension, built into the `banaro-api` image with JPEG
and WebP support. `App\Services\Profiles\PhotoProcessor` is the only class that calls it.

## Options Considered

### Option 1: GD
- **Pros:** ships with PHP, a small dependency surface, reads and writes JPEG, PNG and WebP, and a
  re-encoded file carries no metadata.
- **Cons:** no colour-profile handling; slower than libvips on very large images.

### Option 2: Imagick (ImageMagick)
- **Pros:** broader format and colour-profile support.
- **Cons:** a large native library with a long history of security advisories, which matters for a
  service that decodes untrusted uploads; metadata must be stripped explicitly.

### Option 3: libvips (through FFI or a package)
- **Pros:** fastest and leanest on memory.
- **Cons:** another native dependency and a PHP FFI binding for one feature.

## Consequences

### Positive
- No new package; uploads of at most 5 MB decode well within the API's memory limit.

### Negative
- Embedded colour profiles are dropped, so a wide-gamut photo can look slightly duller.

### Risks
- A decoder flaw in GD affects every upload. The image runs the distribution's patched libraries,
  and only `PhotoProcessor` decodes untrusted files, so a different library is a one-class change.

## References

- `docs/detailed-designs/profiles/change-profile-photo/README.md`
- ADR-0004 (media storage and scanning adapters)
