# Form field

| Field | Value |
|---|---|
| Selector | `bn-field`, `bn-field-error`; marker directives `[bnFieldHelp]`, `[bnFieldError]`; helper `fieldDescribedBy()` |
| Library path | `frontend/projects/components/src/lib/field/` |
| Status | built |
| Traces to | L2-001, L2-005, L2-007, L2-008, L2-012, L2-014, L2-021, L2-040, L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`form-field.html`](../../design-system/components/form-field.html) |
| Source mocks | [`pages/join/invalid`](../../mocks/pages/join/invalid.html), [`pages/contact/invalid`](../../mocks/pages/contact/invalid.html), [`pages/profile-edit/invalid`](../../mocks/pages/profile-edit/invalid.html), [`pages/matching-setup/invalid`](../../mocks/pages/matching-setup/invalid.html), [`pages/project-new/invalid`](../../mocks/pages/project-new/invalid.html), [`pages/onboarding/skills`](../../mocks/pages/onboarding/skills.html), [`dialogs/report/invalid`](../../mocks/dialogs/report/invalid.html), [`dialogs/delete-project/default`](../../mocks/dialogs/delete-project/default.html), [`dialogs/session-expired/invalid`](../../mocks/dialogs/session-expired/invalid.html), [`dialogs/change-photo/invalid`](../../mocks/dialogs/change-photo/invalid.html), [`pages/settings/default`](../../mocks/pages/settings/default.html) |
| Rendering | [`form-field.html`](form-field.html) |

## Purpose and scope

The form field keeps one question together: its visible label, the control or
controls that answer it, the help that explains it, the error that says how to
fix it, and an optional character counter. Every form in Banaro (join, sign-in,
onboarding, profile, project, matching, settings, contact and every form dialog)
builds its questions from `bn-field`, so the label association, the description
wiring and the vertical rhythm are the same everywhere.

`bn-field` wraps the native controls specified in their own CRDs:
[text field](text-field.md) (`input[bn-input]`), [select](select.md)
(`select[bn-input]`, `bn-select`), [textarea](textarea.md)
(`textarea[bn-textarea]`), [radio group](radio-group.md) (`bn-choices`),
[checkbox](checkbox.md) (`bn-check` lists), [slider](slider.md) and the file
upload. `bn-field-error` is the same error line for a control that stands
outside a `bn-field`, such as the code-of-conduct checkbox on `/join`.

Out of scope:

- The error summary at the top of a form and moving focus to the first invalid
  field — [form summary](form-summary.md) and the page (L2-001 AC 13).
- Validation rules and messages — the page and the API (L2-045); the field only
  shows the message it is given.
- Two-column rows (`.field-row`), form sections (`.form-section`) and the action
  row (`.form-actions`) — [form layout](form-layout.md).
- The look of the control itself — each control's CRD.

## Usage

Every row is buildable with the API below. "Control" means the default
`mode="control"`.

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/join/*`, `pages/sign-in/*`, `pages/forgot-password/*`, `pages/reset-password/*` | control; help on e-mail and password | "Full name", "E-mail" + "We only use this to sign you in and to send what you ask for.", "Password" + "At least 12 characters. A short sentence works well." | default, invalid ("Enter your full name", "Use at least 12 characters (you have 7)"), submitting (control `readonly`) | form card on canvas |
| `pages/contact/*` | control; help on Message | "Your name", "E-mail", "Topic" (select), "Message" + "Tell us a little context. A real person reads every message, usually within two working days." | default, invalid ("Enter an e-mail address like name@example.com", "Choose a topic", "Write a message so we know how to help"), submitting | canvas |
| `pages/onboarding/default`, `invalid`, `goals`, `skills` | control; optional marker; select and textarea | "Neighbourhood or city" + help, "What best describes your role?", "What are you building? (optional)", "Something else? (optional)" | default, invalid ("Choose where you are based"), submitting | form card |
| `pages/onboarding/skills` | group (legend "Skills") around chips | help "Choose up to ten. Press a skill to select it, press again to remove it." and a live help line "3 selected" | default | form card |
| `pages/profile-edit/*` (also behind `dialogs/change-photo/*`, `dialogs/session-expired/*`) | control, static, group | "Photo" (static, photo row), "Full name", "Role" + help, "Neighbourhood" (bn-select), "Bio" + help + counter "231 / 400", "Skills" (chips + input group), "Open to" (group, checkbox choices), "What I am looking for (optional)", "Who can see my profile" (group, radio choices) | default, invalid (name, bio "Your bio is 431 characters. Shorten it to 400 or fewer." with counter "431 / 400", group "Choose at least one way you are open to working with others."), submitting, loading | canvas |
| `pages/project-new/*`, `pages/project-edit/*` (also behind `dialogs/delete-project/*`) | control; optional marker; inside `.form-section` and `.field-row` | "Project name" + "The name people will search for.", "One-line summary" + help, "Description (optional)", "Stage" (bn-select), "Website (optional)", "Code repository (optional)" | default, invalid ("Enter a name for your project.", "Shorten the summary to 100 characters or fewer. It is 117 now.", "Start the website with https://, for example https://harvest.example.ca."), submitting | canvas |
| `pages/matching-setup/*` | group with help before content; control with help and error together | "Who you need" + "Pick all that apply.", "Skills wanted" + "Choose the skills that would complete your team.", "What you are building" + "A sentence or two is plenty." | default, invalid (help and error both shown), submitting | canvas |
| `pages/settings/*` (also behind `dialogs/delete-account/*`) | control; static | "Full name", "E-mail" + "We send match and event e-mail here.", "Password" (static: a "Change your password" link + "Last changed 3 months ago."), "Language" (select) | default, invalid, submitting, loading | canvas |
| `dialogs/delete-account/*`, `dialogs/delete-project/*` | control; rich help | "Type DELETE or your e-mail to confirm" + "Type DELETE, or amara@harvest.example.", "Type the project name to confirm" + "Type **Harvest** exactly as shown." (`.typed-name`) | default, invalid ("That doesn't match. Type DELETE or amara@harvest.example exactly."), busy (`readonly`), failed | dialog surface |
| `dialogs/give-feedback/*`, `dialogs/offer-to-help/*`, `dialogs/say-hello/*`, `dialogs/report/*` | control; group (report reasons) | "Your feedback", "How could you help?", "How much time could you give?", "Message", "Why are you reporting Daniel?" (group), "Details (optional)" | default, invalid ("Write a comment before posting. Even one sentence helps."), busy, failed | dialog surface |
| `dialogs/session-expired/invalid` | control; rich error with a link | "Password" + error "That password doesn't match. Try again, or reset it (opens in a new tab)." | invalid, busy | dialog surface |
| `dialogs/change-photo/*` | static around the drop zone | "New photo" + "JPG or PNG, up to 5 MB. Square photos look best." | default, busy, failed, invalid ("That file is a HEIC and 14.8 MB. Choose a JPG or PNG under 5 MB.") | dialog surface |
| `pages/messages/*`, `notifications/connection-banner/*` | control, no help | "Message to Daniel" (textarea, placeholder "Write a reply") | default | thread panel |
| `pages/join/invalid` (`bn-field-error` alone) | standalone error under a `bn-check` | "Agree to the code of conduct to join" | invalid | form card |

## Anatomy

1. **Field** — `.field`. A grid with `--space-2` between rows. `div.field` in
   control and static modes, `fieldset.field` in group mode (border, padding and
   margin reset, `min-width: 0`).
2. **Label** — `.field__label`. `label[for]` (control), `legend` (group) or
   `span[id]` (static). `--text-label`, `--color-fg-default`.
3. **Optional marker** — `.field__optional`, inside the label after one space:
   "(optional)". Regular weight, `--color-fg-subtle`.
4. **Control slot** — the projected control or controls (default slot).
5. **Help** — `p.field__help#{controlId}-help`. `--text-body-sm`,
   `--color-fg-muted`. After the control in control and static modes; directly
   after the legend in group mode.
6. **Error** — `p.field__error#{controlId}-err`: a 16 px alert icon
   (`svg.icon.icon--sm`, `aria-hidden="true"`) and the message in a `span`.
   `--text-body-sm`, `--color-danger-fg`. Always after the control and the help.
7. **Counter** — `p.field__counter#{controlId}-count`, `aria-live="polite"`,
   right-aligned, `--text-caption`, `--color-fg-subtle`, tabular figures. Last.

Host: `bn-field` is `display: block` and renders the `.field` element inside it.
`bn-field-error` is `display: block` and renders one `p.field__error`.

## API

### Inputs

`bn-field`:

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `label` | `string` | — | yes | Visible label text, translated. It is the control's accessible name (or the group's). |
| `controlId` | `string` | — | yes | Control mode: the `id` of the projected control; the label's `for`. Group and static modes: the prefix for the generated ids. Help, error, counter and static-label ids are `{controlId}-help`, `-err`, `-count`, `-label`. |
| `mode` | `'control' \| 'group' \| 'static'` | `'control'` | no | `control`: `div.field` + `label[for]`. `group`: `fieldset.field` + `legend.field__label`, for radio, checkbox and chip groups. `static`: `div.field` + `span.field__label[id]`, for content that is not one labelable control (photo row, a link). |
| `optionalText` | `string \| null` | `null` | no | When set, renders `<span class="field__optional">` with this text (the catalogue's "(optional)") inside the label. Required questions get no marker. |
| `help` | `string \| null` | `null` | no | Plain help text. Renders `p.field__help`. |
| `error` | `string \| null` | `null` | no | The current error message. When non-empty, renders `p.field__error`. Help stays visible. |
| `counter` | `string \| null` | `null` | no | Pre-formatted counter text such as "231 / 400". Renders `p.field__counter` with `aria-live="polite"`. |

`bn-field-error`:

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `message` | `string` | — | yes | The error text. |
| `errorId` | `string \| null` | `null` | no | Sets the `id` of the rendered `p.field__error`, which the control's `aria-describedby` names. |

Helper: `fieldDescribedBy(controlId: string, parts: { help?: boolean; error?: string | null }): string | null`
returns the space-separated ids a control (or a group's fieldset) must name, in
the order help, error — for example `"bio-help bio-err"` — or `null` when there
are none. It replaces the built `fieldDescriptionId()`, which returns one id only.

All inputs are signal inputs.

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| None | | The field displays state; the projected control emits its own events and the form owns the values. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| default | The control(s): `input[bn-input]`, `select[bn-input]`, `bn-select`, `textarea[bn-textarea]`, `bn-choices`, a chip list, an input group, a drop zone, a photo row | Projected between the label (or the group help) and the help/error. |
| `[bnFieldHelp]` | Inline phrasing content (text, `span.typed-name`, `strong`) | Rich help. Projected inside `p.field__help`; the paragraph renders when `help` is set or this slot is filled. |
| `[bnFieldError]` | Inline phrasing content, including a link | Rich error. Projected inside the error's `span`; the paragraph renders when `error` is set or this slot is filled. |

Each slot is declared once in the template. The marker directives `FieldHelp`
(`[bnFieldHelp]`) and `FieldErrorContent` (`[bnFieldError]`) let the component
detect a filled slot with `contentChild`.

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Label and control | — | Every single-control question. |
| With help | — (adds `.field__help`) | A question that needs one sentence of guidance. |
| Optional | — (adds `.field__optional`) | A question the person may skip. |
| With counter | — (adds `.field__counter`) | A length-limited text, such as Bio. |
| Group | `fieldset.field` | Radio and checkbox choices, chip toggles. |
| Static | `span.field__label` | A labelled row with no single labelable control. |
| Standalone error | `bn-field-error` | A control outside a field. |

| Size | Modifier | Height | Padding | Type |
|---|---|---|---|---|
| One size | — | From the content | Row gap `--space-2` | Label `--text-label`; help and error `--text-body-sm`; counter `--text-caption` |

Width is the container's: the field is a block that fills its column; a
`.field-row` puts two fields side by side from 768 px.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | label + control | Label above control | Label is the control's name |
| With help | `help` or `[bnFieldHelp]` | Muted help line below | Control's `aria-describedby` names `{id}-help` |
| Optional | `optionalText` | "(optional)" in regular weight, subtle colour | Part of the name: "Website (optional)" |
| Invalid | `error` or `[bnFieldError]` | Icon + danger text below the control (and below help) | Control has `aria-invalid="true"` and `aria-describedby` names `{id}-err` (after `{id}-help`) |
| Invalid group | `mode="group"` + `error` | Error after the group's content | Fieldset `aria-describedby` names help and error; each control in the group has `aria-invalid="true"` and names `{id}-err` |
| Counter | `counter` | Right-aligned caption | Polite live region reads the new count |
| Over limit | `counter` + `error` | Counter and error both shown ("431 / 400") | As invalid |
| Control busy | control `readonly` (text) or `disabled` (select, choices) during submit | Field unchanged; the control shows its own read-only look | Label and help unchanged |
| Static | `mode="static"` | Same label style on a `span` | Consumer's group names `{id}-label` with `aria-labelledby` |
| Required | control `required` | No marker | Native required state on the control |

The field has no hover, focus or disabled look of its own: those belong to the
control.

## Markup

```html
<!-- rendered: control with help -->
<bn-field>
  <div class="field">
    <label class="field__label" for="email">E-mail</label>
    <input bn-input class="input" id="email" type="email" autocomplete="email" required aria-describedby="email-help">
    <p class="field__help" id="email-help">We only use this to sign you in and to send what you ask for.</p>
  </div>
</bn-field>
```

```html
<!-- rendered: optional label -->
<label class="field__label" for="website">Website <span class="field__optional">(optional)</span></label>
```

```html
<!-- rendered: help, error and counter together (profile Bio, invalid) -->
<div class="field">
  <label class="field__label" for="bio">Bio</label>
  <textarea bn-textarea class="textarea" id="bio" rows="5" aria-invalid="true" aria-describedby="bio-help bio-err">…</textarea>
  <p class="field__help" id="bio-help">Tell builders who you are and what you care about.</p>
  <p class="field__error" id="bio-err"><svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v5M12 15.5h.01"/></svg><span>Your bio is 431 characters. Shorten it to 400 or fewer.</span></p>
  <p class="field__counter" id="bio-count" aria-live="polite">431 / 400</p>
</div>
```

```html
<!-- rendered: group (matching setup, invalid) -->
<fieldset class="field" aria-describedby="need-help need-err">
  <legend class="field__label">Who you need</legend>
  <p class="field__help" id="need-help">Pick all that apply.</p>
  <bn-choices>…</bn-choices>
  <p class="field__error" id="need-err"><svg class="icon icon--sm" …/><span>Choose at least one kind of person you need.</span></p>
</fieldset>
```

```html
<!-- rendered: static (profile photo) -->
<div class="field">
  <span class="field__label" id="photo-label">Photo</span>
  <div class="photo-edit" role="group" aria-labelledby="photo-label">…</div>
</div>
```

```html
<!-- rendered: bn-field-error alone (join) -->
<bn-field-error><p class="field__error" id="agree-err"><svg class="icon icon--sm" …/><span>Agree to the code of conduct to join</span></p></bn-field-error>
```

```html
<!-- consumer -->
<bn-field [label]="'profile.bio' | t" controlId="bio" [help]="'profile.bioHelp' | t"
          [error]="errors().bio" [counter]="bioCount()">
  <textarea bn-textarea id="bio" rows="5" formControlName="bio" [invalid]="!!errors().bio"
            [attr.aria-describedby]="fieldDescribedBy('bio', { help: true, error: errors().bio })"></textarea>
</bn-field>

<bn-field [label]="'projects.delete.confirmLabel' | t" controlId="dp-name">
  <input bn-input id="dp-name" type="text" autocomplete="off" required [attr.aria-describedby]="'dp-name-help'">
  <span bnFieldHelp>{{ 'projects.delete.typeStart' | t }} <span class="typed-name">{{ project().name }}</span> {{ 'projects.delete.typeEnd' | t }}</span>
</bn-field>

<bn-field mode="group" [label]="'matching.need' | t" controlId="need" [help]="'matching.needHelp' | t" [error]="errors().need">
  <bn-choices>…</bn-choices>
</bn-field>
```

The DOM order (label, controls, help, error, counter; group: legend, help,
content, error) and the classes are part of the contract: the e2e page objects
read errors from `.field__error` and help from `.field__help`.

## Design

- Field: `display: grid`, `gap: var(--space-2)`, `align-content: start`.
- Label `--text-label`; optional marker `--font-weight-regular`.
- Help and error `--text-body-sm`; error is a flex row with `--space-2` gap and
  the icon offset down by `--space-1` to sit on the first line.
- Error icon `--space-4` square (`.icon--sm`), stroke `currentColor`.
- Counter `--text-caption`, `justify-self: end`, `font-variant-numeric: tabular-nums`.
- Group: `fieldset.field` resets border, padding and margin; the legend has no
  padding and `--space-2` below it.
- No motion: the error appears and disappears without animation.

Component tokens:

| Token | Aliases | Overridden by |
|---|---|---|
| `--bn-field-border` | `--color-border-strong`; `--color-danger-solid` when the control is invalid | Declared by the controls (`.input`, `.textarea`), not the field |

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Label | `--color-fg-default` | `--palette-ink-900` | `--palette-night-50` |
| Optional marker | `--color-fg-subtle` | `--palette-stone-600` | `--palette-night-300` |
| Help | `--color-fg-muted` | `--palette-stone-700` | `--palette-night-200` |
| Error text and icon | `--color-danger-fg` | `--palette-lingon-700` | `--palette-lingon-300` |
| Counter | `--color-fg-subtle` | `--palette-stone-600` | `--palette-night-300` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-surface` | 4.5:1 | Label on a form card or dialog |
| `--color-fg-default` | `--color-bg-canvas` | 4.5:1 | Label on the page |
| `--color-fg-muted` | `--color-bg-surface` | 4.5:1 | Help text |
| `--color-fg-subtle` | `--color-bg-surface` | 4.5:1 | Optional marker, counter |
| `--color-danger-fg` | `--color-bg-surface` | 4.5:1 | Error text under a control |
| `--color-danger-fg` | `--color-bg-canvas` | 4.5:1 | Error text on the page |

In forced colours the text uses system colours; the error keeps its icon and
words, so it never relies on red.

## Responsive behaviour

- The field is one column at every width and fills its container. Long labels,
  help and errors wrap; nothing truncates ("Type DELETE or your e-mail to
  confirm" wraps at 320 px).
- `.field-row` (form layout) places two fields side by side from 768 px; below
  that they stack.
- At 320 px nothing scrolls horizontally or clips; at 200 % zoom everything stays
  available. The field adds no targets of its own; its label enlarges the
  control's click target.

## Accessibility

### Role and pattern

Native semantics only: `label[for]` names the control; `fieldset`/`legend`
names a group (L2-010 AC 5 requires `fieldset`/`legend` for filter groups and
Banaro uses it for every group question); `aria-describedby` links help and
error. No ARIA role is added.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves through the projected controls. Label, help, error and counter never take focus; a link inside a rich help or error does. |

### Focus

Focus stays on the control and shows the control's ring. The field never moves
focus; moving focus to the first invalid field after a failed submit is the
page's job (L2-001 AC 13). Clicking the label focuses the control.

### Labelling

- The label is the accessible name; it is never replaced by a placeholder.
- Optional questions say "(optional)" in the label; required questions carry the
  native `required` attribute and no symbol.
- `aria-describedby` on the control (or the group's fieldset) lists the help id
  then the error id, so a screen reader reads "E-mail, edit text, invalid entry,
  Enter an e-mail address like name@example.com".
- `aria-invalid` is set on controls only, never on the field wrapper.
- The counter is not in `aria-describedby`; it is a polite live region.

### Announcements

Field errors are not live regions: after a failed submit the form summary is
announced as an alert and focus moves to the first invalid field, which then
reads its error through `aria-describedby`. The counter announces politely.
A live help line such as "3 selected" uses `p.field__help` with
`aria-live="polite"` in the default slot of a group field.

### Motion

None.

## Content and internationalisation

- Labels are short nouns or questions in sentence case: "Full name", "Who you
  need", "How could you help?". No colon.
- Help is one sentence that explains format or use: "At least 12 characters. A
  short sentence works well."
- Errors say what to do, in the person's words: "Enter an e-mail address like
  name@example.com", "Use at least 12 characters (you have 7)".
- Counters read "{count} / {limit}" with grouped thousands from the formatter
  ("1,000"), per L2-052.
- Translatable inputs: `label`, `optionalText`, `help`, `error`, `counter`,
  `message` and slotted copy. Data values: names inside copy ("Daniel",
  "Harvest", "amara@harvest.example").
- Copy may be about 30 % longer in French; every part wraps.

## Performance

- Change detection: `OnPush`, signal inputs; ids and the described-by string are
  `computed`.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Field.ts`
  (exists) renders Amara's invalid e-mail field from `pages/contact/invalid`
  ("E-mail", value "amara@", error "Enter an e-mail address like
  name@example.com"). Add `FieldError.ts` rendering `bn-field-error` with "Agree
  to the code of conduct to join". Iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep each at roughly 100–300 ms.
- Composite scenarios: `DarkTheme` gains the `Field` scenario inside its dark
  wrapper; the control CRDs' scenarios (`Textarea`, `TextField`, `Select`,
  `RadioGroup`, `Slider`) all render inside `bn-field`.
- Layout stability: the field reserves no space for an error. An error appears
  only after a submit the person started, so the shift is user-initiated and not
  counted by CLS; skeleton fields (loading states) match the label + control
  height.
- Weight: no dependencies beyond `@angular/core`.

## Acceptance criteria

### Rendering

- **AC-1** Given the contact form, when the "Your name" field renders with `controlId` "c-name", then it is a `div.field` whose `label.field__label` has `for="c-name"`, and clicking the label focuses the input. (L2-040)
- **AC-2** Given the join form's e-mail field with help "We only use this to sign you in and to send what you ask for.", when it renders, then a `p.field__help#email-help` follows the input and the input's `aria-describedby` is "email-help". (L2-001)
- **AC-3** Given the project form's Website field with `optionalText` "(optional)", when it renders, then the label contains `span.field__optional` with "(optional)" and the input's accessible name is "Website (optional)". (L2-012)
- **AC-4** Given the delete-project dialog, when the confirmation field renders with rich help, then `p.field__help` reads "Type Harvest exactly as shown." with "Harvest" inside `span.typed-name`. (L2-014)
- **AC-5** Given the profile photo row, when the field renders with `mode="static"` and `controlId` "photo", then the label is `span.field__label#photo-label` and the photo group's `aria-labelledby` names it. (L2-008)

### States

- **AC-6** Given the join form submitted with an empty name, when the field receives `error` "Enter your full name", then `p.field__error#name-err` shows the alert icon (`aria-hidden="true"`) and the text in `--color-danger-fg`, and the input has `aria-invalid="true"` and `aria-describedby="name-err"`. (L2-001)
- **AC-7** Given the matching-setup "What you are building" field with help "A sentence or two is plenty.", when it is invalid with "Tell us what you are building.", then the help stays visible above the error and the textarea's `aria-describedby` is "building-help building-err". (L2-021)
- **AC-8** Given Amara's bio of 231 characters, when the field renders with `counter` "231 / 400", then `p.field__counter#bio-count` is right-aligned after the help, uses tabular figures and has `aria-live="polite"`. (L2-007)
- **AC-9** Given a bio of 431 characters, when the profile is saved, then the field shows the error "Your bio is 431 characters. Shorten it to 400 or fewer." followed by the counter "431 / 400". (L2-007)
- **AC-10** Given the matching-setup "Who you need" group, when it renders with `mode="group"` and help "Pick all that apply.", then it is a `fieldset.field` with `legend.field__label` "Who you need", the help directly after the legend, and the fieldset's `aria-describedby` is "need-help". (L2-021)
- **AC-11** Given the "Who you need" group with no choice, when saved, then the error "Choose at least one kind of person you need." renders after the choices and the fieldset's `aria-describedby` becomes "need-help need-err". (L2-021)
- **AC-12** Given the session-expired dialog's wrong password, when the field shows the rich error "That password doesn't match. Try again, or reset it (opens in a new tab).", then the "reset it" link inside the error is reachable with Tab and opens in a new tab. (L2-005)
- **AC-13** Given the join form, when "Agree to the code of conduct to join" is shown with `bn-field-error` and `errorId` "agree-err", then a `p.field__error#agree-err` follows the checkbox row and the checkbox's `aria-describedby` is "agree-err". (L2-001)
- **AC-14** Given an invalid e-mail field, when the person corrects it and the error is cleared, then `p.field__error` is removed and `aria-describedby` no longer names `email-err`. (L2-001)
- **AC-15** Given the contact form while submitting, when its controls become `readonly` (and the Topic select `disabled`), then every label and help keeps its colour and position. (L2-040)

### Keyboard and focus

- **AC-16** Given any field, when the person tabs through the form, then only the controls (and links inside help or error) take focus; the label, help, error and counter never do. (L2-050)

### Screen readers

- **AC-17** Given the sign-in e-mail field is invalid, when it receives focus, then a screen reader announces the label "E-mail", the invalid state and "Enter your e-mail address in the form name@example.com", and nothing about the field is announced until focus arrives. (L2-050)
- **AC-18** Given an error, when rendered, then it is conveyed by its text and icon as well as colour, so it is understood without colour. (L2-050)

### Theming

- **AC-19** Given the light and the dark theme, when a field with help and an error renders on `--color-bg-surface`, then label, help and error text each measure at least 4.5:1. (L2-050)
- **AC-20** Given the theme switch, when the theme changes, then label, help, error and counter recolour from tokens alone with no component code. (L2-051)

### Responsive

- **AC-21** Given a 320 px viewport, when the "Type DELETE or your e-mail to confirm" field renders with its error, then label, help and error wrap and nothing scrolls horizontally. (L2-049)

### Content

- **AC-22** Given the `en-CA` catalogue, when any field renders, then its label, "(optional)", help, error and counter text come from the catalogue and the component contains no hard-coded copy. (L2-052)

### Performance

- **AC-23** Given a change to `bn-field` or `bn-field-error`, when the perf test runs the `Field` and `FieldError` scenarios against the base branch, then neither is flagged as a possible regression. (L2-048)

## Implementation notes

- Help and error together: the built template shows the error *instead of* the
  help (`@if error … @else if help`). Render both, help first (AC-7).
- Add `mode` (`group` → `fieldset`/`legend`; `static` → `span[id]`), with help
  placed after the legend in group mode and `aria-describedby` on the fieldset.
- Add `optionalText`, `counter`, and the `[bnFieldHelp]` / `[bnFieldError]` slots
  with their marker directives.
- Replace `fieldDescriptionId()` with `fieldDescribedBy()` returning both ids;
  update the contact and join pages that call it.
- `bn-field-error`: add `errorId` and put it on `p.field__error`; the join page
  currently sets `id` on the host.
- `field.css` already carries `.field__counter`, `.field__optional` and
  `fieldset.field`; no new styles are needed.
- Add `FieldError.ts` to the perf-test scenarios and export it from
  `scenarios/index.ts`; add `Field` to `DarkTheme.ts`.

## Decisions

- **D-1** *When a field has both help and an error, does the error replace the help?* No, both show, help first. The design-system text-field and textarea invalid specimens show both, `pages/profile-edit/invalid` and `pages/matching-setup/invalid` show both, and keeping instructions visible while correcting serves WCAG 3.3.2. The contact and join invalid mocks drop the help; they catch up.
- **D-2** *Where does help sit in a group?* Directly after the legend, before the choices, as `pages/matching-setup` and `pages/project-new` show, so the instruction is read before the options. In control mode help follows the control, as every single-control mock shows.
- **D-3** *Does the group or each control carry the description?* Both, for errors: the fieldset names help and error, and each control in an invalid group also has `aria-invalid="true"` and names the error, as `dialogs/report/invalid` and `pages/profile-edit/invalid` do, because fieldset descriptions are not read by every screen reader.
- **D-4** *Does the design-system page's `aria-invalid` on the `.field` wrapper apply?* No. `aria-invalid` belongs on the control; the wrapper specimen on the design-system page is drift, and no mock does it.
- **D-5** *How are required questions marked?* Not visually: the design system says "Put optional in the label and required in words", and every mock marks only optional questions. The control carries native `required`.
- **D-6** *Are field errors live regions?* No. L2-001 AC 13 announces the error summary as an alert and moves focus to the first invalid field; a second live announcement per field would repeat it.
- **D-7** *How does a field show rich help or an error with a link?* Through the `[bnFieldHelp]` and `[bnFieldError]` slots, because `dialogs/delete-project` (`.typed-name`) and `dialogs/session-expired/invalid` (a link) need markup that a string input cannot carry safely.
- **D-8** *What does the field do for a disabled or read-only control?* Nothing: the design system's "disabled" field specimen changes only the control, and the submitting mocks keep labels and help unchanged.
- **D-9** *Do form sections that use `fieldset.form-section > legend.field__label` (project "Who are you looking for?", "Who can see it?", give-feedback "What kind of feedback is it?", settings privacy `fieldset.choices`) use this component?* Yes, `bn-field mode="group"`, which renders `fieldset.field`. The legend spacing differs by `--space-1` from the mocks' `.form-section` legend; one group pattern is simpler than two, and the form-layout CRD keeps `.form-section` for titled sections only. Raised with the lead.
