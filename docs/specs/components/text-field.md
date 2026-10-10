# Text field

| Field | Value |
|---|---|
| Selector | `input[bn-input]` (the same `Input` directive also serves `select[bn-input]`, see [select](select.md)); `bn-input-group` |
| Library path | `frontend/projects/components/src/lib/input/` |
| Status | built (`bn-input-group` planned in the same folder) |
| Traces to | L2-001, L2-003, L2-007, L2-012, L2-014, L2-038, L2-040, L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`text-field.html`](../../design-system/components/text-field.html) |
| Source mocks | [`pages/join/*`](../../mocks/pages/join/default.html), [`pages/sign-in/invalid`](../../mocks/pages/sign-in/invalid.html), [`pages/contact/submitting`](../../mocks/pages/contact/submitting.html), [`pages/profile-edit/submitting`](../../mocks/pages/profile-edit/submitting.html), [`pages/project-new/invalid`](../../mocks/pages/project-new/invalid.html), [`pages/project-edit/invalid`](../../mocks/pages/project-edit/invalid.html), [`pages/reset-password/*`](../../mocks/pages/reset-password/default.html), [`pages/settings/*`](../../mocks/pages/settings/default.html), [`dialogs/delete-account/*`](../../mocks/dialogs/delete-account/invalid.html), [`dialogs/session-expired/*`](../../mocks/dialogs/session-expired/busy.html) |
| Rendering | [`text-field.html`](text-field.html) |

## Purpose and scope

The text field is the single-line native `<input>` for short answers: names,
e-mail addresses, passwords, links, project names and typed confirmations. The
`bn-input` attribute styles the real element so browser autofill, password
managers, IME, spell-check and form submission keep working; the label, help and
error come from the surrounding [form field](form-field.md).

One directive, `Input` (`input[bn-input], select[bn-input]`), serves both this
CRD and the [select](select.md) CRD; this document specifies its behaviour on
`<input>`. Use [textarea](textarea.md) for more than one line, the
[search box](search-box.md) for the directory and project search
(`.search__input`), and [slider](slider.md) for distance.

`bn-input-group` lines up a text input with a trailing action button or a short
prefix or suffix, such as the profile's skill entry ("Add a skill, such as
Laravel" + "Add").

Out of scope:

- Label, help, error and counter — [form field](form-field.md).
- Validation, formatting and what Enter does in a form — the page.
- Search inputs with a magnifier and clear button — [search box](search-box.md).
- Showing or hiding a password — no screen uses it; see D-5.

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/join/*`, `pages/onboarding/default` | `type="text"` `autocomplete="name"`; `type="email"`; `type="password"` `autocomplete="new-password"` | "Full name", "E-mail", "Password" | empty, invalid ("Enter your full name"), submitting (`readonly`), `autofocus` on the first field | form card |
| `pages/sign-in/*`, `pages/forgot-password/*`, `dialogs/session-expired/*` | email + `current-password`; session-expired e-mail is `readonly` (username) | "E-mail", "Password" | empty, filled "amara@harvest.example", invalid ("Enter your e-mail address in the form name@example.com"), submitting/busy (`readonly`) | canvas, dialog |
| `pages/reset-password/*` | two `type="password"` `new-password` | "New password", "Confirm new password" | empty, invalid ("Use at least 12 characters (you have 8)"), submitting | form card |
| `pages/contact/*` | text, email | "Your name", "E-mail" | empty, invalid ("Enter an e-mail address like name@example.com"), submitting | canvas |
| `pages/profile-edit/*`, `pages/settings/*` | text "Full name" (value "Amara Osei"), text "Role" ("Founder · Product"), email | — | filled, invalid ("Enter your name so builders know who you are."), submitting (`readonly`), loading (skeleton) | canvas |
| `pages/profile-edit/*` skills | text inside `bn-input-group` with a quiet "Add" button; placeholder "Add a skill, such as Laravel" | input + button | empty, submitting (input and button `disabled`) | canvas |
| `pages/project-new/*`, `pages/project-edit/*`, `dialogs/delete-project/*` | text "Project name", text "One-line summary", `type="url"` "Website (optional)" placeholder "https://", url "Code repository (optional)" placeholder "https://github.com/" | — | empty, filled "https://harvest.example.ca", invalid ("Shorten the summary to 100 characters or fewer. It is 117 now.", "Start the website with https://, for example https://harvest.example.ca."), submitting (`readonly`) | canvas |
| `dialogs/delete-account/*`, `dialogs/delete-project/*` | text `autocomplete="off"` typed confirmation | "Type DELETE or your e-mail to confirm", "Type the project name to confirm" | empty, filled "DELETE", invalid "delete me", busy (`readonly`), failed | dialog surface |
| `pages/onboarding/skills` | text "Something else? (optional)" | — | empty | form card |
| Design system only | `type="number"` "Distance (km)", sizes sm/md, prefix "Within", suffix "km" | — | — | — |

## Anatomy

1. **Input** — `input.input`, the Angular host itself. Full width, `--radius-md`
   corners, hairline `--bn-field-border`, `--color-bg-surface` fill, `--text-body`.
2. **Placeholder** — native `::placeholder`, `--color-fg-subtle`. A hint about
   format only, never the label.
3. **Input group (optional)** — `div.input-group` rendered by `bn-input-group`: a
   flex row with `--space-3` gaps holding the input and a trailing button, or a
   prefix/suffix text span.

Host: `input[bn-input]` is an attribute component on the native `<input>`; it has
no template (`<ng-content>` is unused on a void element) and adds the class
`input`. `bn-input-group` is `display: block` and renders `div.input-group`
around its content.

## API

### Inputs

`input[bn-input]`:

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `invalid` | `boolean` | `false` | no | `true` sets `aria-invalid="true"`; `false` removes the attribute. Bare attribute allowed (`booleanAttribute`). |
| `size` | `'sm' \| 'md' \| 'lg'` | `'lg'` | no | `sm` adds `.input--sm`, `md` adds `.input--md`; `lg` adds no class (the base height). Every form in the mocks uses `lg`. |

Native attributes stay with the consumer and are passed straight through:
`type` (`text`, `email`, `password`, `url`, `number`, `tel`), `id`, `name`,
`autocomplete`, `required`, `readonly`, `disabled`, `placeholder`, `maxlength`,
`inputmode`, `autofocus` and `aria-describedby`. Reactive-forms directives
(`formControlName`) work on the element unchanged.

`bn-input-group`: no inputs.

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| None | | The native element emits `input`, `change`, `focus` and `blur`; forms bind to them directly. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `input[bn-input]`: None | | A void element has no content. |
| `bn-input-group` default | `input[bn-input]`, then a `button[bn-button]` (`variant="quiet"`) or a `span` prefix/suffix | Rendered in DOM order inside `div.input-group`. The input grows; the button and text keep their size. |

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Text | `type="text"` | Names, roles, project names, typed confirmations |
| E-mail | `type="email"` + `autocomplete="email"` or `"username"` | Sign-in, join, contact, settings |
| Password | `type="password"` + `autocomplete="current-password"` or `"new-password"` | Sign-in, join, reset, session expiry |
| URL | `type="url"` + placeholder "https://" | Project website and repository |
| Number | `type="number"` + `inputmode="numeric"` | Design-system specimen ("Distance (km)"); no screen uses it yet |
| With trailing action | `bn-input-group` + quiet button | Profile skill entry |
| With prefix or suffix | `bn-input-group` + `span` | Units ("km") — the label must already name the unit |

| Size | Modifier | Height | Padding | Type |
|---|---|---|---|---|
| sm | `.input--sm` | `--control-height-sm` | `0 var(--space-4)` | `--text-body` at `--font-size-sm` |
| md | `.input--md` | `--control-height-md` | `0 var(--space-4)` | `--text-body` |
| lg (default) | — | `--control-height-lg` | `0 var(--space-4)` | `--text-body` |

Width is always 100 % of the field or the group's remaining space.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Empty | no value | Surface fill, strong border; placeholder (if any) in subtle text | Name from the label |
| Filled | value | Value in `--color-fg-default` | Value read |
| Hover | `:hover` | Border `--color-fg-muted` | — |
| Focus | `:focus-visible` | `--focus-ring-width` ring in `--color-focus-ring`, `--focus-ring-offset` outside the border | Focus on the native input |
| Active | `:active` | As focus (typing caret) | — |
| Invalid | `aria-invalid="true"` | Border `--color-danger-solid`, fill `--color-danger-bg` | "invalid entry"; the error text via `aria-describedby` |
| Invalid + focus | both | Danger border and fill plus the focus ring | As invalid |
| Read-only | `readonly` (submitting and busy states) | Fill `--color-bg-subtle`, text `--color-fg-muted`, `cursor: not-allowed` | Focusable, value read, "read only" |
| Disabled | `disabled` | As read-only | Removed from tab order; value not submitted |
| Required | `required` | No visual marker | "required" |
| Autofill | `:autofill` | Browser autofill tint allowed; border and radius unchanged | — |
| Loading | page loading | Replaced by a skeleton of `--control-height-lg` | — |

## Markup

```html
<!-- rendered: default (inside bn-field) -->
<input bn-input class="input" id="email" name="email" type="email" autocomplete="email" required aria-describedby="email-help">
```

```html
<!-- rendered: invalid -->
<input bn-input class="input" id="c-email" type="email" value="amara@" autocomplete="email" required aria-invalid="true" aria-describedby="c-email-err">
```

```html
<!-- rendered: submitting -->
<input bn-input class="input" id="name" type="text" value="Amara Osei" autocomplete="name" required readonly>
```

```html
<!-- rendered: medium size -->
<input bn-input class="input input--md" id="answer" type="text">
```

```html
<!-- rendered: input group (profile skills) -->
<bn-input-group>
  <div class="input-group">
    <input bn-input class="input" id="skill-add" type="text" placeholder="Add a skill, such as Laravel" aria-describedby="skills-help">
    <button bn-button class="btn btn--quiet" type="button">Add</button>
  </div>
</bn-input-group>
```

```html
<!-- consumer -->
<bn-field [label]="'identity.join.email' | t" [controlId]="ids.email" [help]="'identity.join.emailHelp' | t" [error]="errors().email">
  <input bn-input [id]="ids.email" type="email" autocomplete="email" formControlName="email"
         [readonly]="state() === 'submitting'" [invalid]="!!errors().email"
         [attr.aria-describedby]="fieldDescribedBy(ids.email, { help: true, error: errors().email })">
</bn-field>
```

## Design

- Height from the size (`--control-height-lg` by default); side padding `--space-4`.
- Border `--border-width-hairline` in `--bn-field-border`; radius `--radius-md`.
- Text `--text-body` in `--color-fg-default`; placeholder `--color-fg-subtle`.
- Focus ring `--focus-ring-width` of `--color-focus-ring` at `--focus-ring-offset`.
- Input group: flex row, `align-items: center`, gap `--space-3`.
- Colour transitions follow the shared motion rule: none on the input (the native
  caret and ring appear immediately).

Component tokens:

| Token | Aliases | Overridden by |
|---|---|---|
| `--bn-field-border` | `--color-border-strong` | `--color-fg-muted` on hover; `--color-danger-solid` when `aria-invalid="true"` |

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Fill | `--color-bg-surface` | `--palette-birch-50` | `--palette-night-900` |
| Border | `--color-border-strong` | `--palette-stone-500` | `--palette-night-500` |
| Border (hover) | `--color-fg-muted` | `--palette-stone-700` | `--palette-night-200` |
| Value | `--color-fg-default` | `--palette-ink-900` | `--palette-night-50` |
| Placeholder | `--color-fg-subtle` | `--palette-stone-600` | `--palette-night-300` |
| Invalid border | `--color-danger-solid` | `--palette-lingon-600` | `--palette-lingon-300` |
| Invalid fill | `--color-danger-bg` | `--palette-lingon-100` | `--palette-lingon-950` |
| Read-only / disabled fill | `--color-bg-subtle` | `--palette-oat-200` | `--palette-night-800` |
| Read-only / disabled text | `--color-fg-muted` | `--palette-stone-700` | `--palette-night-200` |
| Focus ring | `--color-focus-ring` | `--palette-sage-700` | `--palette-sage-300` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-surface` | 4.5:1 | Typed value |
| `--color-fg-subtle` | `--color-bg-surface` | 4.5:1 | Placeholder |
| `--color-border-strong` | `--color-bg-surface` | 3:1 | Input border (WCAG 1.4.11) |
| `--color-border-strong` | `--color-bg-canvas` | 3:1 | Input border on the page |
| `--color-danger-solid` | `--color-bg-surface` | 3:1 | Invalid border |
| `--color-fg-default` | `--color-danger-bg` | 4.5:1 | Value in an invalid input |
| `--color-fg-muted` | `--color-bg-subtle` | 4.5:1 | Read-only value |
| `--color-focus-ring` | `--color-bg-surface` | 3:1 | Focus ring |

Forced colours: the border becomes `CanvasText` (`@media (forced-colors: active)`).

## Responsive behaviour

- The input is 100 % wide at every breakpoint; nothing changes between XS and XL.
- `bn-input-group` stays one row; the input shrinks (`min-width: 0`) so the "Add"
  button never wraps off-screen at 320 px.
- Long values scroll inside the input (native behaviour); labels and errors wrap
  in the field.
- At 320 px nothing scrolls horizontally or clips; at 200 % zoom everything stays
  available; the `lg` height (`--control-height-lg`) exceeds the 44 × 44 CSS px
  target. `sm` is for dense desktop toolbars only and is not used on touch layouts.

## Accessibility

### Role and pattern

Native `<input>` (textbox, or the password/e-mail/url variants). No ARIA role.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Enter and leave the input (read-only inputs stay in the tab order; disabled ones do not). |
| Text editing keys | Native editing, selection, undo. |
| <kbd>Enter</kbd> | Native implicit submission of the enclosing form; in `bn-input-group` the page may bind Enter to the trailing action ("Press Enter to add one"). |
| <kbd>Escape</kbd> | No action; inside a dialog the dialog closes and the value is kept. |

### Focus

The ring is drawn by the shared `:focus-visible` rule: 2 px `--color-focus-ring`
at a 3 px offset, at least 3:1 against the surface. The component never moves
focus; `autofocus` is the page's choice (first field on join, sign-in,
onboarding and reset-password).

### Labelling

- Named by `label[for]` from `bn-field`; never by placeholder alone.
- `aria-describedby` names help then error (form field CRD).
- `aria-invalid="true"` only while an error is shown.
- `autocomplete` tokens are required on identity fields (`name`, `email`,
  `username`, `current-password`, `new-password`) so password managers work
  (WCAG 1.3.5).
- The trailing button in an input group has its own visible name ("Add").

### Announcements

None from the input; errors are announced through the form summary and
`aria-describedby`.

### Motion

None.

## Content and internationalisation

- Placeholders show format only: "https://", "https://github.com/", "Add a skill,
  such as Laravel". Never a sample person ("amara@example.com") as the only hint.
- Values entered by people are data and are never translated; labels,
  placeholders and button text are catalogue strings.
- E-mail and URL values are typed as entered; numbers use `inputmode="numeric"`
  and any displayed number is formatted by the page per L2-052.
- Translatable: `placeholder` values, the input group's button label and
  prefix/suffix text. Data: values ("Amara Osei", "Founder · Product",
  "https://harvest.example.ca").

## Performance

- Change detection: `OnPush`; the directive has two signal inputs and host
  bindings only, no template work.
- Perf-test scenario: add `frontend/projects/perf-test/src/scenarios/TextField.ts`
  rendering Amara's "Full name" field (`value="Amara Osei"`,
  `autocomplete="name"`) inside `bn-field`, and `InputGroup.ts` rendering the
  skills entry with the "Add" button. Iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep each at roughly 100–300 ms.
- Composite scenarios: `Field` (the invalid e-mail) already renders
  `input[bn-input]`.
- Layout stability: the input's height is fixed by `min-height`; loading skeletons
  use the same `--control-height-lg`, so data arrival shifts nothing (L2-048 AC 4).
- Weight: no dependencies beyond `@angular/core`.

## Acceptance criteria

### Rendering

- **AC-1** Given the join form, when the e-mail field renders, then the native `<input type="email">` has the class `input`, `autocomplete="email"`, a `--control-height-lg` height and a `--color-border-strong` hairline border. (L2-001)
- **AC-2** Given the sign-in form, when the password field renders, then it is `type="password"` with `autocomplete="current-password"`, and a password manager can fill it. (L2-003)
- **AC-3** Given the project form, when the Website field is empty, then it shows the placeholder "https://" in `--color-fg-subtle` and its accessible name is "Website (optional)", not the placeholder. (L2-012)
- **AC-4** Given the profile's skill entry, when it renders, then `div.input-group` holds the input with placeholder "Add a skill, such as Laravel" and a quiet "Add" button on one row, and at 320 px the button stays on that row. (L2-007)

### Variants and sizes

- **AC-5** Given `size="md"`, when the input renders, then it has the classes `input input--md` and a `--control-height-md` height; given no size, then it has only `input` and `--control-height-lg`. (L2-051)

### States

- **AC-6** Given the contact form submitted with "amara@", when `invalid` is true, then the input has `aria-invalid="true"`, a `--color-danger-solid` border and a `--color-danger-bg` fill, and keeps the typed value "amara@". (L2-040)
- **AC-7** Given `invalid` becomes false, when the error clears, then the `aria-invalid` attribute is removed (not set to "false") and the border returns to `--color-border-strong`. (L2-040)
- **AC-8** Given the join form is submitting, when the inputs are `readonly`, then they keep their values, show the `--color-bg-subtle` fill and `--color-fg-muted` text, stay focusable and cannot be edited. (L2-001)
- **AC-9** Given the profile form is submitting, when the skill input and its "Add" button are `disabled`, then neither can be focused or used. (L2-007)
- **AC-10** Given the delete-account dialog, when "delete me" is typed and confirmed, then the input shows the invalid state with "That doesn't match. Type DELETE or amara@harvest.example exactly." and keeps the typed text. (L2-038)
- **AC-11** Given the project form with a 117-character summary, when saved, then the summary input stays invalid with its full value until the person shortens it. (L2-012)

### Keyboard and focus

- **AC-12** Given any text field, when it receives keyboard focus, then a 2 px `--color-focus-ring` ring appears 3 px outside the border with at least 3:1 contrast against `--color-bg-surface`. (L2-050)
- **AC-13** Given the delete-project dialog is busy, when the confirmation input is `readonly`, then Tab still reaches it and Escape does not clear it. (L2-014)

### Screen readers

- **AC-14** Given the invalid sign-in e-mail "amara.osei", when it is focused, then a screen reader reads "E-mail", "invalid entry", the value and "Enter your e-mail address in the form name@example.com". (L2-050)
- **AC-15** Given join and reset-password, when inspected, then name, e-mail and password inputs carry the `autocomplete` tokens `name`, `email` and `new-password`. (L2-050)

### Theming

- **AC-16** Given the dark theme, when an empty input with a placeholder renders on `--color-bg-surface`, then the placeholder measures at least 4.5:1 and the border at least 3:1. (L2-050)
- **AC-17** Given the theme switch, when it toggles, then the input, its invalid and read-only states recolour from tokens with no component code. (L2-051)

### Responsive

- **AC-18** Given a 320 px viewport, when the "One-line summary" field shows a 117-character value, then the page does not scroll horizontally and the input stays within its column. (L2-049)
- **AC-19** Given a touch layout below 576 px, when any default-size input is measured, then its target is at least 44 × 44 CSS px. (L2-049)

### Content

- **AC-20** Given the `en-CA` catalogue, when the skill entry renders, then the placeholder "Add a skill, such as Laravel" and the button "Add" come from the catalogue. (L2-052)

### Performance

- **AC-21** Given a change to `Input` or `bn-input-group`, when the perf test runs `TextField`, `InputGroup` and `Field` against the base branch, then none is flagged as a possible regression. (L2-048)

## Implementation notes

- Built: `Input` (`input[bn-input], select[bn-input]`) with `invalid` and the
  `input` host class; `input.css` already has the size classes.
- Add the `size` input mapping to `.input--sm` / `.input--md` (the CSS exists,
  nothing sets it).
- `input.css` sets `:host([readonly])` and `:host([disabled])` together — keep.
- Add `bn-input-group` (`input-group.ts`, `input-group.css` with the
  `.input-group` rule plus `min-width: 0` on the projected input) in the same
  `input/` folder and export it from `public-api.ts`.
- Add the `TextField` and `InputGroup` perf scenarios.
- The select behaviour of the same directive (class switch inside `bn-select`) is
  specified in [select](select.md).

## Decisions

- **D-1** *What is the default size?* `lg` with no modifier class: every mock form uses the 52 px input, and the design system says "The mocks use large 52px inputs in forms".
- **D-2** *Read-only or disabled while submitting?* Read-only for text inputs, as every submitting and busy mock does, so the value stays readable, focusable and is still submitted; disabled only where a mock shows it (the profile skill entry and its "Add" button).
- **D-3** *May a placeholder carry an example value?* Only format hints ("https://"). The design system says never placeholder-only labels and not to use a sample e-mail as the accessible name.
- **D-4** *Is there a show-password toggle?* No built-in toggle. The design-system specimen shows a quiet "Show password" button in an input group, but no screen uses one; if a screen needs it, it composes `bn-input-group` + a quiet button with `aria-pressed`, which this API already supports.
- **D-5** *Are prefix and suffix text announced?* No: they are `aria-hidden="true"` because the label must already name the unit ("Distance (km)"), as the design system's labels do.
- **D-6** *Should the shared input group be a component or a class?* A component, `bn-input-group`, so its styles live in the components library rather than global CSS (AGENTS.md); it adds no behaviour.
