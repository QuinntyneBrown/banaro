# Popover

| Field | Value |
|---|---|
| Selector | `bn-popover` (panel), `[bnPopoverTrigger]` (directive on the trigger button) |
| Library path | `frontend/projects/components/src/lib/popover/` |
| Status | planned |
| Traces to | L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`popover.html`](../../design-system/components/popover.html), pattern [`dialogs.html`](../../design-system/patterns/dialogs.html) |
| Source mocks | None. No mock uses a popover for floating content; the builder-profile "More" list is a [menu](menu.md) (D-1). |
| Rendering | [`popover.html`](popover.html) |

## Purpose and scope

A popover is a small, non-modal floating panel anchored to a button. It holds a title and a short
piece of explanatory content (a sentence or two, optionally with an inline link) that would crowd
the page if always shown, and that a member opens on purpose by clicking or tapping. The page
behind stays usable; nothing traps focus, and Escape, the trigger or a click outside closes it.

It is built on Angular CDK `Overlay` (connected position strategy), not on the native `popover`
attribute or a `<details>` element.

A popover never holds a list of actions. The builder-profile "More" button ("Report Daniel",
"Block Daniel") is an action list and belongs to [menu](menu.md) (menu D-1, the APG menu-button
pattern with `role="menu"`); see D-1 here. Use [dialog](dialog.md) when the content needs a decision,
a form, or blocks the page; [tooltip](tooltip.md) for a non-interactive hint on hover or focus that
supplements a control's name; and [inline message](inline-message.md) or a field hint
([form field](form-field.md)) for text that must always be visible.

Out of scope:

- Action lists, menu items and `role="menu"` ([menu](menu.md)).
- Forms and editing (a [dialog](dialog.md) or a page; AGENTS.md: no inline forms).
- The trigger's look ([button](button.md), quiet variant).
- The native `[popover]` sheets in the mocks: the top bar's navigation sheet
  ([top bar](top-bar.md)) and the directory's filters sheet
  ([search and filter toolbar](search-filter-toolbar.md)), which are owned by those components.

## Usage

No screen in `docs/mocks/` uses a popover today. The only floating panel anchored to a button on a
product screen is the builder-profile "More" list, which is a [menu](menu.md) (D-1); the account
menu is also a menu. This CRD fixes the component's contract from its design-system page so that a
later screen can adopt it without reshaping its API; no page adopts it until a mock shows it
(AGENTS.md: mock before production behaviour).

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| Design-system specimen "title" | quiet trigger; `heading` set | title line, then a short paragraph | closed, trigger hover / focus / active, disabled trigger, open | panel on `--color-bg-surface-raised` |
| Design-system specimens "actions" and "form" | — | not supported: actions are a [menu](menu.md), forms a [dialog](dialog.md) (D-1, D-4) | — | — |
| Product screens | none yet | — | — | — |

The specimens on the rendering page use the cast's own fact, "Distances are from your
neighbourhood, Leslieville", behind a quiet "About distances" trigger, because the design system's
specimen copy ("Profile actions", "Edit profile", "Report builder") is an action list (D-1).

## Anatomy

1. **Trigger** — a native `button` (usually `button[bn-button][variant=quiet]`) carrying
   `[bnPopoverTrigger]`. It gets `aria-expanded` and `aria-controls`; no `aria-haspopup` (D-2).
2. **Panel** — `div.menu.popover` (the shared floating surface from components.css plus the
   component class), `role="group"`, `tabindex="-1"`, `id` generated, named by the title
   (`aria-labelledby`) or by `label` (`aria-label`). Rendered in the CDK overlay container.
3. **Title (optional)** — `p.popover__title` ("Distances").
4. **Body** — `div.popover__body` holding the projected content: short text, optionally an inline
   link.

Host: `bn-popover` is a structural holder; it renders nothing in place. Its template is attached to
a CDK overlay when the trigger opens it.

## API

### `bn-popover` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `heading` | `string \| null` | `null` | no | Renders `p.popover__title` first; the panel is then `aria-labelledby` the title. Translatable. |
| `label` | `string \| null` | `null` | when `heading` is null | `aria-label` of an untitled panel. Translatable. |
| `placement` | `'bottom-start' \| 'bottom-end'` | `'bottom-start'` | no | Preferred position; flips above the trigger when there is no room below, and shifts to stay inside the viewport. |
| `panelClass` | `string` | `''` | no | Extra classes on the panel. |

### `[bnPopoverTrigger]` directive inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `bnPopoverTrigger` | `Popover` | — | yes | The `bn-popover` it opens. |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| `opened` (on `bn-popover`) | `void` | The panel attaches. |
| `closed` (on `bn-popover`) | `'escape' \| 'outside' \| 'trigger' \| 'tab'` | The panel detaches, with the reason. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| default | phrasing and short flow content: `p`, text, inline `a` | Projected into `div.popover__body` after the title. No buttons, menu items, lists of actions or form controls (D-1, D-4). |

Public methods on `bn-popover`: `open()`, `close()`, `toggle()`. The slot is declared once.

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Titled | `heading` set | The design system's "title" variant: a title line above the explanation. |
| Untitled | `label` set | A single short explanation whose trigger already names the topic. |

The design system also names "actions" and "form" variants; they draw the same action-list
specimen. Actions are a [menu](menu.md) (D-1); forms are a [dialog](dialog.md) (D-4).

| Size | Modifier | Width | Padding | Type |
|---|---|---|---|---|
| One size | — | at least the `.menu` minimum width token, at most the viewport minus `--layout-margin` on each side | `--space-2` panel; `--space-2` `--space-4` title and body | title `--text-label`, body `--text-body` |

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Closed | default | Trigger only | Trigger `aria-expanded="false"` |
| Trigger hover / focus / active | `:hover`, `:focus-visible`, `:active` | Owned by [button](button.md); open adds `--color-border-strong` to the trigger border | — |
| Open | trigger activated (click, tap, Enter, Space) | Panel below the trigger, offset `--space-2`, `--shadow-3`, radius `--radius-lg` | Trigger `aria-expanded="true"`; focus moves to the panel, which reads its title and body (D-3) |
| Flipped | no room below | Panel above the trigger | — |
| Closing | Escape, outside click, trigger pressed, Tab out | Panel removed | Focus returns to the trigger (Escape, trigger); stays on the clicked target (outside click); moves on (Tab) |
| Disabled trigger | `disabled` on the trigger | Button disabled style | Not focusable; never opens |

Hover alone never opens a popover (design system: do not rely on hover).

## Markup

```html
<!-- rendered: closed -->
<button type="button" class="btn btn--quiet" aria-expanded="false" aria-controls="bn-popover-1">About distances</button>
```

```html
<!-- rendered: open (panel in the CDK overlay container) -->
<button type="button" class="btn btn--quiet is-open" aria-expanded="true" aria-controls="bn-popover-1">About distances</button>
…
<div class="cdk-overlay-connected-position-bounding-box">
  <div class="cdk-overlay-pane bn-popover-pane">
    <div class="menu popover" id="bn-popover-1" role="group" tabindex="-1" aria-labelledby="bn-popover-1-title">
      <p class="popover__title" id="bn-popover-1-title">Distances</p>
      <div class="popover__body"><p>Distances are from your neighbourhood, Leslieville.</p></div>
    </div>
  </div>
</div>
```

```html
<!-- consumer -->
<button bn-button variant="quiet" type="button" [bnPopoverTrigger]="about">{{ 'directory.aboutDistances' | t }}</button>
<bn-popover #about [heading]="'directory.distances' | t">
  <p>{{ 'directory.distancesFrom' | t: { neighbourhood } }}</p>
</bn-popover>
```

`is-open` is the trigger's open marker. The panel reuses the `.menu` floating surface only; it never
contains `.menu__item`.

## Design

- Surface `.menu` (shared with [menu](menu.md)): `--color-bg-surface-raised`, rule
  `--border-width-hairline` `--color-border-default`, radius `--radius-lg`, elevation `--shadow-3`,
  padding `--space-2`, minimum width `--size-enu-and-tabs----------------------------------min-width-30`.
- Offset from the trigger `--space-2`; layer `--z-popover`.
- Title `p.popover__title`: `--text-label`, `--color-fg-muted`, padding `--space-2` `--space-4`.
- Body `div.popover__body`: `--text-body`, `--color-fg-default`, padding `--space-2` `--space-4`;
  inline links use the [link](link.md) styles.
- Trigger open state: border `--color-border-strong`.
- Motion: none; the panel appears in place (the design system gives the popover no entrance).

Component tokens: none.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Panel | `--color-bg-surface-raised` | resolved live | resolved live |
| Panel rule | `--color-border-default` | resolved live | resolved live |
| Title | `--color-fg-muted` | resolved live | resolved live |
| Body text | `--color-fg-default` | resolved live | resolved live |
| Open trigger border | `--color-border-strong` | resolved live | resolved live |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-surface-raised` | 4.5:1 | Body text |
| `--color-fg-muted` | `--color-bg-surface-raised` | 4.5:1 | Title |
| `--color-focus-ring` | `--color-bg-surface` | 3:1 | Focus ring on the trigger and inline links |

## Responsive behaviour

- The layout does not change across breakpoints; position does. The panel stays inside the viewport
  with `--layout-margin` on each side: at 320 px it shifts left or flips above rather than overflow.
- Text wraps; the panel never exceeds the viewport width.
- The trigger is at least 44 × 44 CSS px below 576 px, and opens on tap; nothing depends on hover.
- At 200 % zoom the panel scrolls within the viewport if taller than it.

## Accessibility

### Role and pattern

WAI-ARIA [Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/): the trigger is a
button with `aria-expanded` and `aria-controls`; the panel is a labelled `role="group"`. It is not
a `role="menu"` (that is [menu](menu.md)), not a `role="dialog"`, and not modal.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Enter</kbd> / <kbd>Space</kbd> on the trigger | Toggles the panel; opening moves focus to the panel. |
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Move through any inline links; Tab past the last one closes the panel and moves to the element after the trigger; Shift+Tab from the panel closes it and focuses the trigger. |
| <kbd>Escape</kbd> | Closes the panel and returns focus to the trigger. |

### Focus

Opening moves focus to the panel (`tabindex="-1"`) because the overlay sits at the end of the
document (D-3); closing by Escape or the trigger returns focus to the trigger. The ring is
`--focus-ring-width` `--color-focus-ring` at `--focus-ring-offset`. No focus trap.

### Labelling

The panel is named by its title, or by `label` when untitled. The trigger's visible text names the
topic ("About distances"). Icons, if any, are `aria-hidden`.

### Announcements

None beyond the panel's name and content, read when focus moves to it; `aria-expanded` changes are
read on the trigger.

### Motion

None.

## Content and internationalisation

- Title: a noun phrase in sentence case, no full stop ("Distances"). Body: one or two short
  sentences; a long explanation belongs on a page, an edit in a dialog (design system content rule).
- Translatable inputs: `heading`, `label`; the trigger's text; the projected body. Data values: the
  member's neighbourhood.
- French grows about 30 %, so the panel has a minimum, not a fixed, width, and text wraps.

## Performance

- Change detection: `OnPush`, signal inputs; the panel's view is created only on first open and
  detached on close.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Popover.ts` renders the quiet
  "About distances" trigger with its `bn-popover` opened, titled "Distances", reading "Distances are
  from your neighbourhood, Leslieville."; iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly 100–300 ms.
- Composite scenarios: none.
- Layout stability: the panel floats in the overlay, so opening it never moves the page.
- Weight: `@angular/cdk/overlay` and `@angular/cdk/a11y` only.

## Acceptance criteria

### Rendering

- **AC-1** Given an "About distances" trigger with a popover, when the page renders, then the button has `aria-expanded="false"`, `aria-controls` naming the panel's id, no `aria-haspopup`, and no panel is shown. (L2-050)
- **AC-2** Given the trigger, when Amara clicks it, then a `div.menu.popover` panel with `role="group"`, named "Distances" by its `p.popover__title`, appears below the button offset by `--space-2`, reading "Distances are from your neighbourhood, Leslieville.", and contains no `.menu__item` or `role="menu"`. (L2-050)

### States

- **AC-3** Given the open panel, when Amara clicks elsewhere on the page, then the panel closes, `closed` emits `'outside'`, and the control she clicked receives the click (the page behind stayed usable). (L2-050)
- **AC-4** Given the open panel, when Amara clicks the trigger again, then the panel closes, `aria-expanded` is "false", and `closed` emits `'trigger'`. (L2-050)

### Keyboard and focus

- **AC-5** Given the trigger focused, when Amara presses Enter, then the panel opens, `aria-expanded` is "true", and focus is on the panel, whose accessible name is "Distances". (L2-050)
- **AC-6** Given the open panel, when Amara presses Escape, then it closes and focus returns to "About distances". (L2-050)
- **AC-7** Given focus in the open panel, when Amara presses Tab past its last focusable element, then the panel closes and focus moves to the next control after the trigger; focus is never trapped. (L2-050)
- **AC-8** Given the trigger focused by keyboard, when it renders, then it shows a 2 px `--color-focus-ring` outline with at least 3:1 contrast. (L2-050)

### Screen readers

- **AC-9** Given the open panel, when axe-core runs in both themes, then it reports no WCAG 2.2 A or AA violations. (L2-050)

### Theming

- **AC-10** Given the dark theme, when the panel is open, then it uses `--color-bg-surface-raised`, and the body text and the `--color-fg-muted` title each measure at least 4.5:1 against it. (L2-050)
- **AC-11** Given the popover's styles, when inspected, then every colour comes from a design-system token. (L2-051)

### Responsive

- **AC-12** Given a 320 px viewport, when the panel opens from a trigger near the right edge, then it stays fully inside the viewport and nothing scrolls horizontally. (L2-049)
- **AC-13** Given a 360 px touch viewport, when Amara taps the trigger, then the panel opens without any hover, and the trigger's target is at least 44 × 44 CSS px. (L2-049)

### Content

- **AC-14** Given the en-CA catalogue, when the panel renders, then "About distances", "Distances" and the body sentence come from the catalogue, with the neighbourhood "Leslieville" as a parameter. (L2-052)

### Performance

- **AC-15** Given a change to the popover, when the perf test runs the `Popover` scenario against the base branch, then it is not flagged as a possible regression. (L2-048)

## Implementation notes

- Folder `frontend/projects/components/src/lib/popover/`: `popover.ts` (`Popover`, selector
  `bn-popover`, holds an `<ng-template>` with the panel, title and the default slot),
  `popover-trigger.ts` (`PopoverTrigger`, selector `[bnPopoverTrigger]`), `popover.css` (title,
  body, open trigger marker). Export both from `public-api.ts`.
- Overlay: `Overlay.position().flexibleConnectedTo(trigger)` with positions bottom-start, then
  top-start (and the `-end` pair for `bottom-end`), `withViewportMargin` of the layout margin,
  `scrollStrategies.reposition()`, no backdrop; close on `outsidePointerEvents` and `keydownEvents`.
  Focus the panel with `FocusMonitor`/`focusVia` on open; restore to the trigger on Escape.
- The `.menu` surface classes come from components.css (shared with [menu](menu.md)); the panel does
  not redeclare them and never uses the menu item classes.
- Add `Popover.ts` to the perf-test scenarios and `index.ts`.
- `@angular/cdk` is not yet in `frontend/package.json`; add it (matching the Angular major) in the first slice that builds this component.

## Decisions

- **D-1** *Is the builder-profile "More" a popover or a menu?* A menu — see [menu.md](menu.md) D-1.
  It is a list of actions ("Report Daniel", "Block Daniel") opened from a button, which is the APG
  menu-button pattern (`role="menu"`, arrow-key navigation) that [menu](menu.md) implements, and the
  design system says action menus use menu roles. Two components owning one control would give it two
  APIs and two keyboard models, so the popover drops it and covers only non-menu floating content.
  For the same reason the design system's "actions" variant and its "Profile actions" specimen copy
  are not used here.
- **D-2** *`aria-haspopup="dialog"` on the trigger, as in the design-system code sample?* No. The
  panel is neither a dialog nor a menu; a disclosure uses `aria-expanded` and `aria-controls` only.
- **D-3** *Where does focus go on open?* To the panel. The design-system text says opening a
  non-interactive hint does not move focus, but that hint is the [tooltip](tooltip.md); a popover is
  opened on purpose and its panel sits at the end of the document in the CDK overlay, so without the
  move its content would be unreachable in reading order (WCAG 1.3.2, 2.4.3).
- **D-4** *The design system's "form" variant?* Not supported: its specimen is identical to the
  others, the design system's own content rule says "a long edit belongs on a page or in a dialog",
  and AGENTS.md forbids inline forms opened by a button.
- **D-5** *Write a CRD for a component no mock uses?* Yes, because the design system defines it; but
  no page adopts it until a mock shows it (AGENTS.md: mock before production behaviour). Status stays
  `planned`.
- **D-6** *Native `popover`, `<details>` or CDK Overlay?* CDK Overlay. AGENTS.md and the brief build
  every overlay on CDK; it also gives flip and viewport containment at 320 px.
- **D-7** *Entrance motion?* None; the design system defines none for the popover, and a small
  panel that appears in place reads as instant feedback.
