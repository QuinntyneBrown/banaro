# Drawer

| Field | Value |
|---|---|
| Selector | `bn-drawer` |
| Library path | `frontend/projects/components/src/lib/drawer/` |
| Status | planned |
| Traces to | L2-010, L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`drawer.html`](../../design-system/components/drawer.html) ("Drawer and sheet"), pattern [`dialogs.html`](../../design-system/patterns/dialogs.html) |
| Source mocks | [`pages/directory/default`](../../mocks/pages/directory/default.html), [`filtered`](../../mocks/pages/directory/filtered.html), [`no-results`](../../mocks/pages/directory/no-results.html), [`edge`](../../mocks/pages/directory/edge.html), [`loading`](../../mocks/pages/directory/loading.html), [`error`](../../mocks/pages/directory/error.html) |
| Rendering | [`drawer.html`](drawer.html) |

## Purpose and scope

The drawer holds a panel of refinements that sits beside the content on wide screens and rises as a
modal bottom sheet on narrow ones. In Banaro it is the directory's filter panel: at 992 px and wider
the filters are a sticky sidebar next to the results; below 992 px a "Filters" button opens the same
filters as a bottom sheet over the directory, with an action that shows the matching builders.

It is one component with two forms, so the filter groups are written once. The sheet form opens
through [`DialogService`](dialog.md) with `sheetBelow: 'LG'` and follows the dialog's modal rules;
the inline form is ordinary page content and never traps focus. Use [dialog](dialog.md) for a
decision or short edit, [popover](popover.md) for a non-modal action group, and the top bar's own
navigation sheet ([top bar](top-bar.md)) for the primary navigation.

Out of scope:

- The filter groups, skill toggles, distance options, counts and "Clear all" behaviour (page and the
  filter components named in the `filter-directory` design).
- Staging and applying the filters, the URL, and the result count in the action label (page).
- The "Filters" trigger button itself ([button](button.md)); the drawer only reads it as the opener.

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/directory/default` (and `loading`, `error`, `edge`) | `inlineFrom="LG"`, heading "Filters" | head action "Clear all" (text, sm); body: Role, Open to, Neighbourhood or city, Distance, Popular skills groups; footer action "Show 1,284 builders" (primary, block) | inline sidebar (≥ 992 px); closed and open sheet (< 992 px) | canvas (sidebar); `--color-bg-surface-raised` sheet over backdrop |
| `pages/directory/filtered` | same | footer action "Show 38 builders" | open sheet with staged choices | same |
| `pages/directory/no-results` | same | footer action "Show 0 builders" | open sheet | same |

The design-system page also draws left and right drawers with "Filter builders" and "Done"; no
screen uses them (D-3).

## Anatomy

1. **Panel** — `aside.filters` with `aria-labelledby` pointing at the title. In the sheet form it is
   the content of a CDK dialog pane and the pane carries `role="dialog"` (see Markup).
2. **Head** — `.filters__head`: the title on the left, the head action on the right.
3. **Title** — `h2.filters__title` with a generated id. It names both forms.
4. **Head action (optional)** — projected, such as "Clear all".
5. **Body** — the projected filter form; it scrolls inside the sheet.
6. **Footer action** — projected primary button with `.filters__done`, full width. Shown only in the
   sheet form; hidden inline.
7. **Backdrop** — `.backdrop` on the CDK backdrop, sheet form only.

Host: `bn-drawer` is `display: contents` in the inline form; below the breakpoint it renders nothing
in place and moves its template into the dialog pane while open.

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `heading` | `string` | — | yes | Title text ("Filters"). Translatable. |
| `inlineFrom` | `'LG' \| 'never'` | `'LG'` | no | Breakpoint class from which the panel is inline. `never` keeps it a sheet at every width. |
| `open` | `boolean` (model, two-way `[(open)]`) | `false` | no | Opens or closes the sheet. Ignored while inline. Set back to `false` whenever the sheet closes for any reason. |
| `opener` | `HTMLElement \| null` | `null` | no | The "Filters" button; gets `aria-expanded` and `aria-controls`, and receives focus when the sheet closes. |
| `autoFocus` | `'first-heading' \| 'first-tabbable' \| string` | `'first-heading'` | no | Focus target when the sheet opens (the title). |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| `openChange` | `boolean` | The sheet opens or closes (model output of `open`). |
| `dismissed` | `'escape' \| 'backdrop' \| 'breakpoint'` | The sheet closes without its footer action: Escape, a backdrop tap, or the viewport crossing to the inline form. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `[slot=head]` | one `button[bn-button]` ("Clear all") | Projected into `.filters__head` after the title, in both forms. |
| default | the filter `form` | Projected into the panel after the head. Rendered once; the same nodes move between the forms, so choices survive. |
| `[slot=footer]` | one `button[bn-button][variant=primary]` with class `filters__done` | Shown in the sheet only. The page closes the sheet (`open = false`) after applying. |

Each slot is declared once inside one `<ng-template>` that is rendered either inline or in the
dialog pane (AGENTS.md slot rule).

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Inline sidebar | — (`.filters` without overlay) | ≥ 992 px: sticky beside the results |
| Bottom sheet | pane class `bn-dialog--sheet` | < 992 px, opened by "Filters" |

| Size | Modifier | Height | Padding | Type |
|---|---|---|---|---|
| One size | — | sheet: up to 86 % of the viewport height, content-driven; inline: content-driven | sheet: `--space-8` top, `--layout-margin` sides, `--space-6` bottom; inline: none | title `--text-h4` |

The inline width comes from the page grid (`--layout-sidebar-width`); the sheet spans the viewport.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Inline | viewport ≥ 992 px | Sticky at `--space-6` from the top, no surface, no footer action | Plain `aside` landmark labelled "Filters"; no trap |
| Closed (narrow) | viewport < 992 px, `open` false | Nothing rendered in place; "Filters" button visible | Opener `aria-expanded="false"` |
| Open sheet | `open` true | Backdrop; sheet rises from the bottom edge over `--duration-slow`; top corners `--radius-xl` | `role="dialog"`, `aria-modal="true"`, named "Filters"; focus on the title; Tab contained; opener `aria-expanded="true"` |
| Scrolling | content taller than the sheet | Sheet scrolls; head scrolls with it | Scrollable sheet is focusable through its controls |
| Busy results | page refreshing counts | No drawer change; the page owns counts | — |
| Closing | footer action, Escape, backdrop tap | Sheet and backdrop removed | Focus returns to "Filters" |
| Crossing to inline | resize or rotate across 992 px while open | Sheet closes; panel appears inline with the same choices | Focus moves to the inline title |
| Hover / focus / active | on projected controls | Owned by checkbox, button and toggle | — |

## Markup

```html
<!-- rendered: inline, ≥ 992 px -->
<aside class="filters" id="bn-drawer-1" aria-labelledby="bn-drawer-1-title">
  <div class="filters__head">
    <h2 class="filters__title" id="bn-drawer-1-title" tabindex="-1">Filters</h2>
    <button type="button" class="btn btn--text btn--sm">Clear all</button>
  </div>
  <form action="#results">…fieldset.filter groups…</form>
  <!-- footer action not rendered inline -->
</aside>
```

```html
<!-- rendered: open sheet, < 992 px -->
<div class="cdk-overlay-backdrop backdrop cdk-overlay-backdrop-showing"></div>
<div class="cdk-global-overlay-wrapper">
  <div class="cdk-overlay-pane bn-dialog--sheet">
    <div class="cdk-dialog-container" role="dialog" aria-modal="true" aria-labelledby="bn-drawer-1-title" tabindex="-1">
      <aside class="filters filters--sheet" id="bn-drawer-1" aria-labelledby="bn-drawer-1-title">
        <div class="filters__head">
          <h2 class="filters__title" id="bn-drawer-1-title" tabindex="-1">Filters</h2>
          <button type="button" class="btn btn--text btn--sm">Clear all</button>
        </div>
        <form action="#results">…</form>
        <button type="button" class="btn btn--primary filters__done">Show 38 builders</button>
      </aside>
    </div>
  </div>
</div>
```

```html
<!-- consumer: directory page -->
<button #filtersBtn bn-button variant="quiet" size="sm" class="filters-btn" type="button" (click)="filtersOpen.set(true)">
  <svg slot="icon" class="icon icon--sm" aria-hidden="true">…</svg>{{ 'directory.filters' | t }}
</button>
<bn-drawer [heading]="'directory.filters' | t" [(open)]="filtersOpen" [opener]="filtersBtn">
  <button slot="head" bn-button variant="text" size="sm" type="button" (click)="clearAll()">{{ 'directory.clearAll' | t }}</button>
  <form action="#results">…</form>
  <button slot="footer" bn-button variant="primary" class="filters__done" type="button" (click)="apply()">{{ 'directory.showCount' | t: { count } }}</button>
</bn-drawer>
```

`.filters--sheet` replaces the mock's `.filters[popover]` selector (D-4); the `cdk-*` classes belong
to CDK. E2E page objects find the sheet with `getByRole('dialog', { name: 'Filters' })` and the
sidebar with `getByRole('complementary', { name: 'Filters' })`.

## Design

- Sheet: background `--color-bg-surface-raised`, radius `--radius-xl` on the top corners only,
  elevation `--shadow-4`, padding `--space-8` `--layout-margin` `--space-6`, max height 86 % of the
  viewport with `overflow: auto`; bottom padding adds the safe-area inset.
- Head: flex, `justify-content: space-between`, gap `--space-4`, margin below `--space-4`.
- Title `--text-h4`.
- Footer action: margin above `--space-6`, full width.
- Inline: `position: sticky; top: var(--space-6)`, no background, padding or shadow.
- Backdrop `--color-bg-backdrop`; layer `--z-modal`.
- Motion: the sheet enters with the `settle` keyframes (rise by `--space-3` with fade) over
  `--duration-slow` and `--ease-enter`; no exit motion.

Component tokens: none; the drawer reads semantic and layout tokens directly.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Sheet | `--color-bg-surface-raised` | `--palette-white` | `--palette-night-850` |
| Title and labels | `--color-fg-default` | resolved live | resolved live |
| Counts and legends | `--color-fg-subtle` | resolved live | resolved live |
| Group rules | `--color-border-default` | `--palette-oat-300` | `--palette-night-700` |
| Backdrop | `--color-bg-backdrop` | warm ink at 45 % | black at 60 % |
| Focus ring | `--color-focus-ring` | resolved live | resolved live |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-surface-raised` | 4.5:1 | Title and option labels in the sheet |
| `--color-fg-subtle` | `--color-bg-surface-raised` | 4.5:1 | Counts and legends in the sheet |
| `--color-fg-default` | `--color-bg-canvas` | 4.5:1 | Inline title and labels |
| `--color-fg-subtle` | `--color-bg-canvas` | 4.5:1 | Inline counts |
| `--color-focus-ring` | `--color-bg-surface` | 3:1 | Focus ring |

## Responsive behaviour

- Below 992 px (XS to MD): the panel is hidden in place; "Filters" opens it as a full-width bottom
  sheet. At 360 px the sheet covers up to 86 % of the height and its content scrolls.
- From 992 px (LG): the panel is an inline sticky sidebar; the footer action is not rendered.
- Crossing 992 px while the sheet is open closes the sheet and shows the inline panel with the same
  choices, emitting `dismissed('breakpoint')`.
- At 320 px nothing scrolls horizontally: long option names ("Product managers", "Anywhere in the
  GTA") wrap and counts stay visible; every target is at least 44 × 44 CSS px.

## Accessibility

### Role and pattern

Sheet form: WAI-ARIA [Dialog (Modal)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/),
through CDK Dialog, named by the title. Inline form: an `aside` (complementary landmark) named by the
title; not modal.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Sheet: moves through head action, filters and footer action, wrapping. Inline: normal page order. |
| <kbd>Escape</kbd> | Sheet: closes without applying; focus returns to "Filters". Inline: nothing. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Activate the focused control. |

### Focus

- Opening the sheet moves focus to the title ("Filters"); closing returns it to the opener.
- Inline, the drawer never moves focus, except to its title when a viewport change replaces an open
  sheet.
- Focus ring `--focus-ring-width` `--color-focus-ring`.

### Labelling

`aria-labelledby` on the panel (and on the dialog pane in the sheet form) points at the title. The
opener carries `aria-expanded` and `aria-controls="bn-drawer-1"`.

### Announcements

None from the drawer. The page announces the new result count politely after applying.

### Motion

The sheet's rise is removed under `prefers-reduced-motion: reduce`.

## Content and internationalisation

- Title "Filters"; head action "Clear all"; footer action names the outcome with the count, "Show 38
  builders", "Show 1,284 builders" (thousands separator per L2-052), "Show 0 builders".
- Translatable inputs: `heading`; slot text from the catalogue. Data values: option names and counts.
- Labels wrap; nothing in the head or footer has a fixed width.

## Performance

- Change detection: `OnPush`, signal inputs, `model()` for `open`; `BreakpointObserver` subscription
  only while the component lives.
- The projected content is rendered once and moved, never re-created, between the forms.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Drawer.ts` renders the inline
  drawer with heading "Filters", "Clear all" and the Role group (Founders 214, Engineers 486,
  Designers 231, Product managers 198, Other 155); iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly 100–300 ms.
- Composite scenarios: `DirectoryFilters` (from the `filter-directory` design) renders the full
  sidebar inside `bn-drawer`.
- Layout stability: the inline panel renders with the page on the server, so the results do not move
  when it hydrates; opening the sheet does not shift the page.
- Weight: `@angular/cdk/dialog` (through `DialogService`), `@angular/cdk/layout`, `@angular/cdk/portal`.

## Acceptance criteria

### Rendering

- **AC-1** Given the directory at 1280 px, when it renders, then the filters are an inline `aside.filters` named "Filters" beside the results, with "Clear all" in `.filters__head` and no "Show 1,284 builders" button. (L2-010)
- **AC-2** Given the directory at 360 px, when it renders, then no filter panel is shown in place and the "Filters" button has `aria-expanded="false"`. (L2-010)

### States

- **AC-3** Given the directory at 360 px, when Amara taps "Filters", then a bottom sheet with `role="dialog"`, `aria-modal="true"` and the name "Filters" opens over a backdrop, and the "Filters" button has `aria-expanded="true"`. (L2-010)
- **AC-4** Given the open sheet with choices staged that match 38 builders, when Amara taps "Show 38 builders", then the page applies the filters and the sheet closes. (L2-010)
- **AC-5** Given the open sheet with Designers checked, when Amara closes it with Escape and opens it again, then Designers is still checked. (L2-010)
- **AC-6** Given the open sheet at 768 px, when the viewport widens to 1280 px, then the sheet closes, `dismissed` emits `'breakpoint'`, the inline panel shows the same choices, and focus is on its "Filters" title. (L2-049)

### Keyboard and focus

- **AC-7** Given the sheet opens, when it appears, then focus is on the "Filters" title, and Tab from "Show 1,284 builders" wraps to "Clear all" without reaching the page behind. (L2-050)
- **AC-8** Given the open sheet, when Amara presses Escape, then the sheet closes and focus returns to the "Filters" button. (L2-050)
- **AC-9** Given the inline sidebar at 1280 px, when Amara tabs through it, then focus moves on to the results after the last filter and is never trapped. (L2-050)

### Screen readers

- **AC-10** Given the directory at 1280 px and at 360 px with the sheet open, when axe-core runs in both themes, then it reports no WCAG 2.2 A or AA violations. (L2-050)

### Theming

- **AC-11** Given the dark theme, when the sheet is open, then the sheet uses `--color-bg-surface-raised`, option labels measure at least 4.5:1 and counts at least 4.5:1 against it. (L2-050)
- **AC-12** Given the drawer's styles, when inspected, then every colour comes from a design-system token. (L2-051)

### Responsive

- **AC-13** Given 360 px, when the sheet opens, then it spans the full width, touches the bottom edge, has rounded top corners, is no taller than 86 % of the viewport, and its content scrolls. (L2-049)
- **AC-14** Given 320 px, when the sheet is open, then there is no horizontal scroll, "Anywhere in the GTA" wraps, and every checkbox row and button is at least 44 px tall. (L2-049)
- **AC-15** Given 1280 px, when Amara scrolls the results, then the inline panel stays in view, stuck at `--space-6` from the top. (L2-049)

### Motion

- **AC-16** Given `prefers-reduced-motion: reduce`, when the sheet opens, then it appears without the rise animation. (L2-050)

### Content

- **AC-17** Given 1,284 matching builders, when the sheet renders, then the footer action reads "Show 1,284 builders" from the catalogue with a comma thousands separator. (L2-052)

### Performance

- **AC-18** Given the directory on a mid-range phone, when the page loads, then the drawer's server-rendered inline panel and hidden sheet keep Cumulative Layout Shift within 0.1, with no shift from the filter region. (L2-048)
- **AC-19** Given a change to the drawer, when the perf test runs the `Drawer` scenario against the base branch, then it is not flagged as a possible regression. (L2-048)

## Implementation notes

- Folder `frontend/projects/components/src/lib/drawer/`: `drawer.ts`, `drawer.html`, `drawer.css`
  (`Drawer`, selector `bn-drawer`). Export from `public-api.ts`.
- The template holds one `<ng-template #panel>` with the `aside.filters` and all three slots. Inline,
  it renders with `ngTemplateOutlet`; for the sheet, `DialogService.open()` receives a
  `TemplatePortal` of it with `{ sheetBelow: 'LG', autoFocus, role: 'dialog' }` and the drawer's
  `ariaLabelledBy`. Use `restoreFocus` with the `opener`.
- Breakpoint from `BREAKPOINTS.LG` via `BreakpointObserver`.
- The page's `FilterSheet` in the `filter-directory` design is this component's sheet form; the page
  no longer needs its own sheet class.
- Add `Drawer.ts` to the perf-test scenarios and `index.ts`.
- `@angular/cdk` is not yet in `frontend/package.json`; add it (matching the Angular major) in the first slice that builds this component.
- The mock's native `popover`, `popovertarget` on "Filters" and `popovertargetaction` on the footer
  action are replaced by the `open` model and click handlers.

## Decisions

- **D-1** *At which width does the panel become inline?* 992 px, L2-010 AC6 and the
  `filter-directory` design. The mock CSS and `--layout-breakpoint-lg` use 64 rem (1024 px); L2 is
  the requirement, and the parity widths agree under both values.
- **D-2** *What does the footer action say: "Apply" (L2-010 AC6) or "Show 38 builders" (mock)?* The
  action is the L2 "Apply" action; its label names the outcome, "Show 38 builders", as in every
  directory mock. The label is a slot, so a catalogue change alone can switch it.
- **D-3** *Left, right and "Filter builders / Done" drawers?* Not built. The design-system page
  draws them with identical specimens and no screen uses them; the API keeps one bottom form, which
  the `inlineFrom="never"` option covers for any future sheet-only use.
- **D-4** *How does the sheet form get its look without `[popover]`?* The CDK pane uses the dialog's
  `bn-dialog--sheet` positioning, and the panel adds `.filters--sheet`, which carries the mock's
  `.filters[popover]` declarations (surface, radius, shadow, padding, height cap).
- **D-5** *Where does focus go when the sheet opens?* To the title, as the design-system page says
  ("move focus to the heading or first control"); the first control would scroll a long list on
  phones and hide the context.
- **D-6** *Does closing without the action keep the choices?* Yes. The design system's do/don't says
  "Preserve selections when the sheet closes"; the same form nodes stay alive. Whether they are
  applied is the page's staging rule.
- **D-7** *Is there a close button in the sheet?* No, as in the mocks. Escape, a backdrop tap and
  the footer action close it; every one is a dialog-standard path.
