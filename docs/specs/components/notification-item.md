# Notification item

| Field | Value |
|---|---|
| Selector | `li[bn-notification-item]` |
| Library path | `frontend/projects/components/src/lib/notification-item/` |
| Status | planned |
| Traces to | L2-027, L2-045, L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`notification-item.html`](../../design-system/components/notification-item.html) |
| Source mocks | [`pages/notifications/default`](../../mocks/pages/notifications/default.html), [`pages/notifications/read`](../../mocks/pages/notifications/read.html), [`pages/notifications/loading`](../../mocks/pages/notifications/loading.html) |
| Rendering | [`notification-item.html`](notification-item.html) |

## Purpose and scope

A notification item is one update on `/notifications`: an icon for what kind of thing happened
(a match, a comment or message, an event, someone going, your profile), a title that links to
the subject ("2 new matches this week"), a quiet detail line, and when it happened. Unread items
sit on a soft sage tint with a "New" badge; selecting one opens its subject and marks it read.

Use the [toast](toast.md) and [banner](alert.md) for transient and system messages (L2-028),
and the [inbox](inbox.md) for conversations.

Out of scope:

- The list `ul.notice-list`, the "New" and "Earlier" sections and "Mark all as read": the
  notifications page (L2-027 AC3).
- The header's unread count ("3 unread notifications", capped at "99+"): the
  [top-bar](top-bar.md).
- Marking as read and opening the subject: the page reacts to `opened`.
- Empty and error states of `/notifications`: page-level [empty-state](empty-state.md).

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/notifications/default` "New" (3 items) | unread | heart: "2 new matches this week" / "Noah Fischer (88%) and Ruth Alvarez (76%) are open to co-founding." / "8:00 am"; chat: "Hannah Kowalski commented on Harvest" / quoted comment / "Yesterday, 4:20 pm"; calendar: "Reminder: Fall Demo Night is next Thursday" / "Thu 15 Oct, 7:00 pm at the Centre for Social Innovation. You have a seat." / "Yesterday, 9:00 am" | unread | canvas, `ul.notice-list` |
| `pages/notifications/default` "Earlier" (3 items) | read | chat: "Daniel Reyes replied to your message" / "Thu 8 Oct"; people: "Grace Liu is going to Design Critique Circle" / "Wed 7 Oct"; person: "12 builders viewed your profile" / "Mon 5 Oct" | read | canvas |
| `pages/notifications/read` (6 items) | read | the six above, all read | read | canvas |
| `pages/notifications/loading` (5 items) | `loading` | 2.75 rem skeleton tile, two lines, a short time line | loading | canvas, `ul.notice-list[aria-busy]` |

Every row is buildable with the API below.

## Anatomy

1. **Item** — host `li` (+ `.is-unread`) inside the page's `ul.notice-list`. Three columns: icon,
   text, time.
2. **Icon** — `span.dialog__icon` with the kind's icon, decorative.
3. **Text** — unclassed `div`: `p.notice__title` (optional `span.badge.badge--info` "New", then
   `a` to the subject) and `p.muted` detail.
4. **Time** — `span.notice__time` containing `time[datetime]`.
5. **Unread text (unread only)** — `span.vh` "Unread" (D-2).
6. **Loading row** — `li[aria-hidden]` with skeletons.

Host: attribute component on the native `li`.

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `kind` | `'match' \| 'comment' \| 'message' \| 'event' \| 'going' \| 'profile'` | — | yes | Picks the icon: heart, chat, chat, calendar, people, person. |
| `title` | `string` | — | yes | Link text; output-encoded. |
| `href` | `string` | — | yes | Subject route. |
| `detail` | `string \| null` | `null` | no | Detail line; quotes from members are encoded. |
| `time` | `string` | — | yes | "8:00 am", "Yesterday, 4:20 pm", "Thu 8 Oct". |
| `datetime` | `string` | — | yes | ISO 8601 for `time[datetime]`. |
| `unread` | `boolean` | `false` | no | Adds `.is-unread`, the "New" badge and the hidden "Unread" text. |
| `newLabel` | `string` | — | yes when `unread` | "New". |
| `unreadLabel` | `string` | — | yes when `unread` | "Unread". |
| `loading` | `boolean` | `false` | no | Renders the skeleton row, `aria-hidden="true"`. |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| `opened` | `void` | The title link is activated, before navigation; the page marks the item read (L2-027 AC1). |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| None | — | — |

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Unread | `li.is-unread` + "New" badge | Not yet opened |
| Read | `li` | Opened, or after "Mark all as read" |
| Loading | `li[aria-hidden]` with skeletons | While the list loads |

| Kind | Icon |
|---|---|
| match | heart |
| comment, message | speech bubble |
| event | calendar |
| going | two people |
| profile | person |

One size. The text column takes the remaining width; the time column is as wide as its text.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Unread | `unread` | `--color-accent-subtle` fill, `--radius-md`; "New" info badge before the title | "New" and visually hidden "Unread" read |
| Read | `unread` false | Hairline bottom rule only | No unread words |
| Link hover / focus | `:hover`, `:focus-visible` | Link colours, shared ring | Link named by the title |
| Just opened | page sets `unread` false after `opened` | Tint and badge removed | — |
| Long title or time | data | Wraps between words; below 576 px the time moves under the detail | — |
| Loading | `loading` | Skeleton tile and lines | Hidden; list `aria-busy` |

The design system's "Action" variant ("Mark read" button) is not used (D-1).

## Markup

```html
<!-- rendered: unread (pages/notifications/default) -->
<li class="is-unread">
  <span class="dialog__icon"><svg class="icon" aria-hidden="true">…heart…</svg></span>
  <div>
    <p class="notice__title"><span class="badge badge--info">New</span> <a href="/matching">2 new matches this week</a></p>
    <p class="muted">Noah Fischer (88%) and Ruth Alvarez (76%) are open to co-founding.</p>
  </div>
  <span class="notice__time"><time datetime="2026-10-09T08:00-04:00">8:00 am</time></span>
  <span class="vh">Unread</span>
</li>
```

```html
<!-- rendered: read -->
<li><span class="dialog__icon"><svg class="icon" aria-hidden="true">…chat…</svg></span><div><p class="notice__title"><a href="/messages/daniel-reyes">Daniel Reyes replied to your message</a></p><p class="muted">“Harvest sounds like exactly the kind of thing I would want to work on.”</p></div><span class="notice__time"><time datetime="2026-10-08">Thu 8 Oct</time></span></li>

<!-- rendered: loading -->
<li aria-hidden="true"><span class="skeleton skeleton--photo" style="width:2.75rem;height:2.75rem"></span><div><span class="skeleton skeleton--text" style="width:55%"></span><span class="skeleton skeleton--text"></span></div><span class="skeleton skeleton--text" style="width:4rem"></span></li>
```

```html
<!-- consumer -->
<ul class="notice-list">
  @for (n of unread(); track n.id) {
    <li bn-notification-item [kind]="n.kind" [title]="n | bnNoticeTitle" [href]="n.subjectRoute" [detail]="n.detail"
        [time]="n.createdAt | bnNoticeTime" [datetime]="n.createdAt" unread
        [newLabel]="'notifications.new' | t" [unreadLabel]="'notifications.unread' | t" (opened)="markRead(n)"></li>
  }
</ul>
```

## Design

- Item: grid `auto 1fr auto`, gap `--space-4`, start-aligned, padding `--space-5` `--space-4`,
  bottom hairline; children `min-width: 0`.
- Unread: `--color-accent-subtle`, `--radius-md`.
- Icon tile: `.dialog__icon`, `--radius-md`, `--color-accent-subtle` with `--color-fg-accent`;
  `--size-switch-control-width-23` × `--size-dialog-icon-height-29`.
- Title `--text-h4`; badge per [badge](badge.md) (`--text-caption`, info colours). Detail
  `--color-fg-muted`. Time `--text-caption` `--color-fg-subtle`.

Component tokens: none.

| Token | Aliases | Overridden by |
|---|---|---|
| — | — | — |

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Unread fill | `--color-accent-subtle` | `--palette-sage-50` | `--palette-sage-950` |
| Rule | `--color-border-default` | `--palette-oat-300` | `--palette-night-700` |
| Icon tile | `--color-accent-subtle` / `--color-fg-accent` | sage 50 / sage 700 | sage 950 / sage 300 |
| Title link | `--color-fg-link` | `--palette-sage-700` | `--palette-sage-300` |
| "New" badge | `--color-info-bg` / `--color-info-fg` | fjord 100 / fjord 700 | fjord 900 / fjord 100 |
| Detail | `--color-fg-muted` | `--palette-stone-700` | `--palette-night-200` |
| Time | `--color-fg-subtle` | `--palette-stone-600` | `--palette-night-300` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-link` | `--color-accent-subtle` | 4.5:1 | Title on unread |
| `--color-fg-muted` | `--color-accent-subtle` | 4.5:1 | Detail on unread |
| `--color-fg-subtle` | `--color-accent-subtle` | 4.5:1 | Time on unread |
| `--color-info-fg` | `--color-info-bg` | 4.5:1 | "New" badge |
| `--color-fg-subtle` | `--color-bg-canvas` | 4.5:1 | Time on read |

Note: on an unread item the icon tile and the row share `--color-accent-subtle`, so the tile's
edge disappears; the icon itself (`--color-fg-accent`) stays visible (D-3).

## Responsive behaviour

- From 576 px: three columns (icon, text, time).
- Below 576 px: two columns; the time moves under the detail in the text column (D-5), so the
  title and detail keep a readable measure. Words break only where they must
  (`overflow-wrap: break-word`); no horizontal scroll at 320 px.
- The title link is a heading-sized text link; the row's padding gives it a touch target of at
  least 44 px tall.

## Accessibility

### Role and pattern

List item in a native list. The title is a link; the icon is decorative.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | The title link of each item |
| <kbd>Enter</kbd> | Opens the subject and marks the item read |

### Focus

Shared ring on the link. Marking all as read does not move focus.

### Labelling

Unread is conveyed by the visible word "New" and the hidden "Unread", never by tint alone.
The link name is the title ("2 new matches this week").

### Announcements

None. The history is not a live region (design system).

### Motion

None.

## Content and internationalisation

- Titles state the outcome with names: "Hannah Kowalski commented on Harvest", "Daniel Reyes
  replied to your message", "Reminder: Fall Demo Night is next Thursday".
- Member quotes use curly quotes and are encoded (L2-045).
- Times in America/Toronto (L2-052): "8:00 am" today, "Yesterday, 4:20 pm", "Thu 8 Oct" older.
- Translatable: title patterns, `newLabel`, `unreadLabel`. Data: names, quotes, event names.

## Performance

- Change detection: `OnPush`, signal inputs.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/NotificationItem.ts` renders the
  unread "2 new matches this week".
- Composite scenarios: `NotificationList.ts` renders the six items of
  `pages/notifications/default` (three unread, three read) in `ul.notice-list`;
  `NotificationListDark.ts` renders them in `data-theme="dark"`. Iterations tuned in
  `e2e/perf-test/config/scenario-iterations.mjs` to 100–300 ms.
- Regression rule: changes run the perf test against the base branch with `--fail-on-regression`
  before they are pushed.
- Layout stability: loading rows use the same grid and padding.

## Acceptance criteria

### Rendering

- **AC-1** Given Amara has three unread notifications, when `/notifications` renders, then "2 new matches this week", "Hannah Kowalski commented on Harvest" and "Reminder: Fall Demo Night is next Thursday" each show their icon, a "New" badge, a detail line and the times "8:00 am", "Yesterday, 4:20 pm" and "Yesterday, 9:00 am". (L2-027)
- **AC-2** Given an unread item, when Amara selects its title, then `opened` emits once before navigation and the page shows the item read on return. (L2-027)
- **AC-3** Given Amara selects "Mark all as read", when it completes, then every item renders without `.is-unread`, the badge or the hidden "Unread" text. (L2-027)
- **AC-4** Given a quoted comment `“<b>Have you</b> interviewed…”`, when the detail renders, then the characters show as text. (L2-045)

### States

- **AC-5** Given the list is loading, when five loading items render, then each is `aria-hidden="true"` with a skeleton tile, two lines and a short time line. (L2-027)

### Keyboard and focus

- **AC-6** Given the list, when Amara tabs, then focus moves from title link to title link with a 2 px ring of at least 3:1 contrast on both the unread fill and the canvas. (L2-050)

### Screen readers

- **AC-7** Given an unread item, when a screen reader reads it, then it hears "New", the title, the detail, the time and "Unread", so the state does not depend on the tint. (L2-050)

### Theming

- **AC-8** Given the dark theme, when unread and read items render, then fill, icon, link, badge and text colours come from tokens only. (L2-051)
- **AC-9** Given either theme, when measured, then title, detail and time reach 4.5:1 on the unread fill and the canvas, and the "New" badge text reaches 4.5:1 on its fill. (L2-050)

### Content

- **AC-10** Given a notification created at 4:20 pm yesterday in Toronto, when it renders on Friday 9 October 2026, then the time reads "Yesterday, 4:20 pm". (L2-052)

### Responsive

- **AC-11** Given 320 px, when "Reminder: Fall Demo Night is next Thursday" renders, then the time sits under the detail, the title breaks only between words, and nothing scrolls horizontally. (L2-049)

### Performance

- **AC-12** Given a change to the item, when the perf test runs `NotificationItem`, `NotificationList` and `NotificationListDark` against the base branch with `--fail-on-regression`, then no scenario is flagged as a possible regression. (L2-048)

## Implementation notes

- Folder `frontend/projects/components/src/lib/notification-item/`: `notification-item.ts`
  (class `NotificationItem`), `notification-item.css` with the `.notice-list > li` rules rewritten
  for `:host` (and `:host(.is-unread)`), `.notice__*`, `.dialog__icon`, `.badge--info`, skeleton
  classes, `.vh`.
- Selector `li[bn-notification-item]`; host class `is-unread`; `[attr.aria-hidden]` when loading.
- Icons inline SVG per kind from the iconography set.
- `NotificationKind` exported from `public-api.ts`.
- Perf scenarios as listed under *Performance*.

## Decisions

- **D-1** *The design system mentions a per-item "Mark read" button ("Action" variant); no mock
  has one and L2-027 marks an item read when it is opened.* No per-item button. If one is ever
  needed it becomes a slot; nothing here changes.
- **D-2** *The design system's unread specimen adds `span.vh` "Unread"; the mocks rely on the
  "New" badge.* Both: the visible badge and the hidden word, so screen-reader users get the state
  at the end of the item too.
- **D-3** *The unread fill matches the icon tile's fill.* Accepted as in the mock; the icon stays
  visible and is decorative.
- **D-4** *The list styles are written as `.notice-list > li`.* The page keeps `ul.notice-list`;
  the component styles itself through `:host` so its encapsulated CSS does not depend on the
  parent class.
- **D-5** *At 320 px the mock's three-column row leaves the text column about 100 px wide, and
  `overflow-wrap: anywhere` splits words ("Ne-w", "Kowalsk-i", "Thursda-y"); see
  `pages/notifications/default` at 320 px.* Below 576 px the item uses two columns with the time
  under the detail, and titles break only between words. This differs from the mock at phone
  width; raised with the lead so the mock and `components.css` can be corrected.
