# 25 · Clay

Banaro as a world of soft, inflated clay. Every surface looks squeezed out of pastel plasticine:
cards, buttons, inputs and avatars have an inner highlight, an inner shade and a soft plum drop
shadow, so they read as puffy objects sitting on a lilac-cream table. A cast of round clay builder
characters ("claylings") with tiny laptops, hard hats, coffee cups and hearts bob in the hero and
squish when you hover them.

<!--
Cast and catalog: docs/mocks/README.md (shared by every concept). Today is Friday 9 October 2026,
viewer Amara Osei (Leslieville). Directory shows builders 1–12 in Best match order.
-->

## What varies

| Axis | Choice |
|---|---|
| Whitespace | Generous: sections at 4–6rem, card padding 1.5–2rem, 28–56px radii everywhere |
| Line height | 1.6 body, 1.04 display; round faces need air |
| Density | Low. 12 results as roomy tiles; filters in a puffy side panel |
| Palette | Pastel clay: peach (accent), mint, lilac, sky, butter on lilac cream; plum ink, never grey |
| Imagery | CSS clay characters, a clay CN Tower, floating clay blobs; real portraits inside clay rings |
| Texture | Lighting only: layered inset + drop shadows (`--shadow-1…4`), pressed state = `--shadow-pressed` |
| Motion | Idle bob, squish-and-settle on hover, springy buttons |
| Browser features | Container query units for the stage, `:has()` for card focus, `details` menu, custom checkboxes and range |

## Type

- **Fredoka** (500–700) for display, headings, buttons and nav: round terminals match the clay.
- **Nunito** (500 body, 700–800 labels) at 17px: friendly, very legible on pastel.

## Palette and tokens

Light: canvas `--palette-lilac-50`, surfaces cream/white, text `--palette-plum-900` (13.4:1),
muted plum 7.3:1, accent peach `--palette-peach-400` with dark peach text on it (8.2:1), links
lilac-700 (7:1). Card tints (`--clay-tint-*`) keep muted text above 5.9:1.
Dark = clay after sunset: plum studio `--palette-plum-950`, dusky pastel tints, the same peach
accent lifted to peach-300, butter focus ring. Clay lighting is tokenised as RGB triplets
(`--clay-hi`, `--clay-lo`, `--clay-drop`) plus alphas, so dark mode softens the highlight and
deepens the shade without touching components.

## Motion

| What | Duration / easing | Reduced motion |
|---|---|---|
| Idle bob of characters and blobs | `--duration-idle` 3.6s, `--ease-standard`, infinite | Off (static pose) |
| Squish on hover (character, avatar) | `--duration-deliberate` 620ms keyframes | Off |
| Button lift / press | `--duration-base` 240ms, `--ease-spring` | Durations collapse to 0.01ms |
| Card lift on hover | `--duration-slow` 420ms, `--ease-spring` | Instant |
| Online dot bob | 1.8s loop | Off |

Every keyframe animation sits inside `@media (prefers-reduced-motion: no-preference)`.

## Browser features

- Container query units (`cqi`) size the hero stage cast; supported in all evergreen browsers.
- `:has(:focus-visible)` puts the focus ring on the whole area/builder card; without `:has()` the
  link itself still shows a ring.
- `details/summary` menu works without JavaScript. One small inline script on the directory opens
  the filter panel from "All filters" on small screens; without it the quick-filter chips remain.

## Responsive

360: single column, menu button, hero copy then the stage, filters collapse to a scrolling chip
row plus "All filters". 768: two-column cards. 1280: hero side by side, sticky filter panel and
three-column tiles. No horizontal page scroll at any width.

## Accessibility

Landmarks, one h1, skip link, labelled search/sort/range, real checkboxes, `aria-pressed` chips,
`aria-current` nav, badge counts with `aria-label`. Characters are decorative (`aria-hidden`).
Focus ring 3px lilac (butter in dark) with offset.

## What to take from it

The lighting tokens (inner highlight + inner shade + tinted drop) and the "pressed into the clay"
selected state are a strong, ownable language for toggles and chips. The characters give Banaro a
mascot system without illustration files.

<!-- coverage:start -->

Legend: ✅ mock exists · ➖ not applicable (reason in manifest) · ❌ missing

### Pages

| Screen | default | loading | empty | error | Requirements |
|---|---|---|---|---|---|
| Home (`home`) | [✅](pages/home/default.html) | ➖ | ➖ | ➖ |  |
| Builder directory (`directory`) | [✅](pages/directory/default.html) | ➖ | ➖ | ➖ |  |

<!-- coverage:end -->
