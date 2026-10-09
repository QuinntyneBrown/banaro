# 22 · Kinetic

Type that moves. Banaro speaks in giant condensed capitals that inflate letter by letter,
scroll past in yellow marquees, stretch wide when you point at them and swell as you scroll.
Black, white and one highlighter yellow; no photographs except grayscale portraits that flood
yellow on hover. The directory is a list of names set so large that each builder is a headline;
hover or focus a name and it widens, the row fills with highlighter and the details unfold.

<!--
Cast and catalog: docs/mocks/README.md ("Cast and catalog"). Today is Friday 9 October 2026,
viewer on the directory is Amara Osei (Leslieville). Live activity lines come from the README's
"Live activity" list.
-->

## The idea

- **The headline is the hero.** "Build what matters, with believers down the street." fills the
  first screen at up to 240 px, each letter rising from hairline weight to black (Big Shoulders
  Display 100 → 900) on a 28 ms stagger. "Believers" sits on a highlighter bar.
- **Marquees as rhythm.** A yellow band ("Faith · Craft · Neighbours · Build together") and an
  inverted band running the other way separate the hero from the content; the directory carries
  a small live-activity ticker.
- **Width is the hover state.** Archivo's `wdth` axis (62–125) does the work hover colours do
  elsewhere: nav links, buttons, area rows and builder names stretch on hover and focus.
- **Scroll scales the verse.** "Two are better than one" grows from 55% to full size and from
  weight 200 to 900 as it crosses the viewport (`animation-timeline: view()`).

## What varies

| Axis | Choice |
|---|---|
| Whitespace | Tight inside blocks, heavy 3 px rules between them; sections 48–80 px |
| Line height | 0.84 display, 1.45 body |
| Density | Medium: one builder per row, but each row is a headline |
| Palette | `--palette-ink`, `--palette-white` / `--palette-paper`, `--palette-highlighter` only (plus green for online) |
| Imagery | Grayscale, high-contrast portraits on home; none in the directory |
| Texture | None; rules and type only |
| Motion | Letter reveal, marquees, wdth/wght hover, highlighter wipes, scroll-scaled verse |
| Browser features | Variable-font axes (`font-stretch`, `font-weight` animation), `animation-timeline: view()`, `:has()` for toggle chips, `grid-template-rows: 0fr → 1fr` expand, `-webkit-text-stroke` outline type |

## Type

- **Display:** Big Shoulders Display 100–900, uppercase, line-height 0.84.
- **Text and UI:** Archivo 400–900 at widths 62–125%. Body copy runs slightly condensed (90–92%)
  for a newspaper-tight texture; names default to 62% and open to 100% on hover.
- **Numerals and indices:** JetBrains Mono for row numbers (01, 02…) and section numbers.
- Scale: 12 · 14 · 16 · 20 · 24 · 32 · fluid 40→72 (h2) · fluid 56→160 (h1) · fluid 64→240 (display).

## Palette

| Role | Light | Dark |
|---|---|---|
| Canvas | white | ink (#0a0a0a) |
| Text | ink (19.8:1) | paper (18.1:1) |
| Muted | gray 600 (6.7:1) | gray 450 (9.1:1) |
| Highlight fill | yellow, ink text (16.9:1) | yellow, ink text (16.9:1) |
| Accent text | ink (yellow is never text on white) | yellow (16.9:1 on ink) |
| Focus ring | 3 px ink + 3 px yellow halo | 3 px yellow + ink halo |

## Motion

| Element | Duration | Easing | Reduced motion |
|---|---|---|---|
| Letter inflate (h1) | 700 ms each, 28 ms stagger | `--ease-enter` (expo out) | Not declared; letters render at weight 900 |
| Marquees | 38 s / 60 s per loop, pause on hover | linear | Not declared; the band is static and decorative (`aria-hidden`) |
| wdth / wght hover | 180–420 ms | `--ease-enter` | Instant (durations collapse) |
| Highlighter wipe (rows, buttons) | 420 ms | `--ease-enter` | Instant |
| Row expand (directory) | 420 ms | `--ease-enter` | Details are always open |
| Verse scale on scroll | scroll-linked | linear | Not declared; verse is full size |
| "16 spots left" dot blink | 1.2 s steps | — | Not declared |

## Browser features and fallbacks

- `animation-timeline: view()` is wrapped in `@supports` and `prefers-reduced-motion:
  no-preference`; elsewhere the verse is simply big.
- Variable-font animation needs a variable font (both are local variable woff2 files).
- `:has()` styles checked filter toggles; without it the native checkbox is still operable
  (visually hidden but focusable, with a visible focus ring via `:has()`; older browsers fall
  back to the label text without the yellow state).
- The directory row expand uses `grid-template-rows` transitions (Chromium 117+, Safari 17.4+);
  older browsers snap open.
- `-webkit-text-stroke` draws outlined project names; on touch devices and forced colours they
  are solid.
- One inline script collapses the filter panel on phones; without JavaScript it stays open.

## Responsive behaviour

- **360 px:** the primary nav becomes a second header row of four words; the hero headline
  wraps to six lines at 56–64 px; area rows stack the description under the word; tiles go two
  per row; filters collapse into a "Filters" disclosure above the results; builder rows are
  always expanded on touch (no hover).
- **768 px:** headline at ~110 px; three-column stats.
- **1280 px:** inline nav, a 17 rem filter rail beside the results, names up to 84 px, area rows
  in four columns with the arrow on the right.

## Accessibility

- The split h1 is `aria-hidden`; a visually hidden copy carries the real sentence.
- Marquees are decorative (`aria-hidden="true"`); every fact they show also appears as real text
  (stats, events, verse).
- Builder rows: the name link and every action expand the row on focus (`:focus-within`), so
  keyboard users get the same details as pointer users; on touch and with reduced motion the
  details are always shown.
- Yellow is only ever a background under ink text, never text on white.
- Filters are real checkboxes in labelled fieldsets; the sort select and search are labelled.

## What to take from it

Kinetic type gives Banaro a voice nothing else in the set has: confident, urban, poster-like.
The width-on-hover interaction is a cheap, distinctive hover state worth keeping even in a
calmer direction. The risk is accessibility and fatigue: motion must stay optional, and the
directory needs a denser view for people scanning 1,284 builders.

## Open questions

- Should a "compact" toggle swap the headline rows for a dense table?
- Is the live-activity ticker real-time (WebSocket) or refreshed on page load?

<!-- coverage:start -->

Legend: ✅ mock exists · ➖ not applicable (reason in manifest) · ❌ missing

### Pages

| Screen | default | loading | empty | error | Requirements |
|---|---|---|---|---|---|
| Home (`home`) | [✅](pages/home/default.html) | ➖ | ➖ | ➖ |  |
| Builder directory (`directory`) | [✅](pages/directory/default.html) | ➖ | ➖ | ➖ |  |

<!-- coverage:end -->
