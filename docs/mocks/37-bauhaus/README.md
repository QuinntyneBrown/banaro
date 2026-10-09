# Banaro · Bauhaus

<!--
Cast and catalog: docs/mocks/README.md (Friday 9 October 2026, viewer Amara Osei in Leslieville).
-->

## The idea

Banaro as a Bauhaus poster. Every surface is a composition of paper, ink and three primaries — red,
yellow and blue — built from the four primary forms: circle, square, triangle and quarter-circle.
Layouts are asymmetric on a 12-column grid, numerals are huge, and there are **no photographs**:
each builder gets a generated geometric portrait (a field of colour plus two or three forms, a
different combination per builder), so the directory reads like a wall of Bauhaus tiles. The forms
also carry meaning: red circle = co-founding / builders, blue square = contributing / projects,
yellow triangle = advising / neighbourhoods, ink quarter-circle = the fourth area (matching).

## What varies

| Axis | Choice |
|---|---|
| Whitespace | Generous section padding (`--space-16`), but blocks butt against each other with heavy rules |
| Line height | Display 0.9, headings 1.05, body 1.45 |
| Density | Medium: 12 cards on the directory, facts in definition lists |
| Palette | Paper `#f1ece1`, ink `#111`, red `#d0261b`, blue `#1f4e9e`, yellow `#f2b705` |
| Imagery | None. Inline-SVG compositions; generated portraits per builder |
| Texture | None. Flat fields and 1/3/6 px rules (`--rule-*`) |
| Shape | Zero radius; the circle (`--radius-full`) is the only curve |
| Motion | Mechanical easing, shapes rotate a quarter turn on hover |

## Type

- **League Spartan** 900 for display, numerals and headings (uppercase, −0.02em tracking), 400–500 for body.
- **Josefin Sans** 700 for labels, nav, overlines and buttons — uppercase with 0.14em tracking.

## Palette and themes

Light: off-white paper with ink text, red primary action, blue links. Dark: a black ground
(`#0c0c0c`) with paper text and brighter primaries (`#ff5a47`, `#5b8dff`, `#ffc928`); the "black"
form token `--shape-ink` flips to paper so every composition keeps four values. On coloured fields,
text uses `--color-on-red/blue/yellow/ink`. All text pairs pass WCAG AA (checked when tokens were generated).

## Motion

| What | Duration | Easing | Reduced motion |
|---|---|---|---|
| Hero semicircle rotates | `--duration-loop` (48 s), linear, infinite | — | Not animated |
| Area forms rotate 90° and scale on hover | `--duration-slow` 420 ms | `--ease-standard` (0.7,0,0.2,1) | Instant |
| Portrait forms turn / slide on card hover | 420 ms | `--ease-standard` | Not animated |
| Button dot becomes a rotated square | `--duration-base` 240 ms | `--ease-standard` | Instant |
| Section numerals rise as they enter (scroll-driven) | view timeline | linear | Not animated |

## Browser features

- **Popover API** (`popover`, `popovertarget`) for the mobile menu and the filter sheet — no JavaScript. On desktop the same elements are forced visible in place. Browsers without popover support show neither on mobile; a fallback would be a `<details>` wrapper.
- **Scroll-driven animation** (`animation-timeline: view()`) inside `@supports`; the static state is the final, visible one.
- **`:has()`** draws the card focus ring when the card's name link (stretched over the card) is focused.

## Responsive

- 360: single column; the hero composition sits under the headline; stats in a 2×2 grid; the four areas stack; builders in two columns; the nav is a menu button opening a popover sheet; filters open as a bottom sheet from "All filters", with a horizontal chip scroller of quick filters.
- 768: areas become a 6-column mosaic (4+2 / 2+4); results in two columns.
- 1280+: asymmetric 12-column hero with the composition overlapping the headline; builders stagger up and down; projects mosaic with a 2×2 feature; filters as a sticky column.

## Accessibility

- Skip link, landmarks, one `<h1>`, `aria-current="page"` on Builders, labelled search, sort and range.
- Colour is never the only cue: shapes sit next to words ("Open to co-founding", "Online now").
- The whole card is clickable through the stretched name link; the actual buttons stay above it.
- Focus ring: 3 px blue (yellow in dark), offset 3 px.

## What to take from it

The geometric portrait generator is the idea worth keeping: it gives the 12 builders without photos
a distinct, ownable identity, and the shape-per-meaning system (circle/square/triangle/quarter)
could become Banaro's icon language even in a calmer direction.

## Open questions

- Would builders accept a generated portrait instead of a photo, or should it be the fallback only?
- The uppercase display type is loud on long names in other languages; test with real profiles.

<!-- coverage:start -->

Legend: ✅ mock exists · ➖ not applicable (reason in manifest) · ❌ missing

### Pages

| Screen | default | loading | empty | error | Requirements |
|---|---|---|---|---|---|
| Home (`home`) | [✅](pages/home/default.html) | ➖ | ➖ | ➖ |  |
| Builder directory (`directory`) | [✅](pages/directory/default.html) | ➖ | ➖ | ➖ |  |

<!-- coverage:end -->
