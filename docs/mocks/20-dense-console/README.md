# 20 · Console

<!--
Cast and catalog: see docs/mocks/README.md (Amara Osei as viewer; builders 1–23; projects;
events; filter counts). "Today" is Friday 9 October 2026. Distances are from Leslieville.
-->

**Axes:** maximum density · line-height 1.3 · keyboard-first

A power-user console. Everything is 13 px with a 1.3 line height, hairline rules, 2–8 px
spacing and no photographs. Keyboard hints (`kbd`) sit on every nav item (`g b`, `g p`, `g e`,
`g m`), on actions (`↵`, `m`, `c`), on filter groups (`d`, `r`, `o`, `n`, `s`) and in a ⌘K
search button in the app bar. A vim-style status line closes every page.

Home is a rendered `README.md`: a file header with "38 online", `#` and `##` markdown headings,
the promise and both actions, a four-cell stat strip with a sparkline, then dense tables for
the four areas (with jump keys), eight featured builders, all seven projects and the four
events, and a terminal block for matching (`$ banaro match --need "technical co-founder"
--near leslieville`). A sticky outline sits on the left; the right rail carries the live
activity log, builders by role, top neighbourhoods, the verse and testimonial as code comments,
and a keyboard cheat sheet. The directory opens with the command palette shown open as a
static combobox ("co-founder laravel" with grouped options for builders, filters and actions),
a dense filter sidebar with counts, and a sortable 23-row table with every field: index, name,
role, neighbourhood, km, match (bar + %), skills, building, open to, last seen and an action.

## What varies in this concept

| Axis | Choice |
|---|---|
| Whitespace | Minimal: `--space-*` steps of 2–8 px inside, 16–20 px between sections. |
| Line height | 1.3 for body and tables, 1.15 for the h1, 1.45 for the lead only. |
| Density | Maximum: 23 rows at 26 px, 11 columns, filter sidebar with 30+ options. |
| Palette | Paper terminal: `#f7f7f4`, ink `#15171a`, rust `#b4430b`. Dark is phosphor: `#0b0d10` with amber `#ffb547`. |
| Imagery | None. The AO avatar is a monogram; data is the picture. |
| Texture | Zebra rows and hairlines only. |
| Motion | Almost none: 60–100 ms hovers and a blinking terminal caret. |
| Browser features | Sticky table headers and sticky first column, `role="combobox"` with `aria-activedescendant`, CSS `attr()` for markdown heading markers. |

## Type

- **IBM Plex Sans** 13 px for text and UI — compact, clear at small sizes.
- **JetBrains Mono** for headings, numbers, keys, paths, the status line and the terminal;
  tabular figures everywhere so counts, km and percentages line up.
- The concept deliberately goes below the skill's 16 px body default (13 px), keeping 12 px as
  the floor for `kbd` and counts. A production version should offer a comfortable-density switch.

## Palette

| Role | Light (paper terminal) | Dark (phosphor) |
|---|---|---|
| Canvas / surface | `#f7f7f4` / `#ffffff` | `#0b0d10` / `#101318` |
| Text / muted | `#15171a` / `#4a4f56` (8.3:1) | `#d9dee5` / `#9ea8b4` (7.7:1) |
| Accent | `#b4430b` (white text 5.6:1) | `#ffb547` (black text 11.4:1) |
| Selected row | `#fbefe7` | `#2a1d08` |
| Online | `#18794e` | `#3fd18e` |

## Motion

- `--duration-fast` 60 ms, `--duration-base` 100 ms; nothing slides or fades on load.
- The terminal caret blinks with `steps(1)` over 1 s only under `prefers-reduced-motion:
  no-preference`.

## Browser features and fallbacks

- The palette is a static open combobox (input `role="combobox"`, `aria-expanded="true"`,
  `aria-controls` a listbox of grouped options, the first `aria-selected`). Wired up, ⌘K would
  open it as a modal dialog with focus trapped.
- Sticky `thead` and first column work in all engines; the table also scrolls inside its own
  focusable region.

## Responsive behaviour

- 360: app bar wraps the nav onto a second row; the palette stays full width; filters collapse
  into a `<details>` disclosure; the table scrolls sideways with the builder column pinned.
- 768: nav returns to the bar; still one column.
- 1024+: filter sidebar appears; Home gains the right rail, and at 1280 the outline column.

## Accessibility notes

- Shortcut hints are visual (`aria-hidden` where they duplicate a label); every action also has
  a pointer path. Sortable headers are buttons with `aria-sort="descending"` on Match.
- Tables have captions and column headers; the selected row is marked visually and in the
  palette's active option.

## What to take from it

For the builders who live in their editor, a keyboard-first directory with a real command
palette is a strong retention feature. The README home is an honest, no-marketing way to
present the community's numbers.

<!-- coverage:start -->

Legend: ✅ mock exists · ➖ not applicable (reason in manifest) · ❌ missing

### Pages

| Screen | default | loading | empty | error | Requirements |
|---|---|---|---|---|---|
| Home (`home`) | [✅](pages/home/default.html) | ➖ | ➖ | ➖ |  |
| Builder directory (`directory`) | [✅](pages/directory/default.html) | ➖ | ➖ | ➖ |  |

<!-- coverage:end -->
