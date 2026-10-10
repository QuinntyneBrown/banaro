# Toast

| Field | Value |
|---|---|
| Selector | `bn-toast`, `bn-toast-region` (shown through `ToastService`) |
| Library path | `frontend/projects/components/src/lib/toast/` |
| Status | planned |
| Traces to | L2-020, L2-026, L2-028, L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`toast.html`](../../design-system/components/toast.html) |
| Source mocks | [`notifications/toast/info`](../../mocks/notifications/toast/info.html), [`…/success`](../../mocks/notifications/toast/success.html), [`…/warning`](../../mocks/notifications/toast/warning.html), [`…/danger`](../../mocks/notifications/toast/danger.html), [`…/with-action`](../../mocks/notifications/toast/with-action.html), [`…/stacked`](../../mocks/notifications/toast/stacked.html), [`notifications/rsvp-toast/info`](../../mocks/notifications/rsvp-toast/info.html), [`…/success`](../../mocks/notifications/rsvp-toast/success.html), [`…/warning`](../../mocks/notifications/rsvp-toast/warning.html), [`…/danger`](../../mocks/notifications/rsvp-toast/danger.html) |
| Rendering | [`toast.html`](toast.html) |

## Purpose and scope

A toast tells a member, briefly and without taking them anywhere, how an action they just took turned
out: "Message sent to Daniel", "You're going to Fall Demo Night", "We couldn't save your search". Any
feature raises one by calling `ToastService.show()`; the service renders it in a single toast region
that floats over the page in an Angular CDK overlay, stacks at most three, runs the dismiss timers and
runs an optional action once.

Use an [alert](alert.md) when the message must stay on the page as part of its state (a failed dialog
request, "This event has ended") and a banner (`bn-banner`, same CRD) for conditions that outlive one
action (offline, unverified e-mail). A toast is never the only place a recovery instruction appears
(design system): when an RSVP fails, the dialog's failed state also offers retry (L2-020).

Out of scope:

- Choosing the copy and deciding when to raise a toast; each feature does that from the catalogue.
- What an action does ("Undo", "Add to calendar", "Try again"); the caller passes a callback.
- Banners and their dismissal memory (`bn-banner`, `BannerService`).

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `notifications/toast/info` (directory sort) | info | "Sorted by best match" / "Builders who fit what you are looking for come first." | default, auto-dismiss | raised surface over the canvas |
| `notifications/toast/success` (say-hello sent, L2-026) | success | "Message sent to Daniel" / "He'll reply in your Banaro messages." | default, auto-dismiss | raised surface |
| `notifications/toast/warning` (distance widened) | warning | "Distance filter widened" / "Showing builders within 60 km of Leslieville." | default, persistent | raised surface |
| `notifications/toast/danger` | danger | "We couldn't save your search" / "Check your connection and try again." | default (`role="alert"`), persistent | raised surface, danger border |
| `notifications/toast/with-action` | success + action | "Added to your shortlist" / "Daniel Reyes is now in your shortlist." + "Undo" | default, action used once | raised surface |
| `notifications/toast/stacked` | three toasts | success "Message sent to Daniel" + "View conversation"; warning "Distance filter widened"; danger "We couldn't save your search" | stacked (3 visible) | raised surface |
| `notifications/rsvp-toast/success` (L2-020) | success + action, `kind: 'rsvp'` | "You're going to Fall Demo Night" / "Thu 15 Oct, 7:00 pm. We will e-mail a reminder." + "Add to calendar" | default | over `event-detail` |
| `notifications/rsvp-toast/info` | info, `kind: 'rsvp'` | "You're #3 on the waitlist" / "Fall Demo Night is full. We will e-mail you if a spot opens." | default | over `event-detail` |
| `notifications/rsvp-toast/warning` | warning, `kind: 'rsvp'` | "Only 2 spots left" / "Reserve yours soon: Fall Demo Night is almost full." | default | over `event-detail` |
| `notifications/rsvp-toast/danger` | danger + action, `kind: 'rsvp'` | "We couldn't save your RSVP" / "Check your connection and try again." + "Try again" | default | over `event-detail`, also over the open `cancel-rsvp` dialog |
| L2 without a mock: resend verification (L2-002), sign-out retry (L2-003), profile saved (L2-007), project saved / deleted (L2-014), offer sent (L2-017), mark-all-read retry (in-app notifications design) | info, success or danger, some with "Try again" | copy from each feature's catalogue keys | default | over the page |
| Design-system page | info, success, warning, danger, action, stacked; hover, focus, active, disabled, leaving | "Demo Night starts tomorrow", "Project saved", "Your session ends soon", "Message not sent" + "Retry" | all | raised surface |

Every row is buildable with the API below.

## Anatomy

`bn-toast-region` (one per application, inside a CDK overlay):

1. **Region** — `div.toast-region`, `role="status"`, `aria-live="polite"`. Fixed to the bottom of the
   viewport; a grid that stacks toasts with `--space-3` between them. Ignores the pointer except on
   toasts.

`bn-toast` (one per visible toast, inside the region):

1. **Container** — `div.toast` (+ `.toast--{variant}`), `role="status"` or `role="alert"`,
   `data-toast="{kind}"` when a kind is set. Grid `auto 1fr auto`.
2. **Status icon** — `svg.icon`, `aria-hidden="true"`, column 1, colour from the variant's icon token.
3. **Title** — `p.toast__title`, column 2, row 1. The outcome in a few words; it names the toast.
4. **Close** — `button.icon-btn.toast__close`, column 3, row 1; 16 px close icon.
5. **Body (optional)** — `p.toast__body`, column 2. One sentence.
6. **Action (optional)** — `button.btn.btn--text.btn--sm.toast__action`, column 2, after the body.

DOM order is icon, title, close, body, action, so the close button is the first tab stop and the
action the next one (mock note on `with-action`). Host: `bn-toast` is `display: block`; the classes live
on the inner `div.toast`, as in `bn-alert`.

## API

### `ToastService` (root-provided)

| Member | Signature | Rule |
|---|---|---|
| `show` | `show(options: ToastOptions): ToastRef` | Adds a toast. When fewer than three are visible it shows at once, at the top of the stack; otherwise it waits in a first-in, first-out queue. Browser only: on the server it returns a ref that is already closed. |
| `dismissAll` | `dismissAll(): void` | Closes every visible and queued toast (used on sign-out). |

`ToastOptions`:

| Field | Type | Default | Required | Rule |
|---|---|---|---|---|
| `variant` | `'info' \| 'success' \| 'warning' \| 'danger'` | `'info'` | no | Picks modifier, icon, role and timing. |
| `title` | `string` | — | yes | Text of `.toast__title`; from the catalogue. |
| `body` | `string` | — | no | Text of `.toast__body`; omitted element when absent. |
| `action` | `{ label: string; run: () => void }` | — | no | Renders `.toast__action`. `run` is called at most once. |
| `kind` | `'rsvp'` | — | no | Written to `data-toast`; lets page objects find RSVP toasts. No visual change. |

`ToastRef`:

| Member | Type | Rule |
|---|---|---|
| `dismiss()` | `() => void` | Closes the toast (or removes it from the queue). Idempotent. |
| `closed` | `Promise<'timeout' \| 'user' \| 'action' \| 'programmatic'>` | Resolves once, with why it closed. |

Timing (L2-028 criterion 1): success and info close after 6 000 ms of visible, unpaused time; warning
and danger never close on their own. A toast with an action follows its variant's rule.

`TOAST_DISMISS_LABEL` — `InjectionToken<Signal<string>>` that each application binds in `app.config.ts`
to its catalogue string ("Dismiss notification"). The component library holds no copy.

### Inputs (`bn-toast`, set by the region)

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `variant` | `'info' \| 'success' \| 'warning' \| 'danger'` | `'info'` | no | Info adds no modifier (the design-system page's `.toast--info` has no rule of its own); others add `.toast--{variant}`. Danger sets `role="alert"`, the others `role="status"`. |
| `heading` | `string` | — | yes | Title text. |
| `body` | `string` | — | no | Body text. |
| `actionLabel` | `string` | — | no | Renders the action button with this label. |
| `dismissLabel` | `string` | — | yes | `aria-label` of the close button. |
| `kind` | `'rsvp'` | — | no | `data-toast` value. |
| `leaving` | `boolean` | `false` | no | Sets `data-state="leaving"` for the exit animation. |

`bn-toast-region` has no inputs; it reads the visible toasts from `ToastService`.

### Outputs (`bn-toast`)

| Output | Payload | Emitted when |
|---|---|---|
| `actionSelected` | `void` | The action is activated for the first time. Later activations are ignored (the button is disabled). |
| `dismissed` | `void` | The close button is activated. |
| `paused` | `boolean` | The pointer enters or focus moves into the toast (`true`), or both have left (`false`). The service pauses and resumes that toast's timer. |

### Content slots

None. Every string arrives through `ToastOptions`, so a toast can be raised from a service without a
template.

## Variants and sizes

| Variant | Modifier | Icon | Role | Closes | Use for |
|---|---|---|---|---|---|
| Info | none | circle with "i" | `status` | after 6 s | A neutral outcome: "Sorted by best match", "You're #3 on the waitlist" |
| Success | `.toast--success` | check | `status` | after 6 s | The action worked: "Message sent to Daniel" |
| Warning | `.toast--warning` | triangle | `status` | when dismissed | It worked with a caveat: "Distance filter widened", "Only 2 spots left" |
| Danger | `.toast--danger` (danger border) | circle with "!" | `alert` | when dismissed | It failed: "We couldn't save your search" |

One size. Width: the region's width (full width minus `--space-4` each side below 768 px;
`--size-toast-region-width-26` at 768 px and wider). Height follows the content.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Entering | inserted | Rises by `--space-4` over `--duration-slow` with `--ease-enter` | Announced by the region (polite) or by its own `role="alert"` (danger) |
| Default | visible | Raised surface, `--shadow-3`, hairline border | Title, body and action read as one message |
| Close hover | `:hover` on `.toast__close` | `--color-bg-subtle` circle, icon to `--color-fg-default` | — |
| Close / action focus | `:focus-visible` | 2 px `--color-focus-ring` ring at `--focus-ring-offset` | Focus stays inside until the person moves it |
| Action active | `:active` | Text button pressed style ([button](button.md)) | — |
| Paused | pointer over the toast, or focus inside it | Unchanged | Timer stops; resumes with the remaining time |
| Disabled | after the action is selected once | Action and close show the disabled style for the instant before the toast leaves | `disabled`; a second press does nothing |
| Leaving | closed (timeout, close, action, `dismiss()`) | `data-state="leaving"`: fades and drops by `--space-4` over `--duration-base` with `--ease-exit`, then removed | Removed from the accessibility tree when removed |
| Queued | a fourth toast while three are visible | Not rendered | Not announced until shown |
| Stacked | two or three visible | Newest at the top, older below, `--space-3` apart | Each announced once, when it appears |

## Markup

```html
<!-- rendered: region with one success toast with an action (notifications/toast/with-action) -->
<div class="toast-region" role="status" aria-live="polite">
  <bn-toast>
    <div class="toast toast--success" role="status">
      <svg aria-hidden="true" class="icon" viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"></path></svg>
      <p class="toast__title" id="bn-toast-3-title">Added to your shortlist</p>
      <button aria-label="Dismiss notification" aria-describedby="bn-toast-3-title" class="icon-btn toast__close" type="button"><svg aria-hidden="true" class="icon icon--sm" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"></path></svg></button>
      <p class="toast__body">Daniel Reyes is now in your shortlist.</p>
      <button class="btn btn--text btn--sm toast__action" type="button">Undo</button>
    </div>
  </bn-toast>
</div>
```

```html
<!-- rendered: danger RSVP toast (notifications/rsvp-toast/danger) -->
<div class="toast toast--danger" role="alert" data-toast="rsvp">
  <svg aria-hidden="true" class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"></circle><path d="M12 7.5v5M12 15.5h.01"></path></svg>
  <p class="toast__title" id="bn-toast-4-title">We couldn't save your RSVP</p>
  <button aria-label="Dismiss notification" aria-describedby="bn-toast-4-title" class="icon-btn toast__close" type="button">…</button>
  <p class="toast__body">Check your connection and try again.</p>
  <button class="btn btn--text btn--sm toast__action" type="button">Try again</button>
</div>
```

Info has no modifier and the circle-and-"i" icon; warning adds `.toast--warning` and the triangle
icon. A toast without an action omits `.toast__action`; without a body it omits `.toast__body`.

```ts
// consumer (say-hello dialog, after the message is sent)
this.toasts.show({
  variant: 'success',
  title: this.i18n.t('sayHello.sent.title', { name: 'Daniel' }),   // "Message sent to Daniel"
  body: this.i18n.t('sayHello.sent.body'),                          // "He'll reply in your Banaro messages."
  action: { label: this.i18n.t('sayHello.sent.view'), run: () => this.router.navigate(['/messages', id]) },
});
```

The overlay: `ToastService` creates one CDK `OverlayRef` on the first `show()` in the browser, with a
`GlobalPositionStrategy` and no backdrop, attaches a `ComponentPortal` of `ToastRegion`, and keeps it
for the application's life. The region's own `.toast-region` rule does the positioning. Page objects
locate by `.toast-region`, `.toast`, `.toast--{variant}`, `.toast__title`, `.toast__body`,
`.toast__action`, `.toast__close`, `[data-toast]` and the roles.

## Design

- Region: `position: fixed`, `z-index: var(--z-toast)`, inset `auto var(--space-4) var(--space-4)
  var(--space-4)` below 768 px; at 768 px and wider `auto var(--space-6) var(--space-6) auto` with
  width `--size-toast-region-width-26`; padding-bottom `env(safe-area-inset-bottom)`; gap `--space-3`;
  `pointer-events: none` (toasts set `auto`).
- Toast: grid `auto 1fr auto`, gap `--space-1` × `--space-4`, `align-items: start`; padding `--space-4`
  × `--space-5`; radius `--radius-lg`; border `--border-width-hairline` `--color-border-default`;
  fill `--color-bg-surface-raised`; shadow `--shadow-3`.
- Icon `.icon` (`--space-5`), offset `--space-1` from the top. Title `--text-label`; body `--text-body-sm`
  in `--color-fg-muted`; action `margin-top: var(--space-1)`, start-aligned in column 2.
- Close: `.icon-btn.toast__close`, `--space-8` square with a negative `--space-1` / `--space-2` margin so
  it aligns with the title. Below 576 px its hit area extends to `--target-comfortable` square with a
  transparent pseudo-element; the visual stays `--space-8`.
- Motion: enter with the `rise` keyframe (`--duration-slow`, `--ease-enter`); leave over
  `--duration-base` with `--ease-exit` (opacity to 0, translate `--space-4` down). Both only inside
  `prefers-reduced-motion: no-preference`.
- Layer: `--z-toast` sits above `--z-modal`, so a toast shows over an open dialog and its backdrop.

Component tokens: none. Variants re-skin through the status icon tokens and `--color-danger-border`.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Toast fill | `--color-bg-surface-raised` | `--palette-white` | `--palette-night-850` |
| Border | `--color-border-default` | `--palette-oat-300` | `--palette-night-700` |
| Danger border | `--color-danger-border` | `--palette-lingon-300` | `--palette-lingon-700` |
| Title | `--color-fg-default` | `--palette-ink-900` | `--palette-night-50` |
| Body | `--color-fg-muted` | `--palette-stone-700` | `--palette-night-200` |
| Info / success / warning / danger icon | `--color-info-icon` / `--color-success-icon` / `--color-warning-icon` / `--color-danger-icon` | `--palette-fjord-700` / `--palette-sage-500` / `--palette-clay-500` / `--palette-lingon-600` | `--palette-fjord-300` / `--palette-sage-300` / `--palette-clay-300` / `--palette-lingon-300` |
| Action label | `--color-fg-link` (text button) | `--palette-sage-700` | `--palette-sage-300` |
| Close icon | `--color-fg-muted` | `--palette-stone-700` | `--palette-night-200` |
| Shadow | `--shadow-3` | light shadow | deeper shadow |
| Focus ring | `--color-focus-ring` | `--palette-sage-700` | `--palette-sage-300` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-surface-raised` | 4.5:1 | Title |
| `--color-fg-muted` | `--color-bg-surface-raised` | 4.5:1 | Body |
| `--color-fg-link` | `--color-bg-surface-raised` | 4.5:1 | Action label |
| `--color-success-icon`, `--color-warning-icon`, `--color-info-icon`, `--color-danger-icon` | `--color-bg-surface-raised` | 3:1 | Status icon (non-text) |
| `--color-focus-ring` | `--color-bg-surface-raised` | 3:1 | Focus ring |

The icon pairs are not in `contrast-pairs.json`; the rendering measures them live in both themes and
they must stay at 3:1 or better. In forced-colours mode the toast keeps a system border and text; the
shadow disappears.

## Responsive behaviour

- Below 768 px (`--layout-breakpoint-md`) the region spans the viewport width less `--space-4` on each
  side and sits `--space-4` above the bottom edge plus the safe-area inset.
- At 768 px and wider the region is `--size-toast-region-width-26` wide at the bottom right, `--space-6`
  from the edges.
- Three stacked toasts at 320 px stay within the viewport width; text wraps, nothing truncates, and the
  page never scrolls horizontally (L2-049). The region never covers the element that has focus: when
  focus lands under the region (for example a form's submit button at the bottom of a phone screen),
  the page scrolls it into view above the region using `scroll-padding-bottom` equal to the region's
  height (design system: "Never obscure focused actions").
- Touch: the close button's hit area is at least 44 × 44 px below 576 px; the action is a `sm` text
  button that reaches 44 px height through the [button](button.md) rule.

## Accessibility

### Role and pattern

The region is a polite live region that exists in the DOM before its first toast, so screen readers
pick up insertions. Each toast also carries its own role, as L2-028 requires: `role="status"` for
info, success and warning, `role="alert"` for danger
([WAI-ARIA alert pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alert/)). Toasts are not dialogs and
never trap focus.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | The region is at the end of the document; Tab reaches each toast's close button, then its action, newest toast first. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Activates the focused close button or action. |
| <kbd>Escape</kbd> | While focus is inside a toast, closes that toast. Has no effect otherwise (a dialog's Escape is not intercepted). |

### Focus

- A toast never takes focus when it appears (L2-050); focus stays on the control that caused it.
- While focus is inside a toast, its timer is paused.
- When a toast that holds focus closes, focus moves to the next toast's close button if one is
  visible, otherwise back to the element that had focus before focus entered the region; if that
  element is gone, to `#main`.
- When a CDK modal dialog is open, its focus trap keeps Tab inside the dialog; the toast stays visible
  and readable, and the dialog's own controls offer the same recovery (L2-020).

### Labelling

- The close button is named by the catalogue string ("Dismiss notification") and described by the
  toast's title (`aria-describedby`), so "Dismiss notification, Message sent to Daniel" tells stacked
  toasts apart.
- The action is named by its visible label ("Undo", "Add to calendar", "Try again").

### Announcements

- Info, success and warning are announced politely once, when inserted; danger assertively.
- A queued toast is announced when it becomes visible, not when queued.
- Closing is not announced.

### Motion

Entrance rise and exit fade/drop are removed under `prefers-reduced-motion: reduce`; the toast appears
and disappears at once, and the 6-second timer is unchanged (L2-050).

## Content and internationalisation

- Title: the outcome, in the past tense or as a fact, a few words: "Project saved", "Message sent to
  Daniel", "We couldn't save your RSVP". Body: one sentence on what happens next or what to do.
- Name the thing when it helps: "You're going to Fall Demo Night". Dates and times per L2-052: "Thu 15
  Oct, 7:00 pm"; distances "60 km".
- Add "Try again" to danger toasts when a retry exists; never make a toast the only place to recover.
- Translatable: `title`, `body`, `action.label`, `TOAST_DISMISS_LABEL`. Data values: names (Daniel
  Reyes), event titles (Fall Demo Night), positions ("#3"), places (Leslieville).
- Long titles and French copy wrap within the region's width; nothing truncates.

## Performance

- Change detection: `OnPush` for `bn-toast` and `bn-toast-region`; the service exposes the visible list
  as a signal; timers run with `setTimeout` outside templates.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Toast.ts` renders one success toast
  "Message sent to Daniel" / "He'll reply in your Banaro messages." with "View conversation", inside a
  static `.toast-region`; iterations in `e2e/perf-test/config/scenario-iterations.mjs` keep it at
  roughly 100–300 ms.
- Composite scenario: `ToastStack.ts` renders the `stacked` mock's three toasts (success with action,
  warning, danger). `DarkTheme` gains `Toast` when it is next extended.
- Layout stability: the region is `position: fixed`, so showing or closing a toast never moves page
  content (no CLS).
- Weight: `@angular/cdk/overlay` and `@angular/cdk/portal` only; the overlay is created lazily on the
  first `show()`, so pages that never toast pay nothing at load.

## Acceptance criteria

### Rendering

- **AC-1** Given Amara sends a hello to Daniel Reyes, when the say-hello request succeeds, then one toast appears with `.toast.toast--success`, `role="status"`, the check icon, `.toast__title` "Message sent to Daniel", `.toast__body` "He'll reply in your Banaro messages." and a `.toast__close` button. (L2-026)
- **AC-2** Given the directory re-sorts, when an info toast "Sorted by best match" is shown, then it has `.toast` with no modifier class, the circle-and-"i" icon and `role="status"`. (L2-028)
- **AC-3** Given the distance filter widens, when the warning toast "Distance filter widened" / "Showing builders within 60 km of Leslieville." shows, then it has `.toast--warning`, the triangle icon and `role="status"`. (L2-028)
- **AC-4** Given saving a search fails, when the danger toast "We couldn't save your search" shows, then it has `.toast--danger`, the danger border, the circle-and-"!" icon and `role="alert"`. (L2-028)
- **AC-5** Given Amara RSVPs to Fall Demo Night with spots left, when the request succeeds, then a success toast with `data-toast="rsvp"` reads "You're going to Fall Demo Night" / "Thu 15 Oct, 7:00 pm. We will e-mail a reminder." with an "Add to calendar" action. (L2-020)
- **AC-6** Given the RSVP request fails, when the danger RSVP toast "We couldn't save your RSVP" shows with "Try again", then the going count on the page is unchanged and activating "Try again" re-sends the RSVP once. (L2-020)

### States

- **AC-7** Given a success toast and an info toast, when nobody interacts with them, then each closes 6 seconds after it appeared and `closed` resolves with `'timeout'`. (L2-028)
- **AC-8** Given a warning toast and a danger toast, when 60 seconds pass without interaction, then both are still visible, and each closes only when its close button is activated (`closed` resolves `'user'`). (L2-028)
- **AC-9** Given the success toast "Message sent to Daniel", when the pointer rests on it from second 4 to second 9, then it is still visible at second 9 and closes about 2 seconds after the pointer leaves; the same holds when focus is inside it. (L2-028)
- **AC-10** Given three toasts are visible, when a fourth is shown, then three remain visible with the newest at the top of the stack, the fourth waits, and it appears as soon as one of the three closes. (L2-028)
- **AC-11** Given the toast "Added to your shortlist" with "Undo", when Amara activates "Undo" twice in quick succession, then the undo callback runs exactly once, the action is disabled after the first press, and the toast closes with `closed` resolving `'action'`. (L2-028)
- **AC-12** Given the toast "We couldn't save your RSVP" shows while the `cancel-rsvp` dialog is open in its failed state, when it renders, then it is visible above the dialog's backdrop and the dialog keeps focus inside itself. (L2-020)

### Keyboard and focus

- **AC-13** Given focus is on the say-hello dialog's "Send" button, when the success toast appears, then focus does not move. (L2-050)
- **AC-14** Given the toast with "Undo", when Amara tabs into the region, then focus reaches "Dismiss notification" first and "Undo" next, each with a visible 2 px focus ring of at least 3:1. (L2-050)
- **AC-15** Given focus is on a toast's close button and two toasts are visible, when Amara presses Enter, then that toast closes and focus moves to the other toast's close button; with no other toast, focus returns to the element focused before the region. (L2-050)
- **AC-16** Given focus is inside a toast, when Amara presses Escape, then that toast closes and no open dialog closes with it. (L2-050)

### Screen readers

- **AC-17** Given the page has loaded and no toast has shown yet, when the first toast is shown, then `.toast-region` with `role="status"` and `aria-live="polite"` was already in the DOM before the toast was inserted, and the toast is announced once. (L2-050)
- **AC-18** Given two stacked toasts, when a screen reader lists the buttons, then the close buttons read "Dismiss notification" described by "Message sent to Daniel" and by "Distance filter widened" respectively. (L2-050)
- **AC-19** Given each variant, when it renders, then its status is carried by the title's words and the icon has `aria-hidden="true"`; no status depends on colour alone. (L2-050)

### Theming

- **AC-20** Given each variant in light and dark, when contrast is measured, then the title and body reach 4.5:1 and the status icon 3:1 against `--color-bg-surface-raised`. (L2-050)
- **AC-21** Given a visible toast, when the theme switches, then its fill, border, text and icon colours change through tokens alone. (L2-051)

### Responsive

- **AC-22** Given a 360 px viewport, when a toast shows, then the region spans the width less `--space-4` on each side at the bottom of the screen and the close button's hit area measures at least 44 × 44 px. (L2-049)
- **AC-23** Given a 1280 px viewport, when the three `stacked` toasts show, then the region is `--size-toast-region-width-26` wide at the bottom right, `--space-6` from the edges. (L2-049)
- **AC-24** Given a 320 px viewport, when the three `stacked` toasts show, then every line wraps inside the region and the page has no horizontal scroll. (L2-049)

### Motion

- **AC-25** Given `prefers-reduced-motion: reduce`, when a toast appears and later closes, then it neither rises nor fades: it appears and is removed at once. (L2-050)

### Content

- **AC-26** Given the `en-CA` catalogue, when any toast shows, then its title, body, action label and the close button's label come from the catalogue, and RSVP times read like "Thu 15 Oct, 7:00 pm". (L2-052)

### Performance

- **AC-27** Given a change to the toast components, when the perf test runs `Toast` and `ToastStack` against the base branch with `--fail-on-regression`, then neither is flagged as a possible regression. (L2-048)

## Implementation notes

- Folder `frontend/projects/components/src/lib/toast/` with `toast.ts` (`Toast`, selector `bn-toast`),
  `toast-region.ts` (`ToastRegion`, selector `bn-toast-region`), `toast.service.ts` (`ToastService`,
  `ToastRef`, `ToastOptions`), `toast-dismiss-label.ts` (`TOAST_DISMISS_LABEL`), and `toast.css` with
  the `.toast-region`, `.toast` and `.toast__*` rules extracted from `components.css`, plus the
  `.icon-btn` rules the close button needs (as `bn-banner` does). Export all from `public-api.ts`.
- Builds on `@angular/cdk/overlay` (`Overlay`, `GlobalPositionStrategy`) and `@angular/cdk/portal`
  (`ComponentPortal`). Create the overlay in the browser only (`afterNextRender` or
  `isPlatformBrowser`); nothing renders during SSR.
- The `leaving` exit rule (`[data-state="leaving"]`) and the close button's 44 px hit area are not in
  `components.css`; add them in `toast.css` with the tokens named in *Design*.
- Composes the [button](button.md) text variant for the action. It does not compose `bn-alert`.
- `banaro/app.config.ts` binds `TOAST_DISMISS_LABEL`; the `admin` application binds it too if it
  shows toasts.
- Perf scenarios `Toast.ts` and `ToastStack.ts` added and exported from `scenarios/index.ts` in the same
  change.

## Decisions

- **D-1** *How long do success and info toasts stay?* 6 seconds, as L2-028 criterion 1 states. The
  `toast` and `rsvp-toast` mock notes say 8 seconds; L2 is the requirement. Listed for the lead.
- **D-2** *Do warning toasts auto-dismiss?* No: L2-028 criterion 1 keeps warning and danger toasts until
  dismissed. The `toast/warning` and `rsvp-toast/warning` mock notes say 12 seconds. Listed for the
  lead.
- **D-3** *Does a toast with an action stay longer?* No separate rule: it follows its variant (6 seconds
  for "Undo" on a success toast, paused while hovered or focused). The `with-action` mock note says 12
  seconds; L2-028 gives none. Listed for the lead.
- **D-4** *Is the RSVP toast its own component?* No. The `rsvp-toast` mocks use the same `.toast` markup,
  so an RSVP toast is a toast with `kind: 'rsvp'` whose copy the events feature builds from the
  catalogue. The system-notifications detailed design names a `bn-rsvp-toast` in `lib/rsvp-toast/`; a
  component that only maps an outcome to copy would put feature copy in the library. Listed for the
  lead.
- **D-5** *The region is a polite live region and danger toasts carry `role="alert"` inside it; is that
  kept?* Yes, as the mocks mark it and L2-028 requires the per-toast roles. The region must exist before
  the first toast so insertions are announced; the danger toast's own alert role makes it assertive.
- **D-6** *How is the close button named?* "Dismiss notification" (mocks, detailed design), described by
  the toast's title so stacked toasts are distinguishable. The design-system page's "Dismiss project
  saved" pattern is met through the description without building a sentence from fragments, which
  translates badly.
- **D-7** *What does "newest on top" mean in a region anchored to the bottom?* The newest toast is the
  first child of the region and renders at the top of the stack; older ones sit below it, nearest the
  screen edge (L2-028 criterion 2).
- **D-8** *Does hovering one toast pause all of them?* No, only the toast under the pointer or holding
  focus (L2-028 criterion 7 speaks of "it"). Others keep counting.
- **D-9** *What are the design-system "Disabled" and "Leaving" states?* Disabled is the instant after an
  action is selected, when the action and close are disabled so the action cannot run twice (L2-028
  criterion 3). Leaving is the exit animation, `data-state="leaving"`; `components.css` has no rule for
  it, so the CRD sets `--duration-base` with `--ease-exit`.
- **D-10** *The close button is 32 px; how does it meet the 44 px touch rule?* Its hit area is extended
  to `--target-comfortable` with a transparent pseudo-element below 576 px, keeping the mock's visual
  size (L2-049 criterion 1).
- **D-11** *Where does focus go when a focused toast closes?* To the next toast's close button, else to
  the element focused before Tab entered the region, else `#main`; never to the document body.
- **D-12** *Do toasts show over an open dialog?* Yes. The toast overlay pane sits above dialogs
  (`--z-toast` above `--z-modal`), so the danger RSVP toast is visible over the `cancel-rsvp` dialog's
  failed state; the dialog's focus trap is not changed.
- **D-13** *Escape inside a toast?* Closes that toast and stops propagation, so a dialog underneath
  does not also close. The design-system keyboard table reserves Escape for overlays, and a toast is
  one.
- **D-14** *What does `show()` do during server-side rendering?* Nothing visible: it returns a closed
  ref. Toasts follow user actions, which only happen in the browser.
