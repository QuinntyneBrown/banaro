# Tabs

| Field | Value |
|---|---|
| Selector | `bn-tabs`, `a[bn-tab]`, `button[bn-tab]`, `bn-tab-panel` |
| Library path | `frontend/projects/components/src/lib/tabs/` |
| Status | planned |
| Traces to | L2-018, L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`tabs.html`](../../design-system/components/tabs.html) |
| Source mocks | [`pages/events/default`](../../mocks/pages/events/default.html), [`pages/events/past`](../../mocks/pages/events/past.html), [`pages/events/empty`](../../mocks/pages/events/empty.html), [`pages/events/loading`](../../mocks/pages/events/loading.html), [`pages/events/error`](../../mocks/pages/events/error.html) |
| Rendering | [`tabs.html`](tabs.html) |

## Purpose and scope

Tabs switch between peer views of the same thing. Banaro uses them in two modes that look the
same and behave differently:

- **Navigation mode** — a row of route links in a `nav` ("Events view": "Upcoming" and "Last
  season"). Each tab is a real link to its own URL and the current one has `aria-current="page"`.
  This is the only mode the mocks use.
- **Panel mode** — an in-page `tablist` that shows one `tabpanel` at a time ("Matching views":
  "Suggestions" and "Saved" in the design system), with arrow-key focus and manual activation.

Use a segmented [button group](button-group.md) for a choice that changes a setting, the
[pagination](pagination.md) composite to move through results, and the top bar's navigation for
the four product areas.

Out of scope:

- The routes, and loading the events of each view (the page).
- Panel content.

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/events/default`, `empty`, `loading`, `error` | navigation mode, `label="Events view"`, underline | `a` "Upcoming" (current), `a` "Last season" | current on "Upcoming"; loading and error do not change the tabs | canvas, under the page head |
| `pages/events/past` | navigation mode, same | "Upcoming", "Last season" (current) | current on "Last season" | canvas |
| Design-system specimens (no mock use) | panel mode, `label="Matching views"`, underline and pill; counts; scrollable | `button` "Suggestions" with count badge "2", `button` "Saved"; panels "Daniel Reyes shares your Laravel skills." / "No saved suggestions yet." | default, hover, focus, active, disabled, selected | canvas or surface |

## Anatomy

1. **Container** — `bn-tabs`. Navigation mode renders `nav[aria-label] > div.tabs`; panel mode
   renders `div.tabs[role="tablist"][aria-label]`. Pill variant adds `.tabs--pill`.
2. **Tab** — `a[bn-tab]` (navigation) or `button[bn-tab]` (panel) with `.tab`. In panel mode it
   has `role="tab"`, an `id`, `aria-controls`, `aria-selected` and a roving `tabindex`.
3. **Selection indicator** — `.tab[aria-current="page"]::after` or `.tab[aria-selected="true"]::after`:
   a `--border-width-thick` bar in `--color-accent` along the bottom, inset by `--space-4`
   (underline); pill variant fills the selected tab with `--color-accent-subtle` instead.
4. **Count (optional)** — `[slot=count]`, a `span.badge.badge--count` after the label.
5. **Panel (panel mode)** — `bn-tab-panel` rendering `div[role="tabpanel"][aria-labelledby]`,
   `hidden` unless selected.

Host: `bn-tabs` is `display: block`; the tabs are the consumer's own `<a>`/`<button>` elements
projected into the row; panels are siblings projected after the row.

## API

### Inputs

`bn-tabs`:

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `label` | `string` | — | yes | `aria-label` of the `nav` (navigation) or the `tablist` (panel): "Events view", "Matching views". |
| `mode` | `'navigation' \| 'panels'` | `'navigation'` | no | Chooses the markup and keyboard model above. |
| `variant` | `'underline' \| 'pill'` | `'underline'` | no | `pill` adds `.tabs--pill`. |
| `selected` | `string` (model) | first tab's `value` | panel mode | The `value` of the selected tab; `[(selected)]` two-way. Ignored in navigation mode (the router decides). |

`a[bn-tab]`, `button[bn-tab]`:

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `value` | `string` | — | panel mode | Identifies the tab and its panel. |
| `disabled` | `boolean` | `false` | no | Panel mode: native `disabled`, skipped by arrow keys. Navigation mode: not offered (a route is never disabled). |

On `a[bn-tab]` the consumer adds `routerLink`; the component applies `routerLinkActive` logic and
writes `aria-current="page"` on the active link (exact match).

`bn-tab-panel`:

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `value` | `string` | — | yes | Matches a tab's `value`. |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| `selectedChange` | `string` | Panel mode: a different tab is activated (Enter, Space or click). Not emitted on arrow-key focus moves (manual activation). |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `bn-tabs` default | 2–6 `a[bn-tab]` or `button[bn-tab]`, then `bn-tab-panel`s in panel mode | All tabs of one kind. |
| `bn-tab` default | Text | Short peer nouns. |
| `bn-tab` `[slot=count]` | One `span.badge.badge--count` | A count of new items; the number is part of the tab's name (D-4). |
| `bn-tab-panel` default | Any content | Rendered only while selected (content is created lazily the first time). |

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Underline | `.tabs` | Default for both modes; a hairline under the row and a thick accent bar under the selected tab. Used by the events page. |
| Pill | `.tabs.tabs--pill` | Panel mode inside a card or panel, where a bottom rule would double the card edge. No rule; the selected tab is a `--color-accent-subtle` pill. |
| Counts | `[slot=count]` | Either variant, when a tab has new items. |
| Scrollable | — | Either variant: the row scrolls horizontally inside itself when the tabs do not fit (always on). |

One size (D-3): each tab is at least `--target-comfortable` (44 px) high with `--space-4` side
padding and `--text-label` type; width comes from the label.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | `--color-fg-muted` label, transparent fill | Link (navigation) or "tab, 2 of 2, not selected" |
| Hover | `:hover` (`data-state="hover"`) | `--color-bg-subtle` fill | — |
| Focus | `:focus-visible` | Global ring | — |
| Active | `:active` | Same as hover | — |
| Current (navigation) | `aria-current="page"` | `--color-fg-default` label and accent bar | "current page" |
| Selected (panel) | `aria-selected="true"` | `--color-fg-default` label and accent bar (underline) or accent-subtle pill (pill) | "selected" |
| Disabled (panel) | `disabled` | `--color-fg-disabled` label, no hover | Dimmed; skipped by arrow keys |
| Overflowing | row wider than its container | Row scrolls horizontally; page does not | — |
| Page loading or failed | the page's own states | Tabs unchanged and usable | — |

## Markup

```html
<!-- rendered: navigation mode (events) -->
<bn-tabs>
  <nav aria-label="Events view">
    <div class="tabs">
      <a class="tab" href="/events" aria-current="page">Upcoming</a>
      <a class="tab" href="/events/past">Last season</a>
    </div>
  </nav>
</bn-tabs>
```

```html
<!-- rendered: panel mode, with count -->
<div class="tabs" role="tablist" aria-label="Matching views">
  <button type="button" class="tab" role="tab" id="tabs-1-suggestions" aria-controls="tabs-1-suggestions-panel" aria-selected="true" tabindex="0">Suggestions <span class="badge badge--count">2</span></button>
  <button type="button" class="tab" role="tab" id="tabs-1-saved" aria-controls="tabs-1-saved-panel" aria-selected="false" tabindex="-1">Saved</button>
</div>
<div role="tabpanel" id="tabs-1-suggestions-panel" aria-labelledby="tabs-1-suggestions" tabindex="0">Daniel Reyes shares your Laravel skills.</div>
<div role="tabpanel" id="tabs-1-saved-panel" aria-labelledby="tabs-1-saved" tabindex="0" hidden>No saved suggestions yet.</div>
```

```html
<!-- consumer -->
<bn-tabs [label]="'events.view' | t">
  <a bn-tab routerLink="/events">{{ 'events.upcoming' | t }}</a>
  <a bn-tab routerLink="/events/past">{{ 'events.past' | t }}</a>
</bn-tabs>

<bn-tabs mode="panels" variant="pill" [label]="'matching.views' | t" [(selected)]="view">
  <button bn-tab value="suggestions">{{ 'matching.suggestions' | t }} <span slot="count" class="badge badge--count">2</span></button>
  <button bn-tab value="saved">{{ 'matching.saved' | t }}</button>
  <bn-tab-panel value="suggestions">…</bn-tab-panel>
  <bn-tab-panel value="saved">…</bn-tab-panel>
</bn-tabs>
```

The `.tabs`, `.tab`, `aria-current`, `role="tab"`, `aria-selected` and `role="tabpanel"` are the
e2e contract. Generated ids are unique per instance.

## Design

- Row: `display: flex`, gap `--space-2`, `overflow-x: auto`, `--border-width-hairline` bottom
  rule in `--color-border-default` (none for pill).
- Tab: `inline-flex`, `flex: none`, `min-height: --target-comfortable`, padding `0 --space-4`,
  `--text-label`, no border, transparent background, no underline.
- Indicator: `--border-width-thick` bar in `--color-accent`, inset `--space-4` left and right,
  overlapping the row rule by one hairline.
- Pill selected: `--radius-full`, `--color-accent-subtle`.
- Count badge: `--text-caption`, min width `--space-6`, `--color-accent` fill with
  `--color-fg-on-accent`.
- Focus ring: drawn inside the tab (`outline-offset` of minus `--focus-ring-width`) because the
  scrolling row clips anything outside it (D-7).
- Colour transitions use `--duration-fast` with `--ease-standard`; the indicator does not slide.

Component tokens: none.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Tab label | `--color-fg-muted` | `--palette-stone-700` | `--palette-night-200` |
| Current or selected label | `--color-fg-default` | `--palette-ink-900` | `--palette-night-50` |
| Indicator bar | `--color-accent` | `--palette-sage-600` | `--palette-sage-300` |
| Row rule | `--color-border-default` | `--palette-oat-300` | `--palette-night-700` |
| Hover fill | `--color-bg-subtle` | `--palette-oat-200` | `--palette-night-800` |
| Pill selected fill | `--color-accent-subtle` | `--palette-sage-50` | `--palette-sage-950` |
| Disabled label | `--color-fg-disabled` | `--palette-oat-400` | `--palette-night-500` |
| Count badge fill | `--color-accent` | `--palette-sage-600` | `--palette-sage-300` |
| Count badge text | `--color-fg-on-accent` | `--palette-birch-50` | `--palette-sage-950` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Unselected tab |
| `--color-fg-default` | `--color-bg-canvas` | 4.5:1 | Selected tab |
| `--color-fg-muted` | `--color-bg-subtle` | 4.5:1 | Hovered tab |
| `--color-fg-default` | `--color-accent-subtle` | 4.5:1 | Pill selected tab |
| `--color-fg-on-accent` | `--color-accent` | 4.5:1 | Count badge |
| `--color-accent` | `--color-bg-canvas` | 3:1 | Indicator bar |
| `--color-focus-ring` | `--color-bg-canvas` | 3:1 | Focus indicator |

The selected tab differs by the indicator bar or pill shape as well as by label colour, so the
state is not shown by colour alone.

## Responsive behaviour

- One row at every width; the row scrolls horizontally inside itself when the labels exceed the
  container, and never wraps (design-system don't). The page itself never scrolls horizontally.
- When a tab becomes current or selected it is scrolled into view within the row
  (`scrollIntoView({ inline: 'nearest' })`).
- At 320 px "Upcoming" and "Last season" fit on one row; each tab is at least 44 × 44 px; at
  200 % zoom the row scrolls rather than clipping.

## Accessibility

### Role and pattern

Navigation mode: a `nav` landmark of links with `aria-current="page"` (design system: route links
remain links). Panel mode: the
[WAI-ARIA tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) with manual activation.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Navigation: visits every tab link. Panel: enters the tablist at the selected tab, then moves to the panel. |
| <kbd>←</kbd> / <kbd>→</kbd> | Panel only: moves focus to the previous / next enabled tab, wrapping; does not select. |
| <kbd>Home</kbd> / <kbd>End</kbd> | Panel only: first / last enabled tab. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Navigation: Enter follows the link. Panel: selects the focused tab and shows its panel. |

### Focus

Panel mode keeps one tab at `tabindex="0"` (the selected one when focus enters). Panels are
focusable (`tabindex="0"`) when they contain no focusable content. Navigation mode: the router's
focus handling applies after the route changes.

### Labelling

The `nav` or `tablist` is named by `label`; each tab's name is its text plus its count
("Suggestions 2"); each panel is labelled by its tab.

### Announcements

None beyond the native role and state announcements.

### Motion

Only colour transitions; with `prefers-reduced-motion: reduce` they are instant. The indicator
never animates.

## Content and internationalisation

- Short peer nouns or phrases in sentence case: "Upcoming", "Last season", "Suggestions", "Saved".
- Counts use L2-052 number formatting ("1,284").
- Translatable: `label` and every tab label. Data values: counts.
- Longer translations stay on one row and make the row scroll.

## Performance

- Change detection: `OnPush`; signal inputs and model; tabs and panels found with
  `contentChildren`; selection is a `computed` per tab; panels render their content lazily on
  first selection.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Tabs.ts` renders the events
  view ("Upcoming" current, "Last season") in navigation mode; `TabsPanels.ts` renders "Matching
  views" in pill panel mode with the count badge "2". Iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep each at roughly 100–300 ms.
- Composite scenarios: none.
- Layout stability: the row has a fixed height from `--target-comfortable`, so switching the
  current tab or loading the page's list never moves it.
- Weight: `RouterLink`, `RouterLinkActive` and `FocusKeyManager` (`@angular/cdk/a11y`) only.

## Acceptance criteria

### Rendering

- **AC-1** Given the events page, when it opens, then a `nav` named "Events view" holds `div.tabs` with the links "Upcoming" (with `aria-current="page"`, `--color-fg-default` and the `--color-accent` bar) and "Last season" (no `aria-current`, `--color-fg-muted`). (L2-018)
- **AC-2** Given the events page, when the member selects "Last season", then the URL changes to the past-events route, `aria-current="page"` moves to "Last season", and the past state lists events newest first. (L2-018)
- **AC-3** Given a panel-mode tablist "Matching views", when it renders, then each tab has `role="tab"`, `aria-controls` pointing at its `tabpanel`, the selected one has `aria-selected="true"` and `tabindex="0"`, the other `aria-selected="false"` and `tabindex="-1"`, and only the selected panel is not `hidden`. (L2-050)
- **AC-4** Given the pill variant, when "Suggestions" is selected, then it has an `--color-accent-subtle` pill with `--radius-full` and the row has no bottom rule. (L2-050)

### States

- **AC-5** Given a tab is hovered, when it renders, then its fill is `--color-bg-subtle` and its label keeps at least 4.5:1 contrast. (L2-050)
- **AC-6** Given a disabled panel tab, when the member presses ArrowRight from the previous tab, then focus skips it. (L2-050)

### Keyboard and focus

- **AC-7** Given focus on "Suggestions" in panel mode, when the member presses ArrowRight, then focus moves to "Saved" without changing the panel, and Enter or Space then selects "Saved", shows its panel and emits `selectedChange` "saved" once. (L2-050)
- **AC-8** Given the events tabs, when the member tabs through them, then both links are reached in order with the 2 px `--color-focus-ring` ring fully visible on all four sides (not clipped by the scrolling row) at 3:1 or more. (L2-050)

### Screen readers

- **AC-9** Given both modes in both themes, when axe-core runs, then there are no violations, the navigation tabs are announced as links with "current page" on the current one, and panel tabs as "tab, selected, 1 of 2". (L2-050)
- **AC-10** Given a tab with the count "2", when its name is computed, then it is "Suggestions 2". (L2-050)

### Theming

- **AC-11** Given the dark theme, when the events tabs render, then labels, bar and rule resolve through `--color-fg-muted`, `--color-fg-default`, `--color-accent` and `--color-border-default` with no component code for the theme. (L2-051)

### Content

- **AC-12** Given the app in en-CA, when the events page renders, then "Events view", "Upcoming" and "Last season" come from the catalogue. (L2-052)

### Responsive

- **AC-13** Given a 320 px viewport and five tabs whose labels exceed the width, when the row renders, then it stays on one line, scrolls inside itself, the page has no horizontal scroll, and each tab is at least 44 px high. (L2-049)

### Motion

- **AC-14** Given `prefers-reduced-motion: reduce`, when the current tab changes, then colours change instantly and nothing slides. (L2-050)

### Performance

- **AC-15** Given a change to tabs, when the perf test runs `Tabs` and `TabsPanels` against the base branch, then neither is flagged as a possible regression. (L2-048)

## Implementation notes

- Folder `frontend/projects/components/src/lib/tabs/`; files `tabs.ts` (class `Tabs`), `tab.ts`
  (class `Tab`, selector `a[bn-tab], button[bn-tab]`), `tab-panel.ts` (class `TabPanel`); styles
  in `tabs.css`; export all three from `public-api.ts`.
- Navigation mode: `RouterLinkActive` with `ariaCurrentWhenActive="page"` and exact matching.
- Panel mode: `FocusKeyManager` with horizontal orientation, wrap, Home/End and a disabled skip
  predicate; ids from a per-instance counter.
- Move `.tabs`, `.tab` and `.tabs--pill` styles from `components.css` into the component.
- Add `Tabs.ts` and `TabsPanels.ts` to the perf-test scenarios and export them.

## Decisions

- **D-1** *One component or two for route links and in-page tabs?* One `bn-tabs` with a `mode`,
  because both share the `.tabs`/`.tab` markup and look identical; the mode switches only roles
  and keyboard handling, which the design system says must differ.
- **D-2** *Manual or automatic activation in panel mode?* Manual (Enter or Space), as the
  design-system accessibility section states.
- **D-3** *Are there small tabs?* No. The design-system page mentions 36 px and 44 px tabs, but
  `components.css` defines no size modifier and no mock uses a small tab; 44 px also meets
  L2-049's touch rule.
- **D-4** *How is the count announced?* As part of the tab's name ("Suggestions 2"); the badge is
  text, so it is read without extra ARIA.
- **D-5** *What is the past-events tab called?* "Last season", as in the events mocks. L2-018 AC2
  calls it a "Past events" toggle; the label is catalogue copy, so the component is unaffected,
  and the difference is raised for product to confirm.
- **D-6** *Can a navigation tab be disabled?* No: a route is either offered or absent.
- **D-7** *Where is the focus ring drawn?* Inside the tab. The rendering shows the design system's
  outset ring clipped to a sliver by the row's `overflow-x: auto`; an inset ring keeps the 2 px
  indicator whole (L2-050) without giving up the scrolling row.
