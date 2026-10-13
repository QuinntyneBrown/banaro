# ADR-0010: sharp for Profile Photo Processing

**Date:** 2026-10-13
**Category:** integration
**Status:** Accepted
**Deciders:** Quinntyne Brown, Claude

## Context

ADR-0006 chose PHP's GD extension to crop and resize uploaded photos to a 480 × 480 px WebP, so that
no metadata (GPS EXIF included) survives (L2-008 criteria 1 and 4). GD does not exist on Node
(ADR-0007).

## Decision

Banaro processes photos with `sharp`, which wraps libvips.
`backend/src/services/profiles/photo-processor.ts` is the only module that decodes uploads.

- It checks the file's magic bytes (JPEG, PNG or WebP) before handing it to sharp.
- It applies the square crop, resizes to 480 × 480 px and encodes WebP. sharp writes no metadata
  unless asked, so the output carries none.
- It caps the input pixel count, so a decompression bomb is rejected.

## Options Considered

### Option 1: sharp (chosen)
- **Pros:** fast and lean on memory; prebuilt binaries for Linux and Windows; strips metadata by
  default.
- **Cons:** a native dependency that must match the image's platform.

### Option 2: Jimp
- **Pros:** pure JavaScript.
- **Cons:** slow, memory-hungry on 5 MB images, and weak WebP support.

### Option 3: ImageMagick on the command line
- **Pros:** broad format support.
- **Cons:** a long advisory history, which matters for a service that decodes untrusted uploads.

## Consequences

### Positive
- The same behaviour as GD, and colour profiles are converted rather than dropped.

### Negative
- The runner stage of the Dockerfile must install sharp for its own platform.

### Risks
- A decoder flaw in libvips affects every upload. Only `photo-processor.ts` decodes untrusted files,
  and the version is pinned and checked by `npm audit`.

## References

- ADR-0006 (superseded by this record)
- `docs/detailed-designs/profiles/change-profile-photo/README.md`
