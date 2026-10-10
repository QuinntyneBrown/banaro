# Checkbox

| Field | Value |
|---|---|
| Selector | `input[bn-checkbox]`, `bn-check` |
| Library path | `frontend/projects/components/src/lib/checkbox/` |
| Status | built |
| Traces to | L2-001, L2-010, L2-012, L2-014, L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`checkbox.html`](../../design-system/components/checkbox.html) |
| Source mocks | [`pages/join/default`](../../mocks/pages/join/default.html), [`pages/join/invalid`](../../mocks/pages/join/invalid.html), [`pages/join/submitting`](../../mocks/pages/join/submitting.html), [`pages/directory/default`](../../mocks/pages/directory/default.html), [`pages/directory/filtered`](../../mocks/pages/directory/filtered.html), [`pages/project-new/invalid`](../../mocks/pages/project-new/invalid.html), [`pages/project-edit/submitting`](../../mocks/pages/project-edit/submitting.html), [`dialogs/say-hello/default`](../../mocks/dialogs/say-hello/default.html), [`notifications/toast/default`](../../mocks/notifications/toast/default.html) |
| Rendering | [`checkbox.html`](checkbox.html) |

## Purpose and scope

The checkbox lets a person pick any number of options independently — the roles,
"Open to" values and neighbourhoods that filter the directory, the kinds of help
a project is looking for — or agree to something, such as the code of conduct on
`/join`. It is a native `<input type="checkbox">` so Space, form submission and
assistive technology work without script.

Two pieces build it:

- `input[bn-checkbox]` styles the native input as the 20 px `.check__box`
  (checked tick, indeterminate dash, invalid border). It also renders a round
  box for `type="radio"`.
- `bn-check` is the **check row**: a full-height `label.check` that holds the
  projected input, its label text (which may contain links) and an optional
  count. The whole 44 px row is the click target. The built `bn-check` is this
  row; this CRD adds its count.

Use the [radio group](radio-group.md) choice cards (`.choice`) when each option
needs a title and a sentence — they host native checkboxes too ("Open to",
"Who you need") and are specified there. Use a [switch](switch.md) for a
setting that takes effect on its own, and toggle chips for skills (L2-010 AC 5).

Out of scope:

- The group's legend, help and error — [form field](form-field.md) in group mode,
  or the directory's `.filter` fieldset in the
  [search and filter toolbar](search-filter-toolbar.md).
- What a change does (filtering results, counting) — the page.
- Choice cards (`.choice`) — [radio group](radio-group.md).

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/join/*` | single `bn-check`, `id="agree"`, label with two links, followed by `bn-field-error` | "I will follow the code of conduct (opens in a new tab) and have read the privacy policy." | unchecked, invalid ("Agree to the code of conduct to join"), checked (submitting) | form card |
| `pages/directory/*` (also behind `dialogs/say-hello`, `notifications/toast`) | rows with counts inside `fieldset.filter > ul.filter__list` | Role: "Founders" 214, "Engineers" 486, "Designers" 231, "Product managers" 198, "Other" 155; Open to: "Co-founding" 173 …; Neighbourhood or city: "Downtown Toronto" 512 … | unchecked, checked ("Founders" in `filtered`), hover | filter sidebar or bottom sheet |
| `pages/project-new/*`, `pages/project-edit/*` (also behind `dialogs/delete-project`) | rows without counts in `ul.check-grid` inside a group field "Who are you looking for?" | "Technical co-founder", "Co-founder", "Contributors", "Advisor", "Engineer", "Designer", "Feedback only" | unchecked, checked, invalid group ("Choose at least one kind of help, or pick “Feedback only”."), submitting (`disabled`) | canvas |
| Design system only | indeterminate; invalid single box; count with context "486 builders" | "Roles to include" | indeterminate | — |

## Anatomy

1. **Row** — `label.check` (rendered by `bn-check`): a three-column grid
   (`auto 1fr auto`) with `--space-3` gaps, `min-height: var(--target-comfortable)`,
   `--space-2` inline padding, `--radius-sm`, `--text-body-sm`, pointer cursor.
2. **Box** — `input.check__box` (`input[bn-checkbox]`): 20 px square
   (`--space-5`), `--radius-xs`, hairline `--color-border-strong`,
   `--color-bg-surface`; a tick drawn with `::after` in `--color-fg-on-accent`.
3. **Label text** — `span`, the second grid column; may contain links and
   visually hidden text.
4. **Count (optional)** — `span.check__count`, the third column:
   `--color-fg-subtle`, tabular figures, with optional visually hidden context.

Host: `input[bn-checkbox]` is an attribute component on the native input (empty
template, class `check__box`). `bn-check` is `display: block` and renders
`label.check` with the projected input first.

## API

### Inputs

`input[bn-checkbox]`:

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `invalid` | `boolean` | `false` | no | `true` sets `aria-invalid="true"` (danger border); `false` removes it. |
| `indeterminate` | `boolean` | `false` | no | Sets the element's `indeterminate` DOM property (a dash, read as "mixed"). Cleared by the browser when the person clicks; the consumer resets it from its model. |

Consumer attributes pass through: `type="checkbox"` (or `"radio"`), `id`,
`name`, `value`, `checked`, `disabled`, `required`, `aria-describedby`,
`formControlName`.

`bn-check`:

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `count` | `string \| null` | `null` | no | Pre-formatted count ("214", "1,284"). When set, renders `span.check__count`. |
| `countContext` | `string \| null` | `null` | no | Visually hidden words after the count, such as " builders", so the name reads "Founders 214 builders". |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| None | | Native `change`; forms bind to the input. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `input` (`bn-check`) | exactly one `input[bn-checkbox]` | Projected first, so it sits in the box column. |
| default (`bn-check`) | phrasing content: text, `a`, `span.vh` | Projected inside the label `span`. Links inside work without toggling the box. |

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Single agreement | `bn-check` + `bn-field-error` | Join's code-of-conduct agreement |
| Filter row with count | `bn-check count="214"` | Directory facets (L2-010 AC 1: each option shows its count) |
| Group row | `bn-check` in `ul.check-grid` | A short multi-select inside a form ("Who are you looking for?") |
| Indeterminate | `indeterminate` | A parent that summarises some-but-not-all children (design system) |
| Round | `type="radio"` on `input[bn-checkbox]` | Compact single choice in a list; no screen uses it — prefer [radio group](radio-group.md) |

`ul.check-grid` (a list with `--space-1` gaps that becomes two columns from
40 rem) is a layout utility shipped in the components library's global
utilities; each `li` holds one `bn-check`.

| Size | Modifier | Height | Padding | Type |
|---|---|---|---|---|
| One size | — | Row `--target-comfortable`; box `--space-5` | Row `0 var(--space-2)` | `--text-body-sm` |

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Unchecked | — | Surface box, strong border | "not checked" |
| Hover | `.check:hover` | Row fill `--color-bg-subtle` | — |
| Focus | `:focus-visible` on the input | Shared focus ring around the box | Focus on the input |
| Active | `:active` | As hover | — |
| Checked | `:checked` | Box fill and border `--color-accent`, tick `--color-fg-on-accent` | "checked" |
| Indeterminate | `:indeterminate` | Accent fill with a horizontal dash | "mixed" |
| Invalid | `aria-invalid="true"` | Box border `--color-danger-solid`; error text below via `bn-field-error` or the group field | "invalid entry"; error via `aria-describedby` |
| Disabled | `disabled` | Box fill `--color-bg-subtle`, border `--color-border-default`; checked box fill `--color-fg-disabled`; label `--color-fg-muted`; no hover fill; `cursor: not-allowed` | "dimmed/unavailable"; skipped by Tab |
| Checked while submitting | `checked disabled` | As disabled, checked | As disabled |

## Markup

```html
<!-- rendered: agreement row (join, invalid) -->
<bn-check>
  <label class="check">
    <input bn-checkbox class="check__box" type="checkbox" id="agree" name="agree" aria-invalid="true" aria-describedby="agree-err">
    <span>I will follow the <a href="/code-of-conduct" target="_blank" rel="noopener">code of conduct<span class="vh"> (opens in a new tab)</span></a> and have read the <a href="/privacy">privacy policy</a>.</span>
  </label>
</bn-check>
<bn-field-error><p class="field__error" id="agree-err">…<span>Agree to the code of conduct to join</span></p></bn-field-error>
```

```html
<!-- rendered: filter row with count (directory) -->
<li><bn-check><label class="check">
  <input bn-checkbox class="check__box" type="checkbox" name="role" value="Founders" checked>
  <span>Founders</span>
  <span class="check__count">214<span class="vh"> builders</span></span>
</label></bn-check></li>
```

```html
<!-- rendered: group row, submitting -->
<li><bn-check><label class="check">
  <input bn-checkbox class="check__box" type="checkbox" name="looking" value="Technical co-founder" checked disabled>
  <span>Technical co-founder</span>
</label></bn-check></li>
```

```html
<!-- consumer -->
<ul class="filter__list">
  @for (role of roleFacets(); track role.value) {
    <li><bn-check [count]="role.count | number" [countContext]="'directory.buildersSuffix' | t">
      <input type="checkbox" bn-checkbox name="role" [value]="role.value" [checked]="role.selected" (change)="toggle('role', role.value)">
      {{ role.labelKey | t }}
    </bn-check></li>
  }
</ul>
```

The project mocks render an empty third `span` in rows without a count; it has
no visual or semantic effect and the component omits it.

## Design

- Row: grid `auto 1fr auto`, `align-items: center`, gap `--space-3`,
  `min-height: var(--target-comfortable)`, padding `0 var(--space-2)`,
  `--radius-sm`, `--text-body-sm`.
- Box: `--space-5` square, `--radius-xs`, `--border-width-hairline`
  `--color-border-strong`, `--color-bg-surface`, `appearance: none`, centred tick.
- Tick: `--space-2` × `--space-1`, `--border-width-thick` strokes in
  `--color-fg-on-accent`, rotated; indeterminate dash: the same stroke, unrotated.
- Round (radio): `--radius-full`; dot `--space-2`.
- Count: `--color-fg-subtle`, `font-variant-numeric: tabular-nums`.
- Motion: the tick fades with `--duration-fast` `--ease-standard`; the row's
  background, colour and border transition with `--duration-fast` /
  `--duration-base`; both only under `prefers-reduced-motion: no-preference`.

Component tokens: none; the box and row read semantic tokens directly.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Box border | `--color-border-strong` | `--palette-stone-500` | `--palette-night-500` |
| Box fill | `--color-bg-surface` | `--palette-birch-50` | `--palette-night-900` |
| Checked fill and border | `--color-accent` | `--palette-sage-600` | `--palette-sage-300` |
| Tick | `--color-fg-on-accent` | `--palette-birch-50` | `--palette-sage-950` |
| Row hover | `--color-bg-subtle` | `--palette-oat-200` | `--palette-night-800` |
| Label | `--color-fg-default` | `--palette-ink-900` | `--palette-night-50` |
| Count | `--color-fg-subtle` | `--palette-stone-600` | `--palette-night-300` |
| Invalid border | `--color-danger-solid` | `--palette-lingon-600` | `--palette-lingon-300` |
| Disabled border | `--color-border-default` | `--palette-oat-300` | `--palette-night-700` |
| Disabled checked fill | `--color-fg-disabled` | `--palette-oat-400` | `--palette-night-500` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-border-strong` | `--color-bg-surface` | 3:1 | Unchecked box edge |
| `--color-border-strong` | `--color-bg-canvas` | 3:1 | Box on the page (filter sidebar) |
| `--color-accent` | `--color-bg-surface` | 3:1 | Checked box against the card |
| `--color-fg-on-accent` | `--color-accent` | 4.5:1 | Tick on the checked box |
| `--color-fg-default` | `--color-bg-subtle` | 4.5:1 | Label on a hovered row |
| `--color-fg-subtle` | `--color-bg-canvas` | 4.5:1 | Count |
| `--color-fg-subtle` | `--color-bg-subtle` | 4.5:1 | Count on a hovered row |
| `--color-danger-solid` | `--color-bg-surface` | 3:1 | Invalid box edge |

Forced colours: the box falls back to the native checkbox (`appearance: auto`).

## Responsive behaviour

- Rows fill their container; long labels wrap in the middle column and the count
  stays top-aligned to the row's centre line.
- `ul.check-grid` is one column below 40 rem and two columns from 40 rem.
- In the directory below 992 px the filter rows live in a bottom sheet (L2-010
  AC 6); the rows are unchanged.
- At 320 px nothing scrolls horizontally or clips; at 200 % zoom everything stays
  available; every row is at least `--target-comfortable` (44 px) tall and full
  width, so the whole target exceeds 44 × 44 CSS px although the box is 20 px.

## Accessibility

### Role and pattern

Native checkbox ([APG checkbox](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/)),
labelled by its wrapping `label`. Groups use `fieldset`/`legend`.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Move to each checkbox, then to links inside a label. |
| <kbd>Space</kbd> | Toggle the focused checkbox. |
| <kbd>Enter</kbd> | On a link inside the label: follow it. On the checkbox: implicit form submission (native). |

### Focus

The input takes focus; the shared `:focus-visible` ring (2 px
`--color-focus-ring`, 3 px offset, `--radius-sm`) surrounds the box. Toggling
never moves focus; a filter change never steals focus to the results.

### Labelling

- The wrapping `label.check` names the input with its text and count:
  "Founders 214 builders".
- Links inside the label keep their own names; "(opens in a new tab)" is
  visually hidden text inside the link.
- An invalid single checkbox names its error with `aria-describedby`; a group's
  error is described by the group field (form field CRD).

### Announcements

None from the checkbox. The page announces the new result count after a filter
change (L2-050 AC 4).

### Motion

The tick fade and row colour transitions are removed under
`prefers-reduced-motion: reduce`.

## Content and internationalisation

- Labels are short nouns, sentence case, parallel: "Founders", "Engineers",
  "Designers"; "Technical co-founder", "Feedback only".
- Counts are numbers of matching builders, formatted with thousands separators
  ("1,284") per L2-052; the hidden context word ("builders") is translated.
- Agreement text is a full sentence ending in a full stop, links inline.
- Translatable: label text, `countContext`, link text. Data: facet values from
  the API (neighbourhood names), counts.

## Performance

- Change detection: `OnPush`; `bn-check` has two signal inputs; the box has two.
- Perf-test scenarios: add `frontend/projects/perf-test/src/scenarios/Checkbox.ts`
  rendering the join agreement row (unchecked, with both links) and the
  composite `FilterChecks.ts` rendering the directory's Role group — five rows
  "Founders" 214 … "Other" 155 — because it repeats on every directory render.
  Iterations in `e2e/perf-test/config/scenario-iterations.mjs` keep each at
  roughly 100–300 ms.
- Layout stability: row height is fixed by `--target-comfortable`; counts use
  tabular figures so changing numbers do not shift the label; filter skeletons
  match the row height.
- Weight: no dependencies.

## Acceptance criteria

### Rendering

- **AC-1** Given the join form, when the agreement renders, then a `label.check` holds `input.check__box[type=checkbox]#agree` first and the sentence "I will follow the code of conduct and have read the privacy policy." with two working links. (L2-001)
- **AC-2** Given the directory Role filter, when it renders, then each option is a `label.check` with the box, the label and a `span.check__count` ("Founders" 214, "Engineers" 486, "Designers" 231, "Product managers" 198, "Other" 155) inside a `fieldset` with a `legend`. (L2-010)
- **AC-3** Given the project form's "Who are you looking for?" group, when it renders, then its seven options are `bn-check` rows in `ul.check-grid`, one column below 40 rem and two columns from 40 rem. (L2-012)

### States

- **AC-4** Given an unchecked box, when Amara checks "Founders", then the box fills with `--color-accent`, shows the `--color-fg-on-accent` tick, and the input's `checked` property is true. (L2-010)
- **AC-5** Given the join form submitted without agreeing, when the error shows, then the box has `aria-invalid="true"`, a `--color-danger-solid` border, and `aria-describedby="agree-err"` naming "Agree to the code of conduct to join". (L2-001)
- **AC-6** Given the project form is submitting, when its checkboxes are `disabled`, then "Technical co-founder" stays visibly checked, every row shows the disabled colours, has no hover fill and cannot be toggled. (L2-012)
- **AC-7** Given `indeterminate` is true, when the box renders, then it shows the accent fill with a dash and `input.indeterminate` is true. (L2-050)
- **AC-8** Given the project edit form with no option chosen, when it is saved, then each box in the group is invalid and the group shows "Choose at least one kind of help, or pick “Feedback only”." (L2-014)

### Keyboard and focus

- **AC-9** Given focus on "Engineers", when Space is pressed, then it toggles, focus stays on it, and a 2 px `--color-focus-ring` ring surrounds the box with at least 3:1 contrast. (L2-050)
- **AC-10** Given the join agreement, when the person tabs, then focus goes to the checkbox, then the "code of conduct" link, then the "privacy policy" link; activating a link does not toggle the box. (L2-050)

### Screen readers

- **AC-11** Given the directory row "Founders" with count 214 and `countContext` " builders", when it receives focus, then a screen reader announces "Founders 214 builders, checkbox, not checked". (L2-010)
- **AC-12** Given a checked box, when it is announced, then its state is conveyed by the checked property and the tick shape, not by colour alone. (L2-050)

### Theming

- **AC-13** Given both themes, when an unchecked and a checked box render on `--color-bg-surface`, then the unchecked border and the checked fill each measure at least 3:1 and the tick at least 4.5:1 against the fill. (L2-050)
- **AC-14** Given the theme switch, when it toggles, then boxes, rows and counts recolour from tokens alone. (L2-051)

### Responsive

- **AC-15** Given a 320 px viewport, when the directory filter sheet shows "Product managers" 198, then the row is at least 44 px tall and full width, and nothing scrolls horizontally. (L2-049)

### Content

- **AC-16** Given the directory, when counts render, then they are formatted with thousands separators from the locale ("1,284") and the context word comes from the `en-CA` catalogue. (L2-052)

### Motion

- **AC-17** Given `prefers-reduced-motion: reduce`, when a box is checked, then the tick appears with no transition. (L2-050)

### Performance

- **AC-18** Given a change to `bn-checkbox` or `bn-check`, when the perf test runs `Checkbox` and `FilterChecks` against the base branch, then neither is flagged as a possible regression. (L2-048)
- **AC-19** Given the directory loads 12 results with the filter sidebar, when the facet counts arrive, then the rows do not move surrounding content (CLS 0 for the replacement). (L2-048)

## Implementation notes

- Built: `input[bn-checkbox]` (`invalid`, class `check__box`, CSS for checked,
  radio, indeterminate via `:indeterminate` and `[data-indeterminate]`, invalid,
  forced colours) and `bn-check` (label row with `input` and default slots).
- Add `indeterminate` (host property binding `[indeterminate]`); drop the
  `[data-indeterminate]` selector once no consumer uses it (it exists for
  design-system specimens).
- Add `count` and `countContext` to `bn-check`, rendering `span.check__count`
  with a `span.vh` context.
- Add the disabled styles (D-2) to `checkbox.css` and `check.css`
  (`.check:has(input:disabled)`).
- Add `.check-grid` to the library's global utilities
  (`components/src/styles/`).
- Add `Checkbox.ts` and `FilterChecks.ts` perf scenarios.

## Decisions

- **D-1** *What is `bn-check`?* The labelled check row (`label.check`): it wraps the projected `input[bn-checkbox]` and the label text in one `label`, so the whole 44 px row toggles the box and links in the label still work. It is the only way a checkbox appears outside a choice card.
- **D-2** *What does a disabled checkbox look like?* The design system and `components.css` define none, and `appearance: none` hides the native disabled look, yet `pages/project-edit/submitting` disables every box. The box takes `--color-bg-subtle` with a `--color-border-default` edge (checked: `--color-fg-disabled` fill), the label `--color-fg-muted`, and the row loses its hover fill; disabled controls are exempt from contrast minimums, and the colours stay within the token roles for disabled UI.
- **D-3** *How do counts read to a screen reader?* As part of the name, with a hidden context word ("Founders 214 builders"), because the design system says "Counts mean matching builders; include the count context in the label" while the mocks show bare numbers.
- **D-4** *Is the empty third `span` in the project rows required?* No: it renders nothing and the grid's third column is `auto`, so `bn-check` renders `span.check__count` only when there is a count.
- **D-5** *Where does `.check-grid` live?* In the components library's global utilities: it is list layout, not a component, and the form-layout CRD does not own it.
