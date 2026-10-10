# Slider

| Field | Value |
|---|---|
| Selector | `bn-slider`, `input[bn-slider]` |
| Library path | `frontend/projects/components/src/lib/slider/` |
| Status | planned |
| Traces to | L2-010, L2-021, L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`slider.html`](../../design-system/components/slider.html) |
| Source mocks | [`pages/directory/default`](../../mocks/pages/directory/default.html), [`pages/directory/filtered`](../../mocks/pages/directory/filtered.html), [`pages/matching-setup/default`](../../mocks/pages/matching-setup/default.html), [`pages/matching-setup/submitting`](../../mocks/pages/matching-setup/submitting.html), [`dialogs/say-hello/default`](../../mocks/dialogs/say-hello/default.html), [`notifications/toast/default`](../../mocks/notifications/toast/default.html) |
| Rendering | [`slider.html`](slider.html) |

## Purpose and scope

The slider sets a distance: how far from Leslieville the directory looks for
builders, and how far a member will travel for a match. It is a native
`<input type="range">` with a visible label, the current value in words, and
the two ends of the scale, so the value is never only a thumb position.

`bn-slider` renders the `.range` composition (label row, ends) around a
projected native range input, which `input[bn-slider]` styles as
`.range__input`.

Use a [text field](text-field.md) of `type="number"` when an exact number
matters more than a feel for the range, and a [select](select.md) or
[radio group](radio-group.md) for a few named distances.

Out of scope:

- What the value filters, the 250 ms debounce of results and the URL — the page
  (L2-010).
- Formatting the value words — the page passes formatted strings (L2-052).

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/directory/*` (also behind `dialogs/say-hello/*`, `notifications/toast/*`) | label carries the value; min 1, max 60, value 40; ends hidden from assistive technology | label "Within 40 km of Leslieville"; `aria-valuetext` "40 kilometres"; ends "1 km", "60 km" | default | filter sidebar / bottom sheet |
| `pages/matching-setup/default`, `invalid` | label + separate value; min 5, max 60, step 5, value 40 | label "How far you will travel", value "40 km"; `aria-valuetext` "40 kilometres from Leslieville"; ends "5 km", "60 km" | default | canvas |
| `pages/matching-setup/submitting` | as above, `disabled` | — | disabled | canvas |
| Design system only | slider plus a companion number input "Distance (km)" and an `output` "Within 40 km" | "Distance from Leslieville" | hover, focus, active, disabled | — |

## Anatomy

1. **Range** — `div.range` (rendered by `bn-slider`): a grid with `--space-3` gaps.
2. **Label row** — `label.range__label[for]`: a flex row, `space-between`,
   `--space-3` gap, `--text-body-sm`; holds the label `span` and, optionally, the
   value `span`.
3. **Input** — `input.range__input[type=range]` (`input[bn-slider]`): full width,
   `min-height: var(--target-comfortable)`, `accent-color: var(--color-accent)`.
4. **Ends** — `div.range__ends[aria-hidden=true]`: two `span`s at each end,
   `--text-caption` in `--color-fg-subtle`.
5. **Companion number input (optional)** — a projected `input[bn-input][type=number]`
   with its own visible label, after the ends.

Host: `bn-slider` is `display: block` and renders `div.range` with the projected
range input between the label row and the ends. `input[bn-slider]` is an
attribute component on the native range input (empty template).

## API

### Inputs

`bn-slider`:

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `controlId` | `string` | — | yes | The range input's `id`; the label's `for`. |
| `label` | `string` | — | yes | The visible label ("How far you will travel", or "Within 40 km of Leslieville" when the label states the value). |
| `valueText` | `string \| null` | `null` | no | The current value as shown ("40 km"). When set, renders a second `span` in the label row, `aria-hidden="true"` (the input's `aria-valuetext` carries it). |
| `minText` | `string` | — | yes | The low end as shown ("5 km"). |
| `maxText` | `string` | — | yes | The high end as shown ("60 km"). |

`input[bn-slider]`: no inputs; it adds `class="range__input"`. The consumer sets
`type="range"`, `id`, `name`, `min`, `max`, `step`, `value` /
`formControlName`, `disabled` and `aria-valuetext` (the value in words, such as
"40 kilometres from Leslieville").

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| None | | Native `input` (while moving) and `change` (on release); forms bind to the input. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `input[type=range]` | exactly one `input[bn-slider]` | Projected between the label row and the ends. |
| `[slot=number]` | a labelled companion `input[bn-input][type=number]` with the same `min`, `max` and value | Optional; projected after the ends. |

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Label with value | `valueText` set | Matching setup: "How far you will travel" … "40 km" |
| Value in the label | `label` holds the value, no `valueText` | Directory filter: "Within 40 km of Leslieville" |
| With ends (ticks) | always | Both screens show the scale's ends |
| With companion number | `[slot=number]` | The design system's "Offer a number input next to the distance slider"; no screen uses it yet |

| Size | Modifier | Height | Padding | Type |
|---|---|---|---|---|
| One size | — | Input `--target-comfortable` | — | Label `--text-body-sm`; ends `--text-caption` |

The slider is 100 % of its container's width.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Native track and thumb tinted `--color-accent` | "slider, 40 kilometres" |
| Hover | `:hover` | Native thumb hover | — |
| Focus | `:focus-visible` | Shared focus ring around the input box | Focus on the input |
| Active / dragging | `:active` | Thumb follows the pointer; label value updates live | `aria-valuetext` updates |
| Disabled | `disabled` (submitting) | Native disabled track and thumb (greyed); label and ends unchanged | Skipped by Tab; value still read |
| At minimum / maximum | `value` = `min` / `max` | Thumb at the end | "5 kilometres" |

## Markup

```html
<!-- rendered: label with value (matching setup) -->
<bn-slider>
  <div class="range">
    <label class="range__label" for="distance"><span>How far you will travel</span><span aria-hidden="true">40 km</span></label>
    <input bn-slider class="range__input" id="distance" name="distance" type="range" min="5" max="60" step="5" value="40"
           aria-valuetext="40 kilometres from Leslieville">
    <div class="range__ends" aria-hidden="true"><span>5 km</span><span>60 km</span></div>
  </div>
</bn-slider>
```

```html
<!-- rendered: value in the label (directory) -->
<div class="range">
  <label class="range__label" for="distance"><span>Within 40 km of Leslieville</span></label>
  <input bn-slider class="range__input" id="distance" name="distance" type="range" min="1" max="60" value="40" aria-valuetext="40 kilometres">
  <div class="range__ends" aria-hidden="true"><span>1 km</span><span>60 km</span></div>
</div>
```

```html
<!-- consumer -->
<bn-slider controlId="distance" [label]="'matching.distanceLabel' | t" [valueText]="km(distance())"
           [minText]="km(5)" [maxText]="km(60)">
  <input bn-slider type="range" id="distance" name="distance" min="5" max="60" step="5" formControlName="distance"
         [attr.aria-valuetext]="'matching.distanceValueText' | t: { km: distance(), place: hood() }">
</bn-slider>
```

## Design

- Range: grid, gap `--space-3`.
- Label row: flex, `justify-content: space-between`, gap `--space-3`,
  `--text-body-sm`, `--color-fg-default`.
- Input: width 100 %, `min-height: var(--target-comfortable)`,
  `accent-color: var(--color-accent)`; track and thumb are the platform's,
  tinted by `accent-color`.
- Ends: flex, `space-between`, `--text-caption` in `--color-fg-subtle`.
- Motion: none beyond the native thumb.

Component tokens: none.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Thumb and filled track | `--color-accent` | `--palette-sage-600` | `--palette-sage-300` |
| Label and value | `--color-fg-default` | `--palette-ink-900` | `--palette-night-50` |
| Ends | `--color-fg-subtle` | `--palette-stone-600` | `--palette-night-300` |
| Focus ring | `--color-focus-ring` | `--palette-sage-700` | `--palette-sage-300` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-accent` | `--color-bg-canvas` | 3:1 | Thumb against the page |
| `--color-accent` | `--color-bg-surface` | 3:1 | Thumb against a card or sheet |
| `--color-fg-default` | `--color-bg-canvas` | 4.5:1 | Label and value |
| `--color-fg-subtle` | `--color-bg-canvas` | 4.5:1 | Ends |
| `--color-focus-ring` | `--color-bg-canvas` | 3:1 | Focus ring |

The unfilled track is drawn by the platform; `accent-color` keeps it within
system contrast. Forced colours: the native range uses system colours.

## Responsive behaviour

- Full width at every breakpoint; in the directory the filters become a bottom
  sheet below 992 px (L2-010 AC 6) and the slider fills the sheet.
- In the label row the label text wraps within its column and the value stays at
  the row's right end (`justify-content: space-between`).
- At 320 px nothing scrolls horizontally or clips; at 200 % zoom everything stays
  available; the input is `--target-comfortable` (44 px) tall and full width.

## Accessibility

### Role and pattern

Native `<input type="range">` ([APG slider](https://www.w3.org/WAI/ARIA/apg/patterns/slider/)).

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Enter and leave. |
| <kbd>→</kbd> / <kbd>↑</kbd> | Increase by one `step`. |
| <kbd>←</kbd> / <kbd>↓</kbd> | Decrease by one `step`. |
| <kbd>Page Up</kbd> / <kbd>Page Down</kbd> | Larger step (platform). |
| <kbd>Home</kbd> / <kbd>End</kbd> | Minimum / maximum. |

### Focus

The input takes focus and shows the shared 2 px `--color-focus-ring` ring.
Changing the value never moves focus.

### Labelling

- Name from `label.range__label`'s first `span` (the value `span` is
  `aria-hidden`, so the name stays "How far you will travel" while moving).
- `aria-valuetext` gives the value with its unit in words ("40 kilometres from
  Leslieville"); a bare number is never the only value.
- Ends are `aria-hidden="true"`: they repeat `min` and `max`.
- WCAG 2.5.7 (dragging movements): a single click or tap on the track sets the
  value, and the arrow keys work, so dragging is never required; the companion
  number input is available for screens that want an exact entry.

### Announcements

None from the slider; the directory announces its new result count after the
filter applies (L2-050 AC 4).

### Motion

None.

## Content and internationalisation

- The label says what the distance means: "How far you will travel", "Within 40
  km of Leslieville". Always with the unit (design system: "Do not label the
  value as 40 without km").
- Values use kilometres per L2-052 ("5 km", "40 km"; one decimal under 10 km
  when not on a step).
- Translatable: `label`, `valueText`, `minText`, `maxText`, `aria-valuetext`
  (all formatted by the page). Data: the neighbourhood name ("Leslieville").

## Performance

- Change detection: `OnPush`; inputs are strings, so moving the thumb re-renders
  only the label row when the page updates `valueText`.
- Perf-test scenario: add `frontend/projects/perf-test/src/scenarios/Slider.ts`
  rendering the matching-setup "How far you will travel" slider at 40 km (5–60 km,
  step 5). Iterations in `e2e/perf-test/config/scenario-iterations.mjs` keep it
  at roughly 100–300 ms.
- Composite scenarios: the directory filter-panel scenario of the search and
  filter toolbar CRD includes it.
- Layout stability: fixed input height; the value `span` uses tabular figures so
  "5 km" to "60 km" does not shift the label.
- Weight: no dependencies; no CDK slider.

## Acceptance criteria

### Rendering

- **AC-1** Given the matching-setup form, when the distance slider renders, then `div.range` holds `label.range__label[for=distance]` with "How far you will travel" and "40 km", `input.range__input[type=range]` with min 5, max 60, step 5 and value 40, and `div.range__ends` with "5 km" and "60 km". (L2-021)
- **AC-2** Given the directory filters, when the distance slider renders, then its label reads "Within 40 km of Leslieville", the input's value is 40, and the ends "1 km" and "60 km" are `aria-hidden="true"`. (L2-010)

### States

- **AC-3** Given the matching-setup slider at 40 km, when Amara presses → once, then the value becomes 45, the visible value reads "45 km" and `aria-valuetext` reads "45 kilometres from Leslieville". (L2-021)
- **AC-4** Given the matching-setup form is submitting, when the slider is `disabled`, then it shows the native disabled look, keeps the value 40 and cannot be moved or focused. (L2-021)
- **AC-5** Given the slider at 40, when Amara clicks the track near "60 km", then the value jumps there without dragging. (L2-050)

### Keyboard and focus

- **AC-6** Given focus on the slider, when Home and End are pressed, then the value goes to 5 and 60, focus stays on the slider, and a 2 px `--color-focus-ring` ring is visible with at least 3:1 contrast. (L2-050)

### Screen readers

- **AC-7** Given the matching-setup slider, when it receives focus, then a screen reader announces "How far you will travel, slider, 40 kilometres from Leslieville" and not the end labels. (L2-050)

### Theming

- **AC-8** Given both themes, when the slider renders on `--color-bg-canvas`, then the accent thumb measures at least 3:1, the label at least 4.5:1 and the ends at least 4.5:1. (L2-050)
- **AC-9** Given the theme switch, when it toggles, then the slider's accent, label and ends recolour from tokens alone. (L2-051)

### Responsive

- **AC-10** Given a 320 px viewport, when the directory filter sheet shows the slider, then it fills the sheet width, its input is at least 44 px tall, and nothing scrolls horizontally. (L2-049)

### Content

- **AC-11** Given the `en-CA` locale, when the slider shows 5, 40 and 60, then the texts read "5 km", "40 km" and "60 km" from the catalogue and formatter. (L2-052)

### Performance

- **AC-12** Given a change to `bn-slider`, when the perf test runs `Slider` against the base branch, then it is not flagged as a possible regression. (L2-048)

## Implementation notes

- New folder `lib/slider/`: `slider.ts` (`bn-slider`, class `Slider`) and
  `slider-input.ts` (`input[bn-slider]`, class `SliderInput`, host class
  `range__input`). Export both.
- Styles from `.range`, `.range__label`, `.range__input` and `.range__ends` in
  `components.css`. Ignore the second `.range { width: 100%; accent-color }` rule
  (it styles the design-system specimen's bare input).
- Add `font-variant-numeric: tabular-nums` on the value `span`.
- Add the `Slider.ts` perf scenario.

## Decisions

- **D-1** *The design-system page shows `input.range` inside a `.field` with a companion number input and an `output`; the mocks use the `.range`/`.range__label`/`.range__ends` composition with no number input. Which markup?* The mocks' composition, which both screens use and the e2e page objects will locate. The number input is offered as an optional `[slot=number]` so the design system's "Offer a number input" can be met without changing the API. Raised with the lead.
- **D-2** *Is a slider without the number input accessible?* Yes: the native range sets its value from a single click or tap on the track and from the keyboard, which satisfies WCAG 2.5.7, and `aria-valuetext` reads the value with its unit.
- **D-3** *Are the ends announced?* No: they repeat min and max; the directory mock already hides them and the matching mock gains `aria-hidden` for consistency.
- **D-4** *Is the visible value part of the name?* No: it is `aria-hidden` so the name does not change while the thumb moves; `aria-valuetext` announces the value.
- **D-5** *L2-010 AC 2 defines distance options of 5, 10, 25 and 40 km and "Anywhere in the GTA", while the directory mock shows a 1–60 km slider. Which applies?* This CRD specifies the slider as the mocks show it; the slider supports `step` and any `min`/`max`, but "Anywhere in the GTA" is not a slider value. Product must settle the directory's distance control; raised with the lead.
