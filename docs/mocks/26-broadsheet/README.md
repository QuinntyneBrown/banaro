# 26 · The Banaro Courier

Banaro as a Toronto & GTA broadsheet. The home page is a front page: blackletter masthead with
ears, the edition line (Vol. III · No. 41 · Friday, October 9, 2026 · Toronto & GTA Edition ·
Free), a lead story set in justified, hyphenated columns with a drop cap and pull quote, real
halftone photographs, a "Builder Index" weather box, a "What's On" listings column, a "Wanted"
display ad for matching, and a projects table set like a markets report. The directory is the
classifieds page: **Builders Wanted & Available**, with an index of classifications and 23
builders set as dense classified ads.

<!--
Cast and catalog: docs/mocks/README.md. Today is Friday 9 October 2026; viewer Amara Osei.
Directory shows all 23 builders (dense concept) in Best match order; top three as display ads.
-->

## What varies

| Axis | Choice |
|---|---|
| Whitespace | Minimal: hairline column rules instead of gaps, 20px gutters, tight section flags |
| Line height | 1.34 body, 0.98 headlines |
| Density | Very high: 3-column lead story, 6-column profiles, 4–5 column classifieds with 23 ads |
| Palette | Newsprint `#f3eee2`, carbon ink, one spot of "Courier red" for kickers and focus |
| Imagery | Shared photos screened as true halftones (dot size follows tone) |
| Texture | Newsprint grain (SVG `feTurbulence`), double and thick-thin rules |
| Motion | Almost none: the masthead rule "prints" in once; photos ease on hover |
| Browser features | CSS multi-column with `column-rule`, `hyphens: auto`, `::first-letter` drop cap, container query units for the masthead, CSS halftone via `contrast()` + blend modes |

## Type

- **UnifrakturMaguntia** — masthead, "Wanted", imprint.
- **Playfair Display** 700–900 — headlines and the classifieds banner.
- **Old Standard TT** — italic decks, event names, report rows.
- **Newsreader** — body text, 16px, justified and hyphenated.
- **Archivo** at 72–85% width — condensed gothic kickers, labels, section index and ad classes.

## Palette and tokens

Day edition: ink `--palette-ink-900` on newsprint 16:1, secondary ink 10:1, tertiary 6.7:1,
Courier red 7.8:1. Night edition (dark): newsprint-coloured ink `--palette-night-ink-100` on
charcoal 14:1, red lifted to `--palette-red-300` (6.6:1). Radii are 0; shadows are flat offset
"print" shadows only for menus.

Halftone tokens: `--halftone-cell` (screen ruling), `--halftone-angle`, `--halftone-dot`,
`--halftone-lift` (pre-screen brightness), `--halftone-invert` and `--halftone-tint` +
`--halftone-blend`. The night edition inverts before and after screening so highlights print as
light dots on charcoal, a positive image rather than a negative.

## Motion

| What | Duration / easing | Reduced motion |
|---|---|---|
| Masthead thick-thin rule draws in once | `--duration-deliberate` 900ms, `--ease-enter` | Off |
| Photo scale on hover | `--duration-slow` 280ms | Off |
| Link/button colour | `--duration-fast` 100ms | Instant |

## Browser features

- Halftone: grayscale image + 50% radial-dot overlay, thresholded by `filter: contrast(14)` and
  tinted with `mix-blend-mode`. Works in all evergreen browsers; without filters you get a plain
  grayscale photo.
- `hyphens: auto` needs `lang="en"` (set); Chromium, Safari and Firefox support English.
- Container query units scale the masthead to fit between its ears at every width.

## Responsive

360: one column, masthead scales to fit, ears hidden, edition line wraps, section index scrolls
horizontally, the project report scrolls inside its own region, classifieds in one column with the
index of classifications behind a button. 768: two/three columns. 1280: six-column front page,
five-column classifieds and a five-column index with dot leaders.

## Accessibility

Real `<table>` with caption and scoped headers for the Builder Index and Project Report; the
scrolling report is a focusable labelled region. Every checkbox in the index is a real labelled
input; sort and distance are labelled selects. Halftone portraits in ads are decorative (the
name is in the text). Focus ring is 2px Courier red.

## What to take from it

Classifieds are a great directory format for scanning many people at once; the dot-leader filter
index with counts is clearer than chips. The halftone treatment unifies mismatched stock photos.

<!-- coverage:start -->

Legend: ✅ mock exists · ➖ not applicable (reason in manifest) · ❌ missing

### Pages

| Screen | default | loading | empty | error | Requirements |
|---|---|---|---|---|---|
| Home (`home`) | [✅](pages/home/default.html) | ➖ | ➖ | ➖ |  |
| Builder directory (`directory`) | [✅](pages/directory/default.html) | ➖ | ➖ | ➖ |  |

<!-- coverage:end -->
