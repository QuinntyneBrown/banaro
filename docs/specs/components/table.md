# Table

| Field | Value |
|---|---|
| Selector | `bn-table`, `th[bn-sort-header]` |
| Library path | `frontend/projects/components/src/lib/table/` |
| Status | planned |
| Traces to | L2-033, L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`table.html`](../../design-system/components/table.html) |
| Source mocks | None: the design system marks the table a core extension that no member-app mock uses; its first consumer is the admin reports list (L2-033) |
| Rendering | [`table.html`](table.html) |

## Purpose and scope

A table compares structured records when relationships across columns matter
and a card list would hide them: the administrators' reports queue (status,
reason, subject, reported), and any later admin listing. It keeps native table
semantics, a caption, column header scopes, and scrolls sideways inside its own
region at narrow widths instead of shrinking text.

Use [list](list.md) or the card blocks for member-facing collections (the
mocks use lists everywhere), and [description-list](description-list.md) for
one record's facts. Never use a table for page layout.

Out of scope:

- Fetching, sorting and paging the data: the page sorts when the sort header
  reports a change, and [pagination](pagination.md) pages.
- Row selection logic and bulk actions: the page keeps the selected set; the
  table renders the state it is given.
- Cell content components ([badge](badge.md) for a status, [button](button.md)
  for row actions, [checkbox](checkbox.md) for selection).
- The admin application's layout ([sidebar-navigation](sidebar-navigation.md)).

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| Admin `/admin/reports` (L2-033 AC1; admin mocks not yet drawn) | default, sortable "Reported" (oldest first), row action "Review", status badge | caption "Reports", columns Status, Reason, Subject, Reported, Actions | default, loading, empty, error, hover | admin surface |
| Design system *Default* | default | caption "Projects seeking collaborators", Project / Stage | default | surface |
| Design system *Dense* | `dense` | as default | default | surface |
| Design system *Sortable* | sort header on Project, `aria-sort="ascending"` | — | sorted | surface |
| Design system *Selectable* | first column checkbox "Select Psalter" | — | selected row | surface |
| Design system *Row actions* | last column "Edit Psalter" text button | — | default | surface |
| Design system *Sticky* | `sticky` header | — | scrolled | surface |
| Design system *Expandable* | full-width row with `details` "More about Psalter" | — | open, closed | surface |
| Design system state columns | — | loading row "Loading projects", empty "No projects yet. Add your first project.", error "Projects could not load. Try again." | loading, empty, error | surface |

## Anatomy

1. **Region** — the host `bn-table`: block, `overflow-x: auto`. When its table
   is wider than itself it becomes a focusable region (`role="region"`,
   `tabindex="0"`, `aria-labelledby` the caption).
2. **Table** — `table.data-table` (+ `.data-table--dense`, `.data-table--sticky`).
3. **Caption** — `caption` with an id; the table's name.
4. **Header cells** — `th scope="col"` on `--color-bg-surface-sunken`; a
   sortable one is `th[bn-sort-header]` with `aria-sort` and an inner
   `button.btn.btn--text`.
5. **Body rows and cells** — `tr` / `td`, hairline bottom rule; first cell may
   be a row header `th scope="row"`.
6. **Selection cell (optional)** — `td` with a labelled checkbox ("Select
   Psalter"); the row gets `aria-selected`.
7. **Row action cell (optional)** — `td` with `button.btn.btn--text` named with
   the row ("Edit Psalter").
8. **Detail row (optional)** — `tr > td[colspan]` holding `details`/`summary`.
9. **Status row (loading, empty, error)** — `tr > td[colspan]` spanning every
   column.

## API

### Inputs — `bn-table`

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `caption` | `string` | — | yes | Rendered as `<caption id>`; names the table and the scroll region. |
| `dense` | `boolean` | `false` | no | Adds `.data-table--dense` (`--space-2` block padding in body cells). |
| `sticky` | `boolean` | `false` | no | Adds `.data-table--sticky` (header cells stick at the region's top, `--z-sticky`). |
| `state` | `'ready' \| 'loading' \| 'empty' \| 'error'` | `'ready'` | no | `loading` sets `aria-busy="true"` on the region and renders the loading row instead of the body slot; `empty` and `error` render their rows instead of the body slot. |
| `columns` | `number` | — | yes | Column count, used for the status rows' `colspan`. |
| `loadingLabel` | `string` | — | yes | Visually hidden text of the loading row ("Loading reports"). |
| `emptyText` | `string` | — | yes | Text of the empty row ("No open reports."). |
| `errorText` | `string` | — | yes | Text of the error row ("Reports could not load."). |
| `retryLabel` | `string` | — | yes | Label of the error row's text button ("Try again"). |

### Inputs — `th[bn-sort-header]`

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `sort` | `'ascending' \| 'descending' \| 'none'` | `'none'` | no | Sets `aria-sort` (omitted when `none`) and the arrow direction. |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| `retried` (`bn-table`) | `void` | The error row's "Try again" button is pressed. |
| `sortChange` (`th[bn-sort-header]`) | `'ascending' \| 'descending'` | The header button is pressed: `none` and `descending` request `ascending`, `ascending` requests `descending`. The page re-sorts and sets `sort`. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `[slot=head]` | one `thead` | Header row(s); `th scope="col"`, sortable ones as `th[bn-sort-header]`. |
| default | one or more `tbody` / `tr` | Body rows; hidden while `state` is not `ready`. Rows may carry `aria-selected="true"`. |
| default (`th[bn-sort-header]`) | text | The column name, rendered inside the button. |

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Default | `.data-table` | Most tables. |
| Dense | `.data-table--dense` | Long admin queues where scanning matters. |
| Sortable | `th[bn-sort-header]` with `aria-sort` | Columns the page can order (Reported). |
| Selectable | checkbox cell + `tr[aria-selected="true"]` | Bulk actions. |
| Row actions | text-button cell | One or two actions per row, named with the row. |
| Sticky | `.data-table--sticky` | Tables taller than the viewport. |
| Expandable | detail row with `details` | Extra text per row without a new page. |

| Size | Modifier | Cell padding | Type |
|---|---|---|---|
| Regular | — | `--space-3` × `--space-4` | `--text-body-sm` |
| Dense | `.data-table--dense` | `--space-2` × `--space-4` (body) | `--text-body-sm` |

Width: 100 % of the region; columns size to content; the region scrolls when
the content is wider.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | `state="ready"` | Rows with hairline rules | Native table navigation |
| Row hover | `tr:hover` (`data-state="hover"` in specimens) | `--color-bg-subtle` row fill | — |
| Focus | `:focus-visible` on a header button, checkbox, action, summary or the scroll region | Shared 2 px ring | Focus on the real control |
| Active | `:active` on a control | Control's own active style | — |
| Sorted | `sort` ascending/descending | Arrow beside the header text | `aria-sort` on the `th` |
| Selected | row `aria-selected="true"` + checked box | `--color-accent-subtle` fill | Checkbox checked; row selected |
| Expanded | `details[open]` | Detail text shown | `summary` expanded/collapsed |
| Loading | `state="loading"` | One row with a text skeleton | `aria-busy="true"`, hidden "Loading reports" |
| Empty | `state="empty"` | One full-width row with the empty text | Read as a cell |
| Error | `state="error"` | One full-width row with the error text and "Try again" | Button focusable; page announces the failure |
| Disabled | not supported | — | A table is not a control; disable the row's actions instead (D-4) |

## Markup

```html
<!-- rendered: default with sortable column, badge and row action -->
<bn-table role="region" tabindex="0" aria-labelledby="bn-table-1-caption">
  <table class="data-table">
    <caption id="bn-table-1-caption">Reports</caption>
    <thead><tr>
      <th scope="col">Status</th><th scope="col">Reason</th><th scope="col">Subject</th>
      <th bn-sort-header scope="col" aria-sort="ascending"><button class="btn btn--text" type="button">Reported<svg class="icon icon--sm" aria-hidden="true">…</svg></button></th>
      <th scope="col">Actions</th>
    </tr></thead>
    <tbody>
      <tr><td><bn-badge class="badge badge--info">Open</bn-badge></td><td>Spam</td><td>Message to Grace Liu</td><td>Thu 8 Oct 2026, 7:15 pm</td><td><button class="btn btn--text" type="button">Review report on message to Grace Liu</button></td></tr>
    </tbody>
  </table>
</bn-table>
```

```html
<!-- rendered: loading, empty, error rows (replace the body) -->
<tbody><tr><td colspan="5"><span class="skeleton skeleton--text" aria-hidden="true"></span><span class="vh">Loading reports</span></td></tr></tbody>
<tbody><tr><td colspan="5">No open reports.</td></tr></tbody>
<tbody><tr><td colspan="5">Reports could not load. <button class="btn btn--text" type="button">Try again</button></td></tr></tbody>
```

```html
<!-- rendered: selectable and expandable rows -->
<tr aria-selected="true"><td><label><input type="checkbox" checked> <span class="vh">Select Psalter</span></label></td><td>Psalter</td><td>Beta</td></tr>
<tr><td colspan="3"><details><summary>More about Psalter</summary><p>Looking for contributors (open source).</p></details></td></tr>
```

```html
<!-- consumer -->
<bn-table [caption]="t('admin.reports.caption')" [columns]="5" [state]="state()" (retried)="load()"
  [loadingLabel]="t('admin.reports.loading')" [emptyText]="t('admin.reports.empty')"
  [errorText]="t('admin.reports.error')" [retryLabel]="t('common.tryAgain')">
  <thead slot="head"><tr>… <th bn-sort-header scope="col" [sort]="order()" (sortChange)="sortBy('reported', $event)">{{ t('admin.reports.reported') }}</th> …</tr></thead>
  <tbody>@for (r of reports(); track r.id) { <tr>…</tr> }</tbody>
</bn-table>
```

## Design

- Region: `display: block; position: relative; overflow-x: auto` (relative so
  visually hidden text in cells cannot escape the scroller); focus ring on the region when it
  is focusable.
- Table: `width: 100%`, `border-collapse: collapse`, `--text-body-sm`.
- Cells: padding `--space-3` `--space-4`, left aligned, bottom rule
  `--border-width-hairline` `--color-border-default`; numbers right aligned
  with tabular figures (D-5).
- Header cells: `--color-fg-muted` on `--color-bg-surface-sunken`; sticky
  header at `top: 0`, `--z-sticky`.
- Caption: `--text-h4`, left aligned, `--space-3` below (D-6).
- Row hover `--color-bg-subtle`; selected `--color-accent-subtle`.
- Sort arrow: 16 px icon, rotates for descending; colour transition over
  `--duration-fast`, none under reduced motion.

Component tokens:

| Token | Aliases | Overridden by |
|---|---|---|
| None | — | Semantic tokens directly. |

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Body text | `--color-fg-default` | `--palette-ink-900` | `--palette-night-50` |
| Header text | `--color-fg-muted` | `--palette-stone-700` | `--palette-night-200` |
| Header fill | `--color-bg-surface-sunken` | `--palette-oat-200` | `--palette-night-850` |
| Rules | `--color-border-default` | `--palette-oat-300` | `--palette-night-700` |
| Hover row | `--color-bg-subtle` | `--palette-oat-200` | `--palette-night-800` |
| Selected row | `--color-accent-subtle` | `--palette-sage-50` | `--palette-sage-950` |
| Focus ring | `--color-focus-ring` | `--palette-sage-700` | `--palette-sage-300` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-surface` | 4.5:1 | Cells |
| `--color-fg-muted` | `--color-bg-surface-sunken` | 4.5:1 | Header text |
| `--color-fg-default` | `--color-bg-subtle` | 4.5:1 | Hovered row |
| `--color-fg-default` | `--color-accent-subtle` | 4.5:1 | Selected row |
| `--color-focus-ring` | `--color-bg-surface` | 3:1 | Focus ring |

## Responsive behaviour

- At every width the table keeps native semantics. When its columns are wider
  than the region (typically below 768 px), the region scrolls horizontally
  inside itself; the page never scrolls sideways and text never shrinks below
  `--text-body-sm`.
- Cards replace a table only when a screen explicitly chooses that layout
  (design system *Responsive*); the component never switches by itself.
- Row action buttons keep at least 44 × 44 CSS px targets below 576 px.
- At 320 px nothing scrolls horizontally or clips; at 200 % zoom everything stays available; every target is at least 44 × 44 CSS px on touch devices.

## Accessibility

### Role and pattern

[WAI-ARIA table pattern](https://www.w3.org/WAI/ARIA/apg/patterns/table/) with
native elements; never `role="grid"` for static data. Sortable columns follow
the [sortable table example](https://www.w3.org/WAI/ARIA/apg/patterns/table/examples/sortable-table/):
a button inside the `th`, `aria-sort` on the `th`.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Visits the scroll region (only when it overflows), then sort buttons, checkboxes, summaries and row actions in reading order. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Activates a sort button, toggles a checkbox or a `summary`, presses an action. |
| Arrow keys | Scroll the focused region; screen readers use their own table navigation. |

### Focus

Shared ring on every control and on the focusable region. After a sort, focus
stays on the pressed header button. After "Try again", focus stays on the
region while the loading row shows.

### Labelling

- The caption names the table and the region.
- Every `th` has `scope`.
- Checkboxes and row actions are named with the row ("Select Psalter",
  "Review report on message to Grace Liu").
- The loading row carries visually hidden text.

### Announcements

The sort change is conveyed by `aria-sort`; the page announces "Sorted by
Reported, oldest first" in its polite live region (L2-050 AC4). Loading
completion and errors are announced by the page.

### Motion

Only the sort arrow's rotation and colour transitions, removed under reduced
motion.

## Content and internationalisation

- Caption: a plain noun phrase ("Reports"). Headers: one or two words
  ("Status", "Reason", "Subject", "Reported").
- Dates in cells follow L2-052 ("Thu 8 Oct 2026, 7:15 pm"); numbers use comma
  thousands ("1,284").
- Translatable: caption, headers, loading, empty, error and retry copy, action
  labels. Data: subjects, names, dates.
- French headers run longer; columns grow and the region scrolls rather than
  truncating.

## Performance

- Change detection: `OnPush`; the region's focusability comes from a
  `ResizeObserver` that sets a signal only when overflow changes.
- Perf-test scenarios: `frontend/projects/perf-test/src/scenarios/Table.ts`
  renders a five-row reports table (caption "Reports", a status badge, a sorted
  "Reported" column and "Review" actions);
  `frontend/projects/perf-test/src/scenarios/SortHeader.ts` renders the
  "Reported" header sorted ascending; iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep each at roughly
  100–300 ms.
- Composite scenarios: `DarkTheme`.
- Layout stability: the loading row keeps the header and caption in place; the
  page reserves the body height of one page of rows so replacing it does not
  move content below (L2-048 AC4).
- Weight: belongs to the admin bundle only while admin is its sole consumer;
  it must not be imported by the public application (L2-048 AC2).

## Acceptance criteria

### Rendering

- **AC-1** Given three open reports filed on 6, 7 and 8 October 2026, when `/admin/reports` renders them oldest first, then the table shows one row per report in that order with its status, reason and subject, under the caption "Reports". (L2-033)
- **AC-2** Given a table, when it renders, then it is a `table.data-table` with a `caption`, every header cell is a `th` with `scope`, and axe-core reports no table violations. (L2-050)
- **AC-3** Given `dense`, when the table renders, then body cells have `--space-2` block padding instead of `--space-3`. (L2-051)
- **AC-4** Given the "Reported" column sorted oldest first, when the header renders, then its `th` has `aria-sort="ascending"` and contains a button named "Reported". (L2-050)
- **AC-5** Given "Reported" sorted ascending, when the administrator presses its header button, then `sortChange` emits `descending` once, and focus stays on the button. (L2-033)
- **AC-6** Given a report filed on Thursday 8 October 2026 at 7:15 pm, when its "Reported" cell renders, then it reads "Thu 8 Oct 2026, 7:15 pm". (L2-052)

### States

- **AC-7** Given `state="loading"`, when the table renders, then the region has `aria-busy="true"`, the caption and header row stay visible, and one full-width row holds a text skeleton and the hidden text "Loading reports". (L2-050)
- **AC-8** Given `state="error"`, when the administrator presses "Try again", then `retried` emits once. (L2-033)
- **AC-9** Given a selected row "Psalter", when it renders, then its checkbox named "Select Psalter" is checked, the row has `aria-selected="true"` and the `--color-accent-subtle` fill. (L2-050)
- **AC-10** Given an expandable row, when the administrator activates "More about Psalter", then the detail text shows and the `summary` reports expanded. (L2-050)

### Keyboard and focus

- **AC-11** Given a table wider than its region, when the administrator tabs to it, then the region receives focus with the 2 px focus ring and the arrow keys scroll it; given a table that fits, the region is not a tab stop. (L2-050)
- **AC-12** Given row actions, when inspected, then each action's accessible name includes its row's subject ("Review report on message to Grace Liu"). (L2-050)

### Theming

- **AC-13** Given the light and dark themes, when the table renders, then cell text, header text on `--color-bg-surface-sunken`, hovered rows and selected rows each measure at least 4.5:1, and colours change only through token values. (L2-051)

### Responsive

- **AC-14** Given the five-column reports table at 320 px, when it renders, then the table scrolls inside its region, the page has no horizontal scroll, and cell text stays at `--text-body-sm`. (L2-049)

### Performance

- **AC-15** Given a change to the table, when the `Table` and `SortHeader` perf-test scenarios run against the base branch with `--fail-on-regression`, then neither is flagged as a possible regression. (L2-048)
- **AC-16** Given the public `banaro` application build, when its initial bundle is inspected, then it contains no table component code while only the admin application uses it. (L2-048)

## Implementation notes

- Planned. Folder `frontend/projects/components/src/lib/table/`: `table.ts`
  (class `Table`, selector `bn-table`) and `sort-header.ts` (class
  `SortHeader`, selector `th[bn-sort-header]`), with templates and styles;
  export from `public-api.ts` (tree-shaken from the public app when unused).
- `Table` template: `<table [class]><caption [id]>…</caption><ng-content select="[slot=head]" />@switch (state()) { … status rows … @default { <ng-content /> } }</table>`;
  each `ng-content` appears once.
- `SortHeader` host binds `[attr.aria-sort]`; template wraps the default slot
  in `<button bn-button variant="text" type="button">` with the arrow icon.
- Add the `.data-table` rules to the component styles (they exist in
  `components.css`) plus the caption, region and numeric-cell rules recorded
  in D-5 and D-6.
- Composes [button](button.md), [badge](badge.md), [checkbox](checkbox.md) and
  [skeleton](skeleton.md) markup.
- Scenarios: add `Table.ts` and `SortHeader.ts`; export from
  `scenarios/index.ts`.

## Decisions

- **D-1** *No mock uses a table; what is it for?* The admin reports list of L2-033 AC1, whose screens are not drawn yet (the mocks cover the member app). The CRD specifies every design-system variant so the admin slice needs no API change; the admin mocks must be drawn before that slice starts (AGENTS.md).
- **D-2** *The design-system specimen's second row reads "Harbour — Pilot | Markham", which is not in the cast and puts a place in the Stage column.* The CRD uses cast projects (Psalter, Gather, Ledgerline) with real stages; the specimen is a data error to fix upstream.
- **D-3** *Where does the scroll wrapper come from, since `components.css` has none (the page uses the design-system-only `.ds-table-wrap`)?* The `bn-table` host is the wrapper and becomes a labelled, focusable region only when it overflows, satisfying WCAG 2.1.1 for scrollable content without adding a tab stop to tables that fit.
- **D-4** *What is the design system's "Disabled" table state?* Its specimen renders the default table; a table is not a control, so the state is not supported and individual actions disable themselves.
- **D-5** *Number alignment?* Numeric columns align right with tabular figures, the convention for comparison that the design system does not state; the consumer marks them with a `td` class `is-numeric`.
- **D-6** *Caption styling?* Visible, `--text-h4`, left aligned: the design system keeps the caption ("Keep the caption and scope attributes") but does not style it.
- **D-7** *Empty and error copy:* "No projects yet. Add your first project." and "Projects could not load. Try again." in the design system become inputs, so admin screens supply their own ("No open reports.", "Reports could not load.") with a real "Try again" button rather than a sentence.
