# 35 · Scrollytelling

Banaro told as a **picture book you scroll**. The home page does not list four features. It tells
one story in four scenes, and an inline-SVG illustration builds itself as you read. A lone founder
at a lamp-lit desk becomes a pair, then a table of builders, and then the Toronto skyline lights
up behind them. Each scene carries one of Banaro's four areas.

- **Home:** a parallax hero (sun, far skyline with the CN Tower, lit mid-rise blocks and a
  foreground hill move at different speeds), then **Chapter 01: the sticky stage**. On desktop the
  illustration sticks on the right while four scene cards scroll on the left. On phones it sticks
  to the top and the cards slide over it. The scenes follow Amara: building Harvest (Builder
  directory), matching with Noah (Co-founder matching), the Builders' Prayer Breakfast
  (Meetups and events), and 312 projects across the city (Project showcase). Then Chapter 02, the
  people (six portraits that reveal), Chapter 03, the work (alternating project spreads), Chapter
  04, events on a timeline whose line draws as you scroll, an epilogue for the matching call to
  action that sets the sun on the horizon, and an afterword with the verse and Hannah's quote.
  A **reading-progress bar** runs along the top. **Chapter markers** on the left light up for the
  chapter in view.
- **Directory:** "Builders near Leslieville, one story at a time". Results are big numbered rows
  (outlined numerals 01–12) that **reveal as they scroll in**. A **sticky filter header** keeps
  search, role and open-to chips, a "More filters" panel (neighbourhood, distance, skills) and a
  **results progress bar** ("Results 1–12 of 1,284 · page 1 of 107") that fills as you read
  through the page.

## What varies

| Axis | Choice |
|---|---|
| Whitespace | Cinematic: chapters at 6rem, scene steps at 85vh, one idea per screen |
| Line height | Display 0.98 (tight, poster-like); story text 1.5–1.6 in Newsreader |
| Density | Low on home, medium in the directory (12 wide rows) |
| Palette | Dawn paper `#fbf3e4`, indigo ink `#1d2150`, lake teal `#0f7a72` (actions), coral `#a63a1e` (kickers), marigold `#ffd27a` (sun, highlights). Dark: night indigo `#0b0f2b` with a lit city |
| Imagery | One flat-vector illustration built from tokens. Photography only for people, projects and the demo night |
| Texture | None: flat colour planes with soft shadows |
| Motion | Scroll is the timeline: parallax, assembling layers, reveals, a drawn timeline line, reading progress, lit chapter markers |
| Browser features | `animation-timeline: scroll()` and `view()`, named `view-timeline` with `timeline-scope`, `animation-range`, `position: sticky`, `text-wrap: balance` |

## Type

- **Bricolage Grotesque** (800) for display, chapter titles and UI. It is expressive and slightly
  hand-built.
- **Newsreader** for the story voice: ledes, scene text, roles and the verse in italic. Italic
  Newsreader also marks the emotional word in each headline ("believers", "Leslieville").

## Palette and themes

Light is dawn: cream paper, a pale sky and a marigold sun. Dark is the same story at night: indigo
sky, a cream moon, and marigold windows across the skyline. The epilogue inverts to paper in dark
mode. Illustration colours are tokens (`--color-ill-*`), so the SVG re-themes with no extra
markup. Every text pair passes AA (checked by script).

## Motion spec

| Effect | Timeline | Range | Easing |
|---|---|---|---|
| Reading progress bar | `scroll(root)` | whole page | linear (scroll-linked) |
| Hero parallax (sun, far, mid, near, copy fade) | `scroll(root)` | 0–100vh | linear |
| Scene layers: pair, table, city (fade and rise 40–80px) | named `--ch2`, `--ch3`, `--ch4` from the step cards, shared with `timeline-scope` | entry 30% to contain 20–30% | linear |
| Map pins on the city | `--ch4` | contain 0–40% | linear |
| Chapter marker lights | `--c1`…`--c7` | cover | linear |
| Card and row reveals (fade, rise 3rem, scale 0.96) | `view()` | entry 2–70% | linear |
| Events timeline line drawing | `--events` | entry 40% to exit 60% | linear |
| Hover and press | time-based: 150–260 ms | — | `--ease-standard` |

Reveals use `animation-fill-mode: forwards`, so content is visible before it reaches its range.
Assembling layers use `both`, so scene 1 shows only the lone builder.

**Reduced motion and fallbacks:** every scroll-driven rule is inside
`@supports (animation-timeline: view())` and `prefers-reduced-motion: no-preference`. Without
them, the stage shows the **complete composition** (table of builders in front of the lit city),
every card is visible, the timeline line is drawn, and the progress bars are full or hidden. The
story still reads as text. The illustration has a `<title>` and `<desc>`.

## Browser features and fallbacks

- Scroll-driven animations work in Chromium 115 and later. Safari and Firefox (as of 2026) get the
  static version described above.
- `timeline-scope` lets the sticky SVG react to step cards elsewhere in the DOM without
  JavaScript. The only script is a tiny chip toggle in the directory.

## Responsive behaviour

- **360:** the stage sticks to the top 52svh and cards scroll over it. Chapter markers are
  hidden, the nav is a menu, the filter header shows search, a filter icon, a scrolling chip row
  and the progress line, and result rows stack.
- **768:** result rows become four columns (numeral, portrait, details, actions).
- **1280:** the story is two columns with the stage sticky on the right, and chapter markers show
  on the left rail.

## Accessibility

- The DOM is the story in order. Animation never hides content without a fallback, and scene
  cards hold all the meaning in text. The SVG is `role="img"` with a title and a long description.
- Highlights (`mark`) use a wavy underline, not colour alone. Chips use `aria-pressed`. Filters
  have labels. Chapter markers are a labelled `nav` whose names appear on focus.
- The reading-progress bar is `aria-hidden` (decorative). The result count is real text.

## What to take from it

Banaro's value is relational, and a story of one founder finding her people explains the four
areas better than a feature grid. The sticky-stage pattern suits onboarding and the matching
explainer. In the directory, numbered rows and a sticky filter header with progress make a long
list feel finite.

<!-- coverage:start -->

Legend: ✅ mock exists · ➖ not applicable (reason in manifest) · ❌ missing

### Pages

| Screen | default | loading | empty | error | Requirements |
|---|---|---|---|---|---|
| Home (`home`) | [✅](pages/home/default.html) | ➖ | ➖ | ➖ |  |
| Builder directory (`directory`) | [✅](pages/directory/default.html) | ➖ | ➖ | ➖ |  |

<!-- coverage:end -->
