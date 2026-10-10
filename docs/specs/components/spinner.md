# Spinner

| Field | Value |
|---|---|
| Selector | `span[bn-spinner]` |
| Library path | `frontend/projects/components/src/lib/spinner/` |
| Status | planned |
| Traces to | L2-001, L2-008, L2-016, L2-048, L2-050, L2-051 |
| Design system | [`spinner.html`](../../design-system/components/spinner.html) |
| Source mocks | [`pages/join/submitting`](../../mocks/pages/join/submitting.html), [`pages/sign-in/submitting`](../../mocks/pages/sign-in/submitting.html), [`dialogs/change-photo/busy`](../../mocks/dialogs/change-photo/busy.html), [`dialogs/block-builder/busy`](../../mocks/dialogs/block-builder/busy.html), [`dialogs/give-feedback/busy`](../../mocks/dialogs/give-feedback/busy.html), and every other `*/busy` and `*/submitting` state |
| Rendering | [`spinner.html`](spinner.html) |

## Purpose and scope

The spinner is a small rotating ring that says "this is working" next to the words that say what is
working: "Creating your account…", "Uploading…", "Sending introduction". It indicates a short local
operation, inside the control or message it belongs to. It is decorative: the label next to it is what
people and screen readers rely on.

Use a [skeleton](skeleton.md) while page content loads, a [progress bar](progress-bar.md) when the
amount done is known, and an [inline message](inline-message.md) with `icon="busy"` for a standalone
busy status with text. Never use a spinner alone to stand in for a whole page.

Out of scope:

- The busy state of a button (`aria-busy`, disabling, the busy label); the [button](button.md) owns
  it and places the spinner.
- Announcing progress; the surrounding control or live message does that.

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| Submitting pages: `join` ("Creating your account…"), `sign-in` ("Signing in…"), `forgot-password` ("Sending…"), `reset-password` ("Updating…"), `onboarding` ("Saving your profile…"), `profile-edit` / `settings` / `project-edit` ("Saving…"), `project-new` ("Sharing…"), `contact` ("Sending…"), `matching-setup` ("Starting matching") | inside a primary busy button, 16 px | button label | spinning | busy primary button |
| Busy dialogs: `say-hello`, `offer-to-help`, `report` ("Sending…"), `give-feedback` ("Posting…"), `change-photo` ("Uploading…"), `session-expired` ("Signing in…"), `pass-suggestion` ("Pass"), `pause-matching` ("Pause matching") | inside a primary busy button, 16 px | button label | spinning | busy primary button |
| Busy dialogs: `block-builder` ("Blocking…"), `delete-account` / `delete-project` ("Deleting…"), `cancel-rsvp` ("Cancel RSVP") | inside a danger busy button, 16 px | button label | spinning | busy danger button |
| Design-system page | `sm`, `md`, `lg`, inside `.inline-status` with `role="status"` | "Sending introduction" | spinning | canvas |

Every row is buildable with the API below.

## Anatomy

1. **Ring** — `span.spinner` (+ `.spinner--{size}`), `aria-hidden="true"`. A circle whose border is
   `currentColor` with the right quarter transparent, rotating.

Host: an attribute component on a native `<span>`; the classes and `aria-hidden` go on the host, so the
DOM is exactly the mock's `<span aria-hidden="true" class="spinner">`.

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `size` | `'sm' \| 'md' \| 'lg'` | `'sm'` | no | Adds `.spinner--sm`, `.spinner--md` or `.spinner--lg`. |

### Outputs

None.

### Content slots

None. The spinner has no text; its neighbour carries the words.

## Variants and sizes

One visual variant; the colour is `currentColor`, so it takes the colour of the text it sits beside
(the button label, the inline message).

| Size | Modifier | Diameter | Ring | Use for |
|---|---|---|---|---|
| sm | `.spinner--sm` | `--space-4` (16 px) | `--border-width-thick` | Inside buttons and inline messages (every product use) |
| md | `.spinner--md` | `--space-6` (24 px) | `--border-width-thick` | Beside body-size text in a panel |
| lg | `.spinner--lg` | `--space-8` (32 px) | `--size-spinner--lg-border-width-21` | Beside a heading-size message |

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Spinning | rendered, motion allowed | Rotates one turn per `--duration-deliberate`, linear, forever | Hidden (`aria-hidden="true"`) |
| Still | `prefers-reduced-motion: reduce` | Static ring with its gap | Hidden |
| In a busy button | inside a `button[bn-button]` with `busy` | Ring in the button's label colour | Hidden; the button has `aria-busy="true"` and a busy label |

There are no interaction states; the spinner is never focusable.

## Markup

```html
<!-- rendered: inside a busy button (pages/join/submitting); the button CRD owns the button markup -->
<button aria-busy="true" class="btn btn--primary" disabled type="submit"><span aria-hidden="true" class="spinner spinner--sm"></span>Creating your account…</button>
```

```html
<!-- rendered: inside a live inline message (design-system page) -->
<span class="inline-status" role="status"><span aria-hidden="true" class="spinner spinner--sm"></span>Sending introduction</span>
```

```html
<!-- rendered: large -->
<span aria-hidden="true" class="spinner spinner--lg"></span>
```

```html
<!-- consumer -->
<span bn-spinner></span>
<span bn-spinner size="lg"></span>
```

Page objects locate the busy indicator by `.spinner` inside its control.

## Design

- Box: `width`/`height` from the size; `flex: none`; `border-radius: var(--radius-full)`.
- Ring: `border: var(--border-width-thick) solid currentColor; border-right-color: transparent`;
  `lg` uses `--size-spinner--lg-border-width-21`.
- Motion: `animation: spin var(--duration-deliberate) linear infinite`, only inside
  `prefers-reduced-motion: no-preference`; the `spin` keyframe rotates one turn.
- Spacing: none of its own; the parent's `gap` spaces it (`--space-3` in a busy button, `--space-2` in
  an inline message).

Component tokens: none.

## Colour

The ring is `currentColor`: it always matches the label it sits beside, in whatever state the parent
is drawn, so the spinner has no colour tokens of its own.

| Part | Token | Light | Dark |
|---|---|---|---|
| Ring in a busy button as the mocks draw it (`disabled` + `aria-busy`) | `--color-fg-disabled` on `--color-bg-subtle` (via the button) | `--palette-oat-400` on `--palette-oat-200` | `--palette-night-500` on `--palette-night-800` |
| Ring in an inline message | `--color-fg-muted` (via `currentColor`) | `--palette-stone-700` | `--palette-night-200` |
| Ring in a busy button the [button](button.md) CRD keeps in its variant colours | `--color-fg-on-accent` / `--color-fg-on-danger` | `--palette-birch-50` / `--palette-white` | `--palette-sage-950` / `--palette-lingon-950` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-muted` | `--color-bg-canvas` | 3:1 | Ring in an inline message (non-text) |
| `--color-fg-on-accent` | `--color-accent` | 3:1 | Ring when the busy primary button keeps its fill |
| `--color-fg-on-danger` | `--color-danger-solid` | 3:1 | Ring when the busy danger button keeps its fill |
| `--color-fg-disabled` | `--color-bg-subtle` | none (inactive control, WCAG 1.4.11 exception) | Ring in a `disabled` busy button, as the mocks draw it |

In forced-colours mode `currentColor` maps to the system text or button-text colour, so the ring stays
visible.

## Responsive behaviour

The spinner has a fixed size and does not change across breakpoints. It never causes overflow at
320 px because it sits inside a control that already wraps. It is not a touch target.

## Accessibility

### Role and pattern

Decorative image: `aria-hidden="true"`, no role, no name. The busy state is conveyed by the parent:
the button's `aria-busy="true"` and busy label, or the inline message's `role="status"` text.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Never stops on the spinner. |

### Focus

Never focusable. A busy button keeps focus while its spinner shows ([button](button.md)).

### Labelling

None on the spinner. The adjacent text must name the work: "Uploading…", "Sending introduction", not
an unnamed "Loading".

### Announcements

None from the spinner.

### Motion

Rotation stops under `prefers-reduced-motion: reduce`; the ring remains as a static mark next to the
label (L2-050).

## Content and internationalisation

The spinner has no copy. Its neighbour's copy is a verb in the progressive with an ellipsis ("Saving…",
"Creating your account…") from the catalogue.

## Performance

- Change detection: `OnPush`; one signal input; host class `computed`.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Spinner.ts` renders the three sizes
  side by side (no text); iterations in `e2e/perf-test/config/scenario-iterations.mjs` keep it at
  roughly 100–300 ms.
- Composite scenarios: `ButtonBusy` ("Creating your account…") exercises the spinner inside a button.
- Layout stability: fixed size; a busy button reserves no extra width beyond the spinner and gap, and
  the button CRD keeps its width stable.
- Weight: no imports beyond `@angular/core`; the animation is pure CSS.

## Acceptance criteria

### Rendering

- **AC-1** Given the join form is submitted, when the button shows "Creating your account…", then a `span.spinner` with `aria-hidden="true"` precedes the label inside the button, 16 px square. (L2-001)
- **AC-2** Given the change-photo upload is running, when the dialog shows "Uploading…", then the spinner inside the button draws its ring in exactly the button label's computed colour (`currentColor`) with a transparent right quarter. (L2-008)
- **AC-3** Given `<span bn-spinner size="md">` and `<span bn-spinner size="lg">`, when rendered, then they are 24 px and 32 px square with `.spinner--md` and `.spinner--lg`, and the large ring uses `--size-spinner--lg-border-width-21`. (L2-051)

### Screen readers

- **AC-4** Given the give-feedback dialog is busy with "Posting…", when a screen reader reads the button, then it reads "Posting…" and the busy state, and nothing for the spinner. (L2-016)
- **AC-5** Given any spinner, when the page is navigated with Tab, then the spinner is never a tab stop and has no accessible name. (L2-050)

### Theming

- **AC-6** Given a live inline message "Sending introduction" on the canvas in light and dark, when measured, then the ring's colour reaches at least 3:1 against the canvas. (L2-050)
- **AC-7** Given the theme switches while a button is busy, when the spinner re-renders, then its colour follows the label through `currentColor` with no spinner-specific colour. (L2-051)

### Motion

- **AC-8** Given motion is allowed, when the spinner renders, then it completes one turn every `--duration-deliberate` (900 ms), linearly. (L2-050)
- **AC-9** Given `prefers-reduced-motion: reduce`, when the busy button renders, then the spinner does not rotate and is still visible beside the label. (L2-050)

### Performance

- **AC-10** Given a change to the spinner, when the perf test runs `Spinner` and `ButtonBusy` against the base branch with `--fail-on-regression`, then neither is flagged as a possible regression. (L2-048)

## Implementation notes

- Folder `frontend/projects/components/src/lib/spinner/`, file `spinner.ts`, class `Spinner`, selector
  `span[bn-spinner]`, style `spinner.css` with the `.spinner`, size and `spin` rules from
  `components.css` (including the reduced-motion guard).
- Host bindings: `class` (`spinner spinner--{size}`), `aria-hidden="true"`.
- The built `button` currently draws its busy spinner with a pseudo-element and no element; the
  mocks render `<span aria-hidden="true" class="spinner">` inside the button. Which one the button uses
  is the [button](button.md) CRD's decision; when it renders an element it uses `span[bn-spinner]`.
- Used by [inline message](inline-message.md) (`icon="busy"`).
- Export from `public-api.ts`; add `Spinner.ts` to the perf-test scenarios and `index.ts`.

## Decisions

- **D-1** *Which size is the default?* `sm` (16 px): every product use is inside a button or an inline
  message at that size. The mocks write the bare `.spinner`, which is the same 16 px; the component adds
  `.spinner--sm` so the size is explicit.
- **D-2** *Does the spinner ever carry a label or `role="status"`?* No. It is always next to text that
  names the work; the parent carries the role (design system: "Spinner never receives focus; its status
  region announces a short purpose").
- **D-3** *What does reduced motion do?* The ring stops rotating and stays visible, so the visual cue
  that work is happening remains without motion (design system: "Stop decorative rotation for reduced
  motion").
- **D-4** *Which colour?* Always `currentColor`, so it matches the label on every fill and theme
  without its own tokens. Inside a busy button drawn `disabled` (as in the mocks) the ring is as muted
  as the label; whether a busy button keeps its variant colours is the [button](button.md) CRD's
  decision, and the spinner follows either way.
