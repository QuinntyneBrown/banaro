# Select

| Field | Value |
|---|---|
| Selector | `select[bn-input]` (the same `Input` directive also serves `input[bn-input]`, see [text field](text-field.md)); `bn-select` |
| Library path | `frontend/projects/components/src/lib/input/` (`select[bn-input]`, built); `frontend/projects/components/src/lib/select/` (`bn-select`, planned) |
| Status | built (`bn-select` planned) |
| Traces to | L2-006, L2-007, L2-009, L2-012, L2-017, L2-018, L2-035, L2-040, L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`select.html`](../../design-system/components/select.html) |
| Source mocks | [`pages/contact/*`](../../mocks/pages/contact/invalid.html), [`pages/onboarding/default`](../../mocks/pages/onboarding/default.html), [`pages/onboarding/invalid`](../../mocks/pages/onboarding/invalid.html), [`pages/settings/submitting`](../../mocks/pages/settings/submitting.html), [`pages/profile-edit/*`](../../mocks/pages/profile-edit/default.html), [`pages/project-new/*`](../../mocks/pages/project-new/default.html), [`dialogs/offer-to-help/*`](../../mocks/dialogs/offer-to-help/invalid.html), [`pages/directory/default`](../../mocks/pages/directory/default.html), [`pages/projects/no-results`](../../mocks/pages/projects/no-results.html), [`pages/events/loading`](../../mocks/pages/events/loading.html) |
| Rendering | [`select.html`](select.html) |

## Purpose and scope

The select is the native `<select>` for choosing one value from a short, closed
list: a contact topic, a neighbourhood, a role, a project stage, how someone
could help, a sort order. Banaro always uses the platform `<select>` — the
design system says "Do not build a custom listbox for a simple stage list" — so
keyboard, screen-reader and mobile pickers are the browser's own.

It comes in two treatments that share one native element:

- **Field select** — `select[bn-input]` inside a [form field](form-field.md).
  The `Input` directive is the same one that styles text inputs (one directive
  serves both `input[bn-input]` and `select[bn-input]`); on a `<select>` it adds
  `.input` and keeps the platform's own arrow.
- **Chevron select** — `bn-select` around a `select[bn-input]`. It draws the
  design system's `.select__wrap` and chevron and switches the projected
  select's class to `.select__control`. With a `label` it is the inline toolbar
  control (`label.select`: "Sort by", "Stage", "Looking for", "Day"); without
  one it sits inside a `bn-field` (profile "Neighbourhood", project "Stage",
  offer-to-help "How could you help?").

Use [radio group](radio-group.md) when there are five or fewer options that each
need a sentence, [checkbox](checkbox.md) for several answers, and the
[search box](search-box.md) for free text.

Out of scope:

- Label, help and error for a field select — [form field](form-field.md).
- What a change does (re-sorting, updating the URL) — the page (L2-009 AC 3).
- The toolbar around inline selects — [search and filter toolbar](search-filter-toolbar.md).

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/contact/*` | field select (`.input`) | "Topic": "Choose one" (value ""), "A question about Banaro", "Report a concern", "Partner on an event", "Press and speaking", "Something else" | default, invalid ("Choose a topic"), submitting (`disabled`, "A question about Banaro" selected) | canvas |
| `pages/onboarding/default`, `invalid` | field select (`.input`) with help | "Neighbourhood or city" (14 GTA places, "Choose one"), "What best describes your role?" (Founder, Engineer, Designer, Product manager, Other) | default (Leslieville, Founder selected), invalid ("Choose where you are based") | form card |
| `pages/settings/*`, `dialogs/delete-account/*` (behind) | field select (`.input`) | "Language": English, Français | default, submitting (`disabled`) | canvas |
| `pages/profile-edit/*` (also behind `dialogs/change-photo`, `dialogs/session-expired`) | chevron select in a field | "Neighbourhood": Leslieville … Scarborough, help "Shown to builders. We use it to work out distances; your address is never shared." | default, submitting (`disabled`) | canvas |
| `pages/project-new/*`, `pages/project-edit/*`, `dialogs/delete-project/*` (behind) | chevron select in a field | "Stage": Idea, Design, Prototype, Pilot, Beta, Launched | default (Design / Beta), submitting (`disabled`) | canvas |
| `dialogs/offer-to-help/*` | chevron select in a field | "How could you help?": "Choose a role" placeholder, Write code, Design or research, Review and test, Advise, Something else; "How much time could you give?": A few hours a month/week, Evenings and weekends, Not sure yet | default, invalid ("Choose how you could help."), busy (`disabled`), failed | dialog surface |
| `pages/directory/*` (also behind `dialogs/say-hello`, `notifications/toast`) | inline chevron select, label "Sort by" | Best match, Nearest, Recently active, Newest | default | toolbar on canvas |
| `pages/projects/*` | inline, labels "Stage", "Looking for", "Sort by" | "All stages", Idea … Launched; "Anyone", Co-founder … Designer | default, no-results (Launched, Advisor selected) | toolbar |
| `pages/events/*` | inline, label "Day" | Any day, Weekdays, Weekends | default, loading (`disabled`) | toolbar |
| Design system only | sizes sm / md / lg (`.select--sm` …) | "Project stage" | — | — |

## Anatomy

1. **Inline wrapper (inline only)** — `label.select`: a non-wrapping inline-flex
   row, `--space-3` gap, `--text-body-sm` in `--color-fg-muted`, holding the
   visible label `span` and the wrap.
2. **Wrap (chevron select)** — `span.select__wrap`: `position: relative`,
   `inline-flex` (`flex` inside a field).
3. **Control** — the native `select`, the Angular host of `select[bn-input]`:
   `.input` (field select) or `.select__control` (inside `bn-select`).
4. **Chevron (chevron select)** — `svg.icon.icon--sm.select__chev`,
   `aria-hidden="true"`, absolutely placed `--space-3` from the right,
   `pointer-events: none`, `--color-fg-subtle`.
5. **Options** — native `option` elements from the consumer; an optional first
   placeholder option with `value=""`.

Host: `select[bn-input]` is an attribute component on the native `<select>`; it
renders the projected `<option>`s with `<ng-content>`. `bn-select` is
`display: inline-block` (`display: block` when it has no `label`) and renders
the wrapper, the wrap and the chevron around its projected select.

## API

### Inputs

`select[bn-input]` (shared `Input` directive):

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `invalid` | `boolean` | `false` | no | `true` sets `aria-invalid="true"`; `false` removes it. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'lg'` | no | Field select: `.input--sm` / `.input--md`. Inside `bn-select`: `.select--sm` / `.select--md` / `.select--lg`. |

When the directive's host is a `<select>` projected into `bn-select` (it injects
the optional `SELECT_HOST` token that `bn-select` provides), the host class is
`select__control` instead of `input`. Consumer attributes pass through: `id`,
`name`, `required`, `disabled`, `autocomplete`, `aria-describedby`,
`formControlName`.

`bn-select`:

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `label` | `string \| null` | `null` | no | When set, renders `label.select` with a visible `span` of this text before the wrap; the label wraps the select, so it names it. When `null`, renders only `span.select__wrap` for use inside `bn-field`, which names the select. |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| None | | The native `change` event; reactive forms bind to the element. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `select[bn-input]` default | `<option>` (and `<optgroup>`) elements | Projected in order. |
| `bn-select` default | exactly one `select[bn-input]` | Projected inside `span.select__wrap`, before the chevron. |

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Field select | `select.input` | A question in a form, keeping the platform arrow (contact, onboarding, settings) |
| Chevron select in a field | `bn-select` (no label) → `span.select__wrap > select.select__control + svg.select__chev` | A question in a form with the design-system chevron (profile, project, offer-to-help) |
| Inline select | `bn-select label="Sort by"` → `label.select` | Sort and filter in result toolbars |
| With placeholder | first `<option value="">` | A required choice with no sensible default ("Choose one", "Choose a role") |

| Size | Modifier | Height | Padding | Type |
|---|---|---|---|---|
| sm | `.input--sm` / `.select--sm` | `--control-height-sm` | `0 var(--space-4)` (chevron: right `--space-10`) | `--font-size-sm` |
| md | `.input--md` / `.select--md` | `--control-height-md` | as above | field `--text-body`; inline `--text-label` |
| lg (default) | none in a field; `.select--lg` optional | `--control-height-lg` | as above | `--text-body` (field), `--text-label` (chevron) |

Inline selects are `--control-height-md` with `--radius-full` corners (pill) by
default and take `.select--sm/md/lg`. Chevron selects inside a field are always
`--control-height-lg`, full width, `--radius-md`: the `.field .select__control`
rule outranks the size modifiers, so `size` applies to inline selects only.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | value chosen | Value in `--color-fg-default` | "Topic, A question about Banaro, combo box" |
| Placeholder shown | `value=""` selected | Placeholder text ("Choose one") in the control | Value read as "Choose one" |
| Hover | `:hover` | Field: border `--color-fg-muted`; chevron: no change | — |
| Focus | `:focus-visible` | `--color-focus-ring` ring at `--focus-ring-offset` | Focus on the native select |
| Open | native picker | Platform list | Platform listbox |
| Active | `:active` / `data-state="active"` (specimen) | Chevron select border `--color-focus-ring` | — |
| Invalid | `aria-invalid="true"` | Field: danger border + `--color-danger-bg`; chevron: danger border | "invalid entry"; error via `aria-describedby` |
| Disabled | `disabled` (submitting, busy, loading) | Fill `--color-bg-subtle`, text `--color-fg-muted` (field) or `--color-fg-disabled` (inline), `cursor: not-allowed` | Not focusable; value still read by a screen reader in browse mode |
| Required | `required` | No marker | "required" |

## Markup

```html
<!-- rendered: field select (contact, invalid) -->
<select bn-input class="input" id="c-topic" name="c-topic" required aria-invalid="true" aria-describedby="c-topic-err">
  <option value="">Choose one</option>
  <option>A question about Banaro</option>
  <option>Report a concern</option>
  <option>Partner on an event</option>
  <option>Press and speaking</option>
  <option>Something else</option>
</select>
```

```html
<!-- rendered: chevron select in a field (project stage) -->
<bn-select>
  <span class="select__wrap">
    <select bn-input class="select__control" id="stage" name="stage">
      <option>Idea</option><option selected>Design</option><option>Prototype</option>
      <option>Pilot</option><option>Beta</option><option>Launched</option>
    </select>
    <svg class="icon icon--sm select__chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5"/></svg>
  </span>
</bn-select>
```

```html
<!-- rendered: inline select (directory toolbar) -->
<bn-select>
  <label class="select"><span>Sort by</span>
    <span class="select__wrap">
      <select bn-input class="select__control" name="sort">
        <option selected>Best match</option><option>Nearest</option><option>Recently active</option><option>Newest</option>
      </select>
      <svg class="icon icon--sm select__chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5"/></svg>
    </span>
  </label>
</bn-select>
```

```html
<!-- consumer -->
<bn-field [label]="'contact.topic' | t" [controlId]="ids.topic" [error]="errors().topic">
  <select bn-input [id]="ids.topic" formControlName="topic" required [invalid]="!!errors().topic"
          [attr.aria-describedby]="fieldDescribedBy(ids.topic, { error: errors().topic })">
    <option value="">{{ 'contact.chooseTopic' | t }}</option>
    @for (topic of topics; track topic.value) { <option [value]="topic.value">{{ topic.key | t }}</option> }
  </select>
</bn-field>

<bn-select [label]="'directory.sortBy' | t">
  <select bn-input name="sort" [formControl]="sort">
    @for (o of sortOptions; track o.value) { <option [value]="o.value">{{ o.key | t }}</option> }
  </select>
</bn-select>
```

## Design

- Field select: identical box to the text field — `--control-height-lg`,
  `--space-4` padding, hairline `--bn-field-border`, `--radius-md`,
  `--color-bg-surface`, `--text-body`.
- Chevron control: `appearance: none`, `--control-height-md`, padding
  `0 var(--space-10) 0 var(--space-4)` (room for the chevron), hairline
  `--color-border-strong`, `--radius-full`, `--text-label`, `cursor: pointer`.
  Inside `.field`: full width, `--control-height-lg`, `--radius-md`.
- Chevron `--space-4` square at `right: var(--space-3)`, vertically centred.
- Inline wrapper `--text-body-sm` in `--color-fg-muted`, gap `--space-3`,
  `white-space: nowrap`.
- Motion: colour, background and border transitions on the chevron control use
  `--duration-fast` / `--duration-base` with `--ease-standard`, only under
  `prefers-reduced-motion: no-preference`.

Component tokens:

| Token | Aliases | Overridden by |
|---|---|---|
| `--bn-field-border` | `--color-border-strong` | `--color-danger-solid` on an invalid field select |

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Fill | `--color-bg-surface` | `--palette-birch-50` | `--palette-night-900` |
| Border | `--color-border-strong` | `--palette-stone-500` | `--palette-night-500` |
| Value | `--color-fg-default` | `--palette-ink-900` | `--palette-night-50` |
| Chevron | `--color-fg-subtle` | `--palette-stone-600` | `--palette-night-300` |
| Inline label | `--color-fg-muted` | `--palette-stone-700` | `--palette-night-200` |
| Invalid border | `--color-danger-solid` | `--palette-lingon-600` | `--palette-lingon-300` |
| Invalid fill (field select) | `--color-danger-bg` | `--palette-lingon-100` | `--palette-lingon-950` |
| Disabled fill | `--color-bg-subtle` | `--palette-oat-200` | `--palette-night-800` |
| Disabled text (inline) | `--color-fg-disabled` | `--palette-oat-400` | `--palette-night-500` |
| Focus ring | `--color-focus-ring` | `--palette-sage-700` | `--palette-sage-300` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-surface` | 4.5:1 | Selected value |
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Inline label ("Sort by") |
| `--color-border-strong` | `--color-bg-surface` | 3:1 | Control border |
| `--color-border-strong` | `--color-bg-canvas` | 3:1 | Inline control on the page |
| `--color-danger-solid` | `--color-bg-surface` | 3:1 | Invalid border |
| `--color-focus-ring` | `--color-bg-canvas` | 3:1 | Focus ring |

The chevron is decorative (the control's border carries the boundary), so it has
no contrast minimum of its own. Forced colours: the native select keeps its
system rendering.

## Responsive behaviour

- Field selects are 100 % wide at every breakpoint.
- Inline selects keep their label and control on one line (`white-space:
  nowrap`); in the toolbar they wrap as whole units onto the next line at narrow
  widths (`.toolbar__tools` wraps), and each is capped at 100 % of the row.
- Long option text is truncated by the platform inside the closed control; the
  open picker shows it in full.
- At 320 px nothing scrolls horizontally or clips; at 200 % zoom everything stays
  available; inline selects are `--control-height-md` (44 px) and field selects
  `--control-height-lg`, so every target is at least 44 × 44 CSS px.

## Accessibility

### Role and pattern

The native `<select>` (combo box / listbox exposed by the platform). The
design-system page names the WAI-ARIA listbox pattern; the native element
already implements it, so no ARIA is added.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Focus the select; disabled selects are skipped. |
| <kbd>↑</kbd> / <kbd>↓</kbd> | Change the option (closed, on Windows) or move in the open list. |
| <kbd>Alt</kbd>+<kbd>↓</kbd>, <kbd>Space</kbd>, <kbd>Enter</kbd> | Open the list (platform-dependent). |
| Type-ahead letters | Jump to a matching option. |
| <kbd>Escape</kbd> | Close the open list without changing the value. |

### Focus

Focus stays on the select and shows the shared 2 px `--color-focus-ring` ring.
Choosing an option never moves focus and never submits or navigates by itself;
the page applies a sort or filter on `change`.

### Labelling

- Field select: named by `label[for]` from `bn-field`; help and error via
  `aria-describedby`.
- Inline select: named by the wrapping `label.select`, whose visible text ("Sort
  by") is the name (WCAG 2.5.3).
- The chevron is `aria-hidden="true"`.
- A placeholder option is never the label; it reads as the current value
  ("Choose one").

### Announcements

None. The page announces result-count changes after a sort or filter.

### Motion

Colour transitions only, removed under `prefers-reduced-motion: reduce`.

## Content and internationalisation

- Options are short, parallel nouns in sentence case: "Best match", "Nearest",
  "Recently active", "Newest"; "Idea", "Design", "Prototype".
- Placeholders say what to choose: "Choose one", "Choose a role".
- Inline labels are two words or fewer: "Sort by", "Stage", "Looking for", "Day".
- Translatable: option labels, placeholder option, inline `label`. Data values:
  neighbourhood names ("Leslieville", "The Danforth") come from the GTA list and
  are proper nouns, translated only where the catalogue has an exonym.
- French option text runs about 30 % longer; the field select is full width and
  the inline control grows to its longest option.

## Performance

- Change detection: `OnPush`; `bn-select` is a static wrapper with one input;
  the directive's class is a `computed` of the injected host token.
- Perf-test scenarios: add `frontend/projects/perf-test/src/scenarios/Select.ts`
  rendering the contact "Topic" field select with "A question about Banaro"
  selected inside `bn-field`, and `SelectInline.ts` rendering the directory's
  "Sort by" select with "Best match". Iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep each at roughly 100–300 ms.
- Composite scenarios: the results-toolbar scenario of the search and filter
  toolbar CRD includes `SelectInline`.
- Layout stability: the control height is fixed; options load synchronously with
  the form, so nothing shifts.
- Weight: no dependencies beyond `@angular/core`; no CDK listbox.

## Acceptance criteria

### Rendering

- **AC-1** Given the contact form, when the Topic field renders, then the native `<select>` has the class `input`, a `--control-height-lg` height, and the first option "Choose one" has `value=""`. (L2-040)
- **AC-2** Given the project form, when the Stage field renders in `bn-select`, then the select has the class `select__control` (not `input`) inside `span.select__wrap`, followed by an `aria-hidden` `svg.select__chev`, and it is full width with `--radius-md` corners. (L2-012)
- **AC-3** Given the directory toolbar, when the sort control renders with `label` "Sort by", then `label.select` wraps the text "Sort by" and the select, the select's accessible name is "Sort by", and "Best match" is selected. (L2-009)
- **AC-4** Given the events toolbar, when the "Day" select renders, then it is a `--radius-full` pill of `--control-height-md` with the chevron on the right and the options "Any day", "Weekdays", "Weekends". (L2-018)

### States

- **AC-5** Given the contact form submitted with "Choose one", when the Topic select is invalid, then it has `aria-invalid="true"`, a `--color-danger-solid` border and `--color-danger-bg` fill, and `aria-describedby` names the "Choose a topic" error. (L2-040)
- **AC-6** Given the offer-to-help dialog with "Choose a role" chosen, when it is sent, then the chevron select shows a `--color-danger-solid` border and the error "Choose how you could help.". (L2-017)
- **AC-7** Given onboarding with no neighbourhood, when the member continues, then the "Neighbourhood or city" select is invalid with "Choose where you are based" and keeps "Choose one" selected. (L2-006)
- **AC-8** Given the profile form is submitting, when the Neighbourhood select is `disabled`, then it shows the `--color-bg-subtle` fill, keeps "Leslieville" visible and cannot be focused. (L2-007)
- **AC-9** Given the settings page is submitting, when the Language select is `disabled`, then "English" stays visible and the select is skipped by Tab. (L2-035)

### Keyboard and focus

- **AC-10** Given the directory sort select has focus, when the person presses ↓ and then Escape in the open list, then the value is unchanged and focus stays on the select with a visible 2 px `--color-focus-ring` ring. (L2-050)
- **AC-11** Given the directory sort select, when the person chooses "Nearest", then the page applies the new order on `change` and focus remains on the select. (L2-009)

### Screen readers

- **AC-12** Given the onboarding role select with help, when it receives focus, then a screen reader announces "What best describes your role?", the selected value "Founder" and the combo-box role, and the chevron is not announced. (L2-050)

### Theming

- **AC-13** Given the dark theme, when an inline select renders on `--color-bg-canvas`, then its border measures at least 3:1 and its "Sort by" label at least 4.5:1. (L2-050)
- **AC-14** Given the theme switch, when it toggles, then both select treatments recolour from tokens alone. (L2-051)

### Responsive

- **AC-15** Given a 320 px viewport, when the projects toolbar shows "Stage", "Looking for" and "Sort by", then the inline selects wrap onto new lines as whole units and nothing scrolls horizontally. (L2-049)
- **AC-16** Given a touch layout below 576 px, when any select is measured, then its target is at least 44 × 44 CSS px. (L2-049)

### Content

- **AC-17** Given the `en-CA` catalogue, when the sort select renders, then "Sort by", "Best match", "Nearest", "Recently active" and "Newest" come from the catalogue. (L2-052)

### Performance

- **AC-18** Given a change to the `Input` directive or `bn-select`, when the perf test runs `Select` and `SelectInline` against the base branch, then neither is flagged as a possible regression. (L2-048)

## Implementation notes

- Built: `select[bn-input]` through the shared `Input` directive; it renders
  `<ng-content />` for the options and sets the `input` class. The contact page
  uses it.
- Add `bn-select` in `lib/select/` (`select.ts`, `select.css` extracted from the
  `.select`, `.select__wrap`, `.select__control`, `.select__chev`,
  `.select--*` and `.field .select__*` rules of `components.css`). It provides
  the `SELECT_HOST` injection token; `Input` injects it optionally and sets
  `select__control` instead of `input` when present. Because `bn-select`'s
  styles must reach the projected select, the `.select__control` rules live in
  the `Input` directive's stylesheet under `:host(.select__control)`.
- Add the `size` input (shared with text field) mapping to `.select--*` inside
  `bn-select`.
- Add `.select__control[aria-invalid="true"]` border handling (exists in
  `components.css`) and the disabled rule.
- Add `Select.ts` and `SelectInline.ts` perf scenarios.

## Decisions

- **D-1** *The mocks use two field-select treatments — `select.input` with the platform arrow (contact, onboarding, settings) and `.select__wrap > select.select__control` with a chevron (profile, project, offer-to-help). Which is the requirement?* Both are buildable: `select[bn-input]` alone gives `.input`, and wrapping it in `bn-select` gives the chevron treatment. Screens keep the treatment their mock shows, so the visual-parity tests (L2-049 AC 4) pass. Raised with the lead so design can converge on one.
- **D-2** *The design-system specimens put `select.select__control` directly in a field with no chevron. Is that a third treatment?* No: a control with `appearance: none` and no chevron has no affordance. Inside a field the chevron treatment always renders `span.select__wrap` and the chevron, as the mocks do.
- **D-3** *Should a required select's placeholder be unselectable?* It stays selectable with `value=""` so the form can detect "nothing chosen" and show the error, as contact and onboarding do; the design system's "Keep a placeholder unselectable" is met by `required` validation rejecting `""`. The offer-to-help failed mock's `<option disabled>` is a variant of the same rule.
- **D-4** *Does changing an inline select act immediately?* Yes, on `change`, because L2-009 AC 3 re-orders results when the member chooses a sort. Exploring options with arrows inside the open list changes nothing until a choice is committed, which honours the design system's "Do not navigate when someone explores options".
- **D-5** *One directive or two?* One: `Input` serves `input[bn-input]` and `select[bn-input]` (built), and `bn-select` is a wrapper, not a second control directive, so forms code is the same for every select.
