# Button group

| Field | Value |
|---|---|
| Selector | `bn-button-group` |
| Library path | `frontend/projects/components/src/lib/button-group/` |
| Status | planned |
| Traces to | L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`button-group.html`](../../design-system/components/button-group.html) |
| Source mocks | None renders `.btn-group`; the design-system page cites [`dialogs/change-photo/default`](../../mocks/dialogs/change-photo/default.html), [`dialogs/delete-account/default`](../../mocks/dialogs/delete-account/default.html), [`dialogs/delete-project/default`](../../mocks/dialogs/delete-project/default.html) and [`dialogs/session-expired/default`](../../mocks/dialogs/session-expired/default.html), whose footers use `.form-actions` |
| Rendering | [`button-group.html`](button-group.html) |

## Purpose and scope

A button group names and lays out a small set of closely related [buttons](button.md): a set of
actions ("Save changes" and "Preview" for a project), a segmented choice where exactly one button
is pressed, or a toolbar that is one Tab stop with arrow-key movement. It gives assistive
technology one labelled group instead of loose buttons.

Use the form layout's `.form-actions` row for a form's submit and cancel, the dialog's footer for
dialog actions, [tabs](tabs.md) to switch views or routes, chips for filter toggles, and a
fieldset of radios for a form answer.

Out of scope:

- The buttons themselves (variants, busy, disabled): see [button](button.md).
- Form footers (`.form-actions`, `.form-actions--end`), dialog footers, `.empty__actions`,
  `.hero__actions`, `.profile-head__actions`, `.proj-head__actions`, `.alert__actions` and
  `.match__actions`: each is owned by its form-layout, dialog, empty-state, hero, profile-header,
  project and matching-panel CRD (D-1).
- What the actions do.

## Usage

The usage inventory for `.btn-group` across `docs/mocks` is empty: no page, dialog or
notification renders the block. The rows below are the design-system specimens, which the
component must support so that later screens need no API change, and the nearest mock
compositions that stay with their own CRDs.

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| Design system "actions" specimen | `variant="actions"`, `label="Project actions"` | primary "Save changes", quiet "Preview" | default, hover, focus, active, disabled (all buttons) | canvas or surface |
| Design system "segmented" specimen | `variant="segmented"`, `label="Project actions"`, `value="preview"` | quiet "Save changes", quiet "Preview" (`aria-pressed`) | default, pressed, disabled | canvas or surface |
| Design system "toolbar" specimen | `variant="toolbar"`, `label="Project actions"` | primary "Save changes", quiet "Preview" | default, focus (roving), disabled | canvas or surface |
| Not this component: dialog and form footers in `change-photo`, `delete-account`, `delete-project`, `session-expired` and every form page | `.form-actions` (owned by form layout and dialog) | "Cancel" + "Save photo", "Keep my account" + "Delete my account" | — | dialog, surface |

## Anatomy

1. **Group** — `div.btn-group` with `role="group"` (actions, segmented) or `role="toolbar"`
   (toolbar) and an `aria-label`. Flex row, wraps, gap `--space-2`.
2. **Buttons** — projected `button[bn-button]` (or `a[bn-button]` in an actions group) children.
3. **Pressed selection (segmented)** — the one child with `aria-pressed="true"`; the others carry
   `aria-pressed="false"`.

Host: `bn-button-group` is `display: contents`; it renders the `div.btn-group` and projects the
buttons into it.

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `label` | `string` | — | yes | `aria-label` of the group, naming its task ("Project actions"); from the catalogue. |
| `variant` | `'actions' \| 'segmented' \| 'toolbar'` | `'actions'` | no | Sets the role and keyboard model (table below). |
| `value` | `string \| null` (model) | `null` | segmented only | The `value` attribute of the pressed button. Two-way bindable (`[(value)]`). |
| `disabled` | `boolean` | `false` | no | Disables every projected button (each button's own `disabled`); the group keeps its label. |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| `valueChange` | `string` (the pressed button's `value`) | Segmented only: the member presses a button that was not pressed. Pressing the pressed button emits nothing (one option is always chosen). |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| default | 2–5 `button[bn-button]` (actions also `a[bn-button]`) | Segmented buttons need a `value` attribute; toolbars hold buttons only. At most one `variant="primary"`; in segmented groups all buttons are `quiet`. |

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Actions | `.btn-group`, `role="group"` | Related actions shown together and named once. Primary action last in reading order when it follows a safe action (design-system do/don't). |
| Segmented | `.btn-group`, `role="group"`, children `aria-pressed` | Exactly one of 2–4 peer options, applied immediately (no submit). |
| Toolbar | `.btn-group`, `role="toolbar"` | A set of commands on one object that should be one Tab stop (roving tabindex). |

One content-driven size: the buttons' own `size` decides the height (all children use the same
size); the group adds only the gap.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Buttons in a wrapping row, gap `--space-2` | "Project actions, group" (or toolbar) on entry |
| Hover, focus, active | per button | Button states (see [button](button.md)) | Per button |
| Pressed (segmented) | `aria-pressed="true"` on one child | Pressed outline `--border-width-thick` `--color-accent` on that button — a shape, not colour alone | "Preview, toggle button, pressed" |
| Disabled | `disabled` input | Every button disabled | Group still named; buttons dimmed and (native) out of the tab order |
| Roving focus (toolbar) | arrow keys | Focus ring moves between buttons | One Tab stop; "toolbar" announced |

## Markup

```html
<!-- rendered: actions -->
<bn-button-group><div class="btn-group" role="group" aria-label="Project actions">
  <button type="button" class="btn btn--primary">Save changes</button>
  <button type="button" class="btn btn--quiet">Preview</button>
</div></bn-button-group>
```

```html
<!-- rendered: segmented -->
<div class="btn-group" role="group" aria-label="Project actions">
  <button type="button" class="btn btn--quiet" value="edit" aria-pressed="false">Save changes</button>
  <button type="button" class="btn btn--quiet" value="preview" aria-pressed="true">Preview</button>
</div>
```

```html
<!-- rendered: toolbar -->
<div class="btn-group" role="toolbar" aria-label="Project actions">
  <button type="button" class="btn btn--primary" tabindex="0">Save changes</button>
  <button type="button" class="btn btn--quiet" tabindex="-1">Preview</button>
</div>
```

```html
<!-- consumer -->
<bn-button-group variant="segmented" [label]="'project.actions' | t" [(value)]="mode">
  <button bn-button variant="quiet" value="edit">{{ 'project.edit' | t }}</button>
  <button bn-button variant="quiet" value="preview">{{ 'project.preview' | t }}</button>
</bn-button-group>
```

The group writes `aria-pressed` and `tabindex` on its children; consumers do not set them.

## Design

- `display: flex`, `flex-wrap: wrap`, gap `--space-2` (the design system's group spacing; `--space-3`
  is the action-row spacing of `.form-actions`).
- No border, fill, radius or elevation of its own; buttons keep their pill shape (no joined
  segments).
- No motion of its own.

Component tokens: none.

## Colour

The group draws nothing; colours are the buttons'.

| Part | Token | Light | Dark |
|---|---|---|---|
| Pressed outline | `--color-accent` | `--palette-sage-600` | `--palette-sage-300` |
| Button label | `--color-fg-default` | `--palette-ink-900` | `--palette-night-50` |
| Focus ring | `--color-focus-ring` | `--palette-sage-700` | `--palette-sage-300` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-surface` | 4.5:1 | Quiet labels |
| `--color-accent` | `--color-bg-surface` | 3:1 | Pressed outline |
| `--color-focus-ring` | `--color-bg-surface` | 3:1 | Focus indicator |

## Responsive behaviour

- Below 768 px the row wraps; buttons keep their width and order (reading order is preserved,
  never reversed).
- From 768 px related buttons sit on one line when they fit.
- At 320 px nothing scrolls horizontally; every button is at least 44 × 44 px on touch devices
  (the button's own rule); at 200 % zoom all buttons stay reachable.

## Accessibility

### Role and pattern

`role="group"` with `aria-label` for actions and segmented choices; `role="toolbar"` with
`aria-label` for toolbars, following the
[WAI-ARIA toolbar pattern](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/). Segmented buttons
are toggle buttons (`aria-pressed`).

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Actions and segmented: visits each button. Toolbar: enters at the last focused button (first on first entry) and leaves the toolbar. |
| <kbd>←</kbd> / <kbd>→</kbd> | Toolbar only: moves focus to the previous / next enabled button, wrapping. |
| <kbd>Home</kbd> / <kbd>End</kbd> | Toolbar only: first / last enabled button. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Activates the focused button; in a segmented group presses it and un-presses the others. |

### Focus

Focus stays on the pressed button after a segmented change. In a toolbar exactly one button has
`tabindex="0"`; disabled buttons are skipped by the arrow keys.

### Labelling

The group's name is its task ("Project actions"). Each button keeps its own visible name. A group
repeated on several cards includes the card's subject in its label ("Actions for Psalter").

### Announcements

None: pressed state changes are announced by the focused toggle button itself.

### Motion

None.

## Content and internationalisation

- Group labels name the task, in sentence case: "Project actions", "Actions for Psalter".
- Button labels follow the button CRD; segmented options are short peer nouns or verbs.
- Translatable: `label` and every button label. Data values: subject names inside labels.
- Longer translations wrap the row; buttons never truncate.

## Performance

- Change detection: `OnPush`, signal inputs and model; children found with `contentChildren` of
  the `Button` directive; `aria-pressed` and `tabindex` written through the buttons' own inputs,
  not by DOM queries.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/ButtonGroup.ts` renders the
  segmented "Project actions" group ("Save changes", "Preview" pressed); iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly 100–300 ms.
- Composite scenarios: none.
- Layout stability: buttons reserve their height from the size token; pressing changes only an
  outline (no reflow).
- Weight: `FocusKeyManager` from `@angular/cdk/a11y` for the toolbar; nothing else.

## Acceptance criteria

### Rendering

- **AC-1** Given an actions group labelled "Project actions" with "Save changes" and "Preview", when it renders, then a `div.btn-group` with `role="group"` and `aria-label="Project actions"` contains the two buttons in that order with a `--space-2` gap. (L2-050)
- **AC-2** Given a segmented group with `value` "preview", when it renders, then "Preview" has `aria-pressed="true"`, "Save changes" has `aria-pressed="false"`, and the pressed one shows the `--color-accent` outline. (L2-050)

### States

- **AC-3** Given the segmented group, when the member presses "Save changes", then it becomes the only pressed button, `valueChange` emits "edit" once, focus stays on it, and pressing it again emits nothing. (L2-050)
- **AC-4** Given the group is disabled, when it renders, then every button is disabled and the group keeps its name. (L2-050)

### Keyboard and focus

- **AC-5** Given a toolbar group, when the member tabs into it, then focus lands on one button, ArrowRight and ArrowLeft move between buttons with wrapping, Home and End go to the ends, and the next Tab leaves the toolbar. (L2-050)
- **AC-6** Given any group, when a button is focused, then it shows the 2 px `--color-focus-ring` ring with at least 3:1 contrast. (L2-050)

### Screen readers

- **AC-7** Given each variant in both themes, when axe-core runs, then there are no violations, and a screen reader announces "Project actions, group" (or "toolbar") on entering. (L2-050)

### Theming

- **AC-8** Given the dark theme, when the segmented group renders, then the pressed outline resolves to `--palette-sage-300` through `--color-accent` with no component code for the theme. (L2-051)

### Content

- **AC-9** Given the app in en-CA, when a group renders, then its `aria-label` comes from the catalogue and the component contains no copy. (L2-052)

### Responsive

- **AC-10** Given a 320 px viewport and an actions group whose labels are a third longer than "Save changes" and "Preview", when it renders, then the buttons wrap onto two lines in reading order and the page has no horizontal scroll. (L2-049)

### Performance

- **AC-11** Given a change to the button group, when the perf test runs `ButtonGroup` against the base branch, then it is not flagged as a possible regression. (L2-048)

## Implementation notes

- Folder `frontend/projects/components/src/lib/button-group/`; files `button-group.ts`,
  `button-group.html`, `button-group.css`; class `ButtonGroup`; selector `bn-button-group`;
  export from `public-api.ts`.
- Composes [button](button.md) (`pressed` and `disabled` inputs are set through a small internal
  API on `Button`, for example a `setGroupState()` method, so consumer bindings are not
  overwritten).
- Toolbar: `FocusKeyManager` (`@angular/cdk/a11y`) with `withHorizontalOrientation('ltr')`,
  `withWrap()`, `withHomeAndEnd()`, `skipPredicate` for disabled buttons.
- `.btn-group` styles move from `components.css` into the component stylesheet.
- Add `ButtonGroup.ts` to the perf-test scenarios and export it from `scenarios/index.ts`.

## Decisions

- **D-1** *Does the component replace `.form-actions` and the other action rows in the mocks?*
  No. The mocks never use `.btn-group`; their action rows have their own classes, spacing
  (`--space-3`) and placement rules, and visual parity with the mocks requires keeping them.
  Those rows belong to the form-layout, dialog, empty-state and header CRDs.
- **D-2** *Does a segmented group allow none pressed?* No: one option is always pressed, as in the
  design-system specimen; pressing the pressed button does nothing.
- **D-3** *Do segments join into one shape?* No. The design system renders separate pills with the
  shared gap and shows the pressed one by the button's outline.
- **D-4** *How does the group label repeat on cards?* It includes the subject, per the design
  system's "label a group that repeats on multiple cards".
- **D-5** *Which roving-focus mechanism does the toolbar use?* CDK `FocusKeyManager`; the CDK has
  no toolbar primitive, and AGENTS.md prefers CDK over hand-rolled behaviour.
