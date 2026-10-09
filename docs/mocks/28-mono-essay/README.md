# 28 · Monochrome Essay

Banaro told as a black-and-white photo essay. The home page is a prologue and four photographic
chapters — I Builder directory, II Project showcase, III Meetups and events, IV Co-founder
matching — that snap into place as you scroll, with an interlude of portraits and a page of words
in between. Captions are minimal serif type; the only colours are greys.

The two themes are two ways of hanging the same photographs:

- **Dark (the dark room):** every chapter is a full-bleed photograph filling the viewport, the
  caption printed on it over a black scrim. Lots of darkness.
- **Light (the gallery):** white walls, each photograph a matted print with a soft shadow, the
  caption on a wall label beneath it.

The directory is a large black-and-white portrait grid with minimal captions and one restrained
row of filters.

<!--
Cast and catalog: docs/mocks/README.md. Today is Friday 9 October 2026; viewer Amara Osei.
Directory shows builders 1–12 in Best match order (Esther Nguyen has no photo: an initials print).
-->

## What varies

| Axis | Choice |
|---|---|
| Whitespace | Extreme around prints; chapters are a viewport tall |
| Line height | 1.5 body, 0.92 display |
| Density | Very low on home; directory medium (12 large portraits) |
| Palette | Greys only: gallery wall `#f4f3f0` / near-black `#0a0a0a` |
| Imagery | Full-bleed and matted photographs in CSS grayscale |
| Texture | None; photographs carry it |
| Motion | Prints "develop" (contrast settles) and captions rise as they scroll in |
| Browser features | `scroll-snap-type: y proximity`, scroll-driven animation (`animation-timeline: view()`), `svh` units, theme-driven layout tokens |

## Type

- **Instrument Serif** (roman and italic) — headlines, names, chapter numerals, the search field.
- **Cormorant Garamond** 500–600 — body at 19px, captions, spaced small-caps labels.

No sans-serif anywhere.

## Palette and tokens

Light: ink `--palette-grey-930` on wall 17:1, muted 8:1, subtle 5.8:1. Dark: `--palette-ink-100`
on near-black 16.9:1, muted 9.7:1, subtle 6.1:1. Layout tokens switch with the theme:
`--essay-mat` (6vw → 0), `--essay-photo-h` (76svh → 100svh), `--essay-caption-row` (2 → 1,
under the print vs. on it), `--essay-scrim`, `--essay-print-edge`, `--essay-photo-filter`.

## Motion

| What | Duration / easing | Reduced motion |
|---|---|---|
| Photo "develops" (contrast and scale settle) | scroll-linked, entry → 45% cover | Off (final state shown) |
| Caption / portrait rise | scroll-linked, entry 0–80% | Off |
| Portrait scale on hover | `--duration-slow` 700ms, `--ease-enter` | Instant |
| Buttons invert | `--duration-base` 320ms | Instant |

Scroll-driven animation is wrapped in `@supports (animation-timeline: view())` and
`prefers-reduced-motion: no-preference`, uses `forwards` fill so content is in its normal visible
state before it enters, and never runs on the prologue.

## Browser features

- `scroll-snap-type: y proximity` on the home page only (`html:has(.essay)`); the header is a
  snap point too so the page opens at the top.
- Scroll-driven animations: Chromium 115+; elsewhere photos and captions simply appear.
- `svh` keeps chapters stable when mobile toolbars move.

## Responsive

360: chapters stay a viewport tall in dark, prints shrink to a thin mat in light; portraits two
per row; the filter row scrolls horizontally inside itself. 768: three portraits per row.
1280: chapter captions split into numeral + text columns; four large portraits per row and the
five filters plus sort on one line.

## Accessibility

Every photograph has alt text describing the scene; portraits are "Portrait of …". Chapter
numerals are `aria-hidden` with a visually hidden "Chapter one" in the kicker. All filters are
labelled selects; actions are real buttons with names that include the builder. The dark scrim
plus a soft text shadow keeps captions above 7:1 over photos.

## What to take from it

Theme as a change of venue (gallery vs. dark room), driven entirely by layout tokens. The quiet
directory shows that a big portrait grid with three caption lines can carry everything a card can.

<!-- coverage:start -->
<!-- coverage:end -->
