# Tooltip

| Field | Value |
|---|---|
| Selector | `[bnTooltip]` (directive on the trigger); renders `span.tooltip` in the CDK overlay |
| Library path | `frontend/projects/components/src/lib/tooltip/` |
| Status | planned |
| Traces to | L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`tooltip.html`](../../design-system/components/tooltip.html) |
| Source mocks | None. The design system marks the tooltip a "core extension": no mock uses it. |
| Rendering | [`tooltip.html`](tooltip.html) |

## Purpose and scope

A tooltip shows a short, non-interactive phrase next to a compact control when the layout cannot
carry a visible label: "Edit profile" beside a pencil icon button, optionally with its keyboard
shortcut ("Edit profile · E"). It supplements the control's accessible name; it never replaces it
and never holds anything a member must read to complete a task.

No screen in `docs/mocks/` uses a tooltip today: every icon-only control in the mocks (the top bar's
Messages and Notifications links, the dialog close control) carries an `aria-label` and no tooltip.
This CRD fixes the component's contract so that a later screen can adopt it without reshaping its
API. Use [popover](popover.md) for anything interactive, a field's help text for validation hints
([form field](form-field.md)), and a toast for status.

Out of scope:

- The trigger control and its accessible name ([button](button.md)).
- Deciding which controls get tooltips (a mock must show it first; see AGENTS.md).

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| Design-system specimen "text" | on an icon button named "Edit profile" | "Edit profile" | hidden, open (hover, focus) | inverse chip above the trigger |
| Design-system specimen "shortcut" | same, with `bnTooltipShortcut="E"` | "Edit profile · E" | hidden, open | same |
| Product screens | none yet | — | — | — |

## Anatomy

1. **Trigger** — any focusable native control with its own accessible name. Gets
   `aria-describedby` pointing at the tooltip while it is shown.
2. **Tooltip** — `span.tooltip[role=tooltip]` with a generated id, in the CDK overlay container.
3. **Shortcut (optional)** — text appended after a middle dot: " · E".

Host: the directive adds nothing to the trigger's layout; the design system's `.tooltip-anchor`
wrapper is not needed with an overlay (D-2).

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `bnTooltip` | `string` | — | yes | The phrase. Translatable. Empty string disables the tooltip. |
| `bnTooltipShortcut` | `string \| null` | `null` | no | Appended as " · {shortcut}". Translatable. |
| `bnTooltipPlacement` | `'top' \| 'bottom'` | `'top'` | no | Preferred side; flips when there is no room. |
| `bnTooltipDisabled` | `boolean` | `false` | no | Never shows. |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| None | | The tooltip is passive; nothing reacts to it. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| None | | The text is an input so it can be a plain string in `aria-describedby`. |

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Text | — | A phrase that names or explains an icon control. |
| Shortcut | `bnTooltipShortcut` | The phrase plus a keyboard hint. |

| Size | Modifier | Height | Padding | Type |
|---|---|---|---|---|
| One size | — | content | `--space-2` `--space-3` | `--text-caption` |

Width is the text's (`min-width: max-content`), capped at the viewport minus the layout margins, so
long translations wrap.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Hidden | default | Not rendered | No `aria-describedby` |
| Open on hover | pointer enters the trigger and stays for `--duration-base` | Inverse chip above the trigger, offset `--space-2` | Trigger `aria-describedby` set |
| Open on focus | keyboard focus (`:focus-visible`) | Same, at once | Description read after the name |
| Hovered tooltip | pointer moves from trigger onto the tooltip | Stays open | — |
| Dismissed | <kbd>Escape</kbd> | Hidden while focus or pointer stays | Focus stays on the trigger |
| Closing | pointer leaves both trigger and tooltip, or blur | Hidden | `aria-describedby` removed |
| Disabled trigger | trigger `disabled` | Never shown | — |
| Touch | touch input | Never shown; the trigger's name carries meaning | — |

## Markup

```html
<!-- rendered: open -->
<button type="button" class="icon-btn" aria-label="Edit profile" aria-describedby="bn-tooltip-1">
  <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">…</svg>
</button>
…
<div class="cdk-overlay-pane bn-tooltip-pane">
  <span class="tooltip" id="bn-tooltip-1" role="tooltip">Edit profile · E</span>
</div>
```

```html
<!-- consumer -->
<button bn-icon-button type="button" [label]="'profile.edit' | t"
        [bnTooltip]="'profile.edit' | t" bnTooltipShortcut="E"><svg …></svg></button>
```

In the overlay the `.tooltip` loses its `position: absolute` anchoring rules, which the pane
replaces; everything else comes from components.css.

## Design

- Background `--color-bg-inverse`, text `--color-fg-inverse`, radius `--radius-sm`, padding
  `--space-2` `--space-3`, type `--text-caption`; layer `--z-tooltip`.
- Offset from the trigger `--space-2`; max width 100 % of the viewport less `--layout-margin` on
  each side.
- Motion: none; it appears and disappears in place.

Component tokens: none.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Chip | `--color-bg-inverse` | resolved live | resolved live |
| Text | `--color-fg-inverse` | resolved live | resolved live |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-inverse` | `--color-bg-inverse` | 4.5:1 | Tooltip text |

## Responsive behaviour

- The layout does not change across breakpoints. Placement flips and shifts to stay inside the
  viewport; at 320 px a long French phrase wraps instead of overflowing.
- On touch devices the tooltip does not show; the trigger's own 44 × 44 CSS px target and name are
  enough.

## Accessibility

### Role and pattern

WAI-ARIA [Tooltip](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/): `role="tooltip"`,
referenced by `aria-describedby` on the trigger only while shown. Meets WCAG 1.4.13: dismissible
with Escape, hoverable, and persistent until the pointer or focus leaves.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Focusing the trigger shows the tooltip; moving on hides it. |
| <kbd>Escape</kbd> | Hides the tooltip; focus stays on the trigger. |

### Focus

The tooltip is never focusable and never takes focus.

### Labelling

The trigger keeps its own `aria-label`; the tooltip is a description, so a tooltip whose text equals
the name adds only the shortcut. It holds no links or buttons.

### Announcements

None beyond the description read with the trigger.

### Motion

None.

## Content and internationalisation

- One short phrase in sentence case, no full stop: "Edit profile". The shortcut is the key alone:
  "E".
- Translatable inputs: `bnTooltip`, `bnTooltipShortcut`. No data values.
- French grows about 30 %; the chip wraps at the viewport cap.

## Performance

- Change detection: `OnPush`; the directive creates the overlay only on first show and reuses it.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Tooltip.ts` renders the "Edit
  profile" icon button with its tooltip shown ("Edit profile · E"); iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly 100–300 ms.
- Composite scenarios: none.
- Layout stability: floats in the overlay; never moves the page.
- Weight: `@angular/cdk/overlay` only.

## Acceptance criteria

### Rendering

- **AC-1** Given an icon button named "Edit profile" with a tooltip, when Amara focuses it with the keyboard, then `span.tooltip[role=tooltip]` reading "Edit profile" appears above it and the button's `aria-describedby` points at it. (L2-050)
- **AC-2** Given the shortcut "E", when the tooltip shows, then it reads "Edit profile · E". (L2-052)

### States

- **AC-3** Given the pointer rests on the button, when it moves onto the tooltip, then the tooltip stays open. (L2-050)
- **AC-4** Given the tooltip is shown, when Amara presses Escape, then it hides, focus stays on the button, and `aria-describedby` is removed. (L2-050)
- **AC-5** Given focus leaves the button, when blur happens, then the tooltip hides. (L2-050)
- **AC-6** Given a touch tap on the button, when it is activated, then no tooltip appears and the button still has the name "Edit profile". (L2-049)

### Screen readers

- **AC-7** Given the tooltip is shown, when axe-core runs in both themes, then it reports no WCAG 2.2 A or AA violations, and the tooltip contains no focusable element. (L2-050)

### Theming

- **AC-8** Given both themes, when the tooltip shows, then its text measures at least 4.5:1 against `--color-bg-inverse`. (L2-050)
- **AC-9** Given the tooltip's styles, when inspected, then every colour comes from a design-system token. (L2-051)

### Responsive

- **AC-10** Given a 320 px viewport and a button at the right edge, when the tooltip shows, then it stays inside the viewport and nothing scrolls horizontally. (L2-049)

### Content

- **AC-11** Given the en-CA catalogue, when the tooltip renders, then its phrase comes from the catalogue. (L2-052)

### Performance

- **AC-12** Given a change to the tooltip, when the perf test runs the `Tooltip` scenario against the base branch, then it is not flagged as a possible regression. (L2-048)

## Implementation notes

- Folder `frontend/projects/components/src/lib/tooltip/`: `tooltip.ts` (`Tooltip` directive,
  selector `[bnTooltip]`), `tooltip-panel.ts` (internal standalone component rendering the
  `span.tooltip`), `tooltip.css`. Export the directive from `public-api.ts`.
- Built on CDK `Overlay` with a flexible connected position (top, then bottom), `withViewportMargin`,
  reposition scroll strategy, no backdrop. Listens to `pointerenter`/`pointerleave` on trigger and
  pane, `focusin`/`focusout` with `FocusMonitor` (keyboard origin only for instant show), and
  `keydown` Escape on the document while shown. Pointer type `touch` never shows.
- The trigger is usually an icon button (`button[bn-icon-button]`, owned by [top bar](top-bar.md#icon-button)).
- Add `Tooltip.ts` to the perf-test scenarios and `index.ts`.
- `@angular/cdk` is not yet in `frontend/package.json`; add it (matching the Angular major) in the first slice that builds this component.

## Decisions

- **D-1** *Write a CRD for a component no mock uses?* Yes, because the brief assigns it and the
  design system defines it; but no page adopts it until a mock shows it (AGENTS.md: mock before
  production behaviour). Status stays `planned`.
- **D-2** *`.tooltip-anchor` wrapper or overlay?* Overlay. The brief builds overlays on CDK, and an
  anchored absolute chip clips inside cards with `overflow: hidden` and at the viewport edge.
- **D-3** *Hover delay?* `--duration-base` before showing on hover, none on keyboard focus, so a
  pointer crossing the top bar does not flash chips; the design system gives no delay, and focus must
  show at once to help keyboard users.
- **D-4** *Touch?* Never shown on touch: there is no hover, and a long-press tooltip would compete
  with the control's own action.
