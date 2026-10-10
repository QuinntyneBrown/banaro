# Timeline and activity

| Field | Value |
|---|---|
| Selector | `ol[bn-timeline]`, `li[bn-timeline-item]` |
| Library path | `frontend/projects/components/src/lib/timeline/` |
| Status | planned |
| Traces to | L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`timeline.html`](../../design-system/components/timeline.html) |
| Source mocks | None use `.timeline` (D-1); the design-system page cites [`pages/notifications/default`](../../mocks/pages/notifications/default.html) |
| Rendering | [`timeline.html`](timeline.html) |

## Purpose and scope

A short chronological list of things that happened, each a sentence naming who did what and when:
"Grace Liu RSVP'd to Fall Demo Night. · 2 minutes ago". It shows recent building activity (an
activity feed) or a group of notifications in time order. It is an ordered list, not an APG
infinite feed.

Use the [notification item](notification-item.md) for the `/notifications` page (unread markers,
types and "Mark all as read" belong to it), the [list](list.md) for unordered collections and the
[message thread](message-thread.md) for conversations.

Out of scope:

- Fetching, paging and "load more"; the page passes the items it has.
- Computing relative times ("2 minutes ago"); the page formats them.
- Unread state and marking items read: a projected action control owns its behaviour.

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| None in the mocks today (D-1) | — | — | — | — |
| Design-system "activity" variant | `ol[bn-timeline]` of `li[bn-timeline-item]`, newest first | "Grace Liu RSVP'd to Fall Demo Night." · "2 minutes ago" (`2026-10-09T15:00:00-04:00`); "Daniel Reyes shared an update to Psalter." · "5 minutes ago" | default | canvas or surface |
| Design-system "notifications" variant | same, text with a link and an action | "Reminder: Fall Demo Night is next Thursday" link + "Mark read" quiet small button | default | canvas or surface |

Every configuration is buildable with the API below.

## Anatomy

1. **List** — `ol.timeline`. One-column grid with `--space-4` between items, indented by
   `--space-6`.
2. **Item** — `li` (no class). One event.
3. **Text** — `p`. Actor and action in one sentence; may contain links.
4. **Time** — `time[datetime]`. When it happened, small and subtle.
5. **Action (optional)** — a control projected after the time (for example "Mark read").

Hosts: `ol[bn-timeline]` adds `class="timeline"`; `li[bn-timeline-item]` renders the text, time and
action inside the native item.

## API

### Inputs — `ol[bn-timeline]`

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `label` | `string \| undefined` | `undefined` | no | `aria-label` of the list ("Recent activity") when no visible heading labels it. |
| `busy` | `boolean` | `false` | no | Sets `aria-busy="true"` while skeleton items fill the list. |

### Inputs — `li[bn-timeline-item]`

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `datetime` | `string` | — | yes | ISO 8601 with the America/Toronto offset ("2026-10-09T15:00:00-04:00"); the `time` element's `datetime`. |
| `timeLabel` | `string` | — | yes | Visible time ("2 minutes ago", "Thu 15 Oct, 7:00 pm"). |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| None — projected links and buttons emit their own events. | | |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `ol[bn-timeline]` default | `li[bn-timeline-item]` only | Order is the consumer's: newest first for activity and notifications. |
| `li[bn-timeline-item]` default | inline text and links | Rendered inside the `p`. |
| `li[bn-timeline-item]` `[slot=action]` | one `bn-button` (quiet, small) | Rendered after the `time`. |

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Activity | text only | Recent building activity. |
| Notifications | text with a link and an action | A group of notifications in time order. |

| Size | Modifier | Height | Padding | Type |
|---|---|---|---|---|
| One size | — | content | `--space-6` start indent | text `--text-body`, time `--text-caption` |

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Sentences with times | Ordered list with item count |
| Loading | list `busy` | Skeleton text lines in each item | List busy |
| Empty | no items | Not rendered; the page shows an [empty state](empty-state.md) | — |
| Link hover, focus | on projected links | Link and focus-ring contracts | — |
| Disabled | — | Not applicable | — |

## Markup

```html
<!-- rendered: activity -->
<ol class="timeline" aria-label="Recent activity">
  <li><p>Grace Liu RSVP'd to Fall Demo Night.</p><time datetime="2026-10-09T15:00:00-04:00">2 minutes ago</time></li>
  <li><p>Daniel Reyes shared an update to Psalter.</p><time datetime="2026-10-09T14:57:00-04:00">5 minutes ago</time></li>
</ol>
```

```html
<!-- rendered: notifications -->
<ol class="timeline" aria-label="Earlier this week">
  <li>
    <p><a href="/events/fall-demo-night">Reminder: Fall Demo Night is next Thursday</a></p>
    <time datetime="2026-10-08T09:00:00-04:00">Yesterday</time>
    <button type="button" class="btn btn--quiet btn--sm">Mark read</button>
  </li>
</ol>
```

```html
<!-- consumer -->
<ol bn-timeline [label]="'dashboard.activity.label' | t">
  @for (e of activity(); track e.id) {
    <li bn-timeline-item [datetime]="e.at" [timeLabel]="e.at | bnRelativeTime">{{ e.text }}</li>
  }
</ol>
```

## Design

- List: `display: grid`, gap `--space-4`, `padding-left: var(--space-6)`, `list-style: none`.
- Text: `--text-body`, `--color-fg-default`.
- Time: `display: block`, `--text-caption`, `--color-fg-subtle`, `font-variant-numeric:
  tabular-nums`.
- Action: `margin-top: var(--space-2)`; a quiet small [button](button.md).
- No rule, marker or elevation; no motion.

Component tokens:

| Token | Aliases | Overridden by |
|---|---|---|
| None — the timeline reads semantic tokens directly. | | |

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Text | `--color-fg-default` | `--palette-ink-900` | `--palette-night-50` |
| Time | `--color-fg-subtle` | `--palette-stone-600` | `--palette-night-300` |
| Links | `--color-fg-link` | `--palette-sage-700` | `--palette-sage-300` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-surface` | 4.5:1 | Text on a card |
| `--color-fg-subtle` | `--color-bg-surface` | 4.5:1 | Time on a card |
| `--color-fg-subtle` | `--color-bg-canvas` | 4.5:1 | Time on the page |
| `--color-fg-link` | `--color-bg-surface` | 4.5:1 | Link in the text |

## Responsive behaviour

- The layout does not change across breakpoints: one column, text wrapping above its time.
- At 320 px nothing scrolls horizontally or clips (long names and project names wrap with
  `overflow-wrap: anywhere`); at 200 % zoom everything stays available; projected actions are at
  least 44 × 44 CSS px on touch devices.

## Accessibility

### Role and pattern

Native `ol` for chronology. Not an [APG feed](https://www.w3.org/WAI/ARIA/apg/patterns/feed/): no
`role="feed"` and no `aria-setsize` paging.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Links and "Mark read" controls in DOM order; text and timestamps are not focusable. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Activates the focused link or button. |

### Focus

Only projected links and buttons take focus, with the shared focus ring.

### Labelling

The list is labelled by a visible heading (`aria-labelledby`) or by `label`. Each `time` carries a
machine-readable `datetime`, so assistive technology and scripts can read the exact moment behind
"2 minutes ago".

### Announcements

None. New items are not announced; a page that inserts items live adds its own polite live region.

### Motion

None.

## Content and internationalisation

- One sentence per item: actor, verb in the past tense, object, full stop ("Grace Liu RSVP'd to
  Fall Demo Night.").
- Times: relative for the last day ("2 minutes ago", "Yesterday"), absolute after that in the L2-052
  format ("Thu 15 Oct, 7:00 pm"), always in America/Toronto.
- Translatable inputs: `label`, `timeLabel` (formatted from the catalogue), the item text template.
  Data values: names, event and project names.

## Performance

- Change detection: `OnPush`, signal inputs.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Timeline.ts` renders the two
  activity items (Grace Liu's RSVP to Fall Demo Night, Daniel Reyes's Psalter update); iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly 100–300 ms.
- Composite scenarios: `DarkTheme`.
- Layout stability: skeleton items reserve one text line and one caption line each.
- Weight: no dependencies beyond Angular core.

## Acceptance criteria

### Rendering

- **AC-1** Given two activity items, when the timeline renders, then an `ol.timeline` holds two `li`, each with a `p` ("Grace Liu RSVP'd to Fall Demo Night.") followed by a `time` ("2 minutes ago"), `--space-4` apart. (L2-050)
- **AC-2** Given an item at 3:00 pm on Friday 9 October 2026 in Toronto, when it renders, then its `time` has `datetime="2026-10-09T15:00:00-04:00"`. (L2-052)
- **AC-3** Given a notifications item with a link and a "Mark read" action, when it renders, then the link sits in the `p` and the button after the `time`. (L2-050)

### States

- **AC-4** Given the timeline is `busy`, when it renders, then the list has `aria-busy="true"`, and when items replace the skeletons nothing outside the list moves. (L2-048)

### Keyboard and focus

- **AC-5** Given the notifications variant, when a keyboard user tabs through it, then focus reaches each link and then its "Mark read" button, with a visible 2 px focus ring of at least 3:1, and never a timestamp. (L2-050)

### Screen readers

- **AC-6** Given the activity timeline labelled "Recent activity", when a screen reader enters it, then it announces "Recent activity, list, 2 items". (L2-050)

### Theming

- **AC-7** Given the light and dark themes, when the timeline renders on a card, then the text has at least 4.5:1 and the time at least 4.5:1 contrast. (L2-050)
- **AC-8** Given a theme change, when it re-renders, then colours change without component code because only design-system tokens are used. (L2-051)

### Responsive

- **AC-9** Given a 320 px viewport and an item naming "Builders' Prayer Breakfast at St. Matthew's Hall, Leslieville", when it renders, then the text wraps and nothing scrolls horizontally. (L2-049)

### Performance

- **AC-10** Given a change to the timeline's template, inputs or styles, when the perf test runs `Timeline` against the base branch, then it is not flagged as a possible regression. (L2-048)

## Implementation notes

- Folder `frontend/projects/components/src/lib/timeline/`: `timeline.ts` (`Timeline`, selector
  `ol[bn-timeline]`), `timeline-item.ts` (`TimelineItem`, selector `li[bn-timeline-item]`),
  `timeline.css`; export both from `public-api.ts`.
- `.timeline time { display: block }` and `overflow-wrap: anywhere` on the text are additions to the
  kit's two rules; record them in the design system.
- Add the `Timeline` perf-test scenario and export it from `index.ts`.

## Decisions

- **D-1** *No mock uses `.timeline`; the design-system page cites `pages/notifications/default`,
  which uses `.notice-list`. Specify it anyway?* Yes, from the design-system page, so it can be used
  without API changes; its criteria trace to the cross-cutting requirements. Raised to the lead.
- **D-2** *The design-system token table lists a border, `--color-accent-subtle`, `--radius-md` and
  `--text-h4` that `components.css` never applies to `.timeline`. Use them?* No. The CSS is the
  implemented contract: an indented list with a subtle caption time; the extra tokens are left out
  until a mock shows markers.
- **D-3** *Is the time above or below the text?* Below, as in the design-system markup (`p` then
  `time`), shown as a block.
- **D-4** *Feed semantics?* No `role="feed"`: the design-system overview says it is not an APG
  infinite feed, and the list is short and static.
