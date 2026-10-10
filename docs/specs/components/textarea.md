# Textarea

| Field | Value |
|---|---|
| Selector | `textarea[bn-textarea]` |
| Library path | `frontend/projects/components/src/lib/textarea/` |
| Status | built |
| Traces to | L2-007, L2-012, L2-016, L2-017, L2-021, L2-026, L2-031, L2-040, L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`textarea.html`](../../design-system/components/textarea.html) |
| Source mocks | [`pages/contact/*`](../../mocks/pages/contact/invalid.html), [`pages/profile-edit/invalid`](../../mocks/pages/profile-edit/invalid.html), [`pages/matching-setup/invalid`](../../mocks/pages/matching-setup/invalid.html), [`pages/project-new/*`](../../mocks/pages/project-new/default.html), [`pages/onboarding/goals`](../../mocks/pages/onboarding/goals.html), [`pages/messages/*`](../../mocks/pages/messages/default.html), [`dialogs/give-feedback/*`](../../mocks/dialogs/give-feedback/invalid.html), [`dialogs/offer-to-help/*`](../../mocks/dialogs/offer-to-help/busy.html), [`dialogs/say-hello/*`](../../mocks/dialogs/say-hello/default.html), [`dialogs/report/*`](../../mocks/dialogs/report/busy.html) |
| Rendering | [`textarea.html`](textarea.html) |

## Purpose and scope

The textarea is the native multi-line `<textarea>` for longer writing: a bio, a
project description, a first message to a builder, feedback on a project, a
report's details, a contact message. `bn-textarea` styles the real element so
spell-check, IME, undo and resizing are the browser's own, and keeps what was
typed through failures.

It sits inside a [form field](form-field.md), which provides the label, help,
error and the character counter. Use the [text field](text-field.md) for one
line.

Out of scope:

- Label, help, error and counter — [form field](form-field.md).
- Length limits and their messages — the page and the API (L2-016, L2-026).
- The message composer's send button and thread — the messages page.

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/contact/*` | `rows="6"`, required, help | "Message" + "Tell us a little context. A real person reads every message, usually within two working days." | empty, invalid ("Write a message so we know how to help"), submitting (`readonly`, "Could our Saturday prayer group at St. Matthew's list a monthly breakfast on Banaro? We would love to know how.") | canvas |
| `pages/profile-edit/*` (behind `dialogs/change-photo`, `dialogs/session-expired`) | `rows="5"`, help, counter | "Bio": "Founder and product lead building Harvest…" + counter "231 / 400" | filled, invalid (431 characters, "Your bio is 431 characters. Shorten it to 400 or fewer.", counter "431 / 400"), submitting (`readonly`) | canvas |
| `pages/profile-edit/*`, `dialogs/report/*` | `rows="3"`, optional | "What I am looking for (optional)", "Details (optional)" | filled, busy (`readonly`) | canvas, dialog |
| `pages/project-new/*`, `pages/project-edit/*` | `rows="6"`, optional, help | "Description (optional)": "Harvest takes the Tuesday-night spreadsheet out of food-bank volunteering…" | empty, filled, submitting (`readonly`) | canvas |
| `pages/onboarding/goals`, `submitting` | `rows="4"`, optional, help | "What are you building? (optional)" + "One or two sentences. It appears on your profile." | filled, submitting | form card |
| `pages/matching-setup/*` | `rows="4"`, required, help | "What you are building" + "A sentence or two is plenty." | empty, invalid (help and error), submitting | canvas |
| `dialogs/give-feedback/*`, `dialogs/say-hello/*` | `rows="5"`, required, help | "Your feedback" + "Be specific and kind. Daniel reads every comment and can reply." | empty, invalid ("Write a comment before posting. Even one sentence helps."), busy (`readonly`, "I use Psalter every morning on the streetcar…"), failed (text kept) | dialog surface |
| `dialogs/offer-to-help/*` | `rows="4"`, required, help | "Message" + "Say what you could do and what you'd like to learn. Short is fine." | empty, invalid ("Write a short message so Daniel knows what you have in mind."), busy, failed | dialog surface |
| `pages/messages/*`, `notifications/connection-banner/*` | `rows="3"`, placeholder | "Message to Daniel", placeholder "Write a reply" | empty | thread panel |
| Design system only | counter "72 / 500 characters", auto-grow | "A note for Daniel" | — | — |

## Anatomy

1. **Textarea** — `textarea.textarea`, the Angular host. Full width, minimum
   height `--size-textarea-min-height-22`, padding `--space-3` × `--space-4`,
   hairline `--bn-field-border`, `--radius-md`, `--color-bg-surface`,
   `--text-body` at `--line-height-normal`, `resize: vertical`.
2. **Placeholder** — native `::placeholder` in `--color-fg-subtle`.

Host: `textarea[bn-textarea]` is an attribute component on the native
`<textarea>` with an empty template; it adds the class `textarea`. The value is
the element's own text content and form value.

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `invalid` | `boolean` | `false` | no | `true` sets `aria-invalid="true"`; `false` removes it. |
| `autoGrow` | `boolean` | `false` | no | `true` sets `field-sizing: content` so the box grows with its text from the minimum height; manual vertical resize stays available. Where the browser lacks `field-sizing`, the box keeps `resize: vertical`. |

Consumer attributes pass through: `id`, `name`, `rows` (3–6 in the mocks),
`required`, `readonly`, `disabled`, `placeholder`, `maxlength` (only where no
over-limit error is shown), `aria-describedby`, `formControlName`.

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| None | | Native `input` and `change` events; forms bind to the element. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| None | | The textarea's initial value comes from the form control, never from projected content. |

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Plain | — | Every form textarea |
| With counter | `bn-field` `counter` | A limit the person is likely to reach (Bio) |
| Auto grow | `autoGrow` | Composers where the text should stay fully visible (design-system specimen; no screen yet) |

| Size | Modifier | Height | Padding | Type |
|---|---|---|---|---|
| One size | — | `rows` from the consumer, never below `--size-textarea-min-height-22` | `--space-3` block, `--space-4` inline | `--text-body`, `--line-height-normal` |

Width is always 100 % of the field.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Empty | no text | Surface fill, strong border, placeholder if set | Name from the label |
| Filled | text | Text in `--color-fg-default`, wraps | Text read |
| Hover | `:hover` | Border `--color-fg-muted` | — |
| Focus | `:focus-visible` | `--color-focus-ring` ring at `--focus-ring-offset` | Focus on the textarea |
| Invalid | `aria-invalid="true"` | Border `--color-danger-solid`, fill `--color-danger-bg` | "invalid entry"; error via `aria-describedby` |
| Read-only | `readonly` (submitting, busy) | Fill `--color-bg-subtle`; text stays `--color-fg-default` | Focusable, "read only" |
| Disabled | `disabled` | Fill `--color-bg-subtle`, text `--color-fg-muted`, `cursor: not-allowed` | Not focusable |
| Over limit | page sets `invalid` + field counter "431 / 400" | As invalid; all text kept | As invalid |
| Failed send | page keeps the value after an error | Unchanged; text preserved | — |
| Required | `required` | No marker | "required" |

## Markup

```html
<!-- rendered: default with help -->
<textarea bn-textarea class="textarea" id="c-message" name="c-message" rows="6" required aria-describedby="c-message-help"></textarea>
```

```html
<!-- rendered: invalid, over limit (profile bio) -->
<textarea bn-textarea class="textarea" id="bio" name="bio" rows="5" aria-invalid="true" aria-describedby="bio-help bio-err">Founder and product lead building Harvest, …</textarea>
```

```html
<!-- rendered: busy (give feedback) -->
<textarea bn-textarea class="textarea" id="fb-comment" rows="5" required readonly aria-describedby="fb-comment-help">I use Psalter every morning on the streetcar. …</textarea>
```

```html
<!-- consumer -->
<bn-field [label]="'contact.message' | t" [controlId]="ids.message" [help]="'contact.messageHelp' | t" [error]="errors().message">
  <textarea bn-textarea [id]="ids.message" rows="6" formControlName="message"
            [readonly]="state() === 'submitting'" [invalid]="!!errors().message"
            [attr.aria-describedby]="fieldDescribedBy(ids.message, { help: true, error: errors().message })"></textarea>
</bn-field>
```

## Design

- Minimum height `--size-textarea-min-height-22` (two or more lines); the
  consumer's `rows` may make it taller.
- Padding `--space-3` `--space-4`; border `--border-width-hairline` in
  `--bn-field-border`; radius `--radius-md`; fill `--color-bg-surface`.
- Text `--text-body`, `--line-height-normal`; placeholder `--color-fg-subtle`.
- `resize: vertical` only, so the width never breaks the layout.
- Focus ring `--focus-ring-width` `--color-focus-ring` at `--focus-ring-offset`.
- No motion.

Component tokens:

| Token | Aliases | Overridden by |
|---|---|---|
| `--bn-field-border` | `--color-border-strong` | `--color-fg-muted` on hover; `--color-danger-solid` when invalid |

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Fill | `--color-bg-surface` | `--palette-birch-50` | `--palette-night-900` |
| Border | `--color-border-strong` | `--palette-stone-500` | `--palette-night-500` |
| Text | `--color-fg-default` | `--palette-ink-900` | `--palette-night-50` |
| Placeholder | `--color-fg-subtle` | `--palette-stone-600` | `--palette-night-300` |
| Invalid border | `--color-danger-solid` | `--palette-lingon-600` | `--palette-lingon-300` |
| Invalid fill | `--color-danger-bg` | `--palette-lingon-100` | `--palette-lingon-950` |
| Read-only fill | `--color-bg-subtle` | `--palette-oat-200` | `--palette-night-800` |
| Focus ring | `--color-focus-ring` | `--palette-sage-700` | `--palette-sage-300` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-surface` | 4.5:1 | Typed text |
| `--color-fg-subtle` | `--color-bg-surface` | 4.5:1 | Placeholder "Write a reply" |
| `--color-fg-default` | `--color-bg-subtle` | 4.5:1 | Read-only text |
| `--color-fg-default` | `--color-danger-bg` | 4.5:1 | Text in an invalid textarea |
| `--color-border-strong` | `--color-bg-surface` | 3:1 | Border |
| `--color-danger-solid` | `--color-bg-surface` | 3:1 | Invalid border |
| `--color-focus-ring` | `--color-bg-surface` | 3:1 | Focus ring |

Forced colours: the border becomes `CanvasText`.

## Responsive behaviour

- Full width at every breakpoint; text wraps inside; the box scrolls vertically
  when the text is taller than the box (or grows with `autoGrow`).
- In a dialog bottom sheet below 576 px (L2-049 AC 5) the textarea keeps its
  `rows` height and the sheet scrolls.
- At 320 px nothing scrolls horizontally or clips; at 200 % zoom everything stays
  available; the textarea is far larger than the 44 × 44 CSS px target.

## Accessibility

### Role and pattern

Native `<textarea>` (multi-line textbox). No ARIA role.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Enter and leave; Tab never inserts a tab character. |
| <kbd>Enter</kbd> | Inserts a new line; it never submits the form. |
| Editing, selection and undo keys | Native. |
| <kbd>Escape</kbd> | No action; in a dialog the dialog closes (unless busy) and the text is kept for the next open only if the page keeps it. |

### Focus

The shared 2 px `--color-focus-ring` ring at a 3 px offset. The component never
moves focus.

### Labelling

Named by `label[for]` from `bn-field`; help and error via `aria-describedby`;
the counter is a separate polite live region. A placeholder never replaces the
label ("Message to Daniel" is the label of the reply box; "Write a reply" is the
placeholder).

### Announcements

None from the textarea. The field's counter announces politely.

### Motion

None.

## Content and internationalisation

- Help explains audience and length: "Be specific and kind. Daniel reads every
  comment and can reply."; "A sentence or two is plenty."
- People's text is data: kept exactly, never translated, output-encoded when
  shown elsewhere (L2-007 AC 6).
- Translatable: `placeholder`. Data: the value.
- Limits are stated in the help or error with grouped numbers ("1,000
  characters"), formatted per L2-052.

## Performance

- Change detection: `OnPush`; two signal inputs and host bindings, no template.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Textarea.ts`
  (exists) renders the contact "Message" field with its help inside `bn-field`.
  Iterations in `e2e/perf-test/config/scenario-iterations.mjs` keep it at
  roughly 100–300 ms. Add `TextareaCounter.ts` rendering Amara's bio with the
  counter "231 / 400".
- Layout stability: the minimum height is fixed by token and `rows`; skeletons
  in loading states match it; `autoGrow` only grows while the person types.
- Weight: no dependencies.

## Acceptance criteria

### Rendering

- **AC-1** Given the contact form, when the Message field renders with `rows="6"`, then the native `<textarea>` has the class `textarea`, at least `--size-textarea-min-height-22` of height, full width, and resizes vertically only. (L2-040)
- **AC-2** Given the messages page, when the reply box is empty, then it shows the placeholder "Write a reply" in `--color-fg-subtle` and its accessible name is "Message to Daniel". (L2-026)

### States

- **AC-3** Given the give-feedback dialog sent empty, when `invalid` is true, then the textarea has `aria-invalid="true"`, a `--color-danger-solid` border and `--color-danger-bg` fill, and names "Write a comment before posting. Even one sentence helps." in `aria-describedby`. (L2-016)
- **AC-4** Given Amara's 431-character bio, when the profile is saved, then the textarea is invalid, keeps all 431 characters, and the field shows the counter "431 / 400". (L2-007)
- **AC-5** Given the give-feedback dialog is busy, when the textarea is `readonly`, then it shows the `--color-bg-subtle` fill, keeps "I use Psalter every morning on the streetcar…" readable in `--color-fg-default`, stays focusable and cannot be edited. (L2-016)
- **AC-6** Given the offer-to-help request fails, when the failed state shows, then the textarea still holds the message Amara wrote. (L2-017)
- **AC-7** Given the matching-setup form submitted with an empty "What you are building", when it is invalid, then the textarea is invalid and its `aria-describedby` is "building-help building-err". (L2-021)

### Keyboard and focus

- **AC-8** Given the report dialog's "Details (optional)" textarea has focus, when Enter is pressed, then a new line is inserted and the report is not submitted. (L2-031)
- **AC-9** Given any textarea, when it receives keyboard focus, then a 2 px `--color-focus-ring` ring shows 3 px outside its border with at least 3:1 contrast. (L2-050)

### Screen readers

- **AC-10** Given the project Description field, when it receives focus, then a screen reader announces "Description (optional)", the multi-line edit role and the help "Who it is for, what exists today and what you need next.". (L2-012)

### Theming

- **AC-11** Given the dark theme, when a read-only textarea renders, then its text on `--color-bg-subtle` measures at least 4.5:1 and its border at least 3:1 against the surface. (L2-050)
- **AC-12** Given the theme switch, when it toggles, then the textarea and its states recolour from tokens alone. (L2-051)

### Responsive

- **AC-13** Given a 320 px viewport, when the say-hello dialog opens as a bottom sheet, then the message textarea fills the sheet's width and nothing scrolls horizontally. (L2-049)

### Content

- **AC-14** Given the `en-CA` catalogue, when the reply box renders, then "Write a reply" comes from the catalogue and the typed text is never passed through translation. (L2-052)

### Performance

- **AC-15** Given a change to `bn-textarea`, when the perf test runs `Textarea` and `TextareaCounter` against the base branch, then neither is flagged as a possible regression. (L2-048)

## Implementation notes

- Built: `textarea[bn-textarea]` with `invalid` and the `textarea` class;
  `textarea.css` matches `components.css`.
- Add `autoGrow` (`[style.field-sizing]="autoGrow() ? 'content' : null"`).
- The read-only text colour: `textarea.css` keeps `--color-fg-default` for
  `[readonly]` and uses `--color-fg-muted` only for `[disabled]`, matching
  `components.css`; keep it.
- Add the `TextareaCounter` scenario.

## Decisions

- **D-1** *Should textareas set `maxlength`?* Not where an over-limit error is shown: `pages/profile-edit/invalid` lets the bio reach 431 characters and explains the limit, which is clearer than silently stopping input. The design-system specimen's `maxlength="500"` is allowed only for fields with no over-limit message.
- **D-2** *Read-only text colour?* `--color-fg-default`, not muted, so a long message under review in a busy dialog stays fully readable; this follows `components.css` (`.textarea[readonly]` changes only the fill).
- **D-3** *How is "auto grow" built, and is it tested?* It is a design-system variant no screen uses yet, so it carries no criterion; it is still built and reviewed. It uses CSS `field-sizing: content`, no script, so it costs nothing at render; browsers without it fall back to vertical resize, which the design system already allows.
- **D-4** *Does Enter ever send?* No. The design system says "Do not submit on Enter in a multi-line note"; the messages page sends with its button.
