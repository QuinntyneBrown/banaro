# 01 · Swiss Grid

<!--
Cast and catalog: see docs/mocks/README.md (Amara Osei as viewer; builders 1–23; projects;
events; filter counts). "Today" is Friday 9 October 2026. Distances are from Leslieville.
-->

**Axes:** minimalism · whitespace · no photos

Banaro set in the International Typographic Style. The page is a poster on a strict 12-column grid:
one grotesque, flush left and ragged right, hairline and heavy rules, huge section numerals
(01–05), and a single signal red that marks the most important thing in view: the full stop
of the promise, the next event, the top matches, the current nav item and the co-founder
matching sheet. There are no photographs and no illustrations. The grid is the decoration, and
it is visible: faint red column bands sit behind the hero and the directory title, and a
"Show the 12-column grid" switch in the footer lays the full grid over the page.

## What varies in this concept

| Axis | Choice |
|---|---|
| Whitespace | Very generous. Sections open with `--space-16` and close with `--space-20`; the hero has a full empty band before the stats. |
| Line height | Display 0.92, headings 1.12, body 1.45. Display tracking -0.055em. |
| Density | Low on Home (6 featured builders as index cards), medium in the directory (12 rows in a typographic table). |
| Palette | White paper, black ink, one signal red (`#e20613`). Dark theme is the same poster printed in reverse. |
| Imagery | None. Avatars are black initial squares (AO). |
| Texture | None, apart from the red column bands that show the grid. |
| Motion | Functional only: hover inversions, a nav rule that grows from the left, arrow nudges. |
| Browser features | `:has()` for the grid overlay switch, `<details>` for the mobile menu and filters, CSS grid with token-driven columns, `repeating-linear-gradient` grid bands. |

## Type

- **Libre Franklin** (variable, 100–900) for everything: weight 700–800 for display and names,
  400–600 for text. One family, as the style demands; figures are tabular and lining
  (`font-variant-numeric: tabular-nums lining-nums`) so counts and percentages align.
- Scale: 12 / 14 / 16 / 20 / 24 / 32, then fluid steps for h2 (36–56), h1 (44–80), display
  (48–152), statistics (40–80) and section numerals (88–240).
- Overlines are 12 px bold uppercase with 0.08em tracking; they label every block.

## Palette

| Role | Light | Dark |
|---|---|---|
| Canvas / surface | paper `#ffffff` | night `#0b0b0b` |
| Ink (`--color-fg-default`) | `#0a0a0a` | chalk `#f2f1ec` |
| Muted / subtle | `#4d4d4d` / `#686868` | `#b8b8b4` / `#9c9c98` |
| Accent fill (`--color-accent`) | signal red `#e20613` (white text 4.9:1) | same red, same white text |
| Accent text (`--color-fg-accent`) | deep red `#bf0510` (6.5:1) | light red `#ff5c52` (6.5:1 on black) |
| Rules | ink / `#d4d4d4` hairlines | chalk / `#2e2e2e` hairlines |

All text pairs were checked to WCAG AA (4.5:1 body, 3:1 large and UI).

## Grid

4 columns at 360, 8 at 768, 12 from 1024, with 16/24/24 px gutters and 16/32/48 px margins, all
from `--layout-*` tokens. Home sections put the numeral and heading in columns 1–4 (sticky on
desktop) and the content in 5–12. The directory puts filters in 1–3 and results in 4–12; the
result rows are a seven-column typographic table on desktop and stacked definition lists on
phones. The grid bands are drawn with one gradient whose period is
`(100% + gutter) / columns`, so they always sit exactly on the columns.

## Motion

| What | Duration | Easing |
|---|---|---|
| Area rows, table rows and result rows invert or tint on hover | `--duration-fast` 100 ms | `--ease-standard` |
| Nav underline grows from the left (35% on hover, 100% when current) | `--duration-base` 180 ms | `--ease-standard` |
| Arrows nudge 4 px on hover | 100 ms | `--ease-standard` |
| Checkbox and radio fill | 100 ms | `--ease-standard` |

No load animation and no scroll animation: the style is about stillness. Under
`prefers-reduced-motion: reduce` every duration token drops to 0.01 ms.

## Browser features and fallbacks

- **`:has()`** shows the full-page grid overlay when the footer switch is checked. Without
  `:has()` the switch does nothing and the page is unchanged.
- **`<details>`** drives the mobile menu (no script) and the filter panel. The filter panel is
  open in the markup; a four-line inline script folds it below 1024 px. With JavaScript off the
  filters simply stay open.
- **`text-wrap: balance / pretty`** for headings and paragraphs; older browsers wrap normally.

## Responsive behaviour

- **360:** brand, notifications/avatar or Join, and a Menu disclosure; hero headline at 48 px;
  stats in 2×2; the project table becomes labelled stacks; directory filters fold behind
  "Filters · Show +"; result rows stack with a label column.
- **768:** 8 columns; stats in a row of four; table returns.
- **1280:** full 12-column composition, sticky section heads, seven-column result table.

## Accessibility

- One `h1` per page; sections are labelled by their `h2`; numerals are `aria-hidden` (the
  overline repeats the number as text).
- Current page is `aria-current="page"` on Builders and on page 01 of the pagination.
- Filters are real checkboxes and radios in labelled fieldsets; "Within 40 km" is `checked`.
  Skills are checkbox chips with a visible focus ring on the chip.
- Search and sort have labels; the result count is a polite live region.
- Online status is a filled red dot **and** the words "Online now"; other states use a hollow dot
  and the time.
- Focus ring: 2 px signal red, 3 px offset, everywhere.

## What to take from it

- The discipline: one family, one accent, rules instead of boxes and shadows.
- A directory that reads like a timetable: scanning down the Match column is effortless.
- Numerals as wayfinding on a long home page.
- Risk: without photos the community feels less personal; pair with portraits if chosen.

## Coverage

<!-- coverage:start -->

Legend: ✅ mock exists · ➖ not applicable (reason in manifest) · ❌ missing

### Pages

| Screen | default | loading | empty | error | Requirements |
|---|---|---|---|---|---|
| Home (`home`) | [✅](pages/home/default.html) | ➖ | ➖ | ➖ |  |
| Builder directory (`directory`) | [✅](pages/directory/default.html) | ➖ | ➖ | ➖ |  |

<!-- coverage:end -->
