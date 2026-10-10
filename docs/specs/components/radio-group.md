# Radio group

| Field | Value |
|---|---|
| Selector | `bn-choices`, `bn-choice` |
| Library path | `frontend/projects/components/src/lib/radio-group/` |
| Status | planned |
| Traces to | L2-006, L2-007, L2-012, L2-016, L2-021, L2-031, L2-036, L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`radio-group.html`](../../design-system/components/radio-group.html) |
| Source mocks | [`dialogs/report/*`](../../mocks/dialogs/report/invalid.html), [`dialogs/give-feedback/*`](../../mocks/dialogs/give-feedback/default.html), [`pages/profile-edit/*`](../../mocks/pages/profile-edit/invalid.html), [`pages/project-new/*`](../../mocks/pages/project-new/default.html), [`pages/project-edit/*`](../../mocks/pages/project-edit/submitting.html), [`pages/settings/privacy`](../../mocks/pages/settings/privacy.html), [`pages/onboarding/goals`](../../mocks/pages/onboarding/goals.html), [`pages/matching-setup/*`](../../mocks/pages/matching-setup/invalid.html) |
| Rendering | [`radio-group.html`](radio-group.html) |

## Purpose and scope

The radio group asks one question with a few answers that each deserve a title
and a sentence: why you are reporting Daniel, what kind of feedback it is, who
can see your profile or project. Each answer is a **choice card** — a bordered
`label.choice` around a native radio — so the whole card is the target and the
explanation sits beside the option.

The same card holds a native checkbox when the question takes several answers
("Open to", "What are you open to?", "Who you need"). The `.choices`/`.choice`
block belongs to this component either way: `bn-choices` lays out the cards and
`bn-choice` renders one card around the projected `<input type="radio">` or
`<input type="checkbox">`.

The question itself (legend, help, error) is a [form field](form-field.md) in
group mode. Use a [checkbox](checkbox.md) row (`bn-check`) for short options
without descriptions, a [select](select.md) for a long or familiar list, and a
[switch](switch.md) for an on/off setting.

Out of scope:

- Legend, help and error — [form field](form-field.md) `mode="group"`.
- The values, defaults and what saving does — the page.
- Compact radios without a card — `input[bn-checkbox][type=radio]`
  ([checkbox](checkbox.md)); no screen uses them.

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `dialogs/report/*` | radios, vertical, 5 cards | "Why are you reporting Daniel?": "Spam or selling" / "Unwanted promotion, or messages that sell something.", "Harassment or disrespect", "Pretending to be someone else", "Inappropriate content", "Something else" | none chosen, invalid ("Choose the reason that fits best."), chosen, busy (`disabled`) | dialog surface |
| `dialogs/give-feedback/*` | radios, vertical, 3 cards | "What kind of feedback is it?": "Encouragement" / "Tell Daniel what is working.", "Question", "Suggestion" | Encouragement checked, Question checked, busy (`disabled`) | dialog surface |
| `pages/profile-edit/*` (also behind `dialogs/change-photo`, `dialogs/session-expired`) | radios, 3 cards | "Who can see my profile": "Signed-in builders" / "Everyone on Banaro can see your profile.", "Builders within 60 km", "Hidden" | checked, submitting (`disabled`) | canvas |
| `pages/profile-edit/*` | checkboxes, 3 cards | "Open to": "Co-founding" / "Looking for someone to build a company with.", "Advising", "Contributing" | checked, invalid ("Choose at least one way you are open to working with others."), submitting | canvas |
| `pages/project-new/*`, `pages/project-edit/*`, `dialogs/delete-project/*` (behind) | radios, 2 cards | "Who can see it?": "Everyone on Banaro" / "Anyone who is signed in can read it, including people outside your area.", "Members near me" / "Only builders within 40 km of you can read it." | checked, submitting | canvas |
| `pages/settings/privacy` | radios, 3 cards | "Who can see my profile": "Signed-in builders", "Only people I have messaged", "Nobody" / "Your profile is hidden. Matching and messages are paused." | checked | canvas |
| `pages/onboarding/goals`, `submitting` | checkboxes, 3 cards | "What are you open to?": "Open to co-founding" / "I'm looking for a co-founder, or happy to become one.", "Open to advising", "Open to contributing" | checked, submitting (`disabled`) | form card |
| `pages/matching-setup/*` | checkboxes, 3 cards, help "Pick all that apply." | "Who you need": "Co-founder" / "Someone to build the product with me, full time or soon.", "Advisor", "Contributor" | checked, invalid ("Choose at least one kind of person you need."), submitting | canvas |
| Design system only | horizontal (`.choices--inline`) | "What are you open to?" | — | — |

## Anatomy

1. **Choices** — `div.choices` (rendered by `bn-choices`): a one-column grid with
   `--space-3` gaps; `.choices--inline` lays cards side by side, each at least
   `--space-40` wide.
2. **Choice card** — `label.choice` (rendered by `bn-choice`): a two-column grid
   (`auto 1fr`), gaps `--space-1` × `--space-4`, padding `--space-4` ×
   `--space-5`, hairline `--color-border-default`, `--radius-md`,
   `--color-bg-surface`, pointer cursor.
3. **Native input** — the projected `<input type="radio">` or
   `<input type="checkbox">`, `--space-5` square, `accent-color: var(--color-accent)`,
   spanning both rows, nudged down `--space-1`.
4. **Title** — `span.choice__title`, `--text-label`.
5. **Description** — `span.choice__text`, second column, `--text-body-sm` in
   `--color-fg-muted`.

Host: `bn-choices` is `display: block` and renders `div.choices` around its
content. `bn-choice` is `display: block` and renders `label.choice` with the
projected input first, then the title and description spans.

## API

### Inputs

`bn-choices`:

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `inline` | `boolean` | `false` | no | Adds `.choices--inline` (cards side by side, wrapping). |

`bn-choice`:

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `label` | `string` | — | yes | The option's title, rendered in `span.choice__title`. |
| `description` | `string \| null` | `null` | no | One sentence, rendered in `span.choice__text`. |

The projected input keeps every native attribute: `type` (`radio` or
`checkbox`), `name` (one name per radio question), `value`, `checked`,
`disabled`, `required`, `aria-invalid`, `aria-describedby`, `id`,
`formControlName`.

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| None | | Native `change` on the input; forms bind to it. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `bn-choices` default | `bn-choice` elements | Rendered in order. |
| `bn-choice` `input` | exactly one native `input[type=radio]` or `input[type=checkbox]` (no `bn-checkbox`) | Projected first, inside the label. |

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Vertical (card) | `div.choices` | Every screen: one answer per row |
| Horizontal | `div.choices.choices--inline` | Two or three short options on wide screens (design system) |
| Multiple answers | checkbox inside `bn-choice` | "Open to", "Who you need", "What are you open to?" |

| Size | Modifier | Height | Padding | Type |
|---|---|---|---|---|
| One size | — | From content (at least the 44 px target) | `--space-4` `--space-5` | Title `--text-label`; text `--text-body-sm` |

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Surface card, `--color-border-default` edge | "radio button, not checked, 1 of 5" |
| Hover | `.choice:hover` | Edge `--color-border-strong` | — |
| Focus | `:focus-visible` on the input | Shared focus ring around the native input | Focus on the input |
| Checked | `.choice:has(input:checked)` | Edge `--color-accent`, fill `--color-accent-subtle`, native input checked in accent | "checked" |
| Invalid | input `aria-invalid="true"` | Edge `--color-danger-solid` on every card; error below the cards (form field) | "invalid entry"; error via `aria-describedby` |
| Disabled | input `disabled` (busy, submitting) | Fill `--color-bg-subtle`, title and text `--color-fg-muted`, `cursor: not-allowed`, no hover; a checked card keeps its accent edge | Skipped by Tab; state still read |
| None chosen | no input checked | All cards default | Tab lands on the first radio |

## Markup

```html
<!-- rendered: radio question (report dialog, invalid) -->
<fieldset class="field" aria-describedby="reason-err">
  <legend class="field__label">Why are you reporting Daniel?</legend>
  <bn-choices><div class="choices">
    <bn-choice><label class="choice">
      <input type="radio" name="reason" value="spam" id="reason-first" aria-invalid="true" aria-describedby="reason-err">
      <span class="choice__title">Spam or selling</span>
      <span class="choice__text">Unwanted promotion, or messages that sell something.</span>
    </label></bn-choice>
    <!-- … four more -->
  </div></bn-choices>
  <p class="field__error" id="reason-err"><svg class="icon icon--sm" …/><span>Choose the reason that fits best.</span></p>
</fieldset>
```

```html
<!-- rendered: checkbox card, checked, submitting -->
<bn-choice><label class="choice">
  <input type="checkbox" name="need" value="cofounder" checked disabled>
  <span class="choice__title">Co-founder</span>
  <span class="choice__text">Someone to build the product with me, full time or soon.</span>
</label></bn-choice>
```

```html
<!-- rendered: horizontal -->
<div class="choices choices--inline">…</div>
```

```html
<!-- consumer -->
<bn-field mode="group" [label]="'report.reasonLegend' | t: { name: subject().firstName }" controlId="reason" [error]="errors().reason">
  <bn-choices>
    @for (r of reasons; track r.value; let first = $first) {
      <bn-choice [label]="r.titleKey | t" [description]="r.textKey | t">
        <input type="radio" name="reason" [value]="r.value" formControlName="reason" [id]="first ? 'reason-first' : null"
               [attr.aria-invalid]="errors().reason ? 'true' : null" [attr.aria-describedby]="errors().reason ? 'reason-err' : null">
      </bn-choice>
    }
  </bn-choices>
</bn-field>
```

The first input of a question carries an `id` the error summary links to
("#reason-first", "#open-co").

## Design

- Choices: grid, gap `--space-3`; inline: `repeat(auto-fit, minmax(var(--space-40), 1fr))`.
- Card: grid `auto 1fr`, gap `--space-1` `--space-4`, padding `--space-4`
  `--space-5`, `--border-width-hairline` `--color-border-default`,
  `--radius-md`, `--color-bg-surface`.
- Input: `--space-5` square, `accent-color: var(--color-accent)`, `margin-top:
  var(--space-1)`, spans two rows.
- Title `--text-label`; text `--text-body-sm` `--color-fg-muted`.
- Motion: border and background transitions with `--duration-base`
  `--ease-standard` under `prefers-reduced-motion: no-preference` only.

Component tokens: none.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Card fill | `--color-bg-surface` | `--palette-birch-50` | `--palette-night-900` |
| Card edge | `--color-border-default` | `--palette-oat-300` | `--palette-night-700` |
| Hover edge | `--color-border-strong` | `--palette-stone-500` | `--palette-night-500` |
| Checked edge and input | `--color-accent` | `--palette-sage-600` | `--palette-sage-300` |
| Checked fill | `--color-accent-subtle` | `--palette-sage-50` | `--palette-sage-950` |
| Title | `--color-fg-default` | `--palette-ink-900` | `--palette-night-50` |
| Description | `--color-fg-muted` | `--palette-stone-700` | `--palette-night-200` |
| Invalid edge | `--color-danger-solid` | `--palette-lingon-600` | `--palette-lingon-300` |
| Disabled fill | `--color-bg-subtle` | `--palette-oat-200` | `--palette-night-800` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-surface` | 4.5:1 | Title |
| `--color-fg-muted` | `--color-bg-surface` | 4.5:1 | Description |
| `--color-fg-default` | `--color-accent-subtle` | 4.5:1 | Title on a checked card |
| `--color-fg-subtle` | `--color-accent-subtle` | 4.5:1 | Description on a checked card (`--color-fg-muted` has more contrast than this pair in both themes) |
| `--color-accent` | `--color-bg-surface` | 3:1 | Checked edge and native input |
| `--color-danger-solid` | `--color-bg-surface` | 3:1 | Invalid edge |
| `--color-border-strong` | `--color-bg-surface` | 3:1 | Native radio and checkbox outline |

The unchecked card edge (`--color-border-default`) is decorative: the native
input's own outline carries the 3:1 boundary. Forced colours: native inputs keep
system rendering; the checked card is also marked by the input's state.

## Responsive behaviour

- Vertical cards are full width at every breakpoint; titles and descriptions wrap.
- Horizontal cards wrap to one column when the row is narrower than two
  `--space-40` columns (below about 360 px of content width).
- In a dialog bottom sheet below 576 px the cards fill the sheet width.
- At 320 px nothing scrolls horizontally or clips; at 200 % zoom everything stays
  available; each card is at least 44 px tall and full width, so the target
  exceeds 44 × 44 CSS px although the native input is 20 px.

## Accessibility

### Role and pattern

Native radios in a `fieldset` with a `legend`
([APG radio group](https://www.w3.org/WAI/ARIA/apg/patterns/radio/)); native
checkboxes in a `fieldset` for multi-answer cards. No ARIA roles are added.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Radios: enter the group on the checked radio (or the first when none is checked) and leave it. Checkbox cards: move to each card. |
| <kbd>↓</kbd> / <kbd>→</kbd>, <kbd>↑</kbd> / <kbd>←</kbd> | Radios: move to and check the next / previous option, wrapping. |
| <kbd>Space</kbd> | Radios: check the focused option. Checkboxes: toggle. |

### Focus

The native input takes focus and shows the shared 2 px `--color-focus-ring` ring.
Choosing never moves focus or submits. After a failed submit the page focuses the
first invalid control, the first card's input.

### Labelling

- The legend names the group; each card's `label` names its input with the title
  and the description ("Spam or selling Unwanted promotion, or messages that
  sell something.").
- Every radio in one question shares one `name` (design system: "Give radios in
  one question the same name").
- Invalid groups: each input has `aria-invalid="true"` and names the error id.

### Announcements

None from the component.

### Motion

Border and fill transitions only, removed under `prefers-reduced-motion: reduce`.

## Content and internationalisation

- Titles are parallel and short: "Co-founding", "Advising", "Contributing";
  "Encouragement", "Question", "Suggestion".
- Descriptions are one sentence with a full stop: "Tell Daniel what is working."
- No option is pre-selected when choosing it could cause harm (report reasons
  start empty); safe defaults may be pre-selected ("Signed-in builders").
- Translatable: `label`, `description`. Data: names inside copy ("Daniel"),
  distances ("within 60 km", formatted per L2-052).

## Performance

- Change detection: `OnPush`; two signal inputs per card, no computed work.
- Perf-test scenario: add `frontend/projects/perf-test/src/scenarios/RadioGroup.ts`
  rendering the report dialog's five reasons for Daniel inside `bn-field`
  (`mode="group"`), and `ChoiceCheckboxes.ts` rendering profile "Open to" with
  "Co-founding" checked. Iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep each at roughly 100–300 ms.
- Layout stability: card heights come from text only; checking a card changes
  colours, not size.
- Weight: no dependencies; no CDK radio or listbox.

## Acceptance criteria

### Rendering

- **AC-1** Given the report dialog, when the reason question renders, then a `fieldset` with legend "Why are you reporting Daniel?" holds `div.choices` with five `label.choice` cards, each with a native radio named "reason", a `span.choice__title` and a `span.choice__text`, and none is checked. (L2-031)
- **AC-2** Given the profile form, when "Open to" renders, then three `label.choice` cards hold native checkboxes named "open", "Co-founding" checked. (L2-007)
- **AC-3** Given `bn-choices inline`, when it renders at 1280 px, then the container has `.choices.choices--inline` and the cards sit side by side, each at least `--space-40` wide. (L2-049)

### States

- **AC-4** Given the give-feedback dialog, when Amara chooses "Question", then that card's edge becomes `--color-accent` with a `--color-accent-subtle` fill and "Encouragement" returns to the default card. (L2-016)
- **AC-5** Given the report dialog submitted with no reason, when the error shows, then every radio has `aria-invalid="true"` and `aria-describedby="reason-err"`, every card edge is `--color-danger-solid`, and "Choose the reason that fits best." shows below the cards. (L2-031)
- **AC-6** Given the matching-setup form with no "Who you need" card checked, when saved, then the three checkbox cards are invalid and the group shows "Choose at least one kind of person you need." (L2-021)
- **AC-7** Given the project form is submitting, when the visibility radios are `disabled`, then "Everyone on Banaro" stays visibly checked, every card shows the `--color-bg-subtle` fill and muted text, and none can be focused or changed. (L2-012)
- **AC-8** Given a hovered, unchecked card, when the pointer is over it, then its edge is `--color-border-strong`. (L2-050)

### Keyboard and focus

- **AC-9** Given focus on the checked "Signed-in builders" radio on the privacy settings page, when ↓ is pressed, then "Only people I have messaged" becomes checked and focused, and a 2 px `--color-focus-ring` ring is visible around it. (L2-036)
- **AC-10** Given the report dialog with no reason checked, when the person tabs into the group, then focus lands on "Spam or selling", and one further Tab leaves the group. (L2-050)
- **AC-11** Given onboarding "What are you open to?" checkbox cards, when the person presses Space on "Open to advising", then it toggles without changing "Open to co-founding". (L2-006)

### Screen readers

- **AC-12** Given the report dialog, when "Spam or selling" is focused, then a screen reader announces the legend "Why are you reporting Daniel?", the name "Spam or selling Unwanted promotion, or messages that sell something.", "radio button, not checked, 1 of 5". (L2-050)
- **AC-13** Given a checked card, when rendered, then its state is conveyed by the native checked radio as well as the accent edge, not by colour alone. (L2-050)

### Theming

- **AC-14** Given both themes, when a checked card renders, then the title and description on `--color-accent-subtle` measure at least 4.5:1 and the accent edge at least 3:1 against `--color-bg-surface`. (L2-050)
- **AC-15** Given the theme switch, when it toggles, then cards recolour from tokens alone. (L2-051)

### Responsive

- **AC-16** Given a 320 px viewport, when the report dialog shows "Pretending to be someone else" with its description, then the text wraps inside the card, each card is at least 44 px tall, and nothing scrolls horizontally. (L2-049)

### Content

- **AC-17** Given the `en-CA` catalogue, when the give-feedback question renders, then "Encouragement", "Tell Daniel what is working.", "Question" and "Suggestion" come from the catalogue with the builder's name interpolated. (L2-052)

### Motion

- **AC-18** Given `prefers-reduced-motion: reduce`, when a card is checked, then its edge and fill change with no transition. (L2-050)

### Performance

- **AC-19** Given a change to `bn-choices` or `bn-choice`, when the perf test runs `RadioGroup` and `ChoiceCheckboxes` against the base branch, then neither is flagged as a possible regression. (L2-048)

## Implementation notes

- New folder `lib/radio-group/` with `choices.ts` (`bn-choices`, class
  `Choices`) and `choice.ts` (`bn-choice`, class `Choice`), styles extracted from
  `.choices`, `.choices--inline`, `.choice`, `.choice input`, `.choice__title`,
  `.choice__text` and `.choice:has(input:checked)` in `components.css`, plus the
  hover, invalid and disabled rules decided below.
- The input is projected, and emulated encapsulation does not reach projected
  nodes, so `bn-choice` uses `ViewEncapsulation.None` with every selector
  scoped under `.choice` (`.choice input`, `.choice:has(input:checked)`).
- No CDK primitive: native radios already implement the APG pattern.
- Export both from `public-api.ts`; add `RadioGroup.ts` and `ChoiceCheckboxes.ts`
  perf scenarios.

## Decisions

- **D-1** *What selector does the radio group use, given the same cards hold checkboxes?* `bn-choices` and `bn-choice`, named after the `.choices`/`.choice` block the mocks and design system use, because one component serves radio and checkbox cards and a `bn-radio-group` name would mislabel the checkbox questions.
- **D-2** *Does the component own the fieldset and legend?* No: `bn-field mode="group"` does, so radio questions, checkbox-card questions and chip questions share one label, help and error pattern (see the form-field CRD). The settings privacy mock's `fieldset.choices` is rendered as `fieldset.field > bn-choices`.
- **D-3** *How does an invalid group look?* The design system renders no invalid card style. Every card edge turns `--color-danger-solid` while the error text and `aria-invalid` carry the meaning, matching how the checkbox box and select show invalid. The report mock's error has no icon; the form field always renders it.
- **D-4** *Hover and disabled looks?* Not in `components.css`. Hover strengthens the edge to `--color-border-strong`; disabled uses `--color-bg-subtle` and `--color-fg-muted` with `cursor: not-allowed`, the same roles the text field uses when read-only, because busy dialogs and submitting pages disable every card.
- **D-5** *What is in the accessible name?* Title and description, because both sit inside the native `label` as the mocks show; it keeps the markup native and the description is the reason to choose.
