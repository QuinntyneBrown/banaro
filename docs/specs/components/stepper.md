# Stepper

| Field | Value |
|---|---|
| Selector | `bn-stepper` |
| Library path | `frontend/projects/components/src/lib/stepper/` |
| Status | planned |
| Traces to | L2-006, L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`stepper.html`](../../design-system/components/stepper.html) |
| Source mocks | [`pages/onboarding/default`](../../mocks/pages/onboarding/default.html), [`pages/onboarding/invalid`](../../mocks/pages/onboarding/invalid.html), [`pages/onboarding/skills`](../../mocks/pages/onboarding/skills.html), [`pages/onboarding/goals`](../../mocks/pages/onboarding/goals.html), [`pages/onboarding/submitting`](../../mocks/pages/onboarding/submitting.html) |
| Rendering | [`stepper.html`](stepper.html) |

## Purpose and scope

The stepper shows a new member where they are in onboarding: "Step 2 of 3 · Skills", with "About
you" already done and "Goals" still ahead. It is a progress indicator, not navigation: members move
between steps with the form's "Back" and "Continue" buttons.

Use a [progress bar](progress-bar.md) for an upload or any continuous quantity, and
[tabs](tabs.md) for peer views a member can switch between freely.

Out of scope:

- Moving between steps, saving each step and resuming at the first unfinished step (the
  onboarding page, L2-006).
- The card around it ([auth card](auth-card.md), wide layout) and the step's form
  ([form layout](form-layout.md)).

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/onboarding/default`, `pages/onboarding/invalid` | horizontal, 3 steps, current 1 | "Step 1 of 3 · About you", "Step 2 of 3 · Skills", "Step 3 of 3 · Goals" | current, upcoming | surface (inside the wide auth card) |
| `pages/onboarding/skills` | horizontal, current 2 | same | complete, current, upcoming | surface |
| `pages/onboarding/goals`, `pages/onboarding/submitting` | horizontal, current 3 | same | complete, complete, current | surface |
| `pages/onboarding/success` | not rendered | — | — | — |

## Anatomy

1. **List** — `ol.stepper`, `aria-label` "Progress". Flex row; `.stepper--vertical` stacks it.
2. **Step** — `li.stepper__step`. Its `::before` is the bar segment (`--space-1` tall, full
   radius).
3. **Position** — first `span`, "Step 2 of 3".
4. **Label** — second `span`, "Skills".
5. **Complete marker** — `span.vh` "Complete" inside a done step; screen readers only.

Host: `bn-stepper` is `display: block` and renders the `ol` inside.

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `steps` | `readonly { position: string; label: string }[]` | — | yes | One entry per step, in order. `position` is the translated "Step 1 of 3". |
| `current` | `number` | `0` | no | Zero-based index of the current step. Earlier steps are complete; later ones are upcoming. Clamped to the list. |
| `label` | `string` | — | yes | The list's `aria-label`, "Progress". |
| `completeLabel` | `string` | — | yes | Hidden text appended to each complete step, "Complete". |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | no | `vertical` adds `.stepper--vertical`. |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| None — the stepper is not interactive. | | |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| None — all copy arrives through inputs. | | |

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Horizontal | — | Onboarding, at every width. |
| Vertical | `.stepper--vertical` | A long flow in a narrow column. No current screen uses it; kept because the design system defines it. |
| With position line | two `span`s per step | Every onboarding step: "Step 1 of 3" above "About you". |

One size; each step takes an equal share of the width (`flex: 1`).

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Upcoming | index after `current` | Bar `--color-border-default`, text `--color-fg-subtle` | Read as "Step 3 of 3 Goals" |
| Current | `aria-current="step"` | Bar `--color-accent`, text `--color-fg-default` | "current step" |
| Complete | `.is-done` | Bar `--color-accent`, text `--color-fg-default` | Hidden "Complete" read after the label |
| Hover, focus, active, disabled | — | None: steps are not interactive | — |
| Invalid | — | None: a failed step shows its errors in the form, not on the stepper | — |
| Long label | text wider than its share | Wraps (`overflow-wrap: anywhere`) | Full text read |

## Markup

```html
<!-- rendered: step 2 of 3 -->
<ol class="stepper" aria-label="Progress">
  <li class="stepper__step is-done"><span>Step 1 of 3</span><span>About you</span> <span class="vh">Complete</span></li>
  <li class="stepper__step" aria-current="step"><span>Step 2 of 3</span><span>Skills</span></li>
  <li class="stepper__step"><span>Step 3 of 3</span><span>Goals</span></li>
</ol>
```

The vertical variant adds `stepper--vertical` to the `ol`; nothing else changes.

```html
<!-- consumer -->
<bn-stepper [steps]="steps()" [current]="stepIndex()" [label]="'onboarding.progress' | t" [completeLabel]="'onboarding.stepComplete' | t" />
```

Page objects locate steps by `.stepper__step`, the current one by `aria-current="step"` and done
ones by `.is-done`.

## Design

- List: flex, gap `--space-2`.
- Step: grid, gap `--space-2`, `--text-caption`, `min-width: 0`, `overflow-wrap: anywhere`.
- Bar: `::before`, height `--space-1`, radius `--radius-full`.
- No motion: the bar colour changes when the page renders the next step.

No component tokens.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Upcoming bar | `--color-border-default` | `--palette-oat-300` | `--palette-night-700` |
| Upcoming text | `--color-fg-subtle` | `--palette-stone-600` | `--palette-night-300` |
| Current and complete bar | `--color-accent` | `--palette-sage-600` | `--palette-sage-300` |
| Current and complete text | `--color-fg-default` | `--palette-ink-900` | `--palette-night-50` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-surface` | 4.5:1 | Current and complete text |
| `--color-fg-subtle` | `--color-bg-surface` | 4.5:1 | Upcoming text |
| `--color-accent` | `--color-bg-surface` | 3:1 | Current and complete bar |

The upcoming bar is decorative; the position text carries the meaning.

## Responsive behaviour

- The stepper stays horizontal at every width; at 320 px each step is about a third of the card
  and its label wraps.
- At 320 px nothing scrolls horizontally or clips; at 200 % zoom everything stays available. There
  are no touch targets.

## Accessibility

### Role and pattern

A native ordered list labelled "Progress"; the current item has `aria-current="step"`. Not a tab
list and not a link list.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Skips the stepper; no step is focusable. |

### Focus

The stepper never takes focus. After "Continue", the page moves focus to the new step's `h1`.

### Labelling

The list is named by `label`; each step reads its position and label; complete steps add the
hidden `completeLabel`. Completion is never shown by colour alone.

### Announcements

None. The step change is announced through the page's heading focus.

### Motion

None.

## Content and internationalisation

- Step names are short nouns: "About you", "Skills", "Goals".
- Position reads "Step 2 of 3"; the page builds it from the catalogue with both numbers.
- Translatable inputs: `steps[].position`, `steps[].label`, `label`, `completeLabel`. No data
  values.
- French labels run about 30 % longer and wrap within each step.

## Performance

- Change detection: `OnPush`, signal inputs; each step's state comes from a `computed` list.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Stepper.ts` renders Amara's
  onboarding at "Step 2 of 3 · Skills"; iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly 100–300 ms.
- Composite scenarios: `DarkTheme` gains the stepper.
- Regression rule: a change to the template, inputs, styles or change detection runs the perf
  test against the base branch with `--fail-on-regression` before it is pushed.
- Layout stability: the stepper's height does not depend on state, so moving between steps
  never shifts the card.

## Acceptance criteria

### Rendering

- **AC-1** Given onboarding on the skills step, when the stepper renders, then it is an `ol.stepper` labelled "Progress" with three `li.stepper__step` items reading "Step 1 of 3 About you", "Step 2 of 3 Skills" and "Step 3 of 3 Goals". (L2-006)
- **AC-2** Given the goals step, when the stepper renders, then "About you" and "Skills" have `.is-done`, "Goals" has `aria-current="step"`, and no other step has `aria-current`. (L2-006)
- **AC-3** Given a member who left after saving "About you" and returns, when onboarding resumes at the skills step, then the stepper shows "About you" complete and "Skills" current. (L2-006)

### States

- **AC-4** Given the first step in its invalid state, when the stepper renders, then it still shows "About you" as current with no error styling, and the errors appear only in the form. (L2-006)

### Keyboard and focus

- **AC-5** Given the onboarding page, when Amara tabs through it, then focus never lands on the stepper or any step. (L2-050)

### Screen readers

- **AC-6** Given the skills step, when a screen reader reads the stepper, then "About you" is followed by "Complete" and "Skills" is announced as the current step, so completion is not conveyed by colour alone. (L2-050)
- **AC-7** Given the en-CA catalogue, when the stepper renders, then "Progress", "Complete", "Step 2 of 3" and the step names come from the catalogue, not from the component. (L2-052)

### Theming

- **AC-8** Given the skills step, when the theme switches to dark, then the bars and text change through tokens only, current text keeps at least 4.5:1 and the current bar at least 3:1 against the card. (L2-051)
- **AC-9** Given the upcoming step "Goals", when its text is measured, then `--color-fg-subtle` on the card is at least 4.5:1 in both themes. (L2-050)

### Responsive

- **AC-10** Given a 320 px viewport, when the stepper renders inside the onboarding card, then all three steps stay on one row, their labels wrap, and the page has no horizontal scroll. (L2-049)

### Performance

- **AC-11** Given the `Stepper` perf-test scenario, when the perf test runs against the base branch with `--fail-on-regression`, then it is not flagged as a possible regression. (L2-048)
- **AC-12** Given Continue on the skills step, when the goals step replaces it, then the stepper keeps its height and the content below does not move because of it. (L2-048)

## Implementation notes

- New folder `frontend/projects/components/src/lib/stepper/` with `stepper.ts` (`bn-stepper`,
  class `Stepper`) and `stepper.css` copied from the `.stepper` rules in `components.css`,
  including `.stepper--vertical` and the wrapping rule. Export from `public-api.ts`.
- Add the `Stepper.ts` scenario and export it from `src/scenarios/index.ts` in the same change.
- Composes nothing; used inside `bn-auth-card` with `width="wide"`.

## Decisions

- **D-1** *The design-system page renders one text per step ("Your craft") and a hidden
  "Complete"; the mocks render "Step 2 of 3" and "Skills" with no hidden text. Which?* Both: the
  mocks' two lines, and the design system's hidden "Complete" on done steps, because L2-050
  requires completion not to rest on colour alone. The step names follow the mocks ("About you",
  "Skills", "Goals").
- **D-2** *Are completed steps links back, as the design system allows?* No. No mock links them,
  and the form's "Back" button is the only way back, so the stepper has no focus stops.
- **D-3** *What is the "descriptions" variant on the design-system page?* It renders the same as
  horizontal. The CRD takes it to be the position line ("Step 2 of 3"), the only extra text the
  mocks show.
- **D-4** *Does the stepper show an invalid step?* No. The onboarding invalid state leaves the
  stepper unchanged and shows errors in the form summary and fields.
