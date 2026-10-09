# 23 · Noir & Gold

Dark luxury. Banaro as a private members' house: black, ivory and gold leaf, a high-contrast
didone headline, very little copy, and large photographs printed as black-and-gold duotones.
Everything moves slowly — fades of 1.2 s and more, a photograph that develops over 2.4 s, a
gold sheen that drifts across a button. The light theme is the same house by day: ivory paper,
black ink, gold.

<!--
Cast and catalog: docs/mocks/README.md ("Cast and catalog"). Today is Friday 9 October 2026,
viewer on the directory is Amara Osei (Leslieville). Builders 1–11 are duotone portraits;
Esther Nguyen (12) is an italic gold monogram on black.
-->

## The idea

- **Sparse and centred.** One headline, one sentence, two actions, then a cinematic 21:9
  duotone photograph. Sections are announced with small-caps eyebrows and italic didone titles
  ("Four rooms, *one table*", "Works *in progress*").
- **Gold is material, not colour.** A gold-leaf gradient (`--color-gold-leaf`) fills hairline
  rules, roman numerals, figures and one word of the headline (`background-clip: text`);
  gold-fill buttons sheen on hover.
- **Duotone photographs.** Grayscale, high-contrast images under a gold layer with
  `mix-blend-mode: multiply` — shadows stay black, highlights turn gold. Hover slowly develops
  them back toward colour.
- **The directory is a members' list.** Numbered rows, a portrait in a 4:5 frame, the name in
  Bodoni, role in italic, skills and project as small-caps labelled lines, match as a figure,
  and one quiet action ("Request an introduction").

## What varies

| Axis | Choice |
|---|---|
| Whitespace | Extreme: 128 px between sections on desktop, centred narrow measure |
| Line height | 1.02 display, 1.55 body (Cormorant at 19 px) |
| Density | Low on home (3 featured members, 5 projects); medium in the list |
| Palette | `--palette-noir-*`, `--palette-ivory-*`, `--palette-gold-*`; sage and claret only for status |
| Imagery | Large duotone photographs and portraits |
| Texture | Gold-leaf gradient on rules and type; no noise |
| Motion | Long, slow fades: the hero develops on load, photographs develop on hover |
| Browser features | `mix-blend-mode`, `background-clip: text`, CSS masks for the gold monogram ring, `font-variant-caps: all-small-caps`, old-style figures |

## Type

- **Display:** Bodoni Moda 400 (optical sizes up to 96), roman for names and figures, italic for
  emphasis, section titles and the monogram.
- **Labels:** Bodoni Moda in all-small-caps, letter-spaced 0.24em (`.sc`).
- **Body:** Cormorant Garamond 500 at 19 px, old-style numerals.
- Scale: 13 · 15 · 19 · 22 · 26 · 32 · fluid 36→60 (h2) · fluid 44→88 (h1) · fluid 48→136 (display).

## Palette

| Role | Light (ivory) | Dark (noir) |
|---|---|---|
| Canvas | ivory 100 | noir 900 |
| Text | noir 950 (17.1:1) | ivory 200 (16.1:1) |
| Muted | umber 700 (8.1:1) | umber 300 (9.0:1) |
| Gold text | gold 700 (5.2:1) | gold 300 (9.6:1) |
| Gold button | gold 500→200 gradient, noir text (≥ 6.7:1) | same |
| Gold-leaf type | display sizes only (≥ 3:1 at its darkest stop on noir) | same |

## Motion

| Element | Duration | Easing | Reduced motion |
|---|---|---|---|
| Headline and intro fade | `--duration-deliberate` 1.8 s | `--ease-enter` | Not declared |
| Hero photograph develops (fade + 1.06→1 scale) | `--duration-glacial` 2.4 s | `--ease-standard` | Not declared |
| Duotone → colour on hover | `--duration-slow` 1.2 s; scale 2.4 s | standard / enter | Instant |
| Gold sheen on buttons, letter-spacing widen | 1.2 s | `--ease-standard` | Instant |
| Nav underline draw | 1.2 s | `--ease-enter` | Instant |

## Browser features and fallbacks

- `mix-blend-mode: multiply` duotone: universally supported; in forced-colours mode the gold layer
  is removed and the plain grayscale photo shows.
- `background-clip: text` gold leaf: falls back to plain text colour under forced colours.
- The monogram's gold ring uses CSS masks (`mask-composite: exclude`); without masks the ring
  becomes a filled gold disc behind the italic B.
- No scroll-linked effects: content never waits on scroll position, so thumbnails, print and
  screenshots always show every section.
- One inline script folds the "Refine the list" panel on phones; it is open without JavaScript.

## Responsive behaviour

- **360 px:** brand and actions on one line, the four nav items as a small-caps row beneath; the
  hero photo becomes a 4:5 portrait crop; members stack; list rows show the portrait on the left
  with name, role, place, details and action stacked on the right; refine folds into a disclosure.
- **768 px:** members in three staggered columns; list rows gain number, details and match columns.
- **1280 px:** a centred monogram with the nav on the left and actions on the right; the refine
  column sits beside the list.

## Accessibility

- Gold text is reserved for large display sizes or the darker gold-700 / lighter gold-300 tokens
  that pass 4.5:1; small labels in gold use those tokens, never the gradient.
- Portraits in the list are decorative (`alt=""`) because the name is adjacent; featured and
  testimonial portraits carry names.
- Focus: 2 px gold ring with a 3 px offset; whole member cards show the ring via `:focus-within`.
- Filters are real checkboxes; the selected state adds a gold diamond, not only a colour change.

## What to take from it

Noir & Gold makes Banaro feel exclusive and considered — good for events, demo nights and the
matching invitation. The duotone treatment also hides the inconsistency of stock and member
photography. The risks: luxury can read as gatekeeping for a community platform, Cormorant is
delicate at small sizes, and slow motion must never delay a task.

## Open questions

- Is "members" the right word for a free community, or should copy stay with "builders"?
- Should gold be reserved for events and matching only, keeping the directory monochrome?

<!-- coverage:start -->

Legend: ✅ mock exists · ➖ not applicable (reason in manifest) · ❌ missing

### Pages

| Screen | default | loading | empty | error | Requirements |
|---|---|---|---|---|---|
| Home (`home`) | [✅](pages/home/default.html) | ➖ | ➖ | ➖ |  |
| Builder directory (`directory`) | [✅](pages/directory/default.html) | ➖ | ➖ | ➖ |  |

<!-- coverage:end -->
