# 06 · Raw

<!--
Cast and catalog: docs/mocks/README.md. Today is Friday 9 October 2026; the directory viewer is
Amara Osei (Leslieville). The directory shows all 23 builders in best-match order.
-->

## The idea

Banaro as an honest web page. It looks almost like the browser's default stylesheet, on purpose:
a Times-like serif, blue underlined links that turn purple once visited, black rules, visible table
borders, and a single harsh highlighter yellow for what matters (the promise, "16 spots left", who is
looking for a co-founder, the current page). No textures, no photos, no illustrations, no radius,
no shadow, no easing. Density is the ornament: the home page is one long document with a table of
contents and numbered sections (§1–§5), and the directory is a single 23-row table.

## What varies

| Axis | Choice |
|---|---|
| Whitespace | Tight; sections are separated by 3px rules rather than space |
| Line height | Body 1.4, display 0.95 |
| Density | High: every section is a table; the directory shows 23 rows with 11 columns |
| Palette | White, black, link blue, visited purple, highlighter yellow; dark is the same page with the lights off |
| Imagery | None. Amara's avatar is a bordered "AO" |
| Texture | None |
| Motion | None. Durations are 0ms and easings are `steps(1, end)`; hover is an instant yellow highlight |
| Browser features | Popover API for the mobile menu and filter sheet, sticky table column, `aria-sort` |

## Type

- **Old Standard TT** (with Liberation Serif / Times New Roman fallbacks) for everything readable. It
  reads as "default serif" but has more character at display sizes; the h1 runs to 112px.
- **IBM Plex Mono** for metadata: the status strip, section numbers, skills, dates, distances,
  match percentages, captions and table headers.
- Body is 17px; table cells 14–17px.

## Palette

| Role | Light | Dark |
|---|---|---|
| Canvas | white | black |
| Text | black (21:1) | white (21:1) |
| Link | `#0000ee` (9.4:1) | `#7da7ff` (8.8:1) |
| Visited | `#551a8b` (11:1) | `#c58af9` (8.4:1) |
| Muted | `#595959` (7:1) | `#a6a6a6` (8.6:1) |
| Highlight | yellow with black text (19.6:1) in both themes |
| Online | `#006400` (7.4:1) | `#5cd65c` (11.2:1) |

## Motion

None. Every duration token is `0ms`. Hover, focus and current state are instant swaps to yellow;
buttons invert to black on hover and shift 2px on press. Reduced motion changes nothing because
nothing moves.

## Browser features and fallbacks

- **Popover API** (Chrome 114+, Safari 17+, Firefox 125+) opens the nav menu under 768px and the
  filter sheet under 1024px without script. On larger screens the same elements render inline.
- **Sticky first column** (`position: sticky`) keeps the builder's name visible while the directory
  table scrolls sideways inside its own region on phones.
- **Stacked tables:** the home page's tables unfold into labelled rows (`data-label` + `attr()`) under
  768px instead of scrolling.

## Responsive behaviour

- **360px:** masthead wraps into two rows (brand + Menu; Sign in + Join Banaro). Home tables stack.
  Directory: Filters button opens a bordered sheet; the results table scrolls inside a focusable
  region with the name column pinned.
- **768px:** nav links appear inline in brackets; tables return to grids; stats run four across.
- **1280px:** home splits Contents | quotes; the directory shows the whole filter form above the
  table: Role, Open to with Distance, three-column Neighbourhood list, then a full-width row of skills.

## Accessibility

- Real tables with `<caption>`, `scope="col"` / `scope="row"` and `aria-sort="descending"` on Match.
- The scrolling table region is focusable (`tabindex="0"`, `role="region"`, labelled by the count).
- Links are always underlined; focus turns any element yellow with a 3px black outline.
- Online is a dot and the words "Online now"; badge counts carry `aria-label`s.
- Skill chips use `aria-pressed`; filters are native checkboxes and a native select.

## What to take from it

The directory as a table is fast to scan, sort and compare, and it costs nothing to render. The
yellow highlight as a single "this matters" signal is a strong, cheap system for urgency and state.
Open question: how far the raw look can go before it reads as unfinished to first-time visitors.

## Coverage

<!-- coverage:start -->

Legend: ✅ mock exists · ➖ not applicable (reason in manifest) · ❌ missing

### Pages

| Screen | default | loading | empty | error | Requirements |
|---|---|---|---|---|---|
| Home (`home`) | [✅](pages/home/default.html) | ➖ | ➖ | ➖ |  |
| Builder directory (`directory`) | [✅](pages/directory/default.html) | ➖ | ➖ | ➖ |  |

<!-- coverage:end -->
