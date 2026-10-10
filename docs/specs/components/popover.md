# Popover

| Field | Value |
|---|---|
| Selector | `bn-popover` (panel), `[bnPopoverTrigger]` (directive on the trigger button) |
| Library path | `frontend/projects/components/src/lib/popover/` |
| Status | planned |
| Traces to | L2-011, L2-031, L2-032, L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`popover.html`](../../design-system/components/popover.html), pattern [`dialogs.html`](../../design-system/patterns/dialogs.html) |
| Source mocks | [`pages/builder-profile/default`](../../mocks/pages/builder-profile/default.html), [`pages/builder-profile/sparse`](../../mocks/pages/builder-profile/sparse.html); behind [`dialogs/report`](../../mocks/dialogs/report/default.html) and [`dialogs/block-builder`](../../mocks/dialogs/block-builder/default.html) (all states) |
| Rendering | [`popover.html`](popover.html) |

## Purpose and scope

A popover is a small, non-modal floating panel anchored to a button. It holds a short group of
actions that would crowd the page if always shown. In Banaro it is the "More" button on a builder
profile: it reveals "Report Daniel" and "Block Daniel", each of which opens its dialog. The page
behind stays usable; nothing traps focus, and Escape or a click outside closes it.

It is built on Angular CDK `Overlay` (connected position strategy), not on the native `popover`
attribute or a `<details>` element. Use [dialog](dialog.md) when the content needs a decision or
blocks the page, [menu](menu.md) for an application menu with arrow-key navigation and
`role="menu"` (the account menu), and [tooltip](tooltip.md) for a non-interactive hint.

Out of scope:

- The item styles `.menu__item`, `.menu__item--danger` and `.menu__divider` ([menu](menu.md)); the
  popover reuses the `.menu` surface and hosts the items as projected links or buttons.
- What each item does (opening the report or block dialog is the page's).
- The trigger's look ([button](button.md), quiet variant).

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/builder-profile/default` and `sparse`, profile header actions | trigger quiet button "More" with chevron, `aria-label` "More actions for Daniel Reyes"; panel `aria-label` "More actions", placement bottom-start | item link "Report Daniel" (flag icon), divider, danger item "Block Daniel" (block icon) | closed, open | page canvas; panel on `--color-bg-surface-raised` |
| `dialogs/report/*`, `dialogs/block-builder/*` | the same profile header behind the dialog, closed | — | closed (the item opened the dialog) | inert page behind a dialog |
| Design-system specimens (title, actions, form) | quiet trigger "More actions"; panel with a title line "Profile actions" | links "Edit profile", "Report builder" | open | surface |

Every row is built with the API below: a trigger directive, a labelled panel, an optional title,
and projected items.

## Anatomy

1. **Trigger** — a native `button` (usually `button[bn-button][variant=quiet]`) carrying
   `[bnPopoverTrigger]`. It gets `aria-expanded` and `aria-controls`. Its visible label and its
   `aria-label` must share the visible words ("More").
2. **Panel** — `div.menu` with the consumer's extra class (`.more__menu`), `role="group"`,
   `aria-label` from `label`, `id` generated. Rendered in the CDK overlay container.
3. **Title (optional)** — `p.popover__title` above the items ("Profile actions").
4. **Items** — projected `a.menu__item` / `button.menu__item`, dividers `<hr bn-divider variant="menu">`
   (rendered `hr.menu__divider`, [divider](divider.md)).

Host: `bn-popover` is a structural holder; it renders nothing in place. Its template is attached to
a CDK overlay when the trigger opens it.

## API

### `bn-popover` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `label` | `string` | — | yes | `aria-label` of the panel ("More actions"). Translatable. |
| `heading` | `string \| null` | `null` | no | Renders `p.popover__title` first; when set the panel is `aria-labelledby` the title instead of `aria-label`. |
| `placement` | `'bottom-start' \| 'bottom-end'` | `'bottom-start'` | no | Preferred position; flips above the trigger when there is no room below, and shifts to stay inside the viewport. |
| `panelClass` | `string` | `''` | no | Extra classes on the panel (`'more__menu'`). |

### `[bnPopoverTrigger]` directive inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `bnPopoverTrigger` | `Popover` | — | yes | The `bn-popover` it opens. |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| `opened` (on `bn-popover`) | `void` | The panel attaches. |
| `closed` (on `bn-popover`) | `'escape' \| 'outside' \| 'item' \| 'trigger' \| 'tab'` | The panel detaches, with the reason. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| default | `a.menu__item`, `button.menu__item`, `hr[bn-divider][variant=menu]` (rendered `hr.menu__divider`, see [divider](divider.md)) | Projected into the panel after the title. Activating any item closes the panel. |

Public methods on `bn-popover`: `open()`, `close()`, `toggle()`. Each slot is declared once.

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Actions | — | A list of item links or buttons (builder profile "More"). |
| Titled | `heading` set | A titled group ("Profile actions"), the design system's title variant. |

The design system also names a "form" variant; it draws the same specimen. Forms do not go in a
popover (D-4).

| Size | Modifier | Width | Padding | Type |
|---|---|---|---|---|
| One size | — | at least the `.menu` minimum width token, at most the viewport minus `--layout-margin` on each side | `--space-2` | items `--text-body` |

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Closed | default | Trigger only | Trigger `aria-expanded="false"` |
| Trigger hover / focus / active | `:hover`, `:focus-visible`, `:active` | Owned by [button](button.md); open adds `--color-border-strong` to the trigger border | — |
| Open | trigger activated | Panel below the trigger, offset `--space-2`, `--shadow-3`, radius `--radius-lg` | Trigger `aria-expanded="true"`; focus moves to the first item |
| Item hover / focus | on an item | `--color-bg-subtle` fill | Item name read |
| Flipped | no room below | Panel above the trigger | — |
| Closing | Escape, outside click, item chosen, trigger pressed, Tab out | Panel removed | Focus returns to the trigger (Escape, trigger); stays on the clicked target (outside click); moves on (Tab) |
| Disabled trigger | `disabled` on the trigger | Button disabled style | Not focusable; never opens |

## Markup

```html
<!-- rendered: closed -->
<button type="button" class="btn btn--quiet" aria-label="More actions for Daniel Reyes"
        aria-expanded="false" aria-controls="bn-popover-1">More <svg class="icon icon--sm" aria-hidden="true">…</svg></button>
```

```html
<!-- rendered: open (panel in the CDK overlay container) -->
<button type="button" class="btn btn--quiet is-open" aria-label="More actions for Daniel Reyes"
        aria-expanded="true" aria-controls="bn-popover-1">More …</button>
…
<div class="cdk-overlay-connected-position-bounding-box">
  <div class="cdk-overlay-pane bn-popover-pane">
    <div class="menu more__menu" id="bn-popover-1" role="group" aria-label="More actions">
      <a class="menu__item" href="/builders/daniel-reyes/report"><svg class="icon" aria-hidden="true">…</svg>Report Daniel</a>
      <hr class="menu__divider">
      <a class="menu__item menu__item--danger" href="/builders/daniel-reyes/block"><svg class="icon" aria-hidden="true">…</svg>Block Daniel</a>
    </div>
  </div>
</div>
```

```html
<!-- rendered: titled -->
<div class="menu" id="bn-popover-2" role="group" aria-labelledby="bn-popover-2-title">
  <p class="popover__title" id="bn-popover-2-title">Profile actions</p>
  <a class="menu__item" href="/profile/edit">Edit profile</a>
  <a class="menu__item" href="#">Report builder</a>
</div>
```

```html
<!-- consumer: builder profile -->
<button bn-button variant="quiet" type="button" [bnPopoverTrigger]="more"
        [attr.aria-label]="'profile.moreFor' | t: { name: builder.name }">{{ 'profile.more' | t }} <svg …></svg></button>
<bn-popover #more [label]="'profile.moreActions' | t" panelClass="more__menu">
  <button class="menu__item" type="button" (click)="openReport()"><svg …></svg>{{ 'profile.report' | t: { first } }}</button>
  <hr bn-divider variant="menu">
  <button class="menu__item menu__item--danger" type="button" (click)="openBlock()"><svg …></svg>{{ 'profile.block' | t: { first } }}</button>
</bn-popover>
```

`is-open` is the trigger's open marker that replaces the mock's `.more[open] > summary` rule. Items
that open dialogs are buttons in the product (the mocks use links only because mocks navigate
between files).

## Design

- Surface `.menu`: `--color-bg-surface-raised`, rule `--border-width-hairline`
  `--color-border-default`, radius `--radius-lg`, elevation `--shadow-3`, padding `--space-2`,
  minimum width `--size-enu-and-tabs----------------------------------min-width-30`.
- Offset from the trigger `--space-2`; layer `--z-popover`.
- Title `p.popover__title`: `--text-label`, `--color-fg-muted`, padding `--space-2` `--space-4`.
- Items (from [menu](menu.md)): min height `--target-comfortable`, padding `0 var(--space-4)`,
  radius `--radius-md`, gap `--space-3`; danger item `--color-danger-fg`.
- Trigger open state: border `--color-border-strong`.
- Motion: none; the panel appears in place (the design system gives the popover no entrance).

Component tokens: none.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Panel | `--color-bg-surface-raised` | `--palette-white` | `--palette-night-850` |
| Panel rule | `--color-border-default` | `--palette-oat-300` | `--palette-night-700` |
| Item text | `--color-fg-default` | resolved live | resolved live |
| Danger item | `--color-danger-fg` | resolved live | resolved live |
| Item hover | `--color-bg-subtle` | resolved live | resolved live |
| Title | `--color-fg-muted` | resolved live | resolved live |
| Open trigger border | `--color-border-strong` | resolved live | resolved live |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-surface-raised` | 4.5:1 | Item text |
| `--color-fg-default` | `--color-bg-subtle` | 4.5:1 | Hovered item |
| `--color-danger-fg` | `--color-bg-surface` | 4.5:1 | "Block Daniel" |
| `--color-fg-muted` | `--color-bg-surface-raised` | 4.5:1 | Title |
| `--color-focus-ring` | `--color-bg-surface` | 3:1 | Focus ring on items |

## Responsive behaviour

- The layout does not change across breakpoints; position does. The panel stays inside the viewport
  with `--layout-margin` on each side: at 320 px it shifts left or flips above rather than overflow.
- Items wrap ("Report Daniel Reyes's project") instead of truncating; the panel never exceeds the
  viewport width.
- Every item and the trigger are at least 44 × 44 CSS px below 576 px (items use
  `--target-comfortable`).
- At 200 % zoom the panel scrolls within the viewport if taller than it.

## Accessibility

### Role and pattern

WAI-ARIA [Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/): the trigger is a
button with `aria-expanded` and `aria-controls`; the panel is a labelled `role="group"` of links
or buttons. It is not a `role="menu"` (that is [menu](menu.md)) and not modal.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Enter</kbd> / <kbd>Space</kbd> on the trigger | Toggles the panel; opening moves focus to the first item. |
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Move between items; Tab past the last item closes the panel and moves to the element after the trigger; Shift+Tab before the first item closes it and focuses the trigger. |
| <kbd>Escape</kbd> | Closes the panel and returns focus to the trigger. |
| <kbd>Enter</kbd> on an item | Activates it and closes the panel. |

### Focus

Opening moves focus to the first item because the overlay sits at the end of the document; closing
by Escape or the trigger returns focus to the trigger. The ring is `--focus-ring-width`
`--color-focus-ring` at `--focus-ring-offset`. No focus trap.

### Labelling

Trigger name "More actions for Daniel Reyes" contains the visible "More" (WCAG 2.5.3). Panel named
"More actions" (or by its title). Icons are `aria-hidden`; the danger item's meaning is in its text
("Block Daniel"), not only its colour.

### Announcements

None; `aria-expanded` changes are read on the trigger.

### Motion

None.

## Content and internationalisation

- Item labels are verbs with the person's first name: "Report Daniel", "Block Daniel"; a danger
  action comes last, after a divider.
- Translatable inputs: `label`, `heading`; the trigger's text and `aria-label`; item text. Data
  values: the builder's name.
- Labels wrap; French grows about 30 %, so the panel has a minimum, not a fixed, width.

## Performance

- Change detection: `OnPush`, signal inputs; the panel's view is created only on first open and
  detached on close.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Popover.ts` renders the "More"
  trigger with its `bn-popover` for Daniel Reyes, opened, with "Report Daniel" and "Block Daniel";
  iterations in `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly 100–300 ms.
- Composite scenarios: none.
- Layout stability: the panel floats in the overlay, so opening it never moves the page.
- Weight: `@angular/cdk/overlay` and `@angular/cdk/a11y` only.

## Acceptance criteria

### Rendering

- **AC-1** Given Daniel Reyes's profile, when it renders, then the "More" button has the accessible name "More actions for Daniel Reyes", `aria-expanded="false"` and no panel is shown. (L2-011)
- **AC-2** Given the "More" button, when Amara activates it, then a panel with `role="group"`, the name "More actions" and the classes `.menu.more__menu` appears below the button, offset by `--space-2`, listing "Report Daniel" then "Block Daniel" after a divider. (L2-011)

### States

- **AC-3** Given the open panel, when Amara chooses "Report Daniel", then the panel closes and the report dialog opens. (L2-031)
- **AC-4** Given the open panel, when Amara chooses "Block Daniel", then the panel closes and the block dialog opens. (L2-032)
- **AC-5** Given the open panel, when Amara clicks elsewhere on the profile, then the panel closes, `closed` emits `'outside'`, and the page behind stayed usable while it was open. (L2-050)
- **AC-6** Given a 320 px viewport, when the panel opens near the right edge, then it stays fully inside the viewport and nothing scrolls horizontally. (L2-049)

### Keyboard and focus

- **AC-7** Given the "More" button focused, when Amara presses Enter, then the panel opens, `aria-expanded` is "true", and focus is on "Report Daniel". (L2-050)
- **AC-8** Given the open panel, when Amara presses Escape, then it closes and focus returns to "More". (L2-050)
- **AC-9** Given focus on "Block Daniel", when Amara presses Tab, then the panel closes and focus moves to the next control after "More"; focus is never trapped. (L2-050)
- **AC-10** Given an item focused by keyboard, when it renders, then it shows a 2 px `--color-focus-ring` outline with at least 3:1 contrast. (L2-050)

### Screen readers

- **AC-11** Given the open panel on Daniel Reyes's profile, when axe-core runs in both themes, then it reports no WCAG 2.2 A or AA violations, and "Block Daniel" is conveyed by its text, not only by `--color-danger-fg`. (L2-050)

### Theming

- **AC-12** Given the dark theme, when the panel is open, then it uses `--color-bg-surface-raised` and item text measures at least 4.5:1 against it. (L2-050)
- **AC-13** Given the popover's styles, when inspected, then every colour comes from a design-system token. (L2-051)

### Responsive

- **AC-14** Given a 360 px viewport, when the panel is open, then each item is at least 44 px tall. (L2-049)

### Content

- **AC-15** Given the en-CA catalogue, when the panel renders, then "More", "More actions", "Report Daniel" and "Block Daniel" come from the catalogue with the builder's first name as a parameter. (L2-052)

### Performance

- **AC-16** Given a change to the popover, when the perf test runs the `Popover` scenario against the base branch, then it is not flagged as a possible regression. (L2-048)

## Implementation notes

- Folder `frontend/projects/components/src/lib/popover/`: `popover.ts` (`Popover`, selector
  `bn-popover`, holds an `<ng-template>` with the panel and the default slot), `popover-trigger.ts`
  (`PopoverTrigger`, selector `[bnPopoverTrigger]`), `popover.css` (title, open trigger marker).
  Export both from `public-api.ts`.
- Overlay: `Overlay.position().flexibleConnectedTo(trigger)` with positions bottom-start, then
  top-start (and the `-end` pair for `bottom-end`), `withViewportMargin` of the layout margin,
  `scrollStrategies.reposition()`, no backdrop; close on `outsidePointerEvents` and `keydownEvents`.
- The `.menu` surface classes come from components.css (shared with [menu](menu.md)); the panel does
  not redeclare them.
- Replace the mock's `<details class="more">` and `<summary>` with the trigger button; drop the
  `.more`/`.more__menu` absolute positioning, which the overlay replaces.
- Add `Popover.ts` to the perf-test scenarios and `index.ts`.
- `@angular/cdk` is not yet in `frontend/package.json`; add it (matching the Angular major) in the first slice that builds this component.

## Decisions

- **D-1** *Native `popover`, `<details>` or CDK Overlay?* CDK Overlay. AGENTS.md and the brief build
  every overlay on CDK; it also gives flip and viewport containment that `.more__menu`'s absolute
  position lacks at 320 px.
- **D-2** *`aria-haspopup="dialog"` on the trigger, as in the design-system code sample?* No. The
  panel is neither a dialog nor a menu; a disclosure uses `aria-expanded` and `aria-controls` only.
- **D-3** *Where does focus go on open?* To the first item. The design-system text says opening a
  non-interactive hint does not move focus, but this panel is interactive and sits at the end of the
  document, so without the move Tab would never reach it. The account-menu mock uses the same rule.
- **D-4** *The design system's "form" variant?* Not supported: its specimen is identical to the
  others, and the design system's own content rule says "a long edit belongs on a page or in a
  dialog"; AGENTS.md also forbids inline forms opened by a button.
- **D-5** *Entrance motion?* None; the design system defines none for the popover, and a small
  panel that appears in place reads as instant feedback.
- **D-6** *Links or buttons for "Report Daniel" and "Block Daniel"?* Buttons that open dialogs
  through `DialogService`; the mocks link to dialog files only because mocks are static pages.
