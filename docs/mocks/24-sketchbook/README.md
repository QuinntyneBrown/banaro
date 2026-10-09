# 24 · Sketchbook

A founder's notebook. Banaro drawn by hand on dot-grid paper: marker headlines, highlighter
swipes over the words that matter, doodled arrows and circles in red pen, sticky notes for
projects, and builders as lined index cards with a small paper-clipped portrait that looks
photocopied in pencil. Switch to dark and the notebook becomes a chalkboard: slate green,
chalk-white type, chalk pastels, portraits redrawn in chalk.

<!--
Cast and catalog: docs/mocks/README.md ("Cast and catalog"). Today is Friday 9 October 2026,
viewer on the directory is Amara Osei (Leslieville). Builders 1–11 have sketch-filtered portraits;
Esther Nguyen (12) is a doodled monogram in a hand-drawn circle.
-->

## The idea

- **Paper you can feel.** The page is dot-grid (`radial-gradient` at a 22 px pitch); index cards
  are ruled with a red margin line; the verse sits on a sticky note; the matching invitation is a
  three-hole lined sheet; the footer is a dashed "cut here" line with scissors.
- **Hand-drawn, not clip-art.** Boxes use the classic asymmetric `border-radius` trick plus an
  inline SVG `feTurbulence` + `feDisplacementMap` filter (`#wobble`) applied only to a
  pseudo-element border, so the outline wobbles but the text stays crisp.
- **Annotations do the work of UI chrome.** The match score is a red-pen circle, the current nav
  item is highlighted, links underline in wavy red on hover, "start here!" points at the primary
  action with a doodled arrow, skills are highlighter swipes in five colours.
- **Sketch portraits.** Portraits are grayscale, high-contrast and multiplied onto the paper (light)
  or inverted and screened onto the slate (dark) — pencil by day, chalk by night.

## What varies

| Axis | Choice |
|---|---|
| Whitespace | Medium; sections at 64–80 px, generous card padding |
| Line height | 1.6 body (Atkinson Hyperlegible), 1.1 headlines |
| Density | Medium: 3 index cards per row in the directory, all details visible |
| Palette | Paper, ballpoint navy, red pen, five highlighters; chalkboard slate and chalk pastels in dark |
| Imagery | One taped photo, small paper-clipped sketch portraits, SVG doodles |
| Texture | Dot grid, ruled lines, margin lines, tape, sticky-note fold, chalk smudges (dark) |
| Motion | Highlighter swipe and arrow draw-on in the hero; springy tilt on hover |
| Browser features | SVG filters on pseudo-elements, `mix-blend-mode` with themed blend modes, `pathLength` stroke animation, `box-decoration-break: clone` |

## Type

- **Permanent Marker** — h1, h2, sticky-note titles, numerals (a thick felt-tip).
- **Caveat 700** — h3/h4, nav, buttons, margin notes, counts (quick handwriting).
- **Gochi Hand** — sticky-note body and the verse.
- **Atkinson Hyperlegible** — all reading text and form controls, so handwriting never carries
  information alone.

## Palette

| Role | Light (paper) | Dark (chalkboard) |
|---|---|---|
| Canvas | paper #faf7ef + dot grid | slate 900 + chalk dust |
| Text | ballpoint ink (13.4:1) | chalk (12.7:1) |
| Muted | ink 700 (6.9:1) | chalk dim (7.8:1) |
| Links | ballpoint blue (7.3:1) | chalk blue (8.3:1) |
| Annotations | red pen (6.1:1) | chalk pink (7.0:1) |
| Primary button | highlighter yellow, ink text (11.2:1) | chalk yellow, slate text (11.0:1) |
| Sticky notes | pastel paper, ink text (≥ 10.5:1) in both themes | same — paper notes pinned to the board |

## Motion

| Element | Duration | Easing | Reduced motion |
|---|---|---|---|
| Hero highlighter swipe | `--duration-deliberate` 900 ms, 300 ms delay | `--ease-enter` | Not declared; highlight shows fully |
| Doodled arrow draw-on (`pathLength` dash) | `--duration-draw` 1.4 s, 600 ms delay | `--ease-standard` | Not declared; arrow shows fully |
| Button and card tilt on hover | `--duration-base` 220 ms | `--ease-spring` | Instant |
| Sticky note straightens on hover | 220 ms | `--ease-spring` | Instant |

## Browser features and fallbacks

- `filter: url(#wobble)` on pseudo-elements needs the inline `<svg class="wobble-defs">` on each
  page; without SVG filter support the border is still drawn with the wobbly radius. Under forced
  colours the filter is removed.
- Sketch portraits use `filter` + `mix-blend-mode` values held in tokens
  (`--color-photo-filter`, `--color-photo-blend`) so the theme swaps pencil for chalk.
- The draw-on animation uses `pathLength="1"` with `stroke-dasharray`; browsers without it show
  the finished doodle.
- One inline script folds the filter checklist on phones; it stays open without JavaScript.

## Responsive behaviour

- **360 px:** nav wraps as a handwritten row under the brand; the hero stacks with the taped
  photo and sticky note below; areas, people and projects stack one per row; the checklist folds
  into a "Filters ✎" disclosure; cards keep the clipped portrait beside the name.
- **768 px:** two cards per row, two areas per row, sticky-note wall auto-fills.
- **1280 px:** hero split 7:5, four areas and four people in a row, the checklist beside a
  three-column grid of index cards.

## Accessibility

- Handwriting fonts are used for headings and short annotations only; every fact is also in
  Atkinson Hyperlegible or is a large heading.
- Match circles read "94% match" to assistive tech; the circle is decorative.
- Checkboxes are real inputs with a hand-drawn box and a red tick; focus shows a dashed 3 px ring.
- Highlight colours sit behind ink text and are never the only cue (skills are also a list).

## What to take from it

Sketchbook makes Banaro feel early, personal and unpolished in a good way — like the first page
of an idea. It suits a community of builders who sketch before they ship. Hand-drawn borders,
red-pen match circles and sticky-note projects are memorable signatures. Risks: it can read as
informal for investors and advisors, and handwriting at small sizes must stay rare.

## Open questions

- Should users be able to "pin" notes (projects) to their own notebook page?
- Is the chalkboard dark theme too literal, or a delight worth keeping?

<!-- coverage:start -->

Legend: ✅ mock exists · ➖ not applicable (reason in manifest) · ❌ missing

### Pages

| Screen | default | loading | empty | error | Requirements |
|---|---|---|---|---|---|
| Home (`home`) | [✅](pages/home/default.html) | ➖ | ➖ | ➖ |  |
| Builder directory (`directory`) | [✅](pages/directory/default.html) | ➖ | ➖ | ➖ |  |

<!-- coverage:end -->
