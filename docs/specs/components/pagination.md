# Pagination

| Field | Value |
|---|---|
| Selector | `bn-pagination` |
| Library path | `frontend/projects/components/src/lib/pagination/` |
| Status | planned |
| Traces to | L2-009, L2-015, L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`pagination.html`](../../design-system/components/pagination.html) |
| Source mocks | [`pages/directory/default`](../../mocks/pages/directory/default.html), [`pages/directory/edge`](../../mocks/pages/directory/edge.html), [`pages/directory/filtered`](../../mocks/pages/directory/filtered.html), [`pages/projects/default`](../../mocks/pages/projects/default.html), [`dialogs/say-hello/busy`](../../mocks/dialogs/say-hello/busy.html), [`notifications/toast/info`](../../mocks/notifications/toast/info.html) |
| Rendering | [`pagination.html`](pagination.html) |

## Purpose and scope

Pagination moves a member through a long, stable result set — 1,284 builders, 312 projects —
without losing the search and filters. Banaro's lists use **load more**: a quiet button adds the
next 12 results below the current ones, a thin meter shows how far through the set the member is,
and a line of text states the count and page ("12 of 1,284 · page 1 of 107"). The page number
stays in the URL (L2-009). The design system also defines **numbered**, **previous / next** and
**page size** forms for tables and admin lists; they are part of this component so later screens
need no API change.

Use [tabs](tabs.md) to switch views, and the search and filter toolbar for narrowing results.

Out of scope:

- Fetching, appending and the URL query string: the page owns the data and passes `shown`,
  `total`, `page` and `pageCount`.
- Skeletons for incoming cards (the page; L2-048 AC4).
- The empty and no-results states (no pager is shown).

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/directory/default`, `edge`; `dialogs/say-hello/*` and `notifications/toast/*` (page behind) | load more, button `quiet` `lg` | "Show 12 more builders"; meter 1 %; "12 of 1,284 · page 1 of 107" | default | canvas, centred under the result grid |
| `pages/directory/filtered` | load more, same | "Show 6 more builders"; meter 16 %; "6 of 38 · page 1 of 7" | default | canvas |
| `pages/projects/default` | load more (D-2) | meter 2 %; "Showing 7 of 312 projects"; "Show more projects" | default | canvas |
| Directory and projects after a load more | load more | "Loading more builders…" busy label; then "24 of 1,284 · page 2 of 107" | busy, then default; last page | canvas |
| Design-system specimens only | numbered; previous / next; page size | "Previous" (disabled on page 1), "1" (current, "Go to page 1"), "Next"; "Builders per page" select 12 / 24 | default, hover, focus, active, disabled, current, loading | canvas |

## Anatomy

Load more (`.pager`):

1. **Container** — `div.pager`, a centred grid with gap `--space-4` and block padding
   `--space-16` / `--space-8`.
2. **Button** — `button[bn-button]` `quiet` `lg`: "Show 12 more builders".
3. **Meter** — `div.pager__meter` with `aria-hidden="true"` and a `span` whose width is the
   share of results shown (minimum `--space-2`). Decorative; not a progressbar.
4. **Status text** — `p.pager__text`, tabular numerals, a polite live region.

Numbered and previous / next (`nav.cluster`):

5. **Navigation** — `nav` with `aria-label` ("Builder pagination"), a wrapping cluster.
6. **Previous / Next** — `a[bn-button]` `quiet` links; at a boundary a native disabled
   `button[bn-button]`.
7. **Page links** — `a[bn-button]`: the current page `primary` with `aria-current="page"`, the
   others `quiet`; every page link labelled "Go to page N". Gaps are a non-interactive "…".
8. **Page size (optional)** — a labelled native select ("Builders per page") after the nav.

Host: `bn-pagination` is `display: block`; it renders one of the two structures.

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `variant` | `'load-more' \| 'numbered' \| 'previous-next'` | `'load-more'` | no | Chooses the structure above. |
| `shown` | `number` | — | load more | Results currently listed. |
| `total` | `number` | — | yes | Size of the whole result set. |
| `page` | `number` | — | yes | Current (1-based) page; for load more, the last page loaded. |
| `pageCount` | `number` | — | yes | Number of pages. |
| `busy` | `boolean` | `false` | no | Load more: the button is busy with `busyLabel`. Numbered: `aria-busy="true"` on the nav. |
| `moreLabel` | `string` | — | load more | Button label, formatted by the page from the catalogue: "Show 12 more builders". |
| `busyLabel` | `string` | — | load more | "Loading more builders…". |
| `status` | `string` | — | yes | Status text: "12 of 1,284 · page 1 of 107". |
| `label` | `string` | — | numbered, previous-next | `nav` `aria-label`: "Builder pagination". |
| `pageLabel` | `(page: number) => string` | — | numbered | Accessible name of a page link: "Go to page 2". |
| `previousLabel`, `nextLabel` | `string` | — | numbered, previous-next | "Previous", "Next". |
| `pageLink` | `(page: number) => string \| readonly unknown[]` | — | numbered, previous-next | Router link for a page, keeping the current query (filters, sort). |
| `pageSizeOptions` | `readonly number[]` | `[]` | no | Shows the page-size select when not empty. |
| `pageSize` | `number` (model) | — | with options | Selected page size; `[(pageSize)]`. |
| `pageSizeLabel` | `string` | — | with options | "Builders per page". |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| `more` | `void` | Load more: the button is activated while not busy. |
| `pageSizeChange` | `number` | The page-size select changes. |

Numbered and previous / next navigate by `routerLink` (no output), so the page number is always
in the URL.

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| None | — | All copy arrives as inputs so the structure, meter and live region stay consistent. |

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Load more | `.pager` | Card lists: the directory and projects (L2-009, L2-015). |
| Numbered | `nav.cluster` | Dense lists where jumping matters (admin tables). Shows first, last, current ±1 and "…" gaps. |
| Previous / next | `nav.cluster` | Short sequences; numbered without the page links except the current. |
| Page size | `label` + select after the nav | Tables where the member may choose 12 or 24 rows. |

One size: the load-more button is `lg`, page links and previous / next are `md`.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Button, meter at `shown / total`, status text | Button "Show 12 more builders"; status text |
| Hover, focus, active | per button or link | [Button](button.md) states | Per control |
| Busy (load more) | `busy` | Button busy with spinner and "Loading more builders…"; meter and text unchanged; existing cards stay | Button busy, focus stays on it |
| Loaded | `shown` grows | Meter widens; status text updates ("24 of 1,284 · page 2 of 107") | Status text announced politely |
| Last page (load more) | `shown === total` | Button removed; meter full; status text "1,284 of 1,284" | Focus moves to the status text (D-4) |
| Current (numbered) | `page` | Current page `primary` with `aria-current="page"` | "Go to page 1, current page" |
| Disabled boundary | page 1 or last page | Previous or Next is a native disabled quiet button | Dimmed, not focusable |
| Loading (numbered) | `busy` | Nav carries `aria-busy="true"`; controls unchanged | Busy |
| Disabled (whole control) | the page's own error state | Not rendered (the page shows its error) | — |

## Markup

```html
<!-- rendered: load more (directory) -->
<bn-pagination>
  <div class="pager">
    <button type="button" class="btn btn--quiet btn--lg">Show 12 more builders</button>
    <div class="pager__meter" aria-hidden="true"><span style="width: 1%"></span></div>
    <p class="pager__text" aria-live="polite">12 of 1,284 · page 1 of 107</p>
  </div>
</bn-pagination>
```

```html
<!-- rendered: load more, busy -->
<div class="pager">
  <button type="button" class="btn btn--quiet btn--lg" aria-busy="true" aria-disabled="true"><span class="spinner" aria-hidden="true"></span>Loading more builders…</button>
  <div class="pager__meter" aria-hidden="true"><span style="width: 1%"></span></div>
  <p class="pager__text" aria-live="polite">12 of 1,284 · page 1 of 107</p>
</div>
```

```html
<!-- rendered: numbered, page 1 of 107 -->
<nav class="cluster" aria-label="Builder pagination">
  <button type="button" class="btn btn--quiet" disabled>Previous</button>
  <a class="btn btn--primary" href="/builders?page=1" aria-current="page" aria-label="Go to page 1">1</a>
  <a class="btn btn--quiet" href="/builders?page=2" aria-label="Go to page 2">2</a>
  <span aria-hidden="true">…</span>
  <a class="btn btn--quiet" href="/builders?page=107" aria-label="Go to page 107">107</a>
  <a class="btn btn--quiet" href="/builders?page=2">Next</a>
</nav>
<label>Builders per page <select class="select__control"><option>12</option><option>24</option></select></label>
```

```html
<!-- consumer -->
<bn-pagination
  [shown]="builders().length" [total]="total()" [page]="page()" [pageCount]="pageCount()" [busy]="loadingMore()"
  [moreLabel]="'directory.more' | t: { count: nextCount() }"
  [busyLabel]="'directory.loadingMore' | t"
  [status]="'directory.pagerStatus' | t: { shown: builders().length, total: total(), page: page(), pages: pageCount() }"
  (more)="loadMore()"
/>
```

The classes `pager`, `pager__meter`, `pager__text`, the button classes and `aria-current` are the
e2e contract.

## Design

- `.pager`: grid, `justify-items: center`, gap `--space-4`, padding-block `--space-16`
  `--space-8`.
- `.pager__meter`: width `min(16rem, 100%)` (the pager meter width geometry token),
  `--border-width-thick` high, `--color-border-default` track, `--radius-full`, clipped; the bar
  `--color-accent`, width = `max(1%, round(shown / total × 100) %)` with min width `--space-2`.
- `.pager__text`: `--text-body-sm`, `--color-fg-subtle`, tabular numerals.
- Numbered: `.cluster` (wrapping flex, gap `--space-3`, centred items).
- The meter bar width changes without transition.

Component tokens: none.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Meter track | `--color-border-default` | `--palette-oat-300` | `--palette-night-700` |
| Meter bar | `--color-accent` | `--palette-sage-600` | `--palette-sage-300` |
| Status text | `--color-fg-subtle` | `--palette-stone-600` | `--palette-night-300` |
| Buttons | see [button](button.md) | | |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-subtle` | `--color-bg-canvas` | 4.5:1 | Status text |
| `--color-fg-default` | `--color-bg-surface` | 4.5:1 | Quiet button label |
| `--color-fg-on-accent` | `--color-accent` | 4.5:1 | Current page |
| `--color-border-strong` | `--color-bg-canvas` | 3:1 | Quiet button border on the page |

The meter is decorative (the status text carries the same information), so it has no contrast
minimum.

## Responsive behaviour

- Load more is centred at every width; the meter shrinks to the container below 16 rem.
- Numbered pagination wraps; below 576 px only previous, current and next remain, plus the
  "page 3 of 107" status, so the row fits 320 px (D-5).
- At 320 px nothing scrolls horizontally; every control is at least 44 × 44 px; at 200 % zoom all
  controls stay reachable.

## Accessibility

### Role and pattern

Load more: a native button plus a polite status line (no landmark: it is not navigation). Numbered
and previous / next: a `nav` landmark of links with `aria-current="page"`, following the design
system's landmark guidance.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Reaches the load-more button, or each enabled page control in order. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Activates the load-more button (ignored while busy); Enter follows a page link. |

### Focus

While loading, focus stays on the busy button. After a load the button keeps focus, so the next
press loads the following page; new results are inserted above it. When the last page loads and
the button is removed, focus moves to the status text (`tabindex="-1"`) so it is not lost.

### Labelling

The load-more button names the count it will add ("Show 12 more builders"). Page links are named
"Go to page N"; previous and next are "Previous" and "Next".

### Announcements

`.pager__text` is `aria-live="polite"`: when results arrive it announces "24 of 1,284 · page 2 of
107" without moving focus (L2-050 AC4).

### Motion

The busy spinner follows the button's reduced-motion rule; nothing else moves.

## Content and internationalisation

- Directory: "Show 12 more builders" (the count is the next batch, at most 12), status "12 of
  1,284 · page 1 of 107". Projects: "Show more projects", "Showing 7 of 312 projects". Numbers
  use thousands separators (L2-052).
- Busy: "Loading more builders…", "Loading more projects…".
- Translatable: every label and the status text, built from catalogue messages with parameters.
  Data values: the counts.
- Longer translations wrap under the centred button.

## Performance

- Change detection: `OnPush`, signal inputs; the meter width and the page list are `computed`.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Pagination.ts` renders the
  directory pager ("Show 12 more builders", "12 of 1,284 · page 1 of 107");
  `PaginationNumbered.ts` renders numbered pagination on page 3 of 107. Iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep each at roughly 100–300 ms.
- Composite scenarios: the directory results scenario (cards plus pager), when added.
- Layout stability: the pager keeps its height while busy (the button height does not change);
  new cards are appended above it, never shifting the cards already shown (L2-048).
- Weight: composes `Button`; `RouterLink`; no other dependencies.

## Acceptance criteria

### Rendering

- **AC-1** Given the directory with 1,284 results and 12 shown, when the pager renders, then it shows a quiet large button "Show 12 more builders", an `aria-hidden` meter at 1 %, and the text "12 of 1,284 · page 1 of 107", matching the directory mock at 360, 768 and 1280 px. (L2-049)
- **AC-2** Given the directory filtered to 38 builders with 6 shown, when the pager renders, then the button reads "Show 6 more builders", the meter bar is 16 % wide, and the text reads "6 of 38 · page 1 of 7". (L2-009)

### States

- **AC-3** Given Amara presses "Show 12 more builders", when the next page is loading, then the button is busy with "Loading more builders…", the 12 cards already shown stay in place, and a second press requests nothing. (L2-009)
- **AC-4** Given page 2 has loaded, when the pager updates, then 24 cards are listed, the URL holds `page=2`, the text reads "24 of 1,284 · page 2 of 107", and focus is still on the button. (L2-009)
- **AC-5** Given the projects list with 12 per page, when the last page is loaded, then the button is removed, the meter is full, and focus moves to the status text. (L2-015)
- **AC-6** Given numbered pagination on page 1, when it renders, then "Previous" is a native disabled button, "1" has `aria-current="page"` and the name "Go to page 1", and every page link keeps the current filters in its URL. (L2-009)

### Keyboard and focus

- **AC-7** Given the pager, when the member tabs to the button, then it shows the 2 px `--color-focus-ring` ring at 3:1 or more, and Enter or Space loads more. (L2-050)

### Screen readers

- **AC-8** Given a load completes, when the status text changes, then a screen reader announces "24 of 1,284 · page 2 of 107" politely, and the meter is not exposed as a progressbar. (L2-050)
- **AC-9** Given every variant in both themes, when axe-core runs, then there are no violations. (L2-050)

### Theming

- **AC-10** Given the dark theme, when the pager renders, then the meter bar, track and status text resolve through `--color-accent`, `--color-border-default` and `--color-fg-subtle`, and the status text keeps 4.5:1 or more against the page. (L2-051)

### Content

- **AC-11** Given the app in en-CA, when the pager renders, then its labels and status text come from the catalogue with the counts formatted as "1,284". (L2-052)

### Responsive

- **AC-12** Given a 320 px viewport, when load more and numbered pagination on page 3 of 107 render, then nothing scrolls horizontally, numbered shows Previous, 3 and Next, and every control is at least 44 × 44 px. (L2-049)

### Performance

- **AC-13** Given more results load, when the new cards are appended, then the cards above do not move (CLS 0 for the append). (L2-048)
- **AC-14** Given a change to pagination, when the perf test runs `Pagination` and `PaginationNumbered` against the base branch, then neither is flagged as a possible regression. (L2-048)

## Implementation notes

- Folder `frontend/projects/components/src/lib/pagination/`; files `pagination.ts`,
  `pagination.html`, `pagination.css`; class `Pagination`; selector `bn-pagination`; export from
  `public-api.ts`.
- Composes [button](button.md) (busy, disabled, variants) and the native select styled by the
  select CRD's classes.
- Move `.pager`, `.pager__meter` and `.pager__text` styles from `components.css` into the
  component stylesheet; set the meter bar width with a style binding.
- The page list for numbered pagination is a pure function (first, last, current ±1, gaps)
  computed once per input change.
- Add `Pagination.ts` and `PaginationNumbered.ts` to the perf-test scenarios and export them.

## Decisions

- **D-1** *Load more or numbered for the directory?* Load more, as every directory and projects
  mock shows; L2-009's "page N shows items (N−1)×12+1 to N×12 and the URL holds the page number" is
  met by loading page N and writing it to the URL.
- **D-2** *The projects mock orders the pager meter, text, button and uses a medium button; the
  directory orders button, meter, text with a large button. Which wins?* The directory structure
  and the large button, for both lists, so one component renders both; the projects copy ("Show
  more projects", "Showing 7 of 312 projects") stays. This changes the projects mock's order and
  is raised with design.
- **D-3** *Is the meter a progressbar?* No. It is `aria-hidden="true"` (the projects mock already
  does this; the directory mock's `role="presentation"` is replaced) because the status text says
  the same thing; the design system's don't forbids presenting it as a progressbar.
- **D-4** *Where does focus go when the button disappears on the last page?* To the status text,
  made programmatically focusable, so focus is never dropped to the document.
- **D-5** *How does numbered pagination fit 320 px?* Below 576 px it shows only Previous, the
  current page and Next, with the status line giving the total.
- **D-6** *What is the busy copy?* "Loading more builders…" / "Loading more projects…"; no mock
  shows a busy pager, and the design system says load more preserves current items while busy.
- **D-7** *Which button copy, the design system's "Load more builders" or the mock's "Show 12 more
  builders"?* The mock's, which names how many will be added; the label is an input in any case.
