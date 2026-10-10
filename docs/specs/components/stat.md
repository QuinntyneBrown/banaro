# Stat and KPI

| Field | Value |
|---|---|
| Selector | `div[bn-stats]`, `p[bn-stat]` |
| Library path | `frontend/projects/components/src/lib/stat/` |
| Status | planned |
| Traces to | L2-039, L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`stat.html`](../../design-system/components/stat.html) |
| Source mocks | [`pages/home/default`](../../mocks/pages/home/default.html), [`pages/home/loading`](../../mocks/pages/home/loading.html), [`pages/home/error`](../../mocks/pages/home/error.html), [`pages/home/partial`](../../mocks/pages/home/partial.html) |
| Rendering | [`stat.html`](stat.html) |

## Purpose and scope

A row of headline numbers, each a large light figure with a short label beneath, separated by
hairlines: "1,284 builders · 312 projects · 96 co-founder matches · 48 events in 2026". It
summarises the size of the community at a glance. Numbers use tabular figures; a stat can carry a
change ("+38 this month") that always includes a sign and words.

Use a [description list](description-list.md) for labelled facts that are not headline numbers
("Stage: Beta · 6 food banks"), a [badge](badge.md) for counts on controls, and the
[RSVP panel](rsvp-panel.md) for "64 going · 16 spots left".

Out of scope:

- Computing and caching the counts (L2-039: real counts cached ≤ 10 minutes) and formatting them:
  the page passes formatted strings.
- Charts and sparklines.

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/home/default`, `loading`, `error`, `partial` (below the hero) | `div[bn-stats]` labelled "Banaro in numbers" with four `p[bn-stat]` | "1,284" builders · "312" projects · "96" co-founder matches · "48" events in 2026 | default in all four home states (server-rendered, D-3) | canvas |
| Design-system "delta" variant (no mock yet) | stat with `delta` | "1,284" builders; "38" new this month, delta "+38 this month", trend up | default | canvas |
| Design-system "loading" variant (no mock yet) | list `busy`, values `null` | labels shown, value skeletons | loading | canvas |

Every row is buildable with the API below.

## Anatomy

1. **List** — `div.stats`, `role="list"`, `aria-label`. Two-column grid, four columns from 1024 px,
   hairline above.
2. **Item** — `p.stats__item`, `role="listitem"`. Hairline below on narrow screens; hairline to the
   left of every item after the first on wide screens.
3. **Value** — `span.stats__value`. Large light display figure, tabular numerals.
4. **Label** — `span.stats__label`. Small muted text naming what is counted.
5. **Change (optional)** — `span.stats__delta`: a trend arrow (`aria-hidden`) and the change in words.
6. **Value skeleton (loading)** — `span.skeleton.stats__skeleton` inside the value, `aria-hidden`.

Hosts: the attribute components sit on the native elements and add the classes and roles to them,
so the grid's children are the items themselves.

## API

### Inputs — `div[bn-stats]`

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `label` | `string` | — | yes | `aria-label` of the list ("Banaro in numbers"). |
| `busy` | `boolean` | `false` | no | Sets `aria-busy="true"` while values load; omitted when false. |

### Inputs — `p[bn-stat]`

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `value` | `string \| null` | — | yes | The formatted figure ("1,284"). `null` renders the value skeleton. |
| `label` | `string` | — | yes | What is counted, lower case, plural when the figure is ("builders"). |
| `delta` | `string \| undefined` | `undefined` | no | The change in words with its sign ("+38 this month"); renders `.stats__delta`. |
| `trend` | `'up' \| 'down' \| 'flat'` | `'flat'` | no | Arrow before the delta: ↑, ↓ or none. Decorative; the words carry the meaning. |

`busy` uses `booleanAttribute`. All are signal inputs.

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| None — stats are passive. | | |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `div[bn-stats]` default | `p[bn-stat]` elements only | One per figure; two or four keep the grid even. |
| `p[bn-stat]` | None | Everything comes from inputs. |

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Value | — | A figure and its label (home). |
| Delta | `delta` set | A figure with its change ("+38 this month"). |
| Loading | `busy` on the list, `value` null | Values not yet known. |

| Size | Modifier | Height | Padding | Type |
|---|---|---|---|---|
| One size | — | content | item `--space-6` top/bottom and `--space-4` end; from 1024 px `--space-8` top/bottom and `--space-8` start after the first | value `--font-size-3xl` light display, label `--text-body-sm`, delta `--text-caption` |

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Figure, label | List "Banaro in numbers", 4 items, each read as "1,284 builders" |
| Delta | `delta` set | Change line under the label | "1,284 builders +38 this month" |
| Loading | list `busy`, `value` null | Skeleton in the value's place, label shown | List busy; skeleton hidden |
| Hover, focus, active, disabled | — | Not applicable: stats are passive | — |

## Markup

```html
<!-- rendered: value (pages/home/default) -->
<div class="stats" role="list" aria-label="Banaro in numbers">
  <p class="stats__item" role="listitem"><span class="stats__value">1,284</span><span class="stats__label">builders</span></p>
  <p class="stats__item" role="listitem"><span class="stats__value">312</span><span class="stats__label">projects</span></p>
  <p class="stats__item" role="listitem"><span class="stats__value">96</span><span class="stats__label">co-founder matches</span></p>
  <p class="stats__item" role="listitem"><span class="stats__value">48</span><span class="stats__label">events in 2026</span></p>
</div>
```

```html
<!-- rendered: delta -->
<p class="stats__item" role="listitem"><span class="stats__value">38</span><span class="stats__label">new builders</span><span class="stats__delta"><span aria-hidden="true">↑</span> +38 this month</span></p>
```

```html
<!-- rendered: loading -->
<div class="stats" role="list" aria-label="Banaro in numbers" aria-busy="true">
  <p class="stats__item" role="listitem"><span class="stats__value"><span class="skeleton stats__skeleton" aria-hidden="true"></span></span><span class="stats__label">builders</span></p>
</div>
```

```html
<!-- consumer -->
<div bn-stats [label]="'home.stats.label' | t">
  <p bn-stat [value]="stats().builders | bnNumber" [label]="'home.stats.builders' | t" ></p>
  <p bn-stat [value]="stats().projects | bnNumber" [label]="'home.stats.projects' | t"></p>
  <p bn-stat [value]="stats().matches | bnNumber" [label]="'home.stats.matches' | t"></p>
  <p bn-stat [value]="stats().events | bnNumber" [label]="'home.stats.events' | t: { year: 2026 }"></p>
</div>
```

## Design

- List: `display: grid; grid-template-columns: repeat(2, minmax(0, 1fr))`, top rule
  `--border-width-hairline` solid `--color-border-default`. From 64 rem, four columns.
- Item: `padding: var(--space-6) var(--space-4) var(--space-6) 0`, bottom rule hairline
  `--color-border-default`. From 64 rem: no bottom rule, `padding-block: var(--space-8)`, and each
  item after the first has `padding-left: var(--space-8)` and a left hairline.
- Value: `display: block`; `--font-weight-light` `--font-size-3xl` / 1 `--font-family-display`;
  `--letter-spacing-tight`; `font-variant-numeric: tabular-nums`.
- Label: `display: block`, `margin-top: var(--space-2)`, `--text-body-sm`, `--color-fg-muted`.
- Delta: `display: block`, `margin-top: var(--space-1)`, `--text-caption`, `--color-fg-muted`; the
  arrow is text in the same colour.
- Value skeleton: `.skeleton` (`--color-bg-subtle`, `--radius-sm`) as `display: inline-block`,
  `width: 4ch`, `height: 1em`, so the value keeps its one-line box.

Component tokens:

| Token | Aliases | Overridden by |
|---|---|---|
| None — stats read semantic tokens directly. | | |

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Value | `--color-fg-default` | `--palette-ink-900` | `--palette-night-50` |
| Label, delta | `--color-fg-muted` | `--palette-stone-700` | `--palette-night-200` |
| Rules | `--color-border-default` | `--palette-oat-300` | `--palette-night-700` |
| Skeleton | `--color-bg-subtle` | `--palette-oat-200` | `--palette-night-800` |
| Page behind | `--color-bg-canvas` | `--palette-oat-100` | `--palette-night-950` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-canvas` | 4.5:1 | Value |
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Label and delta |

The rules separate figures that also stand apart by spacing, so they are decorative.

## Responsive behaviour

| Range | Layout |
|---|---|
| < 1024 px | Two by two; rules above the row and under each item. |
| ≥ 1024 px | Four in a row, separated by vertical hairlines. |

- Labels wrap ("co-founder matches" may take two lines at 320 px); values never wrap or truncate.
- At 320 px nothing scrolls horizontally or clips; at 200 % zoom everything stays available.

## Accessibility

### Role and pattern

`role="list"` with `role="listitem"` paragraphs, named by `aria-label`. Static metrics are read in
document order.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Skips the stats: nothing is focusable. |

### Focus

None.

### Labelling

Each item reads as its value followed by its label ("1,284 builders"); a figure is never shown
without its label. The trend arrow is `aria-hidden`; the delta's words carry the change.

### Announcements

None: `aria-busy` marks the list while loading; values do not announce when they arrive.

### Motion

None of its own. The skeleton's shimmer stops under `prefers-reduced-motion: reduce`.

## Content and internationalisation

- Say "1,284 builders" or "64 going"; never a bare "1,284".
- Labels are lower case, short and plural when the figure is ("builders", "events in 2026").
- Values use the en-CA number format with comma thousands (L2-052): "1,284".
- Deltas carry a sign and words ("+38 this month", "−4 this week"); never colour alone.
- Translatable inputs: list `label`, item `label`, `delta`. Data values: `value` (formatted by the
  page).

## Performance

- Change detection: `OnPush`, signal inputs; host bindings for class and role.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Stat.ts` renders the home row
  "Banaro in numbers" with 1,284 builders, 312 projects, 96 co-founder matches and 48 events in
  2026; iterations in `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly
  100–300 ms.
- Composite scenarios: `DarkTheme`.
- Layout stability: the value skeleton is one line of the value's font size, so values replace it
  without moving the labels (L2-048).
- Weight: no dependencies beyond Angular core; uses the global `.skeleton` class from the
  [skeleton](skeleton.md) foundation.

## Acceptance criteria

### Rendering

- **AC-1** Given the home page, when the stats render, then a list labelled "Banaro in numbers" holds four items reading "1,284 builders", "312 projects", "96 co-founder matches" and "48 events in 2026". (L2-039)
- **AC-2** Given a count of 1284 builders, when the page passes it formatted, then the value shows "1,284" with tabular numerals. (L2-052)
- **AC-3** Given a stat with delta "+38 this month" and trend up, when it renders, then `.stats__delta` shows an `aria-hidden` "↑" and the words "+38 this month". (L2-050)

### States

- **AC-4** Given the list is `busy` and every value is `null`, when it renders, then the list has `aria-busy="true"`, each value shows an `aria-hidden` skeleton, and every label is visible. (L2-048)
- **AC-5** Given the loading row, when the values arrive, then the skeletons are replaced and no label or rule moves (layout shift 0). (L2-048)
- **AC-6** Given the home page in its loading, error and partial states, when it renders, then the stats show the cached counts exactly as in the default state. (L2-039)

### Screen readers

- **AC-7** Given the stats list, when a screen reader reads it, then it announces a list named "Banaro in numbers" with 4 items, and the first item as "1,284 builders". (L2-050)

### Theming

- **AC-8** Given the light and dark themes, when the stats render on the canvas, then values have at least 4.5:1 and labels at least 4.5:1 contrast. (L2-050)
- **AC-9** Given a theme change, when the stats re-render, then values, labels and rules change colour without component code because only design-system tokens are used. (L2-051)

### Responsive

- **AC-10** Given a 360 px viewport, when the stats render, then they sit two by two with a hairline under each item and no horizontal scroll. (L2-049)
- **AC-11** Given a 1280 px viewport, when the stats render, then the four sit in one row with a vertical hairline before the second, third and fourth, matching `pages/home/default` within the visual-parity threshold. (L2-049)

### Motion

- **AC-12** Given `prefers-reduced-motion: reduce` and a loading row, when it renders, then the value skeletons do not shimmer. (L2-050)

### Performance

- **AC-13** Given a change to the stat components' template, inputs or styles, when the perf test runs `Stat` against the base branch, then it is not flagged as a possible regression. (L2-048)

## Implementation notes

- Folder `frontend/projects/components/src/lib/stat/`: `stats.ts` (`Stats`, selector
  `div[bn-stats]`), `stat.ts` (`Stat`, selector `p[bn-stat]`), `stat.css` (with `.stats__delta`
  and `.stats__skeleton`); export both from `public-api.ts`.
- Host bindings: `Stats` sets `class="stats"`, `role="list"`, `[attr.aria-label]`,
  `[attr.aria-busy]`; `Stat` sets `class="stats__item"` and `role="listitem"`.
- The stats are not yet on the built home page; the home slice adds them under the hero.
- Add `frontend/projects/perf-test/src/scenarios/Stat.ts` and export it from `index.ts`.

## Decisions

- **D-1** *The design-system page shows `dl > div > dt + dd`, which `components.css` does not style;
  the mocks use `role="list"` paragraphs with `.stats__item`, `.stats__value` and `.stats__label`.
  Which markup?* The mocks', because the styles and e2e locators target those classes, and the
  value must come before its label visually, which `dt`/`dd` order would invert.
- **D-2** *The delta and loading variants have no BEM classes. How are they built?* `.stats__delta`
  (caption, muted, sign and words, decorative arrow) and `.stats__skeleton` (a 4 ch by 1 em
  skeleton inside the value). The design-system page should add both.
- **D-3** *L2-039 says skeletons show while the home page loads, but `pages/home/loading` shows the
  real figures. Which?* The figures: the counts are cached server-side (≤ 10 minutes) and rendered
  with the page, so on home they never load separately. The loading variant exists for any later
  screen that fetches stats on the client.
- **D-4** *Who formats the figures?* The page, with the shared number formatter, so the component
  stays locale-agnostic and takes strings.
- **D-5** *Does a delta use green or red?* No: it stays `--color-fg-muted` with a sign and words, so
  meaning never depends on colour (L2-050).
