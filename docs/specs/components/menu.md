# Menu

| Field | Value |
|---|---|
| Selector | `bn-menu`, `a[bn-menu-item]`, `button[bn-menu-item]`, `bn-menu-header`, `bn-menu-divider` |
| Library path | `frontend/projects/components/src/lib/menu/` |
| Status | planned |
| Traces to | L2-003, L2-011, L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`menu.html`](../../design-system/components/menu.html) |
| Source mocks | [`dialogs/account-menu/default`](../../mocks/dialogs/account-menu/default.html), [`pages/builder-profile/default`](../../mocks/pages/builder-profile/default.html), [`pages/builder-profile/sparse`](../../mocks/pages/builder-profile/sparse.html), [`dialogs/report/default`](../../mocks/dialogs/report/default.html), [`dialogs/block-builder/default`](../../mocks/dialogs/block-builder/default.html) |
| Rendering | [`menu.html`](menu.html) |

## Purpose and scope

A menu holds a short list of secondary actions behind one trigger: the account menu under
Amara's avatar ("View profile", "Edit profile", "Settings", "Your projects", "Sign out") and the
"More" menu on another builder's profile ("Report Daniel", "Block Daniel"). It is a non-modal
overlay built on Angular CDK Menu (`@angular/cdk/menu`) and the CDK Overlay: it opens from its
trigger, takes focus to its first item, moves with the arrow keys, and closes on Escape, Tab,
selection or a click outside, returning focus to the trigger.

Use the top bar's navigation (a popover list of links, not a menu) for primary navigation, a
[button group](button-group.md) for visible related actions, and a dialog for anything that needs
a decision or input.

Out of scope:

- The trigger's own look: the account trigger is the top bar's `.avatar-btn`; the "More" trigger
  is a quiet [button](button.md) with a trailing chevron. Both apply the CDK trigger directive.
- What items do (navigation by `routerLink`; "Sign out", "Report", "Block" open flows owned by
  their pages and dialogs).
- The primary navigation sheet (`nav[popover]`, `.nav__link`), which the design system says is a
  navigation list and must not use menu roles.

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `dialogs/account-menu/default`; trigger `.avatar-btn` "Your account, Amara Osei" on every signed-in screen (162 states) | `label="Your account"`, `align="end"`, header, icons, divider | Header "Amara Osei" / "Founder · Leslieville"; links "View profile", "Edit profile", "Settings", "Your projects"; divider; link "Sign out" | open, item hover and focus; closed | raised surface over the page, under the top bar, right-aligned to the layout margin |
| `pages/builder-profile/default`, `dialogs/report/*`, `dialogs/block-builder/*` (page behind); trigger quiet "More" button, name "More actions for Daniel Reyes" | `label="More actions"`, `align="start"`, icons, divider, danger item | "Report Daniel" (flag icon); divider; "Block Daniel" (cross icon, danger) | closed (mock), open | raised surface under the trigger, start-aligned |
| `pages/builder-profile/sparse` | same, for Esther | "Report Esther", "Block Esther" | closed, open | same |
| Design-system specimens | plain, icons, sections, shortcuts, danger, checkable | header "Amara Osei"; "Edit profile", "Sign out", "Sign out · Shift S", checkbox "Pause matching" | default, hover, focus, active, disabled, open, checked | raised surface |

## Anatomy

1. **Panel** — `div.menu` with `role="menu"` and `aria-label`, rendered by CDK Menu in an overlay
   pane. Padding `--space-2`, `--radius-lg`, hairline `--color-border-default` border,
   `--color-bg-surface-raised`, `--shadow-3`.
2. **Header (optional)** — `bn-menu-header` rendering `div.menu__header` with
   `role="presentation"`: a title (`p.rows__title`) and meta line (`p.rows__meta`). Not focusable.
3. **Item** — `a[bn-menu-item]` or `button[bn-menu-item]` with `.menu__item` and
   `role="menuitem"` (CDK `cdkMenuItem`). Leading `[slot=icon]` SVG, then the label.
4. **Danger item** — `.menu__item--danger`: `--color-danger-fg` label and icon.
5. **Checkable item** — `button[bn-menu-item]` with `checkable`: `role="menuitemcheckbox"`,
   `aria-checked`, and a leading `.check__box`-styled indicator (D-6).
6. **Divider** — `bn-menu-divider` rendering `hr.menu__divider` with `role="separator"`.

Host: `bn-menu` wraps an `ng-template` with `cdkMenu`; nothing renders until the trigger opens it.
The trigger is outside, carrying `[cdkMenuTriggerFor]="menu.template"`. Items are the consumer's
own `<a>`/`<button>` elements.

## API

### Inputs

`bn-menu`:

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `label` | `string` | — | yes | `aria-label` of the panel: "Your account", "More actions". |
| `align` | `'start' \| 'end'` | `'start'` | no | Horizontal alignment of the panel to the trigger: `end` aligns the right edges (account menu), `start` the left edges ("More"). |

`a[bn-menu-item]`, `button[bn-menu-item]`:

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `danger` | `boolean` | `false` | no | Adds `.menu__item--danger`. Only for "Block", "Delete"-type items, after a divider. |
| `disabled` | `boolean` | `false` | no | `cdkMenuItemDisabled`: `aria-disabled="true"`, skipped by arrows and type-ahead, does nothing when activated. |
| `checkable` | `boolean` | `false` | no | `<button>` only: becomes `cdkMenuItemCheckbox`. |
| `checked` | `boolean` (model) | `false` | with `checkable` | `aria-checked`; toggles on activation; `[(checked)]`. |

`bn-menu-header`: `title` (`string`, required) and `meta` (`string`, optional).

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| `bn-menu` `opened` | `void` | The panel has opened and focus is inside it. |
| `bn-menu` `closed` | `'select' \| 'escape' \| 'outside' \| 'tab'` | The panel closed; the reason lets "Sign out" run after the menu is closed (L2-003 AC11). |
| item `triggered` | `void` | An enabled item is activated (click, Enter, Space). Emitted after the menu closes. |
| item `checkedChange` | `boolean` | A checkable item toggles. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `bn-menu` default | `bn-menu-header` (first, at most one), items, `bn-menu-divider` | 2–8 items. Danger items last, after a divider. |
| item default | Text | The action ("Edit profile", "Report Daniel"). |
| item `[slot=icon]` | One `svg.icon.icon--sm`, `aria-hidden="true"` | Before the label. Either every item has an icon or none does. |

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Plain | — | A few text actions. |
| Icons | `[slot=icon]` on every item | The account menu and the "More" menu. |
| Sections | `bn-menu-divider` | Separate profile actions from "Sign out", and safe from danger items. |
| Danger | `.menu__item--danger` | "Block Daniel". |
| Checkable | `role="menuitemcheckbox"` | An on/off setting inside a menu (design-system specimen "Pause matching"); no screen uses it yet. |
| Shortcuts | text + `aria-keyshortcuts` on the item | Design-system specimen "Sign out · Shift S"; Banaro defines no menu shortcuts, so the variant is the consumer's text plus the native attribute (D-7). |

One size. Panel minimum width from the menu min-width geometry token (15 rem), maximum width
`100%` of the viewport minus the layout margins; item height `--target-comfortable`.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Closed | default | Panel not rendered; trigger `aria-expanded="false"` | Trigger "menu button, collapsed" |
| Open | trigger activated | Panel shown under the trigger, `--z-popover` | Trigger `aria-expanded="true"`; focus on the first item; "Your account, menu" |
| Item hover | `:hover` (`data-state="hover"`) | `--color-bg-subtle` fill | — |
| Item focus | keyboard focus (`data-state="focus"`) | Global focus ring inside the panel, plus the hover fill | "View profile, menu item, 1 of 5" |
| Item active | `:active` (`data-state="active"`) | `--color-accent-subtle-hover` fill | — |
| Item disabled | `disabled` | `--color-fg-disabled` on `--color-bg-subtle`, `cursor: not-allowed` | "dimmed"; skipped by arrow keys |
| Danger | `.menu__item--danger` | `--color-danger-fg` label and icon | Same role; the words carry the meaning |
| Checked | `aria-checked="true"` | Filled check indicator | "checked" |
| Closing on selection | item activated | Panel removed, focus back on the trigger (or moved by the action) | — |

## Markup

```html
<!-- rendered: account menu, open (inside a CDK overlay pane) -->
<div class="menu" role="menu" aria-label="Your account" aria-orientation="vertical">
  <div class="menu__header" role="presentation"><p class="rows__title">Amara Osei</p><p class="rows__meta">Founder · Leslieville</p></div>
  <a class="menu__item" role="menuitem" tabindex="-1" href="/builders/amara-osei"><svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true">…</svg>View profile</a>
  <a class="menu__item" role="menuitem" tabindex="-1" href="/profile/edit"><svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true">…</svg>Edit profile</a>
  <a class="menu__item" role="menuitem" tabindex="-1" href="/settings"><svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true">…</svg>Settings</a>
  <a class="menu__item" role="menuitem" tabindex="-1" href="/projects?owner=me"><svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true">…</svg>Your projects</a>
  <hr class="menu__divider" role="separator">
  <button type="button" class="menu__item" role="menuitem" tabindex="-1"><svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true">…</svg>Sign out</button>
</div>
```

```html
<!-- rendered: "More" menu with a danger item; checkable item -->
<div class="menu" role="menu" aria-label="More actions">
  <button type="button" class="menu__item" role="menuitem" tabindex="-1"><svg class="icon icon--sm" …></svg>Report Daniel</button>
  <hr class="menu__divider" role="separator">
  <button type="button" class="menu__item menu__item--danger" role="menuitem" tabindex="-1"><svg class="icon icon--sm" …></svg>Block Daniel</button>
</div>
<button type="button" class="menu__item" role="menuitemcheckbox" aria-checked="true" tabindex="-1"><span class="check__box" aria-hidden="true"></span>Pause matching</button>
```

```html
<!-- consumer -->
<button bn-button variant="quiet" [cdkMenuTriggerFor]="more.template" [attr.aria-label]="'profile.more' | t: { name: builder().name }">
  {{ 'common.more' | t }} <svg slot="icon-end" class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5"/></svg>
</button>
<bn-menu #more [label]="'profile.moreActions' | t">
  <button bn-menu-item (triggered)="openReport()"><svg slot="icon" …></svg>{{ 'profile.report' | t: { first: builder().firstName } }}</button>
  <bn-menu-divider />
  <button bn-menu-item danger (triggered)="openBlock()"><svg slot="icon" …></svg>{{ 'profile.block' | t: { first: builder().firstName } }}</button>
</bn-menu>
```

The classes `menu`, `menu__header`, `menu__item`, `menu__item--danger`, `menu__divider` and the
roles are the e2e contract.

## Design

- Panel: padding `--space-2`, `--radius-lg`, `--border-width-hairline` `--color-border-default`,
  `--color-bg-surface-raised`, `--shadow-3`, layer `--z-popover`; min width from the menu
  min-width geometry token; max width `100%`.
- Position: below the trigger with a `--space-2` gap; account menu aligned to the trigger's end
  edge (the mock's `.menu-anchor` places it at the top bar's bottom minus `--space-2`, at the
  layout margin); CDK flexible positioning flips above when there is no room below and keeps
  `--layout-margin` from the viewport edges.
- Header: padding `--space-3` `--space-4`, hairline bottom border, `--space-2` below; title in
  `--text-h4`, meta in `--text-body-sm` `--color-fg-muted`.
- Item: flex, gap `--space-3`, full width, min height `--target-comfortable`, padding
  `0 --space-4`, `--radius-md`, `--text-body`, left-aligned, no underline, no border.
- Divider: hairline `--color-border-default`, margin `--space-2` 0.
- Colour transitions `--duration-fast` `--ease-standard`; the panel appears without an entrance
  animation (D-5).

Component tokens: none.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Panel fill | `--color-bg-surface-raised` | `--palette-white` | `--palette-night-850` |
| Panel border, divider, header rule | `--color-border-default` | `--palette-oat-300` | `--palette-night-700` |
| Item label | `--color-fg-default` | `--palette-ink-900` | `--palette-night-50` |
| Header meta | `--color-fg-muted` | `--palette-stone-700` | `--palette-night-200` |
| Item hover and focus fill | `--color-bg-subtle` | `--palette-oat-200` | `--palette-night-800` |
| Item active fill | `--color-accent-subtle-hover` | `--palette-sage-100` | `--palette-sage-900` |
| Danger label | `--color-danger-fg` | `--palette-lingon-700` | `--palette-lingon-300` |
| Disabled label | `--color-fg-disabled` | `--palette-oat-400` | `--palette-night-500` |
| Focus ring | `--color-focus-ring` | `--palette-sage-700` | `--palette-sage-300` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-surface-raised` | 4.5:1 | Item label |
| `--color-fg-default` | `--color-bg-subtle` | 4.5:1 | Hovered or focused item |
| `--color-fg-muted` | `--color-bg-surface-raised` | 4.5:1 | Header meta |
| `--color-danger-fg` | `--color-bg-surface` | 4.5:1 | Danger item |
| `--color-focus-ring` | `--color-bg-surface` | 3:1 | Focus indicator |

`--color-danger-fg` on `--color-bg-surface-raised` and on `--color-bg-subtle` are not declared in
`contrast-pairs.json`; the rendering page measures them in both themes and the design system
should declare them (D-8).

Forced colours: the panel border becomes `CanvasText`; focused items use `Highlight`.

## Responsive behaviour

- The same panel at every breakpoint (not a bottom sheet: it is not a dialog).
- At 320 px the account menu fits within the viewport with `--layout-margin` on each side; long
  labels wrap inside the item rather than widening the panel.
- Every item is at least 44 px high; at 200 % zoom the panel scrolls vertically inside the
  viewport if it is taller than the space available.

## Accessibility

### Role and pattern

[WAI-ARIA menu button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/) through CDK
Menu: trigger with `aria-haspopup="menu"` and `aria-expanded`, panel `role="menu"`, items
`role="menuitem"` / `menuitemcheckbox`, divider `role="separator"`, header `role="presentation"`.
The menu is not modal.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Enter</kbd> / <kbd>Space</kbd> / <kbd>↓</kbd> on the trigger | Opens and focuses the first item. |
| <kbd>↑</kbd> on the trigger | Opens and focuses the last item. |
| <kbd>↓</kbd> / <kbd>↑</kbd> | Next / previous enabled item, wrapping. |
| <kbd>Home</kbd> / <kbd>End</kbd> | First / last enabled item. |
| Printable character | Type-ahead to the next item starting with it. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> on an item | Activates it (links navigate) and closes the menu. |
| <kbd>Escape</kbd> | Closes and returns focus to the trigger. |
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Closes and moves focus on from the trigger. |

### Focus

Focus moves into the panel on open (first item, or last with ArrowUp) and returns to the trigger
on Escape, outside click and selection — unless the item's action moves it (a dialog opening takes
focus and later returns it to the trigger, L2-050 AC3; navigation hands focus to the new page).

### Labelling

The panel is named by `label`; items by their text ("Report Daniel", not "Report"). The trigger's
name starts with its visible text ("More actions for Daniel Reyes", "Your account, Amara Osei").

### Announcements

None beyond role and state; the action's outcome is announced by its page or dialog.

### Motion

No entrance animation; colour transitions are instant under `prefers-reduced-motion: reduce`.

## Content and internationalisation

- Action names, sentence case, verb first: "View profile", "Edit profile", "Your projects",
  "Sign out", "Report Daniel", "Block Daniel" (first name from data).
- Header: the member's full name and "Role · Neighbourhood".
- Translatable: `label`, every item label (with name parameters). Data values: names, role,
  neighbourhood.
- Longer translations wrap inside the item; the panel never exceeds the viewport.

## Performance

- Change detection: `OnPush`; the panel content is an `ng-template` instantiated only while open;
  items are directives over the consumer's elements.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Menu.ts` renders the account
  menu panel inline (`cdkMenu` without a trigger) for Amara Osei with its header, five icon items
  and divider; iterations in `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly
  100–300 ms.
- Composite scenarios: `DarkTheme` gains the account menu panel.
- Layout stability: the panel is an overlay and never moves page content.
- Weight: `@angular/cdk/menu` and `@angular/cdk/overlay` (both tree-shaken); nothing else.

## Acceptance criteria

### Rendering

- **AC-1** Given Amara is signed in, when she activates her avatar in the top bar, then a `div.menu[role="menu"]` named "Your account" opens below it, right-aligned, with the header "Amara Osei" / "Founder · Leslieville", the items "View profile", "Edit profile", "Settings", "Your projects", a `role="separator"` divider, and "Sign out". (L2-003)
- **AC-2** Given the builder profile of Daniel Reyes, when Amara activates "More", then a menu named "More actions" opens with "Report Daniel", a divider and "Block Daniel" with `.menu__item--danger` in `--color-danger-fg`. (L2-011)
- **AC-3** Given the "More" menu is open, when Amara chooses "Report Daniel", then the menu closes and the report dialog opens; when the dialog closes, focus returns to "More". (L2-011)

### States

- **AC-4** Given the account menu is open, when Amara chooses "Sign out", then the menu is closed before the app calls `DELETE /api/v1/session`. (L2-003)
- **AC-5** Given an item is hovered or focused, when it renders, then its fill is `--color-bg-subtle` and its label keeps at least 4.5:1 contrast. (L2-050)
- **AC-6** Given a disabled item, when the member presses ArrowDown past it, then it is skipped, it has `aria-disabled="true"`, and activating it does nothing. (L2-050)
- **AC-7** Given a checkable item "Pause matching", when it is activated, then `aria-checked` toggles, `checkedChange` emits once, and the menu closes. (L2-050)

### Keyboard and focus

- **AC-8** Given focus on the avatar trigger, when Enter is pressed, then the menu opens with focus on "View profile"; ArrowDown and ArrowUp move with wrapping, Home and End go to the ends, typing "s" moves to "Settings", and each focused item shows the 2 px `--color-focus-ring` ring. (L2-050)
- **AC-9** Given the account menu is open, when Escape is pressed or the member clicks outside, then the menu closes and focus returns to the avatar trigger; when Tab is pressed, the menu closes and focus moves to the next control after the trigger. (L2-050)

### Screen readers

- **AC-10** Given the trigger, when the menu is closed and open, then it exposes `aria-haspopup="menu"` and `aria-expanded` "false" and "true", and the open panel announces "Your account, menu" with items as "menu item, N of 5". (L2-050)
- **AC-11** Given both menus open in both themes, when axe-core runs, then there are no violations. (L2-050)

### Theming

- **AC-12** Given the dark theme, when the account menu opens, then the panel, border, labels, hover fill and danger label resolve through their semantic tokens with no component code for the theme. (L2-051)

### Content

- **AC-13** Given the app in en-CA, when the menus render, then "Your account", "More actions" and every item label come from the catalogue, with "Daniel" inserted from data. (L2-052)

### Responsive

- **AC-14** Given a 320 px viewport, when the account menu opens, then the whole panel is within the viewport, the page does not scroll horizontally, and every item is at least 44 px high. (L2-049)

### Performance

- **AC-15** Given a change to the menu, when the perf test runs `Menu` and `DarkTheme` against the base branch, then neither is flagged as a possible regression. (L2-048)

## Implementation notes

- Add `@angular/cdk` (matching the Angular major) to `frontend/package.json`; it is not a
  dependency yet.
- Folder `frontend/projects/components/src/lib/menu/`; files `menu.ts` (class `Menu`, selector
  `bn-menu`, exposes `template` for `cdkMenuTriggerFor`), `menu-item.ts` (class `MenuItem`,
  selector `a[bn-menu-item], button[bn-menu-item]`, host directive `CdkMenuItem` /
  `CdkMenuItemCheckbox`), `menu-header.ts`, `menu-divider.ts`, `menu.css`; export all from
  `public-api.ts`.
- Overlay positions: `{ originX: align, originY: 'bottom', overlayX: align, overlayY: 'top',
  offsetY: 8 }` with a flipped fallback above; viewport margin = the layout margin.
- Move `.menu*` styles from `components.css` into the component; the overlay pane needs the
  panel styles globally or via `ViewEncapsulation.None` scoped to `.menu`.
- The top bar's `.avatar-btn` becomes a `<button>` with `cdkMenuTriggerFor` (the mock's `<a>`
  links to the menu mock only); the builder-profile `details.more`/`summary` becomes a
  `button[bn-button]` trigger.
- Add `Menu.ts` to the perf-test scenarios and export it.

## Decisions

- **D-1** *Is the "More" list a menu?* Yes. The mock builds it with `details` and `role="group"`,
  but it holds actions (report, block), and AGENTS.md requires CDK Overlay/Menu for overlays; the
  design system says action menus use menu roles.
- **D-2** *Are account-menu entries links or buttons?* Links for destinations ("View profile",
  "Edit profile", "Settings", "Your projects") with `role="menuitem"`; "Sign out" is a button
  because it performs an action (the mock links to the signed-out page only because mocks are
  static).
- **D-3** *Does selection close the menu before the action?* Yes, always; L2-003 AC11 requires it
  for "Sign out", and the same rule keeps focus handling predictable for every item.
- **D-4** *Is the menu a bottom sheet on phones?* No. It is non-modal and small; L2-049's bottom
  sheet applies to dialogs.
- **D-5** *Does the panel animate in?* No. The design system defines no menu entrance, and an
  instant panel keeps focus movement immediate.
- **D-6** *How does a checkable item look?* A leading `span.check__box` indicator inside a
  `menuitemcheckbox`, filled with `--color-accent` and ticked when `aria-checked="true"` (a
  component rule mirroring the checkbox's `:checked` style), instead of the specimen's `label.check` with a
  real checkbox, because a nested form control inside `role="menu"` is not allowed by ARIA.
- **D-7** *Are shortcuts an API?* No. Banaro has no menu shortcuts; the specimen's "· Shift S" is
  label text, and a consumer that adds one also sets `aria-keyshortcuts`.
- **D-8** *Danger label contrast on the raised panel?* Required at 4.5:1 like any text; the
  declared pair is against `--color-bg-surface`, and the raised and subtle surfaces are measured on
  the rendering page until the design system declares them.
