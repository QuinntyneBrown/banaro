# Accordion

| Field | Value |
|---|---|
| Selector | `details[bn-accordion]`, `bn-accordion-group` |
| Library path | `frontend/projects/components/src/lib/accordion/` |
| Status | planned |
| Traces to | L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`accordion.html`](../../design-system/components/accordion.html) |
| Source mocks | None: no screen in `docs/mocks` uses the `.accordion` block; the requirements come from the design-system page (D-1) |
| Rendering | [`accordion.html`](accordion.html) |

## Purpose and scope

The accordion reveals secondary information on demand: a builder's "Availability details" under
their profile summary, or a list of "Skills" that does not need to be read first. Each item is a
native `<details>` with a `<summary>`, so the browser supplies the disclosure semantics, the
keyboard behaviour, the expanded state and find-in-page. Items stand alone (independent,
"multiple open") or sit in a group where opening one closes the others ("single open").

Use [tabs](tabs.md) to switch between peer views, a [menu](menu.md) for a list of actions behind a
trigger (the builder profile's "More" control is a menu, not an accordion, D-2), a
[popover](popover.md) for floating content anchored to a control, and a [dialog](dialog.md) for
anything that needs a decision. Never put required form fields or their labels inside an
accordion (design system *Do and don't*).

Out of scope:

- The content of the expanded region: paragraphs, lists, links and description lists are the
  consumer's, styled by their own components ([prose](prose.md), [list](list.md),
  [description list](description-list.md)).
- Remembering which items were open across visits or routes; the page owns that state through
  `[(open)]` if it needs it.
- The heading of the section that holds the accordion (the page writes it).

## Usage

No page, dialog or notification in `docs/mocks` uses `.accordion` (the inventory script finds no
match; the ten `<details>` elements in the mocks are all `details.more` on the builder profile and
the dialogs over it, owned by [menu](menu.md)). Every configuration below comes from the
design-system page, and the API covers each of them.

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| Design system *Anatomy*, *Variants · Single open*, *Theming*, *Do and don't* | one item, closed | summary "Availability details"; content "Daniel is open to co-founding with builders in Toronto." | default | surface |
| Design system *Variants · Multiple open* | two independent items, both open (`bn-accordion-group multiple`) | "Availability details" / "Daniel is open to co-founding with builders in Toronto."; "Skills" / "Laravel, Angular, PostgreSQL" | open, open | surface |
| Design system *Variants · Icon* | one item with a leading icon in the summary (`[slot=icon]`, D-6) | "Availability details" + calendar icon | default | surface |
| Design system *States* matrix (light and dark) | each variant | as above | default, hover, focus, active, disabled (D-4), expanded (D-5) | surface and dark surface |
| Product screens | none | — | — | — |

Every row is buildable with the API below: `details[bn-accordion]` with `summary`, `open` and the
icon slot, inside an optional `bn-accordion-group` with `multiple`.

## Anatomy

1. **Item** — the host `<details class="accordion">`. Hairline bottom rule in
   `--color-border-default`, block padding `--space-3`, no fill of its own (it takes the surface it
   sits on), no radius.
2. **Summary trigger** — `summary`, the first child, rendered by the component. Minimum height
   `--target-comfortable`, `--text-label`, `cursor: pointer`, displayed as the native
   `list-item`, so the browser's disclosure marker (a right-pointing triangle when closed, a
   down-pointing one when open) is the expand indicator (D-7).
3. **Icon (optional)** — the `[slot=icon]` content inside the summary, before the text: one
   `svg.icon.icon--sm` with `aria-hidden="true"`, drawn in `currentColor`.
4. **Summary text** — the `summary` input, a text node; it is the accessible name.
5. **Expanded content** — the default slot, projected after the summary. The browser hides it
   while the item is closed (not rendered, not focusable, still found by find-in-page, D-9).
6. **Group (optional)** — `bn-accordion-group`, `display: block`, no element or class of its own.
   It projects its items and, unless `multiple`, gives them one shared `name` so only one is open.

Host: `details[bn-accordion]` is an attribute component on the consumer's own `<details>`; it adds
`class="accordion"` and the `open` and `name` attributes and renders the `<summary>` as its first
child. There is no wrapper element. `bn-accordion-group` is an element host with no rendered
markup besides its projected items.

## API

### Inputs

`details[bn-accordion]`:

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `summary` | `string` | — | yes | Text of the `<summary>`; the item's accessible name. Translatable. Names what expands: "Availability details", "Skills". |
| `open` | `boolean` (model) | `false` | no | Writes the native `open` attribute; `[(open)]` two-way. Kept in sync from the native `toggle` event, so a click, Enter, Space, find-in-page or a sibling closing it in a single-open group all update the model. Server-rendered, so an item that starts open is open in the first paint (D-10). |

`bn-accordion-group`:

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `multiple` | `boolean` | `false` | no | `false` (single open): every item gets the same generated `name` (`bn-accordion-<n>`), so the browser closes the open item when another opens; the group also closes siblings on `toggle` for browsers without exclusive `details` (D-3). `true` (multiple open): no `name`; items open and close independently. |

- Inputs are signal inputs; `multiple` uses `booleanAttribute`, so `<bn-accordion-group multiple>`
  works. `open` is a `model()` with a boolean transform.
- Native attributes the consumer writes on `<details>` stay native: `id`, `class` (kept beside
  `accordion`), `data-*`. A consumer `name` is ignored inside a group (the group owns it) and kept
  outside one.

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| `openChange` (from the `open` model) | `boolean` — the new state | Once per native `toggle` event whose new state differs from the model: user activation, find-in-page, or a single-open group closing this item. Not emitted when the consumer sets `open` itself. |

`bn-accordion-group` has no outputs; consumers listen on the items.

### Content slots

`details[bn-accordion]`:

| Slot | Accepts | Rule |
|---|---|---|
| `[slot=icon]` | One `svg.icon.icon--sm` with `aria-hidden="true"` | Rendered inside the summary before the text (the icon variant). Decorative only. |
| default | Flow content: paragraphs, lists, links, a description list | The expanded region. Never required form fields or their labels. No heading that would duplicate the summary. |

`bn-accordion-group`:

| Slot | Accepts | Rule |
|---|---|---|
| default | `details[bn-accordion]` items only | Two or more items. Items are found with a content query, so items added later join the group. |

Each slot is declared once in the template (AGENTS.md). The summary text is an input, not a slot,
so the `<summary>` always has exactly one text node after the optional icon (D-8).

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Single open | none; items inside `bn-accordion-group` (default) | A set of related sections where reading one at a time keeps the page short. Opening one closes the others. |
| Multiple open | none; `bn-accordion-group multiple`, or stand-alone items | Independent disclosures a member may compare side by side ("Availability details" and "Skills"). |
| Icon | none; an `svg.icon.icon--sm` in `[slot=icon]` | When an icon helps a member scan a list of sections. The icon never replaces the text. |

No variant adds a modifier class: `.accordion` is the only class, and the variants differ only in
grouping and in the projected icon.

There is one size. The item is as wide as its container and as tall as its content: the summary is
at least `--target-comfortable` high, and the item adds `--space-3` above and below.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default (closed) | no `open` attribute | Summary with the right-pointing marker; content hidden; bottom rule | Summary announced with its name and "collapsed" |
| Hover | `:hover` on the summary (`data-state="hover"` in specimens) | Pointer cursor; colours unchanged (D-11) | — |
| Focus | `:focus-visible` on the summary (`data-state="focus"`) | `--focus-ring-width` outline in `--color-focus-ring`, offset `--focus-ring-offset`, radius `--radius-sm`, from the global focus rule | Focused |
| Active | `:active` on the summary (`data-state="active"`) | No change of its own; the item toggles on release (D-11) | — |
| Expanded (open) | native `open` attribute | Down-pointing marker; content shown below the summary; the rule moves below the content | "expanded"; content follows the summary in reading order and its focusable elements join the tab order |
| Single open, sibling opened | another item with the same `name` opens | This item closes; nothing else moves focus | This item becomes "collapsed"; focus stays on the summary the member pressed |
| Disabled | not supported (D-4) | — | — |
| Forced colours | `forced-colors: active` | Summary text, marker and rule in system colours (`CanvasText`); focus ring `Highlight` | — |
| On surfaces | context | Transparent item; the rule and text keep their roles on canvas, surface and raised surface | — |

The item has no loading, empty or error state: a section with nothing to reveal is not rendered
(D-4).

## Markup

Rendered DOM.

```html
<!-- rendered: closed (default) -->
<details class="accordion"><summary>Availability details</summary><p>Daniel is open to co-founding with builders in Toronto.</p></details>
```

```html
<!-- rendered: open -->
<details class="accordion" open><summary>Availability details</summary><p>Daniel is open to co-founding with builders in Toronto.</p></details>
```

```html
<!-- rendered: icon -->
<details class="accordion"><summary><svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/></svg>Availability details</summary><p>Daniel is open to co-founding with builders in Toronto.</p></details>
```

```html
<!-- rendered: single-open group (the group element has no markup of its own) -->
<bn-accordion-group>
  <details class="accordion" name="bn-accordion-1" open><summary>Availability details</summary><p>Daniel is open to co-founding with builders in Toronto.</p></details>
  <details class="accordion" name="bn-accordion-1"><summary>Skills</summary><p>Laravel, Angular, PostgreSQL</p></details>
</bn-accordion-group>
```

```html
<!-- rendered: multiple-open group -->
<bn-accordion-group multiple>
  <details class="accordion" open><summary>Availability details</summary><p>Daniel is open to co-founding with builders in Toronto.</p></details>
  <details class="accordion" open><summary>Skills</summary><p>Laravel, Angular, PostgreSQL</p></details>
</bn-accordion-group>
```

```html
<!-- consumer -->
<bn-accordion-group>
  <details bn-accordion [summary]="'profile.availability' | t" [(open)]="availabilityOpen">
    <p>{{ builder().availabilityNote }}</p>
  </details>
  <details bn-accordion [summary]="'profile.skills' | t">
    <svg slot="icon" class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true">…</svg>
    <p>{{ builder().skills | list }}</p>
  </details>
</bn-accordion-group>
```

The e2e contract is `details.accordion`, its first-child `summary`, the native `open` and `name`
attributes, and the order icon then text inside the summary. The generated `name` value and the
icon's SVG paths are free to change. The component never writes `aria-expanded`, `role` or
`tabindex` on either element (D-5).

## Design

- Item: `--border-width-hairline` bottom border in `--color-border-default`; `padding-block`
  `--space-3`; no inline padding, so the summary text lines up with the surrounding content.
- Summary: `min-height` `--target-comfortable`; `--text-label`; `cursor: pointer`; native
  `list-item` display with the browser marker; text wraps.
- Icon: `--space-4` square (`.icon--sm`), `display: inline-block` (the foundations make every
  `svg` a block, which would push the text onto its own line), `vertical-align: middle`, `--space-2`
  after it (component style, D-6).
- Content: no padding or type of its own; the projected elements bring their own (`p` keeps
  `text-wrap: pretty` from the foundations). The text is `--text-body` in `--color-fg-default`,
  inherited from the surface.
- Shape: no radius, no fill, no elevation, no z-order.
- Focus: the global `:focus-visible` rule — `--focus-ring-width` solid `--color-focus-ring`,
  offset `--focus-ring-offset`, `--radius-sm`.
- Motion: none. Opening and closing are instant; there is no height animation (D-12).
- Stacked items: no gap; each item's own rule separates it from the next.

Component tokens: none. The design system declares no `--bn-accordion-*` knob, and the item has
nothing a surface needs to re-skin.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Summary text and marker | `--color-fg-default` | `--palette-ink-900` | `--palette-night-50` |
| Content text | `--color-fg-default` | `--palette-ink-900` | `--palette-night-50` |
| Bottom rule | `--color-border-default` | `--palette-oat-300` | `--palette-night-700` |
| Surface (inherited) | `--color-bg-surface` | `--palette-birch-50` | `--palette-night-900` |
| Page (inherited) | `--color-bg-canvas` | `--palette-oat-100` | `--palette-night-950` |
| Focus ring | `--color-focus-ring` | `--palette-sage-700` | `--palette-sage-300` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-surface` | 4.5:1 | Summary and content text on a card |
| `--color-fg-default` | `--color-bg-canvas` | 4.5:1 | Summary and content text on the page |
| `--color-fg-default` | `--color-bg-surface` | 3:1 | Disclosure marker (the state indicator) |
| `--color-focus-ring` | `--color-bg-surface` | 3:1 | Focus indicator on a card |
| `--color-focus-ring` | `--color-bg-canvas` | 3:1 | Focus indicator on the page |

The bottom rule is a decorative separator, not the boundary of a control, so it has no contrast
minimum; the open or closed state is carried by the marker's shape, never by colour.

Forced colours: `--color-border-default` and the text resolve to `CanvasText`, the marker follows
the text, and the focus ring resolves to `Highlight` (tokens.css forced-colours block).

## Responsive behaviour

- The item behaves the same at every breakpoint: full width of its container, one column.
- Below 576 px the summary stays at least `--target-comfortable` (44 px) high and spans the full
  width, so the target is at least 44 × 44 CSS px (L2-049).
- Summary and content text wrap; nothing truncates. A long or translated summary wraps onto more
  lines beside the marker, and the summary grows.
- Wide content inside (a table or a code block) scrolls inside its own component, never the page.
- At 320 px nothing scrolls horizontally or clips; at 200 % zoom the summary, marker and content
  stay visible and operable.

## Accessibility

### Role and pattern

Native `<details>` (role `group`) with a `<summary>`, which browsers expose as a disclosure control
with an expanded state. This follows the
[WAI-ARIA disclosure pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/); a group of
items is the "accordion" composition of that pattern, without the optional arrow-key navigation
(D-13). The component adds no `role`, `aria-expanded`, `aria-controls` or `tabindex` (D-5).

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves to and from each summary in document order; when an item is open, the focusable elements in its content follow its summary; closed content is skipped. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Toggles the focused item. In a single-open group, opening it closes the open sibling. |
| <kbd>Escape</kbd> | No action; the accordion is not an overlay. |

### Focus

- The ring comes from the global `:focus-visible` rule on the summary and is never suppressed.
- Toggling never moves focus: it stays on the summary that was pressed, also when a single-open
  group closes another item.
- When an item that contains focus is closed by a sibling opening (only possible by pointer), the
  browser leaves focus on the pressed summary, which is where it already is.

### Labelling

- The accessible name is the summary text ("Availability details"); an icon is
  `aria-hidden="true"` and adds nothing to the name.
- The summary names what expands, in a noun phrase; it is never "More", "Details" or "Show".
- The expanded state comes from the native element; no visually hidden "expand" text is added.

### Announcements

None. The expanded state is exposed on the summary and announced by the screen reader when it
changes; the accordion uses no live region.

### Motion

Nothing animates, so `prefers-reduced-motion` changes nothing: the item opens and closes
instantly in both settings.

## Content and internationalisation

- Summary: a short noun phrase in sentence case with no trailing punctuation that names what is
  revealed: "Availability details", "Skills". Keep it meaningful while closed.
- Content: whatever the section needs, written to make sense on its own: "Daniel is open to
  co-founding with builders in Toronto."; lists use the product's list formatting ("Laravel,
  Angular, PostgreSQL").
- Translatable: the `summary` input and any copy in the content, from the catalogue through the
  `t` pipe. Data values: builder names, skills, neighbourhoods. The component contains no copy.
- Numbers, dates and distances in the content follow L2-052 ("26.9 km", "1,284").
- French runs about 30 % longer: the summary wraps and the item grows; nothing truncates.

## Performance

- Change detection: `OnPush`; signal inputs and the `open` model; one host listener for the native
  `toggle` event per item; the group reads its items with a `contentChildren` query and sets the
  shared `name` with one `effect`, with no per-item subscriptions.
- Perf-test scenarios in `frontend/projects/perf-test/src/scenarios/`: `Accordion.ts` renders one
  closed `details[bn-accordion]` with the summary "Availability details" and the content "Daniel is
  open to co-founding with builders in Toronto."; `AccordionGroup.ts` (composite) renders a
  single-open `bn-accordion-group` with "Availability details" open and "Skills" ("Laravel,
  Angular, PostgreSQL") closed. Iterations in `e2e/perf-test/config/scenario-iterations.mjs` keep
  each at roughly 100–300 ms. The `DarkTheme` composite includes `Accordion`.
- Regression rule: a change to the template, inputs, styles or change detection runs the perf test
  against the base branch with `--fail-on-regression` before it is pushed.
- Layout stability: the open state is in the server-rendered HTML, so hydration never opens or
  closes an item; content height changes only after the member's own activation.
- Weight: `@angular/core` only. No `@angular/cdk/accordion` (D-3), no animation module, no icon
  library (icons are projected SVG).

## Acceptance criteria

### Rendering

- **AC-1** Given an accordion item with the summary "Availability details" and the content "Daniel is open to co-founding with builders in Toronto.", when it renders closed, then the host is `<details class="accordion">` with no `open` attribute, its first child is a `<summary>` whose text is exactly "Availability details", and the content is not visible. (L2-050)
- **AC-2** Given the same item with `open` set to true, when it renders, then the `<details>` has the `open` attribute and the content is visible directly below the summary, above the item's `--color-border-default` bottom rule. (L2-050)
- **AC-3** Given the icon variant, when "Availability details" renders, then the summary's first child is an `svg.icon.icon--sm` with `aria-hidden="true"`, the text follows it on the same line, and the summary's accessible name is exactly "Availability details". (L2-050)
- **AC-4** Given a multiple-open group with "Availability details" and "Skills", when the member opens both, then both have the `open` attribute at the same time and neither item has a `name` attribute. (L2-050)

### Keyboard and focus

- **AC-5** Given focus on the "Availability details" summary, when the member presses Enter and then Space, then the item opens and closes again, focus stays on the summary throughout, and `openChange` emits `true` then `false`. (L2-050)
- **AC-6** Given a single-open group with "Availability details" open and focus on the "Skills" summary, when the member presses Enter, then "Skills" opens, "Availability details" closes and emits `openChange` `false`, and focus stays on the "Skills" summary. (L2-050)
- **AC-7** Given a closed item whose content holds a link to Psalter, when the member tabs past it, then the link is skipped, and after opening the item the link is the next focus stop after the summary. (L2-050)
- **AC-8** Given any summary reached with Tab, when it is focused, then it shows a `--focus-ring-width` ring in `--color-focus-ring` at `--focus-ring-offset` with at least 3:1 contrast against the surface and the canvas. (L2-050)

### Screen readers

- **AC-9** Given the "Availability details" item, when a screen reader reaches the summary, then it announces "Availability details" with "collapsed", and "expanded" after it opens, from the native element, with no `aria-expanded`, `role` or `tabindex` written on the `<details>` or `<summary>`. (L2-050)
- **AC-10** Given every variant, open and closed, on the rendering page and on each route that uses an accordion, when axe-core runs in both themes, then it reports no WCAG 2.2 A or AA violation caused by the accordion. (L2-050)

### States

- **AC-11** Given the pointer over the "Skills" summary, when it is hovered and pressed, then the cursor is a pointer and the summary text keeps `--color-fg-default` with at least 4.5:1 contrast against the surface. (L2-050)
- **AC-12** Given the closed and open states, when they are compared without colour, then the marker's direction (right when closed, down when open) and the shown content tell them apart. (L2-050)

### Theming

- **AC-13** Given the dark theme, when an item renders on a card, then its text, marker, rule and focus ring resolve through `--color-fg-default`, `--color-border-default` and `--color-focus-ring` (text resolving to `--palette-night-50`), with no component code for the theme. (L2-051)
- **AC-14** Given the dark theme, when the summary and content text are measured against `--color-bg-surface` and `--color-bg-canvas`, then each reaches at least 4.5:1. (L2-050)
- **AC-15** Given forced-colours mode, when an item renders and its summary is focused, then the summary text, the marker and a visible focus ring are shown in system colours. (L2-050)

### Content

- **AC-16** Given the app in en-CA, when an accordion renders, then its summary and any copy in its content come from the translation catalogue, and the component's template contains no user-facing text. (L2-052)

### Responsive

- **AC-17** Given a 360 px viewport, when the "Skills" summary is measured, then it is at least 44 px high and spans the full width of its container, so its target is at least 44 × 44 CSS px. (L2-049)
- **AC-18** Given a 320 px viewport and the summary "Disponibilités et préférences de collaboration pour un cofondateur", when the item renders, then the summary wraps beside the marker, nothing is truncated, and the page has no horizontal scroll. (L2-049)

### Motion

- **AC-19** Given `prefers-reduced-motion` set to either `reduce` or `no-preference`, when an item opens or closes, then the content appears or disappears in the same frame, with no height, opacity or marker animation. (L2-050)

### Performance

- **AC-20** Given a server-rendered page with "Availability details" open, when it hydrates, then the item is open in the first paint and stays open, and nothing below it moves (no layout shift from the accordion). (L2-048)
- **AC-21** Given a change to the accordion, when the perf test runs `Accordion`, `AccordionGroup` and `DarkTheme` against the base branch, then no scenario is flagged as a possible regression. (L2-048)

## Implementation notes

- Library folder `frontend/projects/components/src/lib/accordion/` with `accordion.ts`
  (`Accordion`, selector `details[bn-accordion]`), `accordion-group.ts` (`AccordionGroup`,
  selector `bn-accordion-group`) and `accordion.scss`; export both from `public-api.ts`.
- `Accordion`: host binds `class.accordion`, `[attr.open]` (`''` or `null`) and `[attr.name]`
  (from a signal the group sets, or the consumer's own `name` outside a group); host listener on
  `toggle` reads `event.newState` (or `host.open`) and updates the model only when it differs.
  Template: `<summary><ng-content select="[slot=icon]" />{{ summary() }}</summary><ng-content />`.
- `AccordionGroup`: `contentChildren(Accordion)`; an `effect` writes the shared generated name
  (unless `multiple`); a `toggle` listener in the capture phase closes open siblings when an item
  opens, as the fallback for browsers without exclusive `details` (D-3).
- Component styles: `:host > summary > .icon { display: inline-block; vertical-align: middle;
  margin-inline-end: var(--space-2); }`. Without `display: inline-block` the foundations' `svg {
  display: block }` puts the icon on its own line above the text (seen in the rendering). Keep the `.accordion` rules from `components.css` in the global foundations
  so the e2e class contract stays identical to the design system.
- No CDK primitive: `@angular/cdk/accordion` builds the pattern on non-native elements, which the
  design system rules out ("Do not implement disclosure with an inaccessible clickable div").
- Add `Accordion.ts` and `AccordionGroup.ts` to `frontend/projects/perf-test/src/scenarios/`,
  export them from `index.ts`, tune their iterations, and add the accordion to `DarkTheme`.
- Design-system catch-up (not code): the *Icon* variant renders no icon, the *Disabled* and
  *Expanded* specimens use `data-state="disabled"`, `data-state="open"` and `aria-expanded` on
  `<details>`; see D-4 to D-6.

## Decisions

- **D-1** *Which mocks does the accordion serve?* None yet. The inventory finds no `.accordion` in
  pages, dialogs or notifications; the design-system page is the only source, so the CRD specifies
  every variant and state it shows, and a future screen uses this API unchanged.
- **D-2** *Is the builder profile's "More" `details` an accordion?* No. The design-system overview
  mentions "the profile More section" and lists the profile and report/block dialogs as sources,
  but those use `details.more` with a `role="group"` list of actions, which the [menu](menu.md)
  CRD owns and rebuilds on CDK Menu. The accordion is for revealing information, not actions.
- **D-3** *How does single open work?* With the native shared `name` attribute on `<details>`
  (exclusive accordion), plus a group `toggle` fallback that closes siblings, rather than
  `@angular/cdk/accordion`. Native `details` keeps the browser's semantics, find-in-page and
  keyboard behaviour, and the design system prescribes native `details`. Single open is the
  group's default because the design system lists it first.
- **D-4** *What is the disabled state?* Not supported. The design-system matrix shows a "Disabled"
  column using `data-state="disabled"` on `<details>`, but `components.css` styles nothing for it,
  the specimen renders as the default, and native `<details>` cannot be disabled. A section with
  nothing to reveal is not rendered; there is no `disabled` input.
- **D-5** *How is the expanded state written?* With the native `open` attribute only. The
  design-system "Expanded" specimen writes `aria-expanded="true"` and `data-state="open"` on
  `<details>` without `open`, so it renders closed; `aria-expanded` is not needed on `details`
  (the summary already exposes the state) and duplicating it risks a stale value.
- **D-6** *What is the icon variant?* An optional decorative `svg.icon.icon--sm` before the summary
  text, via `[slot=icon]`. The design-system *Icon* specimen is identical to the default, so the
  slot follows the button's leading-icon convention; the icon never carries meaning.
- **D-7** *What shows open versus closed?* The browser's native disclosure marker, kept by leaving
  the summary as `list-item` (the design system does not hide it, unlike `.more`). It changes
  shape, so the state is not shown by colour alone (L2-050).
- **D-8** *Is the summary a slot or an input?* An input (`summary: string`). Every design-system
  summary is plain text, a string keeps the accessible name predictable, and it prevents
  interactive or heading content inside `<summary>`.
- **D-9** *Is closed content rendered?* Yes, always in the DOM and hidden by the browser, so
  find-in-page can reveal it (Chromium opens the item and fires `toggle`) and server rendering
  needs no deferred block.
- **D-10** *Does an item that starts open shift on hydration?* No: `open` is written in the
  server-rendered HTML, and the model's initial value comes from the input, not from the client.
- **D-11** *What do hover and active look like?* A pointer cursor and no colour change, exactly as
  `components.css` renders; the design-system matrix shows hover and active specimens identical
  to the default, and the focus ring already marks keyboard position.
- **D-12** *Does opening animate?* No. The design system defines no transition for `.accordion`,
  and an instant change needs no reduced-motion variant.
- **D-13** *Arrow-key navigation and heading wrappers from the APG accordion pattern?* Neither. The
  design system links the APG accordion but specifies only Tab, Enter and Space; arrow keys are
  optional in the pattern and native `summary` does not support them, and a heading inside
  `summary` changes how screen readers announce it. The section around the accordion carries the
  heading.
