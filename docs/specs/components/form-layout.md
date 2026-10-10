# Form layout

| Field | Value |
|---|---|
| Selector | `form[bn-form]`, `div[bn-form]`, `fieldset[bn-form-section]`, `div[bn-field-row]`, `div[bn-form-actions]`, `bn-form-summary` |
| Library path | `frontend/projects/components/src/lib/form-layout/` (layout parts); `frontend/projects/components/src/lib/form-summary/` (`bn-form-summary`) |
| Status | planned (`bn-form-summary` is built) |
| Traces to | L2-001, L2-003, L2-007, L2-012, L2-014, L2-021, L2-035, L2-040, L2-045, L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`form-layout.html`](../../design-system/components/form-layout.html) |
| Source mocks | [`pages/join/invalid`](../../mocks/pages/join/invalid.html), [`pages/sign-in/default`](../../mocks/pages/sign-in/default.html), [`pages/forgot-password/invalid`](../../mocks/pages/forgot-password/invalid.html), [`pages/reset-password/invalid`](../../mocks/pages/reset-password/invalid.html), [`pages/contact/invalid`](../../mocks/pages/contact/invalid.html), [`pages/onboarding/submitting`](../../mocks/pages/onboarding/submitting.html), [`pages/profile-edit/submitting`](../../mocks/pages/profile-edit/submitting.html), [`pages/project-new/invalid`](../../mocks/pages/project-new/invalid.html), [`pages/project-new/submitting`](../../mocks/pages/project-new/submitting.html), [`pages/project-edit/loading`](../../mocks/pages/project-edit/loading.html), [`pages/project-edit/default`](../../mocks/pages/project-edit/default.html), [`pages/matching-setup/submitting`](../../mocks/pages/matching-setup/submitting.html), [`pages/settings/invalid`](../../mocks/pages/settings/invalid.html), [`pages/settings/submitting`](../../mocks/pages/settings/submitting.html), [`pages/messages/default`](../../mocks/pages/messages/default.html), [`dialogs/change-photo/default`](../../mocks/dialogs/change-photo/default.html), [`dialogs/delete-account/default`](../../mocks/dialogs/delete-account/default.html), [`dialogs/session-expired/default`](../../mocks/dialogs/session-expired/default.html) |
| Rendering | [`form-layout.html`](form-layout.html) |

## Purpose and scope

Form layout arranges Banaro's forms: the single column of fields on "Join Banaro" and "Contact
Banaro", the sectioned card on "Share a project" ("The basics", "Where it is", "Links",
"Visibility"), short related answers side by side ("Website" and "Code repository"), the actions
row ("Cancel", "Share project"), and the error summary "Fix these before continuing" that links
each problem to its field.

Each field is a [form field](form-field.md) wrapping a [text field](text-field.md),
[textarea](textarea.md), [select](select.md), [checkbox](checkbox.md) or
[radio group](radio-group.md); actions are [buttons](button.md). Dialog forms sit in the
[dialog](dialog.md) body and footer.

Out of scope:

- Validation rules, error messages, submission, retries and keeping values (the pages, L2-045).
- Making fields read-only and buttons busy while saving (form-field and button CRDs); the form only
  marks itself `aria-busy`.
- Skeletons inside a loading form card (skeleton CRD).

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/sign-in/*`, `join/*`, `forgot-password/*`, `reset-password/*` | `form[bn-form]` plain, `aria-label` "Sign in" / "Join Banaro" / "Reset password", actions start-aligned | fields, summary on invalid, submit | default, invalid (summary), submitting (`aria-busy`) | auth card |
| `pages/onboarding/*` | plain, `aria-label` "Profile step 2 of 3", actions end-aligned "Back", "Continue" | fields, chips | default, invalid, submitting "Saving your profile…" | wide auth card |
| `pages/contact/*` | plain, `aria-label` "Contact Banaro" | summary: "Enter an e-mail address like name@example.com", "Choose a topic", "Write a message so we know how to help" | default, invalid, submitting | canvas |
| `pages/profile-edit/*` (also behind `dialogs/change-photo/*`, `dialogs/session-expired/*`) | plain, `div[bn-field-row]` for "Full name" and headline, actions start "Save changes", "Cancel" | summary "Enter your name so builders know who you are" | default, invalid, submitting "Saving…", success | canvas |
| `pages/project-new/*`, `pages/project-edit/*` (also behind `dialogs/delete-project/*`) | `form[bn-form] variant="card"`, four `fieldset[bn-form-section]`, nested question sections "Who are you looking for?", "Who can see it?", two field rows, actions end "Cancel", "Share project" / "Save changes" | summary "Enter a name for your project." … | default, invalid, submitting "Sharing…" / "Saving…" | surface card |
| `pages/project-edit/loading` | `div[bn-form] variant="card"` busy, `aria-label` "Loading project" | skeletons | loading | surface card |
| `pages/matching-setup/*` | plain, actions start "Start matching", "Cancel" | summary "Tell us what you are looking for" … | default, invalid, submitting | canvas |
| `pages/settings/*` | plain, actions start "Save changes", "Cancel" | summary "Enter your name", "Enter an e-mail address like name@example.com" | default, invalid, submitting, success | canvas |
| `pages/messages/default`, `notifications/connection-banner/*` | plain, `aria-label` "Reply to Daniel Reyes", actions end "Send" | one textarea | default | surface |
| `dialogs/session-expired/*`, `dialogs/delete-account/*`, `dialogs/change-photo/*` | plain in the dialog body | fields | default, invalid, busy, failed | dialog |
| `pages/sign-in/signed-out`, `pages/verify-email/*`, `pages/join/success` | `div[bn-form-actions]` alone | "Sign in again", "Back to the home page" | — | auth card |

## Anatomy

1. **Form** — `form.form` (grid, gap `--space-6`) or `form.form-card` (grid, gap `--space-8`,
   padded surface card, radius `--radius-xl`). A loading card is a `div.form-card`.
2. **Error summary** — `div.form-summary#error-summary[role=alert][tabindex=-1]`, first child of the
   form: `p.form-summary__title` with icon and heading, then `ul` of links to fields.
3. **Section** — `fieldset.form-section` with `legend.form-section__title` (`--text-h3`); a
   question inside a section is a nested `fieldset.form-section` with `legend.field__label`.
4. **Field row** — `div.field-row`; one column, two equal columns from 48 rem.
5. **Fields** — `bn-field` and group fields (form-field CRD).
6. **Actions** — `div.form-actions` (flex, wraps, gap `--space-3`); `.form-actions--end` aligns
   right.

Hosts: `form[bn-form]` and `div[bn-form]` are the native elements; `fieldset[bn-form-section]` is
the native fieldset and renders its legend first; `div[bn-field-row]` and `div[bn-form-actions]`
are the native divs. `bn-form-summary` is `display: block` and renders the summary inside.

## API

### Inputs

`form[bn-form]`, `div[bn-form]`:

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `variant` | `'plain' \| 'card'` | `'plain'` | no | `plain` sets `.form`; `card` sets `.form-card`. |
| `busy` | `boolean` | `false` | no | Sets `aria-busy="true"` while submitting or loading. |

Native `novalidate`, `aria-label` and `(ngSubmit)` stay on the host. `novalidate` is required on
every validated form so Banaro's messages replace the browser's.

`fieldset[bn-form-section]`:

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `legend` | `string` | — | yes | Legend text, rendered as the first child. |
| `level` | `'section' \| 'question'` | `'section'` | no | `section` renders `legend.form-section__title`; `question` renders `legend.field__label`. |

Native `id`, `aria-describedby` and `disabled` stay on the host.

`div[bn-form-actions]`:

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `align` | `'start' \| 'end'` | `'start'` | no | `end` adds `.form-actions--end`. |

`div[bn-field-row]` has no inputs.

`bn-form-summary`:

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `heading` | `string` | — | yes | "Fix these before continuing". |
| `errors` | `readonly { controlId?: string; message: string }[]` | `[]` | no | One list item per error, in field order. With `controlId` the item is a link to `#controlId`; without, plain text for a whole-form error. |

| Method | Rule |
|---|---|
| `focus()` | Focuses the summary (`tabindex="-1"`). Used only when no field can take focus (D-2). |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| None | | Submission stays on the native form's `submit` / `ngSubmit`. The summary's links move focus without emitting. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| default (form) | summary, sections, fields, rows, actions | In reading order; the summary is first when present. |
| default (section) | fields, rows, nested question sections, help and error lines | After the legend. |
| default (field row) | two short related `bn-field`s | Never a textarea or a long description. |
| default (actions) | `button[bn-button]` and `a[bn-button]` | Start-aligned: primary first, then "Cancel". End-aligned: "Cancel" or "Back" first, primary last. |

## Variants and sizes

| Variant | Markup | Use for |
|---|---|---|
| Single column | `.form` | Identity, contact, profile, settings, matching and dialog forms. |
| Sectioned card | `.form-card` + `.form-section` | Long forms: share and edit a project. |
| Two column | `.field-row` | Short related answers at 48 rem and up. |
| Inline (compact) | `.form` with one field and `.form-actions--end` | The message reply composer. |
| Actions | `.form-actions`, `.form-actions--end` | Every form's buttons. |
| Error summary | `.form-summary` | Every validated form after a failed submit. |

One size; the form fills its column. The card's padding grows from `--space-6` to `--space-10`
at 40 rem.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Fields in order, actions last | Form named by `aria-label` |
| Invalid | page shows summary and field errors | Summary first in the form, in danger colours | Summary is `role="alert"`, announced when inserted; focus on the first invalid field |
| Submitting | `busy` | No change of its own; fields read-only and the primary button busy (their CRDs) | `aria-busy="true"` on the form |
| Loading | `div[bn-form] variant="card" busy` with skeletons | Card with skeleton lines sized to the final form | `aria-busy="true"`, `aria-label` "Loading project" |
| Success | page state | Unchanged form; a toast or result replaces it (page) | — |
| Error (load or save failure) | page state | Unchanged form with values kept; alert above (page) | — |
| Summary link hover, focus | `:hover`, `:focus-visible` | Underline; `--color-focus-ring` ring | — |
| Disabled section | `disabled` on a fieldset | Native disabled on every control inside | Controls unavailable |

## Markup

```html
<!-- rendered: single column, invalid -->
<form class="form" novalidate aria-label="Contact Banaro">
  <div class="form-summary" id="error-summary" role="alert" tabindex="-1">
    <p class="form-summary__title"><svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v5M12 15.5h.01"/></svg>Fix these before continuing</p>
    <ul><li><a href="#c-email">Enter an e-mail address like name@example.com</a></li><li><a href="#c-topic">Choose a topic</a></li></ul>
  </div>
  <div class="field">…</div>
  <div class="form-actions"><button type="submit" class="btn btn--primary">Send message</button></div>
</form>
```

```html
<!-- rendered: sectioned card -->
<form class="form-card" novalidate aria-busy="true">
  <fieldset class="form-section"><legend class="form-section__title">The basics</legend>…</fieldset>
  <fieldset class="form-section"><legend class="form-section__title">Where it is</legend>
    <div class="field-row"><div class="field">…Stage…</div></div>
    <fieldset class="form-section" id="looking" aria-describedby="looking-help"><legend class="field__label">Who are you looking for?</legend>…</fieldset>
  </fieldset>
  <fieldset class="form-section"><legend class="form-section__title">Links</legend><div class="field-row"><div class="field">…Website…</div><div class="field">…Code repository…</div></div></fieldset>
  <div class="form-actions form-actions--end"><a class="btn btn--quiet" href="/projects">Cancel</a><button type="submit" class="btn btn--primary" aria-busy="true" disabled><span class="spinner" aria-hidden="true"></span>Sharing…</button></div>
</form>
```

```html
<!-- rendered: loading card -->
<div class="form-card" aria-busy="true" aria-label="Loading project"><span class="skeleton skeleton--title" aria-hidden="true"></span><div class="stack" aria-hidden="true">…</div></div>
```

```html
<!-- consumer -->
<form bn-form variant="card" novalidate [busy]="saving()" [formGroup]="form" (ngSubmit)="submit()">
  @if (summaryErrors().length) {
    <bn-form-summary [heading]="'forms.summary' | t" [errors]="summaryErrors()" />
  }
  <fieldset bn-form-section [legend]="'projects.form.basics' | t">…</fieldset>
  <fieldset bn-form-section [legend]="'projects.form.links' | t">
    <div bn-field-row><bn-field …/><bn-field …/></div>
  </fieldset>
  <div bn-form-actions align="end">
    <a bn-button variant="quiet" routerLink="/projects">{{ 'common.cancel' | t }}</a>
    <button bn-button variant="primary" type="submit" [busy]="saving()">{{ (saving() ? 'projects.form.sharing' : 'projects.form.share') | t }}</button>
  </div>
</form>
```

Page objects locate the summary by `#error-summary` and its links, sections by their legend
text, and actions by button name.

## Design

- `.form`: grid, gap `--space-6`. `.form-card`: grid, gap `--space-8`, padding `--space-6`
  (`--space-10` from 40 rem), radius `--radius-xl`, hairline `--color-border-default`,
  `--color-bg-surface`.
- `.form-section`: grid, gap `--space-6`, no border, no padding, `min-width: 0`; section legend
  `--text-h3` with `--space-6` below; question legend `--space-3` below.
- `.field-row`: grid, gap `--space-6`; two `1fr` columns from 48 rem.
- `.form-actions`: flex, wrap, gap `--space-3`, padding-top `--space-2`.
- `.form-summary`: padding `--space-5`, hairline `--color-danger-border`, radius `--radius-md`,
  `--color-danger-bg` fill, `--color-danger-fg` text; title `--text-h4` with gap `--space-2`; list
  indented `--space-6`, `--space-3` above; links inherit the colour and stay underlined.

No component tokens.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Card fill | `--color-bg-surface` | `--palette-birch-50` | `--palette-night-900` |
| Card rule | `--color-border-default` | `--palette-oat-300` | `--palette-night-700` |
| Section legend | `--color-fg-default` | `--palette-ink-900` | `--palette-night-50` |
| Summary fill | `--color-danger-bg` | `--palette-lingon-100` | `--palette-lingon-950` |
| Summary rule | `--color-danger-border` | `--palette-lingon-300` | `--palette-lingon-700` |
| Summary text and links | `--color-danger-fg` | `--palette-lingon-700` | `--palette-lingon-300` |
| Focus ring | `--color-focus-ring` | `--palette-sage-700` | `--palette-sage-300` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-danger-fg` | `--color-danger-bg` | 4.5:1 | Summary title and links |
| `--color-fg-default` | `--color-bg-surface` | 4.5:1 | Section legends |
| `--color-focus-ring` | `--color-danger-bg` | 3:1 | Focused summary link |
| `--color-focus-ring` | `--color-bg-surface` | 3:1 | Focused field |

## Responsive behaviour

- Below 48 rem (768 px) every form is one column; `.field-row` stacks its two fields.
- From 48 rem `.field-row` pairs its fields; long descriptions and textareas stay full width.
- From 40 rem the card padding grows to `--space-10`.
- Actions wrap onto a second line without changing DOM order.
- At 320 px nothing scrolls horizontally or clips; at 200 % zoom everything stays available;
  actions keep 44 × 44 CSS px targets.

## Accessibility

### Role and pattern

Native `form`, `fieldset` and `legend`. The summary is a `role="alert"` region linking to fields,
following the GOV.UK-style error summary that the design system's forms pattern describes.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Summary links (when shown), then fields in DOM order, then actions. |
| <kbd>Enter</kbd> on a summary link | Moves focus to that field without scrolling past its label. |
| <kbd>Enter</kbd> in a single-line field | Submits the form natively. |

### Focus

After a failed submit, focus moves to the first invalid field and the summary is announced as an
alert (L2-001). A summary link focuses its field. Focus never moves on background refresh.

### Labelling

The form is named by `aria-label` when the page has more than one form or the form is the page's
purpose ("Join Banaro", "Reply to Daniel Reyes"). Sections are named by their legends; question
sections are described by their help through `aria-describedby`.

### Announcements

The summary announces once when inserted (`role="alert"`). Busy is exposed as `aria-busy`; the
button's busy label is the audible change.

### Motion

None.

## Content and internationalisation

- Summary heading: "Fix these before continuing". Each item says how to fix it: "Enter a name for
  your project.", "Shorten the summary to 100 characters or fewer. It is 117 now."
- Section legends are short nouns: "The basics", "Where it is", "Links", "Visibility". Question
  legends are questions: "Who are you looking for?", "Who can see it?".
- Actions say what will happen: "Share project", "Save changes", "Send message"; busy labels end
  with an ellipsis: "Sharing…", "Saving…".
- Translatable inputs: `legend`, `heading`, `errors[].message`, the form `aria-label`. Numbers in
  messages use thousands separators (L2-052).

## Performance

- Change detection: `OnPush`, signal inputs; attribute components only bind classes and
  attributes.
- Perf-test scenarios: `FormSummary.ts` (exists) renders the contact summary with three errors;
  new `FormLayout.ts` renders the "Share a project" card with its four sections, two field rows
  and end-aligned actions. Iterations in `e2e/perf-test/config/scenario-iterations.mjs` keep each at
  roughly 100–300 ms.
- Composite scenarios: `DarkTheme` gains the sectioned card.
- Regression rule: a change to the template, inputs, styles or change detection runs the perf
  test against the base branch with `--fail-on-regression` before it is pushed.
- Layout stability: the loading card's skeletons match the final card's sections, so replacing them
  does not move the page below (L2-048). Inserting the summary after a submit is user-initiated.

## Acceptance criteria

### Rendering

- **AC-1** Given "Share a project", when the form renders, then it is a `form.form-card` with `novalidate` and four `fieldset.form-section` legends "The basics", "Where it is", "Links" and "Visibility", and the actions row is `.form-actions.form-actions--end` with "Cancel" before "Share project". (L2-012)
- **AC-2** Given "Who are you looking for?" inside "Where it is", when it renders, then it is a nested `fieldset.form-section` whose `legend.field__label` names the group of checkboxes and whose help is linked by `aria-describedby`. (L2-012)
- **AC-3** Given the settings form, when it renders, then it is a single-column `form.form` with "Save changes" before "Cancel" in a start-aligned `.form-actions`. (L2-035)

### States

- **AC-4** Given Amara submits "Join Banaro" with an empty name and the e-mail "amara", when the invalid state shows, then a `.form-summary` with `role="alert"` and the heading "Fix these before continuing" is the form's first child and lists one link per error in field order. (L2-001)
- **AC-5** Given the join invalid state, when it appears, then focus is on the first invalid field, "Full name", and the summary is announced as an alert. (L2-001)
- **AC-6** Given the contact summary, when Amara follows "Choose a topic", then focus moves to the topic select. (L2-040)
- **AC-7** Given the API returns 422 for "Share a project" with errors for `name` and `summary`, when the page shows them, then the summary lists "Enter a name for your project." and "Shorten the summary to 100 characters or fewer. It is 117 now." in that order. (L2-045)
- **AC-8** Given a sign-in with an empty e-mail, when it is submitted, then the summary shows without any API call. (L2-003)
- **AC-9** Given "Share a project" is submitting, when Amara looks at the form, then the form has `aria-busy="true"` and its primary button reads "Sharing…" busy and disabled. (L2-012)
- **AC-10** Given profile edit fails to save with a server error, when the error shows, then the form keeps every entered value. (L2-007)
- **AC-11** Given an error without a field, such as "You already own 10 projects", when the summary renders it, then it is a plain list item, not a link. (L2-012)
- **AC-12** Given the edit project form is loading, when it renders, then a `div.form-card` with `aria-busy="true"` and `aria-label="Loading project"` holds skeletons, and when the form replaces it the content below does not move. (L2-048)
- **AC-13** Given Amara saves "Edit Harvest" with an empty project name, when the invalid state shows, then the summary is the card's first child, above "The basics", and lists "Enter a name for your project." (L2-014)
- **AC-14** Given matching setup is submitting, when the form renders, then it has `aria-busy="true"`. (L2-021)

### Keyboard and focus

- **AC-15** Given the contact invalid state, when Amara tabs from the summary's first link, then focus reaches the second link, and each focused link shows a 2 px `--color-focus-ring` outline with at least 3:1 contrast against the summary fill. (L2-050)

### Screen readers

- **AC-16** Given "Share a project", when a screen reader lists form groups, then it finds groups named "The basics", "Where it is", "Links", "Visibility", "Who are you looking for?" and "Who can see it?". (L2-050)
- **AC-17** Given the en-CA catalogue, when a summary renders, then its heading and messages come from the catalogue. (L2-052)

### Theming

- **AC-18** Given the dark theme, when the summary and the sectioned card render, then they use tokens only and the summary text keeps at least 4.5:1 against its fill. (L2-051)

### Responsive

- **AC-19** Given "Links" with "Website" and "Code repository", when the viewport is 768 px or wider, then the two fields sit side by side, and below 768 px they stack. (L2-049)
- **AC-20** Given a 320 px viewport, when "Share a project" renders, then the card, sections and actions fit without horizontal scroll and the actions wrap if needed. (L2-049)

### Performance

- **AC-21** Given the `FormLayout` and `FormSummary` perf-test scenarios, when the perf test runs against the base branch with `--fail-on-regression`, then neither is flagged as a possible regression. (L2-048)

## Implementation notes

- New folder `frontend/projects/components/src/lib/form-layout/` with `form.ts`
  (`form[bn-form], div[bn-form]`, class `Form`), `form-section.ts` (`fieldset[bn-form-section]`,
  class `FormSection`), `field-row.ts` (`div[bn-field-row]`, class `FieldRow`) and
  `form-actions.ts` (`div[bn-form-actions]`, class `FormActions`), with styles copied from
  `.form`, `.form-card`, `.form-section`, `.form-section__title`, the legend spacing rules,
  `.field-row` and `.form-actions`. Export all from `public-api.ts`.
- Pages that today write `class="form"` and `class="form-actions"` by hand (join, contact) move
  to the attribute components as they are touched.
- `bn-form-summary` (built) gaps:
  - `@for` tracks by `error.message`, so two identical messages break rendering; track by
    `$index`.
  - The fixed id `error-summary` is kept (one summary per page), but a form inside a dialog over a
    page that already shows a summary would duplicate it; the summary takes an optional `id`
    input defaulting to `error-summary`.
  - Pages must focus the first invalid field after a failed submit (L2-001); `focus()` stays for
    the case in D-2.
- Add `FormLayout.ts` to the perf-test scenarios and export it in the same change.

## Decisions

- **D-1** *The design-system page and forms pattern say "on failed submit move focus to the error
  summary"; L2-001 AC2 and AC13 say focus moves to the first invalid field and the summary is
  announced as an alert. Which?* L2: focus the first invalid field; the summary's `role="alert"`
  announces it. Raised to the lead so the design-system pages can be corrected.
- **D-2** *When is `focus()` on the summary used?* Only when the only errors have no field, such as
  the 10-project limit, so focus has somewhere meaningful to go.
- **D-3** *The design-system "inline" variant renders like single column. What is it?* The compact
  reply composer: a plain form with one field and end-aligned actions. No extra class.
- **D-4** *Action order differs between start- and end-aligned rows in the mocks.* Kept as drawn:
  start-aligned rows put the primary first ("Save changes", "Cancel"); end-aligned rows put it
  last ("Cancel", "Share project"). The component does not reorder its content.
- **D-5** *The loading card is a `div`, not a `form`.* `bn-form` accepts `div` as a host so the
  loading card shares the card styles without a submittable form.
- **D-6** *The design-system summary title reads "Check one answer"; every mock reads "Fix these
  before continuing".* The mocks' copy; the heading is an input either way.
