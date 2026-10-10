# Switch

| Field | Value |
|---|---|
| Selector | `bn-switch`, `input[bn-switch]` |
| Library path | `frontend/projects/components/src/lib/switch/` |
| Status | planned |
| Traces to | L2-021, L2-036, L2-037, L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`switch.html`](../../design-system/components/switch.html) |
| Source mocks | [`pages/settings/email`](../../mocks/pages/settings/email.html), [`pages/settings/privacy`](../../mocks/pages/settings/privacy.html), [`pages/matching-setup/default`](../../mocks/pages/matching-setup/default.html), [`pages/matching-setup/submitting`](../../mocks/pages/matching-setup/submitting.html) |
| Rendering | [`switch.html`](switch.html) |

## Purpose and scope

The switch turns one ongoing preference on or off: weekly match e-mail, event
reminders, appearing in the directory, showing your distance. It is a native
checkbox with `role="switch"`, drawn as a track and thumb at the end of a
setting row whose title and one-line explanation stay the same in both states.

`bn-switch` renders the setting row (`label.switch` with title and description)
and `input[bn-switch]` styles the projected native checkbox as
`.switch__control`. In Banaro switches live in forms with a "Save changes"
button (settings, matching setup); the switch records a value like any other
form control.

Use a [checkbox](checkbox.md) for agreeing to something or picking several
options, and a [radio group](radio-group.md) for a choice between named
alternatives ("Who can see my profile").

Out of scope:

- Saving, and what each preference means — the page (L2-036, L2-037).
- The list's surrounding form and its "Save changes" / "Cancel" actions —
  [form layout](form-layout.md).

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/settings/email` | five rows with descriptions, label first | "Weekly matches on Monday" / "Your three suggested builders, every Monday at 8 am."; "Event reminders" / "A note the day before an event you are going to."; "New messages" / "An e-mail when a builder writes to you and you are away."; "Feedback on my projects" / "Comments on Harvest and anything else you share."; "Banaro news" / "A short note about new features, once a month at most." | on (first three), off (last two) | canvas |
| `pages/settings/privacy` | two rows with descriptions | "Appear in the directory" / "Builders can find you by skill, role and neighbourhood."; "Show my distance" / "Other builders see roughly how far you are, such as 5.8 km, never your street." | on | canvas |
| `pages/matching-setup/default`, `invalid`, `submitting` | one row with description | "Weekly e-mail" / "We e-mail your three every Monday morning." | on, submitting (`disabled`) | canvas |
| Design system only | label right (`.switch--label-right`), no description | "Event reminders" | off, hover, focus, active, disabled | — |

## Anatomy

1. **Row** — `label.switch[for]`: a grid `1fr auto` with a `--space-4` gap,
   `--space-4` block padding and a hairline `--color-border-default` rule below.
   Label-right rows use `.switch--label-right` (`auto minmax(0, 1fr)`).
2. **Text** — a `span` holding:
   - **Title** — `span.switch__title#{controlId}-title`, `--text-label`,
     `display: block`.
   - **Description (optional)** — `span.switch__text#{controlId}-text`,
     `--text-body-sm` in `--color-fg-muted`.
3. **Control** — `input.switch__control[type=checkbox][role=switch]`: a
   `--size-switch-control-width-23` × `--size-switch-control-height-24` pill
   (`--radius-full`), track `--color-border-strong` (off) or `--color-accent` (on).
4. **Thumb** — the control's `::after`: a `--space-5` circle in
   `--color-bg-surface`, inset `--space-1`, on the left when off and on the right
   when on.

Host: `bn-switch` is `display: block` and renders the row with the projected
input in the control column. `input[bn-switch]` is an attribute component on the
native checkbox (empty template) that adds `class="switch__control"` and
`role="switch"` and wires its name and description to the parent row.

## API

### Inputs

`bn-switch`:

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `controlId` | `string` | — | yes | The projected input's `id`; the row's `for`; the prefix of `{controlId}-title` and `{controlId}-text`. |
| `label` | `string` | — | yes | The setting's stable name, rendered in `span.switch__title`. It never changes with the state. |
| `description` | `string \| null` | `null` | no | One sentence, rendered in `span.switch__text`. |
| `labelPosition` | `'start' \| 'end'` | `'start'` | no | `end` adds `.switch--label-right` and renders the control before the text. |

`input[bn-switch]`: no inputs. It injects the parent `bn-switch` and binds
`aria-labelledby="{controlId}-title"` and, when there is a description,
`aria-describedby="{controlId}-text"`. The consumer sets `type="checkbox"`,
`id` (equal to `controlId`), `name`, `checked`, `disabled` and `formControlName`.

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| None | | Native `change`; forms bind to the input. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `input` (`bn-switch`) | exactly one `input[bn-switch]` | Projected once, into the control column; the template places the text before or after it by `labelPosition` using one `ng-template` for the text. |

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Label first (default) | `.switch` | Every screen: title and description on the left, control on the right |
| Label right | `.switch--label-right` | Control first, for short lists in narrow panels (design system) |
| With description | `span.switch__text` | Every Banaro setting ("Give privacy settings a description") |

| Size | Modifier | Height | Padding | Type |
|---|---|---|---|---|
| One size | — | Control `--size-switch-control-height-24`; row from content + `--space-4` block padding | — | Title `--text-label`; description `--text-body-sm` |

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Off | not `:checked` | Track `--color-border-strong`, thumb left | "switch, off" |
| On | `:checked` | Track `--color-accent`, thumb right | "switch, on" |
| Hover | `.switch:hover` | No change beyond the pointer cursor on the whole row | — |
| Focus | `:focus-visible` on the input | Shared focus ring around the track | Focus on the input |
| Active | `:active` | No extra visual | — |
| Disabled | `disabled` (submitting) | Off track `--color-border-default`, on track `--color-fg-disabled`; title and description `--color-fg-muted`; `cursor: not-allowed` | Skipped by Tab; state still read |
| Invalid | — | A switch has no invalid state: both values are valid | — |

## Markup

```html
<!-- rendered: with description, on (settings e-mail) -->
<bn-switch>
  <label class="switch" for="weekly-matches">
    <span>
      <span class="switch__title" id="weekly-matches-title">Weekly matches on Monday</span>
      <span class="switch__text" id="weekly-matches-text">Your three suggested builders, every Monday at 8 am.</span>
    </span>
    <input bn-switch class="switch__control" type="checkbox" role="switch" id="weekly-matches" name="weekly-matches"
           aria-labelledby="weekly-matches-title" aria-describedby="weekly-matches-text" checked>
  </label>
</bn-switch>
```

```html
<!-- rendered: label right, no description, off -->
<label class="switch switch--label-right" for="event-reminders">
  <input bn-switch class="switch__control" type="checkbox" role="switch" id="event-reminders" aria-labelledby="event-reminders-title">
  <span><span class="switch__title" id="event-reminders-title">Event reminders</span></span>
</label>
```

```html
<!-- consumer -->
<div>
  @for (pref of emailPrefs; track pref.key) {
    <bn-switch [controlId]="pref.key" [label]="pref.titleKey | t" [description]="pref.textKey | t">
      <input bn-switch type="checkbox" [id]="pref.key" [name]="pref.key" [formControlName]="pref.key">
    </bn-switch>
  }
</div>
```

## Design

- Row: grid `1fr auto`, gap `--space-4`, `align-items: center`, `padding-block:
  var(--space-4)`, bottom rule `--border-width-hairline` `--color-border-default`.
- Title `--text-label`, `display: block`; description `--text-body-sm`.
- Control: `appearance: none`, `--size-switch-control-width-23` ×
  `--size-switch-control-height-24`, `--radius-full`, `position: relative`.
- Thumb: `--space-5` circle at `--space-1` from the top and the active edge.
- Motion: the thumb slides by `translate` and the track colour changes over
  `--duration-fast` with `--ease-standard`, only under
  `prefers-reduced-motion: no-preference`.

Component tokens: none.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Track off | `--color-border-strong` | `--palette-stone-500` | `--palette-night-500` |
| Track on | `--color-accent` | `--palette-sage-600` | `--palette-sage-300` |
| Thumb | `--color-bg-surface` | `--palette-birch-50` | `--palette-night-900` |
| Title | `--color-fg-default` | `--palette-ink-900` | `--palette-night-50` |
| Description | `--color-fg-muted` | `--palette-stone-700` | `--palette-night-200` |
| Row rule | `--color-border-default` | `--palette-oat-300` | `--palette-night-700` |
| Disabled track off | `--color-border-default` | `--palette-oat-300` | `--palette-night-700` |
| Disabled track on | `--color-fg-disabled` | `--palette-oat-400` | `--palette-night-500` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-border-strong` | `--color-bg-canvas` | 3:1 | Off track against the page |
| `--color-border-strong` | `--color-bg-surface` | 3:1 | Off track against a card; thumb against the off track |
| `--color-accent` | `--color-bg-canvas` | 3:1 | On track against the page |
| `--color-accent` | `--color-bg-surface` | 3:1 | Thumb against the on track |
| `--color-fg-default` | `--color-bg-canvas` | 4.5:1 | Title |
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Description |

Forced colours: the control gets a `CanvasText` hairline border; the thumb's
position still shows the state.

## Responsive behaviour

- The row keeps text and control side by side at every width; the text column
  shrinks (`minmax(0, 1fr)`) and wraps, and the control stays its fixed size.
- At 320 px nothing scrolls horizontally or clips ("Other builders see roughly
  how far you are, such as 5.8 km, never your street." wraps); at 200 % zoom
  everything stays available.
- The whole row is the label, so the target is the full row (at least 44 px tall
  with its `--space-4` padding), although the control is 28 px tall.

## Accessibility

### Role and pattern

Native `<input type="checkbox" role="switch">`
([APG switch](https://www.w3.org/WAI/ARIA/apg/patterns/switch/)); the native
checked state is exposed as on/off.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Move to each switch. |
| <kbd>Space</kbd> | Toggle. |
| <kbd>Enter</kbd> | Native implicit submission of the form (does not toggle). |

### Focus

The input takes focus; the shared 2 px `--color-focus-ring` ring surrounds the
track at a 3 px offset. Toggling never moves focus.

### Labelling

- Name: the title only, via `aria-labelledby` ("Weekly matches on Monday"),
  so the description is not repeated in the name.
- Description: `aria-describedby` names `span.switch__text`.
- The title never changes with the state (design system: "never change the label
  to Turn off after activation").

### Announcements

None. The page confirms a saved change with its success state.

### Motion

The thumb slide and track colour change are removed under
`prefers-reduced-motion: reduce`; the thumb jumps to its end position.

## Content and internationalisation

- Titles name the setting as a noun phrase: "Event reminders", "Appear in the
  directory", "Show my distance".
- Descriptions say what happens when it is on, in one sentence: "A note the day
  before an event you are going to."
- Times and distances in descriptions follow L2-052 ("8 am", "5.8 km").
- Translatable: `label`, `description`. Data: project names inside copy ("Harvest").

## Performance

- Change detection: `OnPush`; the control's ARIA ids are `computed` from the
  parent's `controlId`.
- Perf-test scenarios: add `frontend/projects/perf-test/src/scenarios/Switch.ts`
  rendering "Event reminders" with "A note the day before an event you are going
  to." (on), and the composite `EmailPreferences.ts` rendering the five e-mail
  preference rows, which repeat on the settings page. Iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep each at roughly 100–300 ms.
- Layout stability: fixed control size; loading skeletons use
  `.skeleton--pill` (same height as the track) beside text lines.
- Weight: no dependencies.

## Acceptance criteria

### Rendering

- **AC-1** Given the e-mail preferences, when "Weekly matches on Monday" renders on, then a `label.switch[for=weekly-matches]` holds `span.switch__title`, `span.switch__text` "Your three suggested builders, every Monday at 8 am." and `input.switch__control[type=checkbox][role=switch]` that is checked. (L2-037)

### States

- **AC-2** Given "Banaro news" is off, when Amara clicks anywhere on its row, then the switch turns on: the track becomes `--color-accent` and the thumb moves to the right. (L2-037)
- **AC-3** Given the five e-mail switches, when "Feedback on my projects" is toggled, then no other switch changes. (L2-037)
- **AC-4** Given the matching-setup form is submitting, when "Weekly e-mail" is `disabled`, then it stays visibly on with the disabled track colour, its text turns `--color-fg-muted`, and clicking or pressing Space changes nothing. (L2-021)
- **AC-5** Given the privacy settings, when "Show my distance" is turned off and on again, then its title "Show my distance" never changes. (L2-036)

### Keyboard and focus

- **AC-6** Given focus on "Appear in the directory", when Space is pressed, then it toggles, focus stays on it, and a 2 px `--color-focus-ring` ring is visible around the track with at least 3:1 contrast. (L2-050)
- **AC-7** Given focus on a switch inside the settings form, when Enter is pressed, then the switch does not toggle. (L2-050)

### Screen readers

- **AC-8** Given "Event reminders" is on, when it receives focus, then a screen reader announces "Event reminders, switch, on" and the description "A note the day before an event you are going to." as its description, not as part of the name. (L2-050)
- **AC-9** Given a switch, when its state changes, then the state is conveyed by the thumb position and the switch role's on/off value, not by colour alone. (L2-050)

### Theming

- **AC-10** Given both themes, when an off and an on switch render on `--color-bg-canvas`, then each track measures at least 3:1 against the page and the thumb at least 3:1 against its track. (L2-050)
- **AC-11** Given the theme switch, when it toggles, then tracks, thumbs and text recolour from tokens alone. (L2-051)

### Responsive

- **AC-12** Given a 320 px viewport, when "Show my distance" renders with its description, then the text wraps beside the fixed-size control and nothing scrolls horizontally. (L2-049)
- **AC-13** Given a touch layout below 576 px, when a switch row is measured, then its clickable label is at least 44 CSS px tall and spans the row's width. (L2-049)

### Content

- **AC-14** Given the `en-CA` catalogue, when the e-mail preferences render, then every title and description comes from the catalogue and "8 am" follows the 12-hour format. (L2-052)

### Motion

- **AC-15** Given `prefers-reduced-motion: reduce`, when a switch is toggled, then the thumb moves to its end position with no transition. (L2-050)

### Performance

- **AC-16** Given a change to `bn-switch`, when the perf test runs `Switch` and `EmailPreferences` against the base branch, then neither is flagged as a possible regression. (L2-048)

## Implementation notes

- New folder `lib/switch/`: `switch.ts` (`bn-switch`, class `Switch`, provides a
  `SWITCH_ROW` token) and `switch-control.ts` (`input[bn-switch]`, class
  `SwitchControl`, host `class="switch__control"`, `role="switch"`, ARIA ids from
  the injected row). Export both.
- Styles from `.switch`, `.switch__title`, `.switch__text`, `.switch__control`,
  `.switch__control::after`, `:checked` and `.switch--label-right` in
  `components.css`, plus the decisions below (block title, thumb transition,
  disabled colours). The thumb moves with `translate` instead of the
  `left`/`right` swap so it can transition.
- The row is a `label`, so the template uses one `ng-template` for the text and
  renders it before or after the single `<ng-content select="input">`.
- Add `Switch.ts` and `EmailPreferences.ts` perf scenarios.

## Decisions

- **D-1** *Row markup: `label.switch` (settings, design system) or `div.switch` with an inner `label` (matching setup)?* `label.switch` everywhere, so the whole row toggles; the matching-setup mock is drift and catches up.
- **D-2** *Should the description be part of the accessible name, as the settings mock's wrapping label makes it?* No. The input takes `aria-labelledby` (title) and `aria-describedby` (description), which keeps the whole-row click target and gives a short name, as the matching-setup mock's `aria-describedby` intends.
- **D-3** *What does a disabled switch look like?* The design system shows a disabled specimen but `components.css` has no rule. Off track `--color-border-default`, on track `--color-fg-disabled`, muted text, `cursor: not-allowed`; the thumb position still shows the value.
- **D-4** *Does the thumb animate?* Yes, a `--duration-fast` slide under `no-preference`, because the design system's motion rule gives colour changes 240–420 ms; reduced motion removes it.
- **D-5** *Does the switch save immediately?* No: every Banaro screen with switches has a "Save changes" button, so the switch is a form value; L2-037 AC 1 "each is saved independently" means each value is stored separately, not that toggling saves.
- **D-6** *Is the title `display: block` by rule?* Yes: the mocks set it inline on every title; the component stylesheet sets it so the description sits on its own line.
