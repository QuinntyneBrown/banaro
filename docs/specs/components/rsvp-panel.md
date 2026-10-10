# RSVP panel

| Field | Value |
|---|---|
| Selector | `aside[bn-rsvp-panel]` |
| Library path | `frontend/projects/components/src/lib/rsvp-panel/` |
| Status | planned |
| Traces to | L2-019, L2-020, L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`rsvp-panel.html`](../../design-system/components/rsvp-panel.html) |
| Source mocks | [`pages/event-detail/default`](../../mocks/pages/event-detail/default.html), [`pages/event-detail/going`](../../mocks/pages/event-detail/going.html), [`pages/event-detail/waitlist`](../../mocks/pages/event-detail/waitlist.html), [`pages/event-detail/ended`](../../mocks/pages/event-detail/ended.html), [`pages/event-detail/cancelled`](../../mocks/pages/event-detail/cancelled.html), [`dialogs/cancel-rsvp/default`](../../mocks/dialogs/cancel-rsvp/default.html), [`dialogs/cancel-rsvp/busy`](../../mocks/dialogs/cancel-rsvp/busy.html), [`dialogs/cancel-rsvp/failed`](../../mocks/dialogs/cancel-rsvp/failed.html), [`notifications/rsvp-toast/success`](../../mocks/notifications/rsvp-toast/success.html), [`notifications/rsvp-toast/danger`](../../mocks/notifications/rsvp-toast/danger.html) |
| Rendering | [`rsvp-panel.html`](rsvp-panel.html) |

## Purpose and scope

The RSVP panel is the box beside an event where a member decides whether to come. It says where
they stand — free to reserve, going, on the waitlist, too late, or the event is off — shows how
full the room is in words and as a meter, and offers the one or two actions that fit: "Reserve a
spot", "Add to calendar" and "Cancel RSVP", "Join waitlist", "Leave the waitlist", or a way on to
other events.

Use the [event-row](event-row.md) for an event in a list, the [toast](toast.md) for the
`rsvp-toast` confirmations and failures, and the `cancel-rsvp` [dialog](dialog.md) for the
cancellation confirmation.

Out of scope:

- Deciding the status, counting seats atomically, waitlist promotion and the API calls (L2-020):
  the event-detail page and the `api` library.
- The toasts and the `cancel-rsvp` dialog it triggers.
- The page's `.event-head` status badge ("You're going", "Full", "Ended", "Cancelled") and the
  ended/cancelled alerts above the content.
- The buttons themselves: the page projects [button](button.md)s into the actions slot.
- Loading: the page shows a [skeleton](skeleton.md) card in the panel's column.

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/event-detail/default`; also under `notifications/rsvp-toast/info`, `warning`, `danger` | `status="open"`, capacity 80, going 64 | heading "Join us"; note "Free. You can cancel any time before the evening."; meter "64 going · 16 spots left"; primary block button "Reserve a spot" | open, button busy while reserving | surface aside in `.two-col` |
| `pages/event-detail/going`; also under `dialogs/cancel-rsvp/*` and `notifications/rsvp-toast/success` | `status="going"`, going 65 | heading "Your RSVP"; status "You're going" (check, success); note "Thu 15 Oct, 7:00 pm. We will e-mail a reminder on Wednesday evening."; meter "65 going · 15 spots left"; primary block "Add to calendar" (calendar icon); text block link "Cancel RSVP" | going | surface |
| `pages/event-detail/waitlist` | `status="waitlist"`, going 80 of 80 | heading "Waitlist"; status "Full · you're #3 on the waitlist" (clock, neutral); note about promotion by e-mail; meter "80 going · no spots left"; quiet block "Leave the waitlist" | waitlist | surface |
| Design system "Full" (no mock) | `status="full"` | heading "Join the waitlist"; status "Full"; note; meter "80 going · no spots left"; primary block "Join waitlist" | full | surface |
| `pages/event-detail/ended` | `status="ended"`, no meter | heading "This event has ended"; note "Reservations are closed. …"; primary block link "See upcoming events" | ended | surface |
| `pages/event-detail/cancelled` | `status="cancelled"`, no meter | heading "Cancelled"; note "This event is not happening, and any reservation has been released. …"; primary block link "See other events" | cancelled | surface |
| Builders' Prayer Breakfast (no capacity) | `capacity` null | "22 going" as text only; no meter | open | surface |

Every row is buildable with the API below.

## Anatomy

1. **Panel** — host `aside.rsvp`, `aria-labelledby` its heading. Surface card with a hairline.
2. **Heading** — `h2.aside-card__title#{headingId}`.
3. **Status line (optional)** — `p.inline-status` (+ `.inline-status--success` for going) with a
   small icon: check for going, clock for full and waitlist.
4. **Note (optional)** — `p.muted`.
5. **Meter (optional)** — `div.rsvp__meter` with the [progress-bar](progress-bar.md)
   `div.progress[role=progressbar]` labelled "Spots taken" and the count `p`.
6. **Actions** — `[slot=actions]`, block buttons, stacked.

Host: attribute component on the native `aside`, which carries `.rsvp`.

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `status` | `'open' \| 'going' \| 'full' \| 'waitlist' \| 'ended' \| 'cancelled'` | `'open'` | no | Chooses the status line style and icon; `ended` and `cancelled` never show the meter (L2-019). |
| `heading` | `string` | — | yes | "Join us", "Your RSVP", "Join the waitlist", "Waitlist", "This event has ended", "Cancelled". |
| `headingId` | `string` | `'rsvp-title'` | no | Id for the heading and the host's `aria-labelledby`. |
| `statusText` | `string \| null` | `null` | no | "You're going", "Full", "Full · you're #3 on the waitlist". |
| `note` | `string \| null` | `null` | no | Muted paragraph. |
| `going` | `number \| null` | `null` | no | Members going; drives `aria-valuenow`. |
| `capacity` | `number \| null` | `null` | no | When null, no meter renders, only `countText`. |
| `countText` | `string \| null` | `null` | no | "64 going · 16 spots left", "80 going · no spots left", "22 going". |
| `meterLabel` | `string` | — | yes when `capacity` is set | Accessible name of the meter, "Spots taken". |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| None | — | The actions are projected buttons with their own handlers. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `[slot=actions]` | one or two `button[bn-button]` / `a[bn-button]` with `block` | Projected last, in order. The required set per status is in *States*. Declared once. |

## Variants and sizes

| Variant | Status line | Meter | Actions (projected) |
|---|---|---|---|
| Open | — | yes, when capacity is set | primary "Reserve a spot" |
| Going | `.inline-status--success`, check, "You're going" | yes | primary "Add to calendar" + text "Cancel RSVP" |
| Full | `.inline-status`, clock, "Full" | yes, 100 % | primary "Join waitlist" |
| Waitlist | `.inline-status`, clock, "Full · you're #3 on the waitlist" | yes, 100 % | quiet "Leave the waitlist" |
| Ended | — | no | primary link "See upcoming events" |
| Cancelled | — | no | primary link "See other events" |

One size; the panel fills the aside column of `.two-col` (`--size-two-col-grid-template-columns-34`
from 1024 px, full width below).

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Open | `status="open"` | Meter shows taken share | Meter: progressbar "Spots taken", value 64 of 80 |
| Reserving | projected button `busy` | Primary button busy "Reserving…"; counts unchanged until success | Button `aria-busy`; focus stays |
| Going | `status="going"` | Success-coloured status line with check | Status text read; not colour alone |
| Full | `status="full"` | Neutral status line, full meter | "Full" read |
| Waitlist | `status="waitlist"` | Neutral status line with position | Position read |
| Ended | `status="ended"` | No meter, no RSVP action | — |
| Cancelled | `status="cancelled"` | No meter, no RSVP action | — |
| Count change | `going` changes after RSVP or cancel | Meter width and count update in place | The page's `rsvp-toast` announces the change; the panel itself does not (D-3) |
| Failure | request fails | Panel unchanged; page shows `rsvp-toast` danger | — |

## Markup

```html
<!-- rendered: going (pages/event-detail/going) -->
<aside class="rsvp" aria-labelledby="rsvp-title">
  <h2 class="aside-card__title" id="rsvp-title">Your RSVP</h2>
  <p class="inline-status inline-status--success"><svg class="icon icon--sm" aria-hidden="true">…check…</svg>You're going</p>
  <p class="muted">Thu 15 Oct, 7:00 pm. We will e-mail a reminder on Wednesday evening.</p>
  <div class="rsvp__meter">
    <div class="progress" role="progressbar" aria-label="Spots taken" aria-valuenow="65" aria-valuemin="0" aria-valuemax="80"><div class="progress__bar" style="width: 81%"></div></div>
    <p>65 going · 15 spots left</p>
  </div>
  <button type="button" class="btn btn--primary btn--block"><svg class="icon icon--sm" aria-hidden="true">…calendar…</svg>Add to calendar</button>
  <a class="btn btn--text btn--block" href="/events/fall-demo-night/cancel">Cancel RSVP</a>
</aside>
```

```html
<!-- rendered: ended (no status line, no meter) -->
<aside class="rsvp" aria-labelledby="rsvp-title"><h2 class="aside-card__title" id="rsvp-title">This event has ended</h2><p class="muted">Reservations are closed. The next gathering is the Builders' Prayer Breakfast on Saturday.</p><a class="btn btn--primary btn--block" href="/events">See upcoming events</a></aside>
```

```html
<!-- consumer -->
<aside bn-rsvp-panel [status]="rsvp().status" [heading]="'event.rsvp.' + rsvp().status + '.title' | t"
       [statusText]="statusText()" [note]="note()" [going]="event().going" [capacity]="event().capacity"
       [countText]="event() | bnAttendance" [meterLabel]="'event.rsvp.meter' | t">
  @switch (rsvp().status) {
    @case ('open') { <button bn-button variant="primary" block slot="actions" [busy]="reserving()" (click)="reserve()">{{ reserving() ? ('event.rsvp.reserving' | t) : ('event.rsvp.reserve' | t) }}</button> }
    @case ('going') {
      <button bn-button variant="primary" block slot="actions" (click)="addToCalendar()">{{ 'event.rsvp.calendar' | t }}</button>
      <button bn-button variant="text" block slot="actions" (click)="openCancelDialog()">{{ 'event.rsvp.cancel' | t }}</button>
    }
  }
</aside>
```

One `@if`/`@case` per projected node keeps each `[slot=actions]` node projected (NG8011).

## Design

- Panel: grid, gap `--space-4`, padding `--space-6`, radius `--radius-lg`, fill
  `--color-bg-surface`, hairline `--color-border-default`.
- Heading `--text-h4`. Status line `--text-body-sm` with `--space-2` icon gap. Note
  `--color-fg-muted`.
- Meter: gap `--space-2`, `--text-body-sm`, `--color-fg-muted`; track `--space-2` tall,
  `--radius-full`, `--color-border-default`; bar `--color-accent`, width set by the [progress-bar](progress-bar.md) from `going / capacity`.

| Token | Aliases | Overridden by |
|---|---|---|
| — | The panel declares no knobs; the bar width belongs to the [progress-bar](progress-bar.md). | — |

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Surface | `--color-bg-surface` | `--palette-birch-50` | `--palette-night-900` |
| Rule, meter track | `--color-border-default` | `--palette-oat-300` | `--palette-night-700` |
| Heading | `--color-fg-default` | `--palette-ink-900` | `--palette-night-50` |
| Going status | `--color-success-fg` | `--palette-sage-700` | `--palette-sage-200` |
| Neutral status, note, count | `--color-fg-muted` | `--palette-stone-700` | `--palette-night-200` |
| Meter bar | `--color-accent` | `--palette-sage-600` | `--palette-sage-300` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-success-fg` | `--color-bg-surface` | 4.5:1 | "You're going" |
| `--color-fg-muted` | `--color-bg-surface` | 4.5:1 | Note, count, waitlist status |
| `--color-accent` | `--color-border-default` | 3:1 | Meter bar against its track |
| `--color-focus-ring` | `--color-bg-surface` | 3:1 | Focus on actions |

## Responsive behaviour

- Below 1024 px the panel stacks under the event content at full width; from 1024 px it is the
  right-hand column.
- Block buttons fill the panel width and are `--control-height-md` tall or more; touch targets
  are at least 44 × 44 CSS px.
- At 320 px the note and count wrap; nothing scrolls horizontally.

## Accessibility

### Role and pattern

Native `aside` landmark labelled by its heading ("Your RSVP"). The meter is a determinate
`progressbar` with `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax` = capacity and the name
"Spots taken"; the visible count says the same in words (design system: never a meter without a
count).

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Primary action, then the secondary action |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Native activation |

### Focus

After the member reserves and the status changes to going, focus moves to the new primary
action ("Add to calendar") so it is not lost when the "Reserve a spot" button is removed (D-4).
After the `cancel-rsvp` dialog closes, focus returns per the dialog rules.

### Labelling

The status is always words ("You're going", "Full · you're #3 on the waitlist"), with the icon
`aria-hidden`; colour never carries it alone.

### Announcements

None from the panel; the page's `rsvp-toast` announces outcomes (`role="status"`, danger
`role="alert"`).

### Motion

The meter bar does not animate its width change (D-5).

## Content and internationalisation

- Headings, status and notes come from the catalogue; dates in notes follow L2-052 ("Thu 15 Oct,
  7:00 pm").
- Count patterns: "{n} going · {m} spots left", "{n} going · no spots left", "{n} going"; numbers
  with comma thousands.
- Waitlist position: "Full · you're #{n} on the waitlist".
- Translatable inputs: all text inputs and slot labels. Data: counts, event name inside notes.

## Performance

- Change detection: `OnPush`, signal inputs; the percentage is a `computed`.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/RsvpPanel.ts` renders Fall Demo
  Night's going state (65 of 80, "Add to calendar", "Cancel RSVP").
- Composite scenarios: `RsvpPanelStates.ts` renders the six statuses side by side, and
  `RsvpPanelDark.ts` the same in `data-theme="dark"`. Iterations tuned in
  `e2e/perf-test/config/scenario-iterations.mjs` to roughly 100–300 ms.
- Regression rule: changes run the perf test against the base branch with `--fail-on-regression`
  before they are pushed.
- Layout stability: a status change replaces content in place; the page's skeleton card has the
  panel's padding and a block-height placeholder.

## Acceptance criteria

### Rendering

- **AC-1** Given Fall Demo Night with 64 of 80 spots taken, when the open panel renders, then it shows "Join us", "Free. You can cancel any time before the evening.", a progressbar named "Spots taken" with value 64 of 80, the text "64 going · 16 spots left" and the "Reserve a spot" action. (L2-019)
- **AC-2** Given Amara is going, when the panel renders, then it shows "Your RSVP", the success status "You're going" with a check icon, the reminder note, "65 going · 15 spots left", "Add to calendar" and "Cancel RSVP". (L2-019)
- **AC-3** Given Amara is third on the waitlist, when the panel renders, then the status reads "Full · you're #3 on the waitlist", the meter is full at 80 of 80 with "80 going · no spots left", and the only action is "Leave the waitlist". (L2-019)
- **AC-4** Given the event is at capacity and Amara is not on the waitlist, when the full panel renders, then it shows "Full" and the "Join waitlist" action. (L2-020)
- **AC-5** Given the event has ended, when the panel renders, then it shows "This event has ended", no meter and no RSVP action, only "See upcoming events". (L2-019)
- **AC-6** Given the host cancelled the event, when the panel renders, then it shows "Cancelled", the release note and "See other events", with no meter or RSVP action. (L2-019)
- **AC-7** Given the Builders' Prayer Breakfast has no capacity, when the panel renders, then no progressbar is in the DOM and the count reads "22 going". (L2-019)

### States

- **AC-8** Given Amara selects "Reserve a spot" with 16 spots left, when the request succeeds, then the panel changes to going and the count reads "65 going · 15 spots left". (L2-020)
- **AC-9** Given the reserve request is in flight, when Amara looks at the panel, then the primary button shows "Reserving…" with `aria-busy="true"`, keeps focus and ignores a second press. (L2-020)
- **AC-10** Given the reserve request fails, when the error returns, then the panel's status, meter and count are unchanged. (L2-020)

### Keyboard and focus

- **AC-11** Given the going panel, when Amara tabs into it, then focus goes to "Add to calendar" and then "Cancel RSVP", each with a 2 px ring of at least 3:1 contrast. (L2-050)
- **AC-12** Given Amara reserves with the keyboard, when the panel switches to going, then focus lands on "Add to calendar" rather than the page body. (L2-050)

### Screen readers

- **AC-13** Given the going panel, when a screen reader lists landmarks, then it finds a complementary region named "Your RSVP", and the status is read as the words "You're going". (L2-050)

### Theming

- **AC-14** Given the dark theme, when the going panel renders, then surface, status, note, meter and actions take their colours from tokens only. (L2-051)
- **AC-15** Given either theme, when measured, then "You're going" and the note reach 4.5:1 on the surface and the meter bar reaches 3:1 against its track. (L2-050)

### Content

- **AC-16** Given 1,200 going of 1,500, when the count renders, then it reads "1,200 going · 300 spots left". (L2-052)

### Responsive

- **AC-17** Given the event page at 360 px, when the panel renders below the content, then it spans the column, the block buttons are at least 44 × 44 CSS px and nothing scrolls horizontally. (L2-049)

### Performance

- **AC-18** Given a change to the panel, when the perf test runs `RsvpPanel`, `RsvpPanelStates` and `RsvpPanelDark` against the base branch with `--fail-on-regression`, then no scenario is flagged as a possible regression. (L2-048)

## Implementation notes

- Folder `frontend/projects/components/src/lib/rsvp-panel/`: `rsvp-panel.ts` (class `RsvpPanel`),
  `rsvp-panel.css` with `.rsvp`, `.rsvp__meter`, `.inline-status` and `.aside-card__title` rules.
- Selector `aside[bn-rsvp-panel]`; host class `rsvp`, `[attr.aria-labelledby]`.
- Composes the [progress-bar](progress-bar.md) for the meter (determinate); the bar's width is the
  progress-bar's value, not a style the panel writes.
- Focus hand-off after a status change (D-4): the panel exposes `focusPrimaryAction()`, which
  focuses the first projected action; the page calls it after a successful reserve.
- Perf scenarios `RsvpPanel.ts`, `RsvpPanelStates.ts`, `RsvpPanelDark.ts`.

## Decisions

- **D-1** *The design system's four variants (available, going, full, cancelled) all render the
  going markup, and the mocks have no "full but not waitlisted" state.* The CRD defines six
  statuses from the mocks plus L2-020 AC2: open, going, full, waitlist, ended, cancelled. Full
  shows "Full" and "Join waitlist"; its copy is the catalogue's.
- **D-2** *Actions rendered by the panel or projected?* Projected. Each status needs different
  buttons, links and handlers; the panel lays them out and the page owns behaviour.
- **D-3** *Announce the count change?* No; the `rsvp-toast` already announces the outcome, and a
  second live region would double it.
- **D-4** *Where does focus go when the pressed button disappears?* To the new primary action,
  through `focusPrimaryAction()`, so keyboard users keep their place.
- **D-5** *Animate the meter?* No. The change is a fact, not a flourish, and the design system's
  motion rules have no meter transition.
