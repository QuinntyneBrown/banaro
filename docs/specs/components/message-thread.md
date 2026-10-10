# Message thread

| Field | Value |
|---|---|
| Selector | `section[bn-message-thread]` |
| Library path | `frontend/projects/components/src/lib/message-thread/` |
| Status | planned |
| Traces to | L2-026, L2-045, L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`message-thread.html`](../../design-system/components/message-thread.html) |
| Source mocks | [`pages/messages/default`](../../mocks/pages/messages/default.html), [`pages/messages/send-failed`](../../mocks/pages/messages/send-failed.html), [`pages/messages/loading`](../../mocks/pages/messages/loading.html), [`notifications/connection-banner/warning`](../../mocks/notifications/connection-banner/warning.html), [`notifications/connection-banner/danger`](../../mocks/notifications/connection-banner/danger.html), [`notifications/connection-banner/info`](../../mocks/notifications/connection-banner/info.html), [`notifications/connection-banner/success`](../../mocks/notifications/connection-banner/success.html) |
| Rendering | [`message-thread.html`](message-thread.html) |

## Purpose and scope

The message thread is one conversation between two builders: who you are talking to, the
messages oldest to newest as soft bubbles (yours on the right in sage, theirs on the left), and
the reply box underneath. A message that could not be sent stays in the thread, marked "Not
sent", with "Retry" and "Discard".

Use the [inbox](inbox.md) for the list of conversations beside it and the `say-hello`
[dialog](dialog.md) for the first message to a builder.

Out of scope:

- The reply form's fields: the page projects a form with [field](field.md) +
  [textarea](textarea.md) and a primary "Send" [button](button.md) into the composer slot.
- Fetching, polling or pushing new messages, sending, retrying and the 403/404/429 rules
  (L2-026): the page and the `api` library.
- The `.split` layout and the conversation list; the empty and error states of `/messages`.
- Connection banners: the [banner](banner.md) above the page.

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/messages/default`; also under every `notifications/connection-banner/*` | default | header Daniel Reyes (48 px avatar), "Full-stack engineer · Mississauga · View profile"; three bubbles (theirs, mine, theirs) with meta "Daniel · Thu 8 Oct, 7:15 pm", "You · Thu 8 Oct, 8:02 pm", "Daniel · Today, 8:42 am"; composer: label "Message to Daniel", placeholder "Write a reply", "Send" | default | surface panel in `.split` |
| `pages/messages/send-failed` | one `failed` message | mine + failed: "Saturday at 10 works for me. …"; meta: alert icon, "Not sent. Check your connection.", "Retry", "Discard"; composer keeps the text | send failed | surface |
| `pages/messages/loading` | `loading` | `div.thread[aria-hidden]` with title, block and two text skeletons | loading | surface |
| Blocked pair (L2-026 AC7, no mock) | `readOnly` | composer replaced by a note "You can no longer reply in this conversation." | read-only | surface |

Every row is buildable with the API below.

## Anatomy

1. **Thread** — host `section.thread`, `aria-labelledby` the header name. Surface card, grid gap
   `--space-5`.
2. **Header** — `div.dialog__who`: 48 px `img.avatar` (`alt=""`), `h2.rows__title#{id}` name,
   `p.rows__meta` with role, place and a "View profile" link.
3. **Log** — `div.stack[role=log][aria-label="Conversation with Daniel Reyes"]`.
4. **Bubble** — `div.bubble` (+ `.bubble--mine`, + `.bubble--failed[role=alert]`): `p` body and
   `p.bubble__meta`.
5. **Failure meta** — inside `.bubble__meta`: alert icon, failure text, "Retry" and "Discard"
   text buttons.
6. **Composer** — `[slot=composer]` (the page's `form.form`), or `p.muted` read-only note.

Host: attribute component on the native `section`.

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `name` | `string` | — | yes | The other builder; header heading. |
| `headingId` | `string` | `'thread-title'` | no | Heading id and host `aria-labelledby`. |
| `meta` | `string` | — | yes | "Full-stack engineer · Mississauga". |
| `profileHref` | `string \| null` | `null` | no | Appends " · " and the "View profile" link (`profileLabel`). |
| `profileLabel` | `string` | — | yes when `profileHref` is set | "View profile". |
| `photo` | `string \| null` | `null` | no | 48 px avatar; null shows initials (`initials`, `tone`). |
| `initials` / `tone` | `string` / tone | `''` / `'sage'` | yes when `photo` is null | — |
| `logLabel` | `string` | — | yes | "Conversation with Daniel Reyes". |
| `messages` | `ThreadMessage[]` | `[]` | no | `{ id; body; mine: boolean; meta: string; datetime: string; status: 'sent' \| 'failed' }`, oldest first. Tracked by `id`. |
| `failedText` | `string` | — | yes | "Not sent. Check your connection." |
| `retryLabel` / `discardLabel` | `string` | — | yes | "Retry", "Discard". |
| `readOnly` | `boolean` | `false` | no | Hides the composer slot and shows `readOnlyNote`. |
| `readOnlyNote` | `string \| null` | `null` | yes when `readOnly` | — |
| `loading` | `boolean` | `false` | no | Renders the skeleton thread, `aria-hidden="true"`. |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| `retried` | message `id` | "Retry" on a failed message is activated |
| `discarded` | message `id` | "Discard" on a failed message is activated |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `[slot=composer]` | the reply `form` | Rendered after the log unless `readOnly`. Declared once. |

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Theirs | `.bubble` | Received message, left |
| Mine | `.bubble--mine` | Sent message, right |
| Failed | `.bubble--mine.bubble--failed` | A message of mine that was not delivered |

One size. Bubbles cap at `--size-bubble-max-width-36`; the thread fills its column.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Bubbles in order, mine right in `--color-accent-subtle`, theirs left in `--color-bg-subtle` | Log read in order; each meta names the sender and time |
| New message arrives | `messages` grows | Bubble appended at the end; existing bubbles untouched; scroll stays unless the reader was at the bottom (D-3) | `role="log"` announces the new bubble politely |
| Sending | page | The pending bubble appears with meta "You · Sending…" (D-4) | — |
| Send failed | `status: 'failed'` | Danger border and fill, alert icon, "Not sent…", Retry, Discard | `role="alert"` on that bubble announces once |
| Read-only | `readOnly` | Note instead of composer | Note read |
| Loading | `loading` | Skeleton header, block, lines | `aria-hidden`; the page sets `aria-busy` |

## Markup

```html
<!-- rendered: default with one failed message (pages/messages/send-failed) -->
<section class="thread" aria-labelledby="thread-title">
  <div class="dialog__who"><img class="avatar" src="/media/daniel-reyes.jpg" width="48" height="48" alt=""><div><h2 class="rows__title" id="thread-title">Daniel Reyes</h2><p class="rows__meta">Full-stack engineer · Mississauga · <a href="/builders/daniel-reyes">View profile</a></p></div></div>
  <div class="stack" role="log" aria-label="Conversation with Daniel Reyes">
    <div class="bubble"><p>Hi Amara, thanks for the note. …</p><p class="bubble__meta">Daniel · <time datetime="2026-10-08T19:15-04:00">Thu 8 Oct, 7:15 pm</time></p></div>
    <div class="bubble bubble--mine"><p>Thanks, Daniel! Would you be up for coffee? …</p><p class="bubble__meta">You · <time datetime="2026-10-08T20:02-04:00">Thu 8 Oct, 8:02 pm</time></p></div>
    <div class="bubble bubble--mine bubble--failed" role="alert"><p>Saturday at 10 works for me. …</p><p class="bubble__meta"><svg class="icon icon--sm" aria-hidden="true">…alert…</svg> Not sent. Check your connection. <button type="button" class="btn btn--text btn--sm">Retry</button><button type="button" class="btn btn--text btn--sm">Discard</button></p></div>
  </div>
  <form class="form" aria-label="Reply to Daniel Reyes">…field, textarea, Send…</form>
</section>
```

```html
<!-- rendered: loading -->
<div class="thread" aria-hidden="true"><span class="skeleton skeleton--title"></span><span class="skeleton skeleton--block"></span><span class="skeleton skeleton--text"></span><span class="skeleton skeleton--text is-short"></span></div>
```

```html
<!-- consumer -->
<section bn-message-thread [name]="c.other.name" [meta]="c.other | bnRolePlace" [profileHref]="'/builders/' + c.other.slug"
         [profileLabel]="'messages.viewProfile' | t" [photo]="c.other.photo" [logLabel]="'messages.log' | t: { name: c.other.name }"
         [messages]="messages()" [failedText]="'messages.notSent' | t" [retryLabel]="'messages.retry' | t"
         [discardLabel]="'messages.discard' | t" [readOnly]="c.blocked" [readOnlyNote]="'messages.readOnly' | t"
         (retried)="retry($event)" (discarded)="discard($event)">
  <form slot="composer" class="form" [attr.aria-label]="'messages.replyTo' | t: { name: c.other.name }" (ngSubmit)="send()">…</form>
</section>
```

The loading thread in the mock is a `div`; the component keeps its `section` host with the same
classes (D-5).

## Design

- Thread: grid gap `--space-5`, padding `--space-6`, `--radius-lg`, `--color-bg-surface`, hairline.
- Header: `.dialog__who` gap `--space-4`; avatar `--space-12`, `--radius-md`; name `--text-h4`;
  meta `--text-body-sm` `--color-fg-muted`.
- Log: grid gap `--space-5`.
- Bubble: max width `--size-bubble-max-width-36`, padding `--space-4` `--space-5`, `--radius-lg`,
  `--color-bg-subtle`; mine `justify-self: end`, `--color-accent-subtle`; failed hairline
  `--color-danger-border` on `--color-danger-bg`.
- Meta `--text-caption` `--color-fg-subtle`, `--space-2` above; failure buttons text sm.
- The failed bubble's meta is a wrapping flex row (`align-items: center`, gap `--space-2`) so the
  block-level icon sits inline with the text and buttons (D-10).
- Bubble text breaks long words and URLs with `overflow-wrap: anywhere` (new rule; `components.css`
  lacks it).

Component tokens: none.

| Token | Aliases | Overridden by |
|---|---|---|
| — | — | — |

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Thread surface | `--color-bg-surface` | `--palette-birch-50` | `--palette-night-900` |
| Their bubble | `--color-bg-subtle` | `--palette-oat-200` | `--palette-night-800` |
| My bubble | `--color-accent-subtle` | `--palette-sage-50` | `--palette-sage-950` |
| Failed bubble | `--color-danger-bg`, `--color-danger-border` | lingon 100 / 300 | lingon 950 / 700 |
| Body | `--color-fg-default` | `--palette-ink-900` | `--palette-night-50` |
| Meta | `--color-fg-subtle` | `--palette-stone-600` | `--palette-night-300` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-subtle` | 4.5:1 | Their message |
| `--color-fg-default` | `--color-accent-subtle` | 4.5:1 | My message |
| `--color-fg-subtle` | `--color-bg-subtle` | 4.5:1 | Meta on their bubble (D-6) |
| `--color-fg-subtle` | `--color-accent-subtle` | 4.5:1 | Meta on my bubble |
| `--color-fg-default` | `--color-danger-bg` | 4.5:1 | Failed message and failure text |
| `--color-fg-subtle` | `--color-danger-bg` | 4.5:1 | "Not sent…" meta on the failed fill |

## Responsive behaviour

- Below 1024 px the thread stacks under the inbox at full width; from 1024 px it is the flexible
  column beside the 22 rem inbox (page `.split`).
- Bubbles keep their max width and wrap; at 320 px a bubble fills the thread width minus padding;
  long words and URLs break (`overflow-wrap: anywhere`); no horizontal scroll.
- "Retry" and "Discard" are padded to 44 × 44 CSS px on touch.

## Accessibility

### Role and pattern

`section` labelled by the other builder's name. The message list is a `role="log"` live region
(polite, additions only) named "Conversation with Daniel Reyes". Bubbles are not focusable.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | "View profile", then each failed message's "Retry" and "Discard", then the composer |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Native activation |

### Focus

Arriving messages never move focus. After "Discard", focus goes to the composer; after "Retry"
succeeds, focus stays on the composer or returns there (D-7).

### Labelling

Every meta names the sender ("Daniel", "You") and the time; sides and colours are never the only
cue. The failure is words plus an icon.

### Announcements

New received messages are announced once by the log. A failure is announced once through the
failed bubble's `role="alert"`. History loaded on open is not announced (the log is populated
before it is attached, D-3).

### Motion

None; no scroll animation (`scroll-behavior: auto`).

## Content and internationalisation

- Meta: "{sender} · {time}", times per L2-052: "Thu 8 Oct, 7:15 pm"; "Today, 8:42 am" for today.
- Bodies are member text, plain, encoded, line breaks kept (L2-045).
- Translatable: `profileLabel`, `logLabel`, `failedText`, `retryLabel`, `discardLabel`,
  `readOnlyNote`, "You". Data: names, bodies.

## Performance

- Change detection: `OnPush`, signal inputs; `@for` tracks by `id`, so an arriving message adds one
  bubble without re-rendering the others.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/MessageThread.ts` renders the
  Daniel Reyes conversation of `pages/messages/send-failed` (four bubbles, one failed).
- Composite scenarios: `MessageThreadLong.ts` renders a 40-message history between Amara and
  Daniel (the repeated bubble composition); `MessageThreadDark.ts` renders the default thread in
  `data-theme="dark"`. Iterations tuned in `e2e/perf-test/config/scenario-iterations.mjs` to
  100–300 ms.
- Regression rule: changes run the perf test against the base branch with `--fail-on-regression`
  before they are pushed.
- Layout stability: avatar 48 × 48 declared; the loading skeleton keeps the thread's padding.

## Acceptance criteria

### Rendering

- **AC-1** Given Amara opens her conversation with Daniel Reyes, when the thread renders, then the header shows "Daniel Reyes", "Full-stack engineer · Mississauga · View profile", and the three messages appear oldest to newest with Daniel's on the left and hers on the right. (L2-026)
- **AC-2** Given Daniel sends a new message while the thread is open, when it arrives, then it is appended at the end without reloading the page and the existing bubbles are not re-created. (L2-026)
- **AC-3** Given a message body `<b>hi</b>`, when it renders, then the characters show as text. (L2-045)

### States

- **AC-4** Given Amara's message cannot be delivered, when the send fails, then the bubble shows "Not sent. Check your connection." with "Retry" and "Discard" and the original text kept. (L2-026)
- **AC-5** Given the failed message, when Amara selects "Retry", then `retried` emits its id once; when she selects "Discard", then `discarded` emits its id once. (L2-026)
- **AC-6** Given Daniel has blocked Amara, when the thread renders, then it is read-only: no composer, and the note "You can no longer reply in this conversation." (L2-026)
- **AC-7** Given `/messages` is loading, when the thread pane renders, then it shows the skeleton thread hidden from assistive technology. (L2-026)

### Keyboard and focus

- **AC-8** Given the failed message, when Amara tabs from "View profile", then focus reaches "Retry", "Discard" and the composer in that order with a 2 px ring of at least 3:1 contrast; after "Discard", focus is on the composer. (L2-050)

### Screen readers

- **AC-9** Given the thread is open, when Daniel's new message arrives, then a screen reader announces it once through the log, without moving focus; opening the thread does not announce the history. (L2-050)
- **AC-10** Given a failure, when it occurs, then "Not sent. Check your connection." is announced once as an alert. (L2-050)

### Theming

- **AC-11** Given the dark theme, when the thread renders, then surface, bubbles, failure and text colours come from tokens only. (L2-051)
- **AC-12** Given either theme, when measured, then message text reaches 4.5:1 on both bubble fills and on the failed fill, and the meta reaches 4.5:1 on its bubble. (L2-050)

### Content

- **AC-13** Given a message sent today at 8:42 am Toronto time, when its meta renders, then it reads "Daniel · Today, 8:42 am". (L2-052)

### Responsive

- **AC-14** Given 320 px, when a message contains `https://psalter.example.ca/decks/psalm-121-for-small-groups`, then the bubble wraps the URL inside its width and the page does not scroll horizontally. (L2-049)

### Performance

- **AC-15** Given a change to the thread, when the perf test runs `MessageThread`, `MessageThreadLong` and `MessageThreadDark` against the base branch with `--fail-on-regression`, then no scenario is flagged as a possible regression. (L2-048)

## Implementation notes

- Folder `frontend/projects/components/src/lib/message-thread/`: `message-thread.ts` (class
  `MessageThread`), `message-thread.css` with `.thread`, `.bubble*`, `.dialog__who`,
  `.rows__title`, `.rows__meta`, skeleton classes.
- Selector `section[bn-message-thread]`; host class `thread`, `[attr.aria-labelledby]`,
  `[attr.aria-hidden]` when loading.
- Scroll anchoring: after render, if the reader was within `--space-12` of the bottom, scroll the
  log's container to the end; otherwise leave it (D-3).
- `ThreadMessage` exported from `public-api.ts`.
- Perf scenarios as listed under *Performance*.

## Decisions

- **D-1** *The send-failed mock says "Delete"; L2-026 AC5 says "Discard".* "Discard", from the
  catalogue. Raised with the lead as mock drift.
- **D-2** *The design-system page shows only a "Received" variant.* Mine and failed come from the
  mocks; all three are specified.
- **D-3** *Live region noise on open and scroll jumps.* The log is filled before it is attached
  so history is not announced; new bubbles are appended; scroll follows only if the reader was at
  the bottom.
- **D-4** *A sending state has no mock.* The page appends the bubble with meta "You · Sending…"
  until the server confirms; no spinner.
- **D-5** *The loading mock uses `div.thread`.* The host stays a `section` with the same class.
- **D-6** *Meta on their bubble sits on `--color-bg-subtle`, a pair not listed in
  `contrast-pairs.json`.* The rendering's live ratio checks it; the pair is required at 4.5:1 and
  should be added to the design system's list.
- **D-7** *Where does focus go after Retry?* It stays where it was (the Retry button is removed
  only on success, then focus moves to the composer).
- **D-8** *L2-026 AC7 (blocked, read-only) has no mock.* A `p.muted` note replaces the composer;
  its wording is the catalogue's. Raised with the lead.
- **D-9** *The failed bubble's `--color-danger-border` edge measures about 2:1 against the
  surface.* The edge is decoration, not the state's only cue: the words "Not sent…", the icon and
  the fill carry it, so no 3:1 requirement applies to the edge.
- **D-10** *In the send-failed mock the alert icon sits alone on its own line, because the base
  stylesheet makes every `svg` a block.* The failure meta lays out as a wrapping flex row; icon,
  words and buttons share a line while they fit.
