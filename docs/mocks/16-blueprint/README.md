# 16 · Blueprint

<!--
Cast and catalog: see docs/mocks/README.md (shared by all 40 concepts). Today is Friday 9 October 2026;
the directory viewer is Amara Osei (Leslieville), looking for a technical co-founder.
-->

## Idea

Banaro as an architect's drawing set: builders build, so the product is drawn like a building. Every
page is a sheet with a ruled border, zone markers (1–8, A–F) and a title block
("BANARO · SHEET A-101 · SCALE 1:1 · DRAWN 09.10.2026"). The home page is the general arrangement:
a street elevation from Leslieville rowhouses to the CN Tower, annotated with callouts and a
dimension line. Sections are numbered details; projects and events are schedules; co-founder
matching arrives as a red revision cloud. The directory is literally a drawing schedule of builders.

## What varies (compared with the other concepts)

| Axis | Choice |
|---|---|
| Whitespace | Tight and gridded; everything snaps to the 16 px / 80 px grid paper |
| Line height | Uppercase display at 1.05; body 1.55; mono annotations |
| Density | Highest of the four: all 7 projects and 4 events as schedules on home; 23 builders in a 9-column schedule on the directory |
| Palette | Light: white vellum with blue linework and a red revision pen. Dark: prussian blueprint with white lines and cyan highlights |
| Imagery | Inline SVG line drawings (street elevation, detail figures, match-radius plan, graphic scale). Portraits are cyanotypes: greyscale photos blended into the line colour |
| Texture | CSS grid paper (two gradient grids) behind everything |
| Motion | The pen draws the elevation in once (640 ms), detail figures redraw on hover, button corner ticks spring outward |
| Browser features | SVG `pathLength` stroke animation, `mix-blend-mode` cyanotypes, CSS masks, radial-gradient revision clouds, Popover API, responsive table-to-card schedules |

## Type

- **IBM Plex Sans** Light 300 uppercase with 0.04 em tracking for titles (architectural lettering),
  regular for body copy.
- **IBM Plex Mono** for every annotation: marks (B-01, P-03, M-02), legends, labels, numbers and the
  title block.

## Palette

| Role | Light (vellum) | Dark (blueprint) |
|---|---|---|
| Canvas | `#f3f7fa` with blue grid | prussian `#0f3e6b` with white grid |
| Lines | blue `#1f5fa8` | chalk `#f2f8ff` |
| Text / muted / subtle | `#0d2a4a` / `#24456b` / `#3a5a80` | `#f2f8ff` / `#d2e5f7` / `#b4d1ee` |
| Accent (primary button) | blue `#1f5fa8`, white text | cyan `#7fd8ff`, deep navy text |
| Redline (revisions, focus ring) | `#c23b2b` (4.9:1 on vellum) | `#ff9a8a` (5.3:1 on blueprint) |

All 46 token pairs pass `check_contrast.py`. Elevation is expressed as line weight (1, 1.5,
2.5 px) and a flat offset "highlighter" block, never a blurred shadow.

## Motion spec

| What | Duration | Easing |
|---|---|---|
| Hero elevation draws itself (stroke dash offset, staggered 0/60/120 ms) | 640 ms, once | `cubic-bezier(0.65, 0, 0.35, 1)` |
| Area figure redraws on hover | 900 ms | same |
| Button corner ticks spring out 3 px | 200 ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` |
| Revision cloud settles in | 360 ms | `cubic-bezier(0, 0, 0, 1)` |
| Menu and legend sheet unroll (clip-path) | 360 ms | same |
| Hover fills (highlighter) | 120 ms | `cubic-bezier(0.2, 0, 0, 1)` |

Inside `prefers-reduced-motion: no-preference` only; the drawing animates *from* hidden to its
resting, fully drawn state (`animation-fill-mode: backwards`), so with reduced motion or no
animation support it is simply drawn.

## Browser features and fallbacks

- **SVG stroke animation** with `pathLength="1"` so every line draws at the same pace regardless of length.
- **Cyanotypes** use `filter: grayscale()` plus `mix-blend-mode` over the line colour; without blend
  support the photo shows in greyscale.
- **Revision clouds** are four repeating radial gradients (one per edge), so they scale to any box
  without distortion.
- **Popover API** for the menu and the filter legend on small screens.

## Responsive behaviour

- 360: the sheet border tightens; zone markers hide; the elevation scales down above a two-column
  title block; schedules turn into labelled cards (each cell shows its column name); the filter
  legend opens as a sheet from the "Legend" button.
- 768: areas two by two; elevations two across.
- 1280: hero splits lettering and drawing; four areas as one row of details; elevations three
  across; schedules show every column; the filter legend runs as a five-column keynote strip above
  the full-width builder schedule; the footer is a full title block.

## Accessibility notes

- Tables keep `caption`, `th scope`, and `aria-sort="descending"` on Match; in card mode the header
  row is visually hidden but stays in the accessibility tree.
- The elevation and plan drawings have `role="img"` with titles that state the numbers they carry.
- Focus ring is a dashed redline outline, unmistakable against blue linework.
- Online status is a filled square plus words; match is a number plus a bar.

## What to take from it

The schedule: a dense, sortable, scannable table is the most efficient directory of all the
concepts, and the card fallback on phones keeps every field. The revision cloud is a memorable way
to flag what's new for the signed-in viewer.

## Open questions

- Is uppercase lettering too cold for a faith community? A sentence-case variant would soften it.
- 23 rows per page suits desktop; on phones the stacked schedule is long and may want 12.

<!-- coverage:start -->

Legend: ✅ mock exists · ➖ not applicable (reason in manifest) · ❌ missing

### Pages

| Screen | default | loading | empty | error | Requirements |
|---|---|---|---|---|---|
| Home (`home`) | [✅](pages/home/default.html) | ➖ | ➖ | ➖ |  |
| Builder directory (`directory`) | [✅](pages/directory/default.html) | ➖ | ➖ | ➖ |  |

<!-- coverage:end -->
