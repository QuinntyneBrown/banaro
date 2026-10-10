# Badge and status

| Field | Value |
|---|---|
| Selector | `bn-badge`, `bn-status` |
| Library path | `frontend/projects/components/src/lib/badge/` |
| Status | planned |
| Traces to | L2-009, L2-019, L2-026, L2-027, L2-036, L2-048, L2-049, L2-050, L2-051 |
| Design system | [`badge.html`](../../design-system/components/badge.html) |
| Source mocks | [`pages/event-detail/going`](../../mocks/pages/event-detail/going.html), [`pages/event-detail/waitlist`](../../mocks/pages/event-detail/waitlist.html), [`pages/event-detail/cancelled`](../../mocks/pages/event-detail/cancelled.html), [`pages/event-detail/ended`](../../mocks/pages/event-detail/ended.html), [`pages/notifications/default`](../../mocks/pages/notifications/default.html), [`pages/messages/default`](../../mocks/pages/messages/default.html), [`pages/dashboard/default`](../../mocks/pages/dashboard/default.html), [`pages/directory/default`](../../mocks/pages/directory/default.html), [`pages/builder-profile/default`](../../mocks/pages/builder-profile/default.html) |
| Rendering | [`badge.html`](badge.html) |

## Purpose and scope

The design-system page "Badge and status" holds two small passive labels that
say what something is in a word, with colour as a supplement:

- **`bn-badge`** (`.badge`) — a tinted capsule with a leading dot for a state
  ("You're going", "Full", "Cancelled", "Ended", "New", "Prototype"), or a
  solid accent counter (`.badge--count`, "1").
- **`bn-status`** (`.status`) — a builder's presence: a small dot and a word
  ("Online now", "Seen 4 h ago"), green and breathing when online.

Use [chip](chip.md) for anything the user can press or remove (a passive badge
never looks clickable), [inline-message](inline-message.md) for a sentence of
feedback such as "Full · you're #3 on the waitlist" (`.inline-status`), and
[alert](alert.md) for a message with a title.

Out of scope:

- The unread count on the header's message and notification buttons
  (`.icon-btn__count`, owned by [top-bar](top-bar.md)) and the "99+" cap of
  L2-027 AC2 there.
- Deciding which state applies (going, waitlisted, ended): the page computes it.
- Hiding presence when a member turned online status off: the page omits the
  `bn-status` (L2-036).
- Project stage in the project card and facts, which is plain text in
  `.project__facts` and [description-list](description-list.md), not a badge.

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/event-detail/going`, `dialogs/cancel-rsvp/*`, `notifications/rsvp-toast/success` event head | badge, success | "You're going" | default | canvas |
| `pages/event-detail/waitlist` event head | badge, warning | "Full" | default | canvas |
| `pages/event-detail/cancelled` event head | badge, danger | "Cancelled" | default | canvas |
| `pages/event-detail/ended` event head | badge, neutral | "Ended" | default | canvas |
| `pages/notifications/default` unread items | badge, info, before the title link | "New" | default; absent in `read` | surface |
| `pages/messages/*`, `pages/dashboard/*`, `notifications/connection-banner/*` inbox item | badge, count, `aria-hidden="true"` (the link's name says "unread") | "1" | default | surface |
| Design system specimens | badge, info "Prototype"; solid "Going"; count "3" with `aria-label="3 unread notifications"` | — | default | surface |
| `pages/directory/*` card foot, `dialogs/say-hello/*`, `notifications/toast/*` | status, online | "Online now" | online (breathing dot) | card surface |
| `pages/directory/*` card foot | status, offline | "Seen 4 h ago", "Seen yesterday", "Seen 2 days ago" | offline | card surface |
| `pages/builder-profile/*`, `dialogs/block-builder/*`, `dialogs/report/*` profile header | status, online | "Online now" | online | canvas |
| Design system *Avatar · status* | status, online, beside an avatar | "Online" | online | surface |

## Anatomy

**Badge**

1. **Container** — `.badge` plus one tone modifier. Inline-flex capsule,
   `--radius-full`, min height `--space-6`, side padding `--space-3`.
2. **Dot** — the `::before` pseudo-element, `--space-2` circle in
   `currentColor`. Decorative; absent on `.badge--count`.
3. **Text** — the projected label. It is the accessible content.

**Status**

1. **Container** — `.status` (`.status--online` when online). Inline-flex,
   gap `--space-2`, `--text-caption`.
2. **Dot** — `span.status__dot`, `aria-hidden="true"`, `--space-2` circle with
   a hairline ring; filled `--color-online` when online.
3. **Word** — the projected text.

Host: `bn-badge` and `bn-status` are the elements themselves; the component
adds the `badge`/`status` classes to the host, so the rendered element is
`<bn-badge class="badge …">` (inline, like the mock's `span`). Locators use the
classes, not the tag.

## API

### Inputs — `bn-badge`

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `tone` | `'neutral' \| 'info' \| 'success' \| 'warning' \| 'danger' \| 'solid' \| 'count'` | `'neutral'` | no | Adds `.badge--{tone}`; `neutral` adds no modifier. |
| `label` | `string \| null` | `null` | no | Accessible name for a count shown on its own ("3 unread notifications"): sets `role="img"` and `aria-label`. Ignored for other tones. |
| `decorative` | `boolean` | `false` | no | Sets `aria-hidden="true"`, for a count inside a control whose name already states it (the inbox item). |

### Inputs — `bn-status`

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `online` | `boolean` | `false` | no | Adds `.status--online`: green word, filled dot, breathing animation. |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| None | — | Both are passive and never take focus. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| default (`bn-badge`) | text | The state word or the count digits, already translated and formatted ("You're going", "1"). Never empty. |
| default (`bn-status`) | text | The presence word ("Online now", "Seen 4 h ago"). Never empty: a dot alone is not allowed. |

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Neutral | `.badge` | A finished or inactive state: "Ended", "Draft". |
| Info | `.badge--info` | Something new or informational: "New", "Prototype". |
| Success | `.badge--success` | A confirmed good state: "You're going". |
| Warning | `.badge--warning` | Needs attention, still possible: "Full", "Nearly full". |
| Danger | `.badge--danger` | Stopped or failed: "Cancelled". |
| Solid | `.badge--solid` | One emphasised state per view on a busy surface: "Going". |
| Count | `.badge--count` | An unread number: "1", "3". No dot; centred digits; min width `--space-6`. |
| Status online | `.status.status--online` | Presence when online. |
| Status offline | `.status` | Last seen. |

| Size | Modifier | Height | Padding | Type |
|---|---|---|---|---|
| One size (badge) | — | min `--space-6` | `--space-3` (count `--space-2`) | `--text-caption` |
| One size (status) | — | line height of `--text-caption` | none | `--text-caption` |

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Tone colours | Text read in place |
| Online | `online` | `--color-success-fg` word, `--color-online` filled dot, breathing ring | Word read; dot hidden |
| Offline | `online` false | `--color-fg-subtle` word, hollow dot with `--color-border-strong` ring | Word read |
| Count, standalone | `tone="count"` + `label` | Accent capsule with digits | `role="img"`, name "3 unread notifications" |
| Count, inside a named control | `tone="count"` + `decorative` | Same | Hidden; the control's name carries it |
| Hover, focus, active, disabled | not supported | — | Passive: no focus stop, no pointer styling (design system *States*) |

## Markup

```html
<!-- rendered: tone badges -->
<bn-badge class="badge badge--success">You're going</bn-badge>
<bn-badge class="badge badge--warning">Full</bn-badge>
<bn-badge class="badge badge--danger">Cancelled</bn-badge>
<bn-badge class="badge">Ended</bn-badge>
<bn-badge class="badge badge--info">New</bn-badge>
<bn-badge class="badge badge--solid">Going</bn-badge>
```

```html
<!-- rendered: counts -->
<bn-badge class="badge badge--count" aria-hidden="true">1</bn-badge>
<bn-badge class="badge badge--count" role="img" aria-label="3 unread notifications">3</bn-badge>
```

```html
<!-- rendered: status -->
<bn-status class="status status--online"><span class="status__dot" aria-hidden="true"></span>Online now</bn-status>
<bn-status class="status"><span class="status__dot" aria-hidden="true"></span>Seen 4 h ago</bn-status>
```

```html
<!-- consumer -->
<bn-badge tone="success">{{ t('event.rsvp.going') }}</bn-badge>
<bn-badge tone="count" decorative>{{ conversation.unread }}</bn-badge>
<bn-status [online]="b.online">{{ b.presence }}</bn-status>
```

## Design

- Badge: inline-flex, centred, gap `--space-2`, min height `--space-6`, padding
  `0 --space-3`, `--radius-full`, `--text-caption`; dot `--space-2` square,
  `--radius-full`, `currentColor`.
- Count: min width `--space-6`, padding `0 --space-2`, centred, no dot.
- Status: inline-flex, gap `--space-2`, `--text-caption`; dot `--space-2`,
  `--radius-full`, `--border-width-hairline` ring.
- Motion: the online dot breathes over `--duration-breath` with
  `--ease-breath`, infinitely, only under `prefers-reduced-motion:
  no-preference`. Badges never animate.
- No elevation, no layer.

Component tokens:

| Token | Aliases | Overridden by |
|---|---|---|
| None | — | Tones are modifier classes over semantic tokens. |

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Neutral fill / text | `--color-bg-subtle` / `--color-fg-muted` | oat-200 / stone-700 | night-800 / night-200 |
| Info fill / text | `--color-info-bg` / `--color-info-fg` | fjord-100 / fjord-700 | fjord-900 / fjord-100 |
| Success fill / text | `--color-success-bg` / `--color-success-fg` | sage-50 / sage-700 | sage-950 / sage-200 |
| Warning fill / text | `--color-warning-bg` / `--color-warning-fg` | clay-100 / clay-700 | clay-900 / clay-300 |
| Danger fill / text | `--color-danger-bg` / `--color-danger-fg` | lingon-100 / lingon-700 | lingon-950 / lingon-300 |
| Solid and count fill / text | `--color-accent` / `--color-fg-on-accent` | sage-600 / birch-50 | sage-300 / sage-950 |
| Status offline word | `--color-fg-subtle` | stone-600 | night-300 |
| Status offline ring | `--color-border-strong` | stone-500 | night-500 |
| Status online word | `--color-success-fg` | sage-700 | sage-200 |
| Status online dot | `--color-online` | sage-500 | sage-300 |

(Primitives are `--palette-*` values of those names.)

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-muted` | `--color-bg-subtle` | 4.5:1 | Neutral badge |
| `--color-info-fg` | `--color-info-bg` | 4.5:1 | Info badge |
| `--color-success-fg` | `--color-success-bg` | 4.5:1 | Success badge |
| `--color-warning-fg` | `--color-warning-bg` | 4.5:1 | Warning badge |
| `--color-danger-fg` | `--color-danger-bg` | 4.5:1 | Danger badge |
| `--color-fg-on-accent` | `--color-accent` | 4.5:1 | Solid and count |
| `--color-success-fg` | `--color-bg-surface` | 4.5:1 | "Online now" on a card |
| `--color-fg-subtle` | `--color-bg-surface` | 4.5:1 | "Seen 4 h ago" on a card |
| `--color-online` | `--color-bg-surface` | 3:1 | Online dot |

Under `forced-colors: active` fills disappear; the words remain, which is why
a badge is never colour-only.

## Responsive behaviour

- Neither component changes across breakpoints. A badge keeps its text on one
  line where it fits and wraps inside the capsule when its container is
  narrower than the word (French "Liste d'attente").
- In the event head the badge sits in a wrapping cluster beside the date tile;
  at 320 px it stays beside or drops below the tile, never overflowing.
- At 320 px nothing scrolls horizontally or clips; at 200 % zoom everything stays available; every target is at least 44 × 44 CSS px on touch devices (neither component is a target).

## Accessibility

### Role and pattern

Plain inline text. No ARIA pattern; a standalone count uses `role="img"` with
an `aria-label`, because "3" alone has no meaning.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Skips both; they are never focusable. |

### Focus

None. A count inside a link or button shares that control's focus ring.

### Labelling

- Tone badges are read as their word; the dot is a pseudo-element and is not
  read.
- A count inside a named control is `aria-hidden`, and the control's name says
  it ("Daniel Reyes, unread…"; "Notifications, 3 unread").
- A standalone count has `aria-label` with the meaning ("3 unread
  notifications").
- Presence is always a word; the dot is `aria-hidden`.

### Announcements

None. When presence or an RSVP state changes on screen, the owning page or
toast announces it; the badge itself is not a live region.

### Motion

Only the online dot animates (breathing ring). Under
`prefers-reduced-motion: reduce` it is static and fully visible.

## Content and internationalisation

- One to three words, sentence case: "You're going", "Full", "Cancelled",
  "Ended", "New". Never all caps (the design system's caption style is not
  uppercase).
- Counts are integers formatted by the page ("1", "12", "1,284" never occurs
  in a badge). The header count's "99+" cap lives in [top-bar](top-bar.md).
- Presence copy: "Online now" or "Seen {relative time}" in sentence case
  ("Seen yesterday", "Seen 2 days ago").
- Translatable: every badge word and presence word, plus the count's `label`.
  Data: the count digits and relative times, formatted by the page.

## Performance

- Change detection: `OnPush`, signal inputs; host classes from one `computed`.
- Perf-test scenarios: `frontend/projects/perf-test/src/scenarios/Badge.ts`
  renders the "You're going" success badge of Fall Demo Night;
  `frontend/projects/perf-test/src/scenarios/Status.ts` renders Daniel Reyes's
  "Online now"; iterations in `e2e/perf-test/config/scenario-iterations.mjs`
  keep each at roughly 100–300 ms.
- Composite scenarios: `DirectoryResults` (twelve statuses, see [card](card.md)),
  `DarkTheme`.
- Layout stability: fixed min height; text arrives with the data, so nothing
  shifts after render.
- Weight: no dependencies.

## Acceptance criteria

### Rendering

- **AC-1** Given Amara Osei is going to Fall Demo Night, when the event head renders, then it shows a `.badge.badge--success` reading "You're going". (L2-019)
- **AC-2** Given Fall Demo Night has ended or has been cancelled, when the event head renders, then it shows a neutral `.badge` reading "Ended" or a `.badge.badge--danger` reading "Cancelled" respectively. (L2-019)
- **AC-3** Given an unread notification "2 new matches this week", when `/notifications` renders, then a `.badge.badge--info` reading "New" precedes the title, and once the item is read the badge is no longer rendered. (L2-027)
- **AC-4** Given Daniel Reyes's conversation has 1 unread message, when the inbox renders, then the item shows a `.badge.badge--count` reading "1" with `aria-hidden="true"`, and the item link's accessible name includes "unread". (L2-026)
- **AC-5** Given a standalone count of 3 with the label "3 unread notifications", when it renders, then it has `role="img"` and the accessible name "3 unread notifications". (L2-050)
- **AC-6** Given Daniel Reyes is online, when his card renders, then `bn-status` has `.status--online`, a filled `--color-online` dot and the word "Online now". (L2-009)
- **AC-7** Given Esther Nguyen was last seen 4 hours ago, when her card renders, then `bn-status` has no `--online` modifier, a hollow dot and the text "Seen 4 h ago". (L2-009)
- **AC-8** Given a builder who turned online status off, when their card renders, then no `.status` element is present at all. (L2-036)

### Screen readers

- **AC-9** Given any badge or status, when a screen reader reads it, then it announces only the word (for example "Full" or "Online now") and nothing for the dot. (L2-050)
- **AC-10** Given every badge tone and both statuses, when they render with colour removed (`forced-colors: active`), then each still shows its word, so no state is conveyed by colour alone. (L2-050)

### Keyboard and focus

- **AC-11** Given a page with badges and statuses, when the member tabs through it, then focus never lands on a `.badge` or a `.status`. (L2-050)

### Theming

- **AC-12** Given the light theme, when each of the neutral, info, success, warning, danger, solid and count badges renders, then its text measures at least 4.5:1 against its own fill. (L2-050)
- **AC-13** Given the dark theme, when the same badges render, then their colours change only through the theme's token values and each still measures at least 4.5:1. (L2-051)
- **AC-14** Given an online status on a card in either theme, when measured, then "Online now" is at least 4.5:1 and the dot at least 3:1 against `--color-bg-surface`. (L2-050)

### Responsive

- **AC-15** Given the waitlist event head at 320 px, when it renders, then the "Full" badge is fully visible without horizontal page scroll. (L2-049)

### Motion

- **AC-16** Given `prefers-reduced-motion: reduce`, when an online status renders, then its dot has no running animation and stays fully visible. (L2-050)

### Performance

- **AC-17** Given a change to either component, when the `Badge` and `Status` perf-test scenarios run against the base branch with `--fail-on-regression`, then neither is flagged as a possible regression. (L2-048)

## Implementation notes

- Planned. Folder `frontend/projects/components/src/lib/badge/`: `badge.ts`
  (class `Badge`, selector `bn-badge`) and `status.ts` (class `Status`,
  selector `bn-status`), each with a template and stylesheet; export both from
  `public-api.ts`.
- `Badge` host bindings: `[class]` from `computed` (`badge`, `badge--{tone}`),
  `[attr.role]`, `[attr.aria-label]`, `[attr.aria-hidden]`. Template:
  `<ng-content />`.
- `Status` template: `<span class="status__dot" aria-hidden="true"></span><ng-content />`.
- Move the `.badge*`, `.status*` and breathing keyframe rules from
  `components.css` into the components' encapsulated styles, keeping class
  names. Host elements need no display rule beyond the class (`inline-flex`).
- Scenarios: add `Badge.ts` and `Status.ts`; export from `scenarios/index.ts`.

## Decisions

- **D-1** *Does "Badge and status" mean one component or two?* Two: `bn-badge` for `.badge` and `bn-status` for `.status`, in one library folder. They have different anatomy (a capsule versus a dot and word) and different consumers, and one component with a mode switch would carry both sets of inputs everywhere.
- **D-2** *Does `.inline-status` ("Passed", "Full · you're #3 on the waitlist") belong here?* No. It is a sentence with an icon, used as inline feedback, so it belongs to [inline-message](inline-message.md). Raised with the lead so that CRD covers it.
- **D-3** *How is a count announced?* Inside a named control it is hidden (as in the mocks); on its own it takes `role="img"` and `aria-label`, as the design system's "3 unread notifications" specimen does. A bare number is never left for a screen reader to read alone.
- **D-4** *May a status render without a word?* No. The design system's *Don't* forbids a dot as the only availability signal; the default slot is required.
- **D-5** *Does the solid tone have a use in the mocks?* Not yet; it stays in the API because the design system defines it and one emphasised state per view is a stated use, so a later screen does not reshape the API.
