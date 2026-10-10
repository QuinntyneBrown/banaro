# Inline message

| Field | Value |
|---|---|
| Selector | `p[bn-inline-message]`, `span[bn-inline-message]` |
| Library path | `frontend/projects/components/src/lib/inline-message/` |
| Status | planned |
| Traces to | L2-019, L2-023, L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`inline-message.html`](../../design-system/components/inline-message.html) |
| Source mocks | [`pages/event-detail/going`](../../mocks/pages/event-detail/going.html), [`pages/event-detail/waitlist`](../../mocks/pages/event-detail/waitlist.html), [`pages/matching/reviewed`](../../mocks/pages/matching/reviewed.html), [`notifications/rsvp-toast/success`](../../mocks/notifications/rsvp-toast/success.html), [`dialogs/cancel-rsvp/default`](../../mocks/dialogs/cancel-rsvp/default.html) (page behind) |
| Rendering | [`inline-message.html`](inline-message.html) |

## Purpose and scope

An inline message is a one-line status that sits right beside the thing it describes: "You're going"
at the top of the RSVP panel, "Full · you're #3 on the waitlist", "You said hello" next to a builder in
this week's matches, "Passed" next to one you passed on, or "Sending introduction" with a small spinner
while a request runs. It is the `.inline-status` block of the design-system page "Inline message".

The same design-system page also shows field hints (`.field__help`) and field errors
(`.field__error`). Those are rendered by the form field (`bn-field`, `bn-field-error`) because they are
wired to the input with `aria-describedby`; this CRD does not re-specify them. Use an
[alert](alert.md) for a message with a title, a body and actions, a [toast](toast.md) for a transient
outcome, and the [spinner](spinner.md) alone only inside a busy control.

Out of scope:

- Field help and field error text (`bn-field`, `bn-field-error`).
- Deciding the status (going, waitlisted, contacted, passed); the page computes it.
- Any action next to the status; the page places buttons separately.

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/event-detail/going` RSVP panel (also behind `cancel-rsvp` and `rsvp-toast/success`) | `<p>`, success, check icon | "You're going" | default | RSVP aside on the canvas |
| `pages/event-detail/waitlist` RSVP panel | `<p>`, neutral, clock icon | "Full · you're #3 on the waitlist" | default | RSVP aside |
| `pages/matching/reviewed` rows | `<span>`, success, check icon | "You said hello" (Daniel Reyes, Noah Fischer) | default | row on the canvas |
| `pages/matching/reviewed` rows | `<span>`, neutral, no icon | "Passed" (Ruth Alvarez) | default | row on the canvas |
| Design-system page (spinner and inline-message specimens) | `<span>`, neutral, busy (spinner), live | "Sending introduction" | busy | any surface |
| Design-system page "Success" | `<p>`, success, no icon | "Your introduction was sent." | default | any surface |

Every row is buildable with the API below.

## Anatomy

1. **Container** — `.inline-status` (+ `.inline-status--success`). An inline-flex row: icon, then
   text, gap `--space-2`, centred vertically.
2. **Icon (optional)** — `svg.icon.icon--sm` (16 px), `aria-hidden="true"`; or, when busy, a
   [spinner](spinner.md) `span.spinner.spinner--sm`, `aria-hidden="true"`.
3. **Text** — the default slot. It is the whole message.

Host: the component is an attribute component on a native `<p>` (a status that stands as its own
paragraph, as in the RSVP panel) or `<span>` (a status inside a row); the classes go on the host, so
the rendered element is the native one, as with `button[bn-button]`.

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `tone` | `'neutral' \| 'success'` | `'neutral'` | no | `success` adds `.inline-status--success`. |
| `icon` | `'none' \| 'check' \| 'clock' \| 'busy'` | `'none'` | no | `check` and `clock` render the 16 px icons from the mocks; `busy` renders `span[bn-spinner]` size `sm`. |
| `live` | `boolean` (`booleanAttribute`) | `false` | no | Sets `role="status"` on the host, so changes to the text are announced politely. Use it when the message changes while the person is on the page (busy → done). |

### Outputs

None. The message is not interactive.

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| default | Text, optionally with inline `<strong>` or `<a>` | The message. Translatable. Must make sense without the icon or the colour. |

## Variants and sizes

| Variant | Modifier | Icon | Use for |
|---|---|---|---|
| Neutral | none | none, clock or busy | A fact without judgement: "Passed", "Full · you're #3 on the waitlist", "Sending introduction" |
| Success | `.inline-status--success` | check (or none) | A confirmed good state: "You're going", "You said hello" |

One size: `--text-body-sm` with a 16 px icon. Width follows the text.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | rendered | Text in the tone's colour, optional icon | Read as text in reading order |
| Busy | `icon="busy"` | Small spinner before the text, rotating | Spinner hidden; the text ("Sending introduction") is read; with `live`, announced when it appears |
| Updated | text or tone changes with `live` | New text | Announced politely, focus unchanged |
| Long text | narrow container | Text wraps under itself beside the icon | Full text read |

There are no hover, focus, active or disabled states; the message is passive.

## Markup

```html
<!-- rendered: success with check (pages/event-detail/going) -->
<p class="inline-status inline-status--success"><svg aria-hidden="true" class="icon icon--sm" viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"></path></svg>You're going</p>
```

```html
<!-- rendered: neutral with clock (pages/event-detail/waitlist) -->
<p class="inline-status"><svg aria-hidden="true" class="icon icon--sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"></circle><path d="M12 7.5V12l3 2"></path></svg>Full · you're #3 on the waitlist</p>
```

```html
<!-- rendered: neutral, no icon (pages/matching/reviewed) -->
<span class="inline-status">Passed</span>
```

```html
<!-- rendered: busy and live (design-system spinner page) -->
<span class="inline-status" role="status"><span aria-hidden="true" class="spinner spinner--sm"></span>Sending introduction</span>
```

```html
<!-- consumer -->
<p bn-inline-message tone="success" icon="check">{{ 'events.rsvp.going' | translate }}</p>
<p bn-inline-message icon="clock">{{ 'events.rsvp.waitlisted' | translate: { position: 3 } }}</p>
<span bn-inline-message tone="success" icon="check">{{ 'matching.reviewed.saidHello' | translate }}</span>
<span bn-inline-message live [icon]="sending() ? 'busy' : 'none'">{{ statusText() }}</span>
```

Page objects locate by `.inline-status` and `.inline-status--success`.

## Design

- `display: inline-flex; align-items: center; gap: var(--space-2)`; type `--text-body-sm`.
- Icon: `.icon.icon--sm` (`--space-4` square), stroke 1.5, `currentColor`, so it takes the tone's colour.
- Busy spinner: `.spinner.spinner--sm` (`--space-4`), ring `--border-width-thick` in `currentColor`.
- No margins of its own; the page spaces it (the RSVP panel's stack).
- Motion: only the spinner's rotation (see [spinner](spinner.md)).

Component tokens: none.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Neutral text and icon | `--color-fg-muted` | `--palette-stone-700` | `--palette-night-200` |
| Success text and icon | `--color-success-fg` | `--palette-sage-700` | `--palette-sage-200` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-muted` | `--color-bg-surface` | 4.5:1 | Neutral message in the RSVP panel |
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Neutral message in a row |
| `--color-success-fg` | `--color-bg-surface` | 4.5:1 | Success message |
| `--color-success-fg` | `--color-bg-canvas` | 4.5:1 | Success message on the page |

In forced-colours mode the text and icon take the system text colour; the words still carry the
status.

## Responsive behaviour

- The message is a single inline-flex row; in a narrow container the text wraps beside the icon and the
  icon stays top-aligned with the first line only when the text wraps (the row centres a single line).
- At 320 px "Full · you're #3 on the waitlist" fits or wraps within the RSVP panel without horizontal
  scroll (L2-049). Nothing truncates.
- No touch target: the message is not interactive.

## Accessibility

### Role and pattern

Plain text (`<p>` or `<span>`). With `live`, `role="status"` (polite live region). The icon and spinner
are decorative; the words carry the status (L2-050), so success is never conveyed by the green colour
or the check alone.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Never stops on the message. Links inside it, if any, are reached normally. |

### Focus

Never takes or moves focus.

### Labelling

The text is the message. It does not need `aria-label`. The RSVP panel's heading ("Your RSVP",
"Waitlist") gives it context.

### Announcements

Only with `live`: changes after insertion are announced politely ("Sending introduction" → "Your
introduction was sent."). Static messages rendered with the page are not announced.

### Motion

The busy spinner stops rotating under `prefers-reduced-motion: reduce` and stays visible as a static
ring; the text is unchanged (L2-050).

## Content and internationalisation

- A few words, sentence case, no full stop for fragments ("You're going", "Passed"); a full sentence
  ends with one ("Your introduction was sent.").
- Positions and counts come from data with L2-052 number formatting ("#3"). The middle dot " · "
  separates two facts.
- Translatable: the whole text through the catalogue, with placeholders for data ("Full · you're
  #{position} on the waitlist").

## Performance

- Change detection: `OnPush`; inputs are signals; host classes are `computed`.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/InlineMessage.ts` renders the waitlist
  message "Full · you're #3 on the waitlist" with the clock icon and the success "You said hello" with
  the check; iterations in `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly 100–300 ms.
- Composite scenarios: none yet; a matches list scenario that repeats rows should include it.
- Layout stability: switching `icon` between `busy` and `none` changes width by the icon and gap only
  inside its own line; place it where a width change does not move other content.
- Weight: imports the spinner component only.

## Acceptance criteria

### Rendering

- **AC-1** Given Amara is going to Fall Demo Night, when the RSVP panel renders, then it shows `<p class="inline-status inline-status--success">` with the 16 px check icon (`aria-hidden="true"`) and the text "You're going". (L2-019)
- **AC-2** Given Amara is third on the waitlist, when the RSVP panel renders, then it shows `<p class="inline-status">` with the clock icon and the text "Full · you're #3 on the waitlist". (L2-019)
- **AC-3** Given Amara said hello to Daniel Reyes and passed on Ruth Alvarez, when the `reviewed` matches list renders, then Daniel's row ends with `<span class="inline-status inline-status--success">` "You said hello" with the check, and Ruth's row ends with `<span class="inline-status">` "Passed" without an icon. (L2-023)

### States

- **AC-4** Given a `live` inline message with `icon="busy"`, when it renders "Sending introduction", then it has `role="status"`, a `span.spinner.spinner--sm` with `aria-hidden="true"` before the text, and no `aria-label`. (L2-050)
- **AC-5** Given that live message, when its text changes to "Your introduction was sent." with `tone="success"`, then a screen reader announces the new text once and focus does not move. (L2-050)

### Screen readers

- **AC-6** Given the success message "You're going", when read by a screen reader, then it reads "You're going" with no icon description, and with colours removed (forced colours) the words still state the status. (L2-050)
- **AC-7** Given any inline message, when the page is navigated with Tab, then the message is never a tab stop. (L2-050)

### Theming

- **AC-8** Given the success and neutral messages in light and dark, when contrast is measured against the RSVP panel surface and the canvas, then the text reaches at least 4.5:1. (L2-050)
- **AC-9** Given the theme switches, when the messages re-render, then their colours change through `--color-success-fg` and `--color-fg-muted` alone. (L2-051)

### Responsive

- **AC-10** Given a 320 px viewport, when the waitlist message renders in the RSVP panel, then it wraps if needed, nothing is clipped, and the page has no horizontal scroll. (L2-049)

### Motion

- **AC-11** Given `prefers-reduced-motion: reduce`, when a busy message renders, then the spinner does not rotate and the text is unchanged. (L2-050)

### Content

- **AC-12** Given the `en-CA` catalogue, when the waitlist message renders for position 3, then the text comes from the catalogue with the position inserted ("Full · you're #3 on the waitlist"). (L2-052)

### Performance

- **AC-13** Given a change to the inline message, when the perf test runs `InlineMessage` against the base branch with `--fail-on-regression`, then it is not flagged as a possible regression. (L2-048)

## Implementation notes

- Folder `frontend/projects/components/src/lib/inline-message/`, file `inline-message.ts`, class
  `InlineMessage`, selector `p[bn-inline-message], span[bn-inline-message]`, style
  `inline-message.css` with the `.inline-status` rules from `components.css`.
- Host bindings: `class` (`inline-status`, `inline-status--success`), `role` (`status` when `live`).
  The icon is rendered before `<ng-content />` from an `@switch` on `icon`.
- Composes [spinner](spinner.md) (`span[bn-spinner]`, size `sm`) for `busy`.
- Export from `public-api.ts`; add `InlineMessage.ts` to the perf-test scenarios and `index.ts`.

## Decisions

- **D-1** *Does this CRD own field help and field errors, which the design-system page shows under
  "Inline message"?* No. They are rendered by `bn-field` and `bn-field-error`, which connect them to the
  control with `aria-describedby`; specifying them twice would split one behaviour across two
  components. This CRD owns `.inline-status`.
- **D-2** *Is it an element or an attribute component?* An attribute on `<p>` or `<span>`, because the
  mocks use both and the right element depends on whether the status is its own paragraph or part of a
  row, as with `button[bn-button]`.
- **D-3** *Is there a danger or warning tone?* No. The design system defines only neutral and success
  for `.inline-status`; errors belong to the field or to an alert.
- **D-4** *Which icons?* The mocks use a check (success) and a clock (waitlist), plus the design
  system's busy spinner; the input is a closed list so new icons are a deliberate API change.
- **D-5** *Is the message a live region by default?* No. The mocks' messages are page state rendered
  with the page; `live` is opt-in for messages that change in place, as the design-system spinner
  specimen does with `role="status"`.
