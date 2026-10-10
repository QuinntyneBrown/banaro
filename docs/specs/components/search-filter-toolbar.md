# Search and filter toolbar

| Field | Value |
|---|---|
| Selector | `bn-search-filter-toolbar`, `bn-search-box` |
| Library path | `frontend/projects/components/src/lib/search-filter-toolbar/` (toolbar); `frontend/projects/components/src/lib/search-box/` (`bn-search-box`) |
| Status | planned (`bn-search-box` is built) |
| Traces to | L2-009, L2-010, L2-015, L2-018, L2-042, L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`search-filter-toolbar.html`](../../design-system/components/search-filter-toolbar.html) |
| Source mocks | [`pages/directory/default`](../../mocks/pages/directory/default.html), [`pages/directory/loading`](../../mocks/pages/directory/loading.html), [`pages/directory/filtered`](../../mocks/pages/directory/filtered.html), [`pages/directory/no-results`](../../mocks/pages/directory/no-results.html), [`pages/directory/error`](../../mocks/pages/directory/error.html), [`pages/directory/edge`](../../mocks/pages/directory/edge.html), [`pages/projects/default`](../../mocks/pages/projects/default.html), [`pages/projects/loading`](../../mocks/pages/projects/loading.html), [`pages/projects/no-results`](../../mocks/pages/projects/no-results.html), [`pages/projects/error`](../../mocks/pages/projects/error.html), [`pages/events/default`](../../mocks/pages/events/default.html), [`pages/events/loading`](../../mocks/pages/events/loading.html), [`pages/not-found/default`](../../mocks/pages/not-found/default.html), [`dialogs/say-hello/default`](../../mocks/dialogs/say-hello/default.html) |
| Rendering | [`search-filter-toolbar.html`](search-filter-toolbar.html) |

## Purpose and scope

The toolbar sits above a list of results and says what the list holds and how to change it:
"Showing 1–12 of 1,284 builders" with "Filters" and "Sort by: Best match" on the directory; the
project search "Project, builder or what it does" with Stage, Looking for and Sort selects; the
events area chips with a Day select. The search box is the rounded field with a "Search" button,
used on its own in the directory header and on the not-found page.

Filter groups themselves (Role, Open to, Neighbourhood, Distance, Skills) live in the filter
sidebar and bottom sheet ([drawer](drawer.md), [checkbox](checkbox.md)); the chips are
[chips](chip.md); the selects are [selects](select.md); the "Filters" and "Clear all" buttons are
[buttons](button.md); paging is [pagination](pagination.md).

Out of scope:

- Querying, debouncing, URL state and the result list (the pages, L2-009, L2-010, L2-015).
- The filter panel, its sheet and "Apply" (drawer CRD).
- The no-results and error blocks below the toolbar (empty-state CRD).

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/directory/default` (also behind `dialogs/say-hello/*`, `notifications/toast/*`) | `variant="bar"`, `filtersLabel` "Filters", sort select in tools | count "Showing **1–12** of **1,284** builders" | default | canvas |
| `pages/directory/loading` | bar | count "Finding builders near you…" | loading | canvas |
| `pages/directory/filtered` | bar, active filters "Founders", "Co-founding", "Product strategy", "Clear all" | count "Showing **1–6** of **38** builders" | filtered | canvas |
| `pages/directory/no-results` | bar, active filters "Designers", "Advising", "Oakville" | count "**0** builders match" | no results | canvas |
| `pages/directory/error` | toolbar not rendered; search box only | — | error | canvas |
| `pages/directory/*` header, `pages/not-found/default` | `bn-search-box` standalone, label "Search builders", placeholder "Name, skill or project", button "Search"; value "Kotlin" in no-results | — | empty, with value | canvas / surface |
| `pages/projects/default`, `loading`, `error` | `variant="stacked"`, search "Search projects", selects Stage, Looking for, Sort by | count "Showing **1–7** of **312** projects, most recent first" / "Loading projects…" / "Projects could not be loaded" | default, loading, error | canvas |
| `pages/projects/no-results` | stacked, search value "chaplaincy", active filters "Stage: Launched", "Looking for: Advisor" | count "0 projects match “chaplaincy”, Launched, looking for Advisor" | no results | canvas |
| `pages/events/default`, `pages/events/loading` | bar, `showCount` false, lead = area chips fieldset "Filter by area", tools = Day select | — | default, loading (chips disabled) | canvas |

## Anatomy

Bar (`variant="bar"`):

1. **Toolbar** — `div.toolbar`. Flex, wraps, space-between, bottom rule `--color-border-default`.
2. **Count** — `p.toolbar__count[aria-live=polite]`, `--text-body-sm` muted with `strong` numbers.
3. **Lead (optional)** — projected leading group in place of the count (events area chips).
4. **Tools** — `div.toolbar__tools`: the filters button, then projected selects.
5. **Filters button** — `button.btn.btn--quiet.btn--sm.filters-btn` with the sliders icon; hidden
   from 62 rem (992 px), where the filters are a sidebar.
6. **Active filters (optional)** — after the toolbar, `div.cluster` holding `ul.chips` of remove
   chips labelled "Active filters" and a `button.btn.btn--text.btn--sm` "Clear all".

Stacked (`variant="stacked"`):

1. **Toolbar** — `form.proj-toolbar[role=search]`. Grid, gap `--space-4`, bottom rule.
2. **Search** — the projected `bn-search-box` in embedded mode (`div.search`).
3. **Filters** — `div.proj-toolbar__filters`: projected selects, then `ul.active-filters` of remove
   chips.
4. **Count** — after the form, `p.proj-toolbar__count[aria-live=polite]`.

Search box (`bn-search-box`):

1. **Field** — `form.search[role=search]` standalone, `div.search` when embedded. Rounded, strong
   rule, focus ring on `:focus-within`.
2. **Icon** — magnifier `svg.icon`, hidden.
3. **Label** — `label.vh`, "Search builders".
4. **Input** — `input.search__input[type=search]`, `autocomplete="off"`.
5. **Button** — `button[bn-button] variant="primary" type="submit"`, "Search".

Hosts: `bn-search-filter-toolbar` and `bn-search-box` are `display: block`.

## API

### Inputs

`bn-search-filter-toolbar`:

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `variant` | `'bar' \| 'stacked'` | `'bar'` | no | `bar` renders `div.toolbar`; `stacked` renders `form.proj-toolbar[role=search]` with the count after it. |
| `showCount` | `boolean` | `true` | no | Renders the count paragraph. Events sets it false and fills `[slot=lead]`. |
| `filtersLabel` | `string \| null` | `null` | no | Bar only. Renders the "Filters" button. |
| `filtersOpen` | `boolean` | `false` | no | Reflected in the filters button's `aria-expanded`. |
| `activeFilters` | `readonly { id: string; label: string; removeLabel: string }[]` | `[]` | no | Renders one remove chip per filter; nothing when empty. |
| `activeFiltersLabel` | `string` | `''` | yes when `activeFilters` is not empty | The list's `aria-label`, "Active filters". |
| `clearAllLabel` | `string \| null` | `null` | no | Renders "Clear all" after the chips when filters are active. |

`bn-search-box` (built, extended):

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `label` | `string` | — | yes | Hidden label, "Search builders", "Search projects". |
| `buttonLabel` | `string` | — | yes | "Search". |
| `placeholder` | `string` | `''` | no | An example, never the only label: "Name, skill or project". |
| `inputId` | `string` | `'q'` | no | Input id; the not-found page uses `nf-q`. |
| `value` | `string` | `''` | no | Initial query, from the URL ("Kotlin", "chaplaincy"). |
| `embedded` | `boolean` | `false` | no | Renders `div.search` instead of `form.search` so it can sit inside the stacked toolbar's form. |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| `filtersOpened` (toolbar) | `void` | The filters button is activated. The page opens the bottom sheet. |
| `filterRemoved` (toolbar) | `string` (filter id) | A remove chip is activated. |
| `filtersCleared` (toolbar) | `void` | "Clear all" is activated. |
| `searched` (toolbar, stacked) | `string` (trimmed query) | The stacked form is submitted, by the search button or Enter. |
| `searched` (search box) | `string` (trimmed query) | The standalone search form is submitted. |
| `queryChange` (search box) | `string` | Every input event; the page debounces it by 250 ms. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `[slot=count]` | text with `strong` numbers | Inside the count paragraph. |
| `[slot=lead]` | one group, the area chips `fieldset` | Bar only, rendered first in the toolbar. |
| `[slot=search]` | one `bn-search-box` with `embedded` | Stacked only, first in the form. |
| default | `label.select` selects | In `.toolbar__tools` (bar) or `.proj-toolbar__filters` (stacked), before the active filters. |

Each slot is declared once; the template places each by `variant` through one `ng-template`.

## Variants and sizes

| Variant | Markup | Use for |
|---|---|---|
| Sort (bar) | `.toolbar` with count, filters button and sort select | Directory. |
| Search (stacked) | `.proj-toolbar` with search, selects and active filters | Projects. |
| Lead group (bar) | `.toolbar` with area chips and a select | Events. |
| Active filters | remove chips and "Clear all" | Directory and projects when filtered. |
| Search box alone | `.search` | Directory header, not-found page. |

One size. The search box is capped at `--size-search-max-width-18`.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Count, tools | Count is a polite live region |
| Loading | page passes the loading count | "Finding builders near you…", "Loading projects…"; tools stay enabled except events chips, which the page disables | Count change announced |
| Filtered | `activeFilters` not empty | Remove chips and "Clear all" | List named "Active filters" |
| No results | page passes "0 builders match" | Count; active filters stay | Count change announced |
| Error | page passes "Projects could not be loaded" (stacked) or omits the toolbar (directory) | Count only | Announced |
| Search focus | `:focus-within` on `.search` | `--color-focus-ring` ring around the whole field | Input named "Search builders" |
| Search with value | `value` | Query in the input | — |
| Filters open | `filtersOpen` | Button unchanged; sheet open (drawer) | `aria-expanded="true"` |
| Hover, active | on buttons and selects | Their own states | — |

## Markup

```html
<!-- rendered: bar, filtered -->
<div class="toolbar">
  <p class="toolbar__count" aria-live="polite">Showing <strong>1–6</strong> of <strong>38</strong> builders</p>
  <div class="toolbar__tools">
    <button type="button" class="btn btn--quiet btn--sm filters-btn" aria-haspopup="dialog" aria-expanded="false"><svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/></svg>Filters</button>
    <label class="select"><span>Sort by</span><span class="select__wrap"><select class="select__control" name="sort">…</select>…</span></label>
  </div>
</div>
<div class="cluster">
  <ul class="chips" aria-label="Active filters"><li><button type="button" class="chip" aria-pressed="true" aria-label="Remove filter: Founders">Founders <svg class="icon icon--sm" …/></button></li>…</ul>
  <button type="button" class="btn btn--text btn--sm">Clear all</button>
</div>
```

```html
<!-- rendered: stacked -->
<form class="proj-toolbar" role="search">
  <div class="search"><svg class="icon" …/><label class="vh" for="q">Search projects</label><input class="search__input" id="q" name="q" type="search" value="chaplaincy" placeholder="Project, builder or what it does" autocomplete="off"><button type="submit" class="btn btn--primary">Search</button></div>
  <div class="proj-toolbar__filters">
    <label class="select"><span>Stage</span>…</label><label class="select"><span>Looking for</span>…</label><label class="select"><span>Sort by</span>…</label>
    <ul class="active-filters" aria-label="Active filters"><li><button type="button" class="chip" aria-pressed="true" aria-label="Remove filter: Stage: Launched">Stage: Launched <svg …/></button></li>…</ul>
  </div>
</form>
<p class="proj-toolbar__count" aria-live="polite">0 projects match “chaplaincy”, Launched, looking for Advisor</p>
```

```html
<!-- rendered: bar with lead group (events) -->
<div class="toolbar">
  <fieldset class="filter"><legend class="vh">Filter by area</legend><ul class="chips">…</ul></fieldset>
  <div class="toolbar__tools"><label class="select"><span>Day</span>…</label></div>
</div>
```

```html
<!-- consumer -->
<bn-search-filter-toolbar [filtersLabel]="'directory.filters' | t" [filtersOpen]="sheetOpen()" [activeFilters]="active()"
  [activeFiltersLabel]="'directory.activeFilters' | t" [clearAllLabel]="'directory.clearAll' | t"
  (filtersOpened)="openSheet()" (filterRemoved)="remove($event)" (filtersCleared)="clear()">
  <span slot="count">{{ 'directory.count' | t: { from, to, total } }}</span>
  <label class="select">…Sort by…</label>
</bn-search-filter-toolbar>
<bn-search-box [label]="'directory.search' | t" [placeholder]="'directory.searchHint' | t" [buttonLabel]="'common.search' | t" [value]="q()" (queryChange)="typed($event)" (searched)="search($event)" />
```

## Design

- `.toolbar`: flex, wrap, `align-items: center`, `justify-content: space-between`, gap
  `--space-4`, padding-bottom `--space-6`, margin-bottom `--space-8`, bottom rule
  `--border-width-hairline` `--color-border-default`. `.toolbar__tools`: flex, gap `--space-3`,
  wraps.
- `.proj-toolbar`: grid, gap `--space-4`, the same bottom spacing and rule;
  `.proj-toolbar__filters`: flex, wrap, gap `--space-3` / `--space-5`.
- Counts: `--text-body-sm`, `--color-fg-muted`; `strong` in `--color-fg-default` at
  `--font-weight-semibold`. The stacked count has `--space-6` below.
- `.search`: flex, gap `--space-3`, padding `--space-1` with `--space-5` on the start side,
  radius `--radius-full`, `--color-bg-surface`, strong hairline rule, max width
  `--size-search-max-width-18`; input height `--control-height-md`, `--text-body`; placeholder and
  icon `--color-fg-subtle`.
- Active filters: `.cluster` gap `--space-3`; `.active-filters` gap `--space-2`.

No component tokens.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Bottom rule | `--color-border-default` | `--palette-oat-300` | `--palette-night-700` |
| Count | `--color-fg-muted` | `--palette-stone-700` | `--palette-night-200` |
| Count numbers | `--color-fg-default` | `--palette-ink-900` | `--palette-night-50` |
| Search fill | `--color-bg-surface` | `--palette-birch-50` | `--palette-night-900` |
| Search rule | `--color-border-strong` | `--palette-stone-500` | `--palette-night-500` |
| Placeholder, icon | `--color-fg-subtle` | `--palette-stone-600` | `--palette-night-300` |
| Focus ring | `--color-focus-ring` | `--palette-sage-700` | `--palette-sage-300` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Count |
| `--color-fg-subtle` | `--color-bg-surface` | 4.5:1 | Search placeholder |
| `--color-border-strong` | `--color-bg-canvas` | 3:1 | Search field boundary |
| `--color-focus-ring` | `--color-bg-canvas` | 3:1 | Search focus ring |

## Responsive behaviour

- Below 48 rem the bar wraps: the count takes the first line and the tools the second; stacked
  selects wrap under the search.
- Below 62 rem (992 px) the "Filters" button shows and opens the bottom sheet; from 62 rem it is
  hidden because the filters are a sticky sidebar (L2-010).
- The search box shrinks to the column; the input keeps `min-width: 0` so the button never
  overflows.
- At 320 px nothing scrolls horizontally or clips; at 200 % zoom everything stays available; the
  filters button, selects, chips and search button have 44 × 44 CSS px targets.

## Accessibility

### Role and pattern

The search is a `search` landmark (`role="search"` on the form). The bar is a plain group of
controls. The filters button opens a modal sheet ([APG dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)).

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Search input, search button, then filters button, selects, active-filter chips, "Clear all", in DOM order. |
| <kbd>Enter</kbd> in the search input | Submits the search. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> on "Filters" | Emits `filtersOpened`. |
| <kbd>Escape</kbd> in the sheet | Closes it; focus returns to "Filters" (drawer). |

### Focus

After removing a filter, focus moves to the next chip, then the previous, then "Clear all"; after
"Clear all", focus moves to the search input. Focus never moves when results refresh.

### Labelling

The search input is named by its hidden label; the placeholder is never the only label. The
filters button is named "Filters" with `aria-expanded`. The active-filter list is named "Active
filters".

### Announcements

The count paragraph is `aria-live="polite"`, so "Showing 1–6 of 38 builders", "Finding builders
near you…" and "0 builders match" are announced without moving focus (L2-050).

### Motion

None of its own.

## Content and internationalisation

- Count: "Showing 1–12 of 1,284 builders", "Showing 1–7 of 312 projects, most recent first",
  "0 builders match". Numbers use thousands separators (L2-052); the range uses an en dash.
- Search placeholders give an example of what to type: "Name, skill or project", "Project,
  builder or what it does".
- Sort options: Best match, Nearest, Recently active, Newest (directory); Most recent, Most
  feedback, Needs feedback, Nearest builder (projects).
- Translatable inputs and slots: every label, the count, `activeFiltersLabel`, `clearAllLabel`,
  `removeLabel`s. Data values: the query, counts, filter values.

## Performance

- Change detection: `OnPush`, signal inputs.
- Perf-test scenarios: `SearchBox.ts` (exists) renders the not-found search; new
  `SearchFilterToolbar.ts` renders the directory bar "Showing 1–6 of 38 builders" with the filters
  button, sort select and the three active filters. Iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep each at roughly 100–300 ms.
- Composite scenarios: `DarkTheme` gains the toolbar.
- Regression rule: a change to the template, inputs, styles or change detection runs the perf
  test against the base branch with `--fail-on-regression` before it is pushed.
- Layout stability: the count line keeps one line of height while loading ("Finding builders near
  you…"), so the results below do not move when the real count arrives (L2-048).

## Acceptance criteria

### Rendering

- **AC-1** Given the directory, when it loads, then the toolbar shows "Showing 1–12 of 1,284 builders" with the numbers in `strong`, a "Filters" button and a "Sort by" select with Best match selected. (L2-009)
- **AC-2** Given the projects page, when it loads, then the stacked toolbar is a `form.proj-toolbar` with `role="search"` holding the search "Search projects", the Stage, Looking for and Sort by selects, and the count "Showing 1–7 of 312 projects, most recent first" follows it. (L2-015)
- **AC-3** Given the events page, when it loads, then the toolbar shows the area chips in a `fieldset` named "Filter by area" and a Day select, with no count. (L2-018)
- **AC-4** Given 1284 builders, when the count renders, then it reads "1,284". (L2-052)

### States

- **AC-5** Given filters Founders, Co-founding and Product strategy, when the directory shows results, then the active filters render as remove chips named "Remove filter: Founders", "Remove filter: Co-founding" and "Remove filter: Product strategy" in a list named "Active filters", with "Clear all" after them. (L2-010)
- **AC-6** Given active filters, when Amara activates "Remove filter: Co-founding", then `filterRemoved` emits its id once; when she activates "Clear all", then `filtersCleared` emits once. (L2-010)
- **AC-7** Given filters that match nobody, when the no-results state shows, then the count reads "0 builders match" and the active filters and "Clear all" stay visible. (L2-010)
- **AC-8** Given the projects page with "chaplaincy" in the URL, when it renders, then the search input holds "chaplaincy" and the active filters "Stage: Launched" and "Looking for: Advisor" are in `ul.active-filters`. (L2-015)
- **AC-9** Given Amara types "Lar" into the directory search, when each character is entered, then `queryChange` emits the current text and the page filters after its 250 ms pause. (L2-009)
- **AC-10** Given the projects page, when Amara submits the search with "Psalter" followed by a trailing space, then `searched` emits "Psalter". (L2-015)
- **AC-11** Given the directory is loading, when the toolbar renders, then the count reads "Finding builders near you…". (L2-009)
- **AC-12** Given the not-found page, when Amara searches "Daniel" in the search box, then `searched` emits "Daniel" and the page opens `/builders?q=Daniel`. (L2-042)

### Keyboard and focus

- **AC-13** Given a viewport under 992 px, when Amara activates "Filters", then `filtersOpened` emits and the button has `aria-expanded="true"` while the sheet is open. (L2-010)
- **AC-14** Given the search field, when it has keyboard focus, then a 2 px `--color-focus-ring` outline surrounds the whole rounded field with at least 3:1 contrast against the page. (L2-050)

### Screen readers

- **AC-15** Given the directory, when the results change from 1,284 to 38 builders, then the polite count announces "Showing 1–6 of 38 builders" without moving focus. (L2-050)
- **AC-16** Given the search box, when a screen reader reaches it, then it is inside a search landmark and the input is named "Search builders", not by its placeholder. (L2-050)

### Theming

- **AC-17** Given the dark theme, when the toolbar and search render, then they use tokens only, the count keeps at least 4.5:1 and the search boundary at least 3:1 against the page. (L2-051)

### Responsive

- **AC-18** Given a viewport of 992 px or wider, when the directory renders, then the "Filters" button is not shown because the filters are a sidebar. (L2-010)
- **AC-19** Given a 320 px viewport, when the projects toolbar renders with its active filters, then the search, selects and chips wrap without horizontal scroll and each control has a 44 × 44 CSS px target. (L2-049)

### Performance

- **AC-20** Given the `SearchFilterToolbar` and `SearchBox` perf-test scenarios, when the perf test runs against the base branch with `--fail-on-regression`, then neither is flagged as a possible regression. (L2-048)
- **AC-21** Given the directory loading state, when the real count replaces "Finding builders near you…", then the results below do not move. (L2-048)

## Implementation notes

- New folder `frontend/projects/components/src/lib/search-filter-toolbar/` with
  `search-filter-toolbar.ts` (`bn-search-filter-toolbar`, class `SearchFilterToolbar`) and its
  CSS copied from `.toolbar`, `.toolbar__count`, `.toolbar__tools`, `.filters-btn`,
  `.proj-toolbar*`, `.active-filters` and `.cluster`, with the filters-button breakpoint at 62 rem
  (D-1). Composes `bn-chip`, `bn-chip-list` and `bn-button`. Export from `public-api.ts`.
- `bn-search-box` (built) gaps:
  - Add the `value` input (initial query) and seed the `query` signal from it.
  - Add the `embedded` input rendering `div.search` (no nested form).
  - Add the `queryChange` output on input.
  - Expose the current query (a read-only `query` signal) so the stacked toolbar's form can emit
    `searched`.
- Add `SearchFilterToolbar.ts` and export it from `src/scenarios/index.ts` in the same change.

## Decisions

- **D-1** *L2-010 AC6 switches the filters to a sidebar at 992 px; `components.css` hides the
  filters button and shows the sidebar from 64 rem (1024 px), and the design-system page says
  1024 px.* L2 wins: the toolbar hides the button from 62 rem (992 px), and the drawer CRD shows
  the sidebar at the same width. Raised to the lead so the design system can change its breakpoint.
- **D-2** *The directory count has no live region; the projects count does.* Both get
  `aria-live="polite"`, because L2-050 AC4 requires results changes to be announced.
- **D-3** *The events toolbar puts its select directly in `.toolbar`, not in `.toolbar__tools`.*
  The component always wraps tools in `.toolbar__tools`; the rendering is the same because both
  are flex rows, and one structure keeps the page objects simple.
- **D-4** *The mock's filters button uses `popovertarget`; the app uses CDK for sheets.* The button
  emits `filtersOpened` and reflects `aria-expanded`; the drawer CRD owns the sheet.
- **D-5** *The projects toolbar has no "Clear all" in its active filters.* The input is optional;
  projects omits it and offers "Clear filters" in its no-results block, as the mock does.
- **D-6** *Should the search inside the projects toolbar be its own form?* No: nested forms are
  invalid HTML. The search box renders as `div.search` in embedded mode and the toolbar's form
  submits.
