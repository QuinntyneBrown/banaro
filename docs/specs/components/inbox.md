# Inbox

| Field | Value |
|---|---|
| Selector | `ul[bn-inbox]` |
| Library path | `frontend/projects/components/src/lib/inbox/` |
| Status | planned |
| Traces to | L2-026, L2-030, L2-045, L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`inbox.html`](../../design-system/components/inbox.html) |
| Source mocks | [`pages/messages/default`](../../mocks/pages/messages/default.html), [`pages/messages/send-failed`](../../mocks/pages/messages/send-failed.html), [`pages/messages/loading`](../../mocks/pages/messages/loading.html), [`pages/dashboard/default`](../../mocks/pages/dashboard/default.html), [`pages/dashboard/partial`](../../mocks/pages/dashboard/partial.html), [`notifications/connection-banner/warning`](../../mocks/notifications/connection-banner/warning.html), [`notifications/connection-banner/danger`](../../mocks/notifications/connection-banner/danger.html) |
| Rendering | [`inbox.html`](inbox.html) |

## Purpose and scope

The inbox lists a member's conversations, most recent first: each row is a link with the other
builder's face and name, a one-line snippet of the latest message, when it arrived, and how many
are unread. On `/messages` the open conversation is marked current; on the dashboard the same
rows show up to three unread conversations.

Use the [message-thread](message-thread.md) for the conversation itself and the
[notification-item](notification-item.md) for other updates.

Out of scope:

- The `nav` landmark around it ("Conversations", "Unread conversations"): the page.
- Ordering, the dashboard's "up to 3 unread, newest first" filter and the unread counts
  (L2-026, L2-030): the API and the page.
- The empty ("No conversations yet") and error states of `/messages`: page-level
  [empty-state](empty-state.md).
- Live updates: the page passes a new `conversations` array; the component re-renders by `id`.

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/messages/default`, `send-failed`; also under every `notifications/connection-banner/*` | 3 rows, current set | Daniel Reyes (current, unread 1, "8:42 am", bold snippet "Yes. I can do Saturday after the Prayer Breakfast, say 10 am?"); Grace Liu "Wed"; Hannah Kowalski "Mon" | current, unread, read | surface in `.split` nav |
| `pages/dashboard/default`, `pages/dashboard/partial` | 1 row, no current | Daniel Reyes unread 1 | unread | surface in `nav[aria-label="Unread conversations"]` |
| `pages/messages/loading` | `loading`, 3 rows | skeleton photo 2.5 rem, two lines | loading | surface |

Every row is buildable with the API below.

## Anatomy

1. **List** — host `ul.inbox`. Surface card, `--radius-lg`, hairline, `overflow: hidden`.
2. **Row** — `li > a.inbox__item` (`aria-current="true"` when current). Three columns.
3. **Avatar** — `img.avatar` 40 × 40, `alt=""`; or `span.avatar-initials`.
4. **Text** — unclassed `div` (`min-width: 0`): `p.inbox__name`, `p.inbox__snippet`
   (+ `.inbox__snippet--unread`, D-2).
5. **Aside** — unclassed `div.stack`: `span.inbox__time`, and `span.badge.badge--count[aria-hidden]`
   when unread.
6. **Loading row** — `li.inbox__item[aria-hidden]` with skeletons.

Host: attribute component on the native `ul`.

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `conversations` | `InboxConversation[]` | `[]` | no | `{ id; name; href; photo: string \| null; initials; tone; snippet; time: string; datetime: string; unread: number; current: boolean }`, in display order. |
| `unreadLabel` | `string` | — | yes | Word used in the row's accessible name: "unread". |
| `loading` | `boolean` | `false` | no | Renders `skeletonCount` loading rows instead. |
| `skeletonCount` | `number` | `3` | no | — |
| `loadingLabel` | `string` | — | yes when `loading` | Host `aria-label`, "Loading conversations". |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| `opened` | conversation `id` | A row link is activated (before navigation), so the page can mark it current and read. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| None | — | Rows are data-driven. |

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Default | `a.inbox__item` | A read conversation |
| Unread | `.inbox__snippet--unread` + count badge | New messages waiting |
| Current | `[aria-current="true"]` | The conversation open in the thread pane |
| Loading | `li.inbox__item[aria-hidden]` | Placeholder rows |

One size; the inbox is 22 rem wide beside the thread from 1024 px (`.split`) and full width
below.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Muted snippet, subtle time | Name "Grace Liu. Here is the Gather prototype link. No rush on feedback., Wed" |
| Hover | `:hover` | `--color-bg-subtle` fill (D-3) | — |
| Focus | `:focus-visible` | Shared focus ring inset on the row (D-3) | — |
| Unread | `unread > 0` | Snippet `--font-weight-semibold` in `--color-fg-default`; count badge | Name starts "Daniel Reyes, unread." |
| Current | `current` | `--color-accent-subtle` fill | `aria-current="true"` |
| Long snippet | data | One line, ellipsis | Full snippet in the accessible name |
| Loading | `loading` | Skeleton rows | Rows `aria-hidden`; host `aria-label` "Loading conversations"; page `aria-busy` |

## Markup

```html
<!-- rendered: pages/messages/default -->
<ul class="inbox">
  <li><a class="inbox__item" href="/messages/daniel-reyes" aria-current="true" aria-label="Daniel Reyes, unread. Yes. I can do Saturday after the Prayer Breakfast, say 10 am?, 8:42 am">
    <img class="avatar" src="/media/daniel-reyes.jpg" width="40" height="40" alt="">
    <div><p class="inbox__name">Daniel Reyes</p><p class="inbox__snippet inbox__snippet--unread">Yes. I can do Saturday after the Prayer Breakfast, say 10 am?</p></div>
    <div class="stack"><span class="inbox__time"><time datetime="2026-10-09T08:42-04:00">8:42 am</time></span><span class="badge badge--count" aria-hidden="true">1</span></div>
  </a></li>
  <li><a class="inbox__item" href="/messages/grace-liu" aria-label="Grace Liu. Here is the Gather prototype link. No rush on feedback., Wed">…<span class="inbox__time">Wed</span>…</a></li>
</ul>
```

The mock's inline styles (`min-width:0`, stack gap and `justify-items: end`, and the unread
snippet's weight and colour) move into component CSS; the unread snippet gets the new
`.inbox__snippet--unread` class (D-2).

```html
<!-- rendered: loading -->
<ul class="inbox" aria-label="Loading conversations"><li class="inbox__item" aria-hidden="true"><span class="skeleton skeleton--photo" style="width:2.5rem;height:2.5rem"></span><div><span class="skeleton skeleton--text" style="width:50%"></span><span class="skeleton skeleton--text is-short"></span></div><span></span></li>…</ul>
```

```html
<!-- consumer -->
<nav [attr.aria-label]="'messages.conversations' | t">
  <ul bn-inbox [conversations]="conversations()" [unreadLabel]="'messages.unread' | t"
      [loading]="loading()" [loadingLabel]="'messages.loading' | t" (opened)="open($event)"></ul>
</nav>
```

## Design

- List: `--radius-lg`, `--color-bg-surface`, hairline `--color-border-default`.
- Row: grid `auto 1fr auto`, gap `--space-4`, padding `--space-4` `--space-5`, bottom hairline;
  inherits colour, no underline.
- Avatar `--space-10`, `--radius-md`. Name `--text-h4`. Snippet `--text-body-sm`
  `--color-fg-muted`, single line with ellipsis. Time `--text-caption` `--color-fg-subtle`.
- Aside stack gap `--space-2`, items end-aligned. Badge count: `--color-accent` fill,
  `--color-fg-on-accent`, min width `--space-6`.
- Hover `--color-bg-subtle`; current `--color-accent-subtle`; focus ring inset
  (`outline-offset: calc(-1 * var(--focus-ring-width))`).

Component tokens: none.

| Token | Aliases | Overridden by |
|---|---|---|
| — | — | — |

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Surface | `--color-bg-surface` | `--palette-birch-50` | `--palette-night-900` |
| Row rule | `--color-border-default` | `--palette-oat-300` | `--palette-night-700` |
| Current fill | `--color-accent-subtle` | `--palette-sage-50` | `--palette-sage-950` |
| Hover fill | `--color-bg-subtle` | `--palette-oat-200` | `--palette-night-800` |
| Name, unread snippet | `--color-fg-default` | `--palette-ink-900` | `--palette-night-50` |
| Snippet | `--color-fg-muted` | `--palette-stone-700` | `--palette-night-200` |
| Time | `--color-fg-subtle` | `--palette-stone-600` | `--palette-night-300` |
| Count badge | `--color-fg-on-accent` on `--color-accent` | birch on sage 600 | sage 950 on sage 300 |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-accent-subtle` | 4.5:1 | Name and unread snippet on the current row |
| `--color-fg-muted` | `--color-accent-subtle` | 4.5:1 | Snippet on the current row |
| `--color-fg-subtle` | `--color-accent-subtle` | 4.5:1 | Time on the current row |
| `--color-fg-subtle` | `--color-bg-surface` | 4.5:1 | Time |
| `--color-fg-on-accent` | `--color-accent` | 4.5:1 | Count |
| `--color-focus-ring` | `--color-accent-subtle` | 3:1 | Focus on the current row |

## Responsive behaviour

- Below 1024 px the inbox sits above the thread at full width; from 1024 px it is the 22 rem
  column (`--size-split-grid-template-columns-35`).
- The snippet truncates to one line at every width; names wrap. Each row is a whole-row link at
  least 72 px tall, well over 44 × 44 CSS px.
- No horizontal scroll at 320 px.

## Accessibility

### Role and pattern

A list of links inside a page `nav`. Each link carries a composed `aria-label`: "{name}[, unread].
{snippet}, {time}", so the truncated snippet and the visual-only badge are fully conveyed; the
badge itself is `aria-hidden`. The current conversation is `aria-current="true"`.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Each conversation link in order |
| <kbd>Enter</kbd> | Opens the conversation |

### Focus

Focus ring drawn inside the row so the list's `overflow: hidden` does not clip it. Refreshing
the list keeps focus on the same conversation (tracked by `id`).

### Labelling

As above. The visible name matches the start of the accessible name (WCAG 2.5.3).

### Announcements

None; the list does not announce refreshes (design system: do not announce every historical
message as new).

### Motion

Background colour transitions follow the global reduced-motion rule.

## Content and internationalisation

- Times: today "8:42 am"; this week the weekday "Wed"; older "Thu 1 Oct" (America/Toronto,
  L2-052).
- Snippets are the latest message's plain text, encoded (L2-045); the full text belongs to the
  thread.
- Translatable: `unreadLabel`, `loadingLabel`, the label pattern. Data: names, snippets.

## Performance

- Change detection: `OnPush`, signal inputs; `@for` tracks by `id`; the accessible names are
  `computed`.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Inbox.ts` renders the three
  conversations of `pages/messages/default` (Daniel current and unread).
- Composite scenarios: `InboxLong.ts` renders 30 conversations with a mix of unread and read
  (the repeated row); `InboxDark.ts` renders the three in `data-theme="dark"`. Iterations tuned in
  `e2e/perf-test/config/scenario-iterations.mjs` to 100–300 ms.
- Regression rule: changes run the perf test against the base branch with `--fail-on-regression`
  before they are pushed.
- Layout stability: loading rows match row height; avatars declare 40 × 40.

## Acceptance criteria

### Rendering

- **AC-1** Given Amara has three conversations, when `/messages` renders, then the inbox lists Daniel Reyes ("8:42 am"), Grace Liu ("Wed") and Hannah Kowalski ("Mon") in that order, each a link with avatar, name and one-line snippet. (L2-026)
- **AC-2** Given Daniel's conversation has one unread message, when the inbox renders, then his snippet is semibold in the default colour and a count badge "1" is shown. (L2-026)
- **AC-3** Given the open conversation is Daniel's, when the inbox renders, then his link has `aria-current="true"` and the current fill. (L2-026)
- **AC-4** Given Amara's dashboard with one unread conversation, when "Unread messages" renders, then the inbox shows only Daniel's row with sender, one-line preview and time, linking to `/messages`. (L2-030)
- **AC-5** Given a snippet `<i>see you</i>`, when the row renders, then the characters show as text. (L2-045)

### States

- **AC-6** Given `/messages` is loading, when the inbox renders, then three skeleton rows hidden from assistive technology appear in a list named "Loading conversations". (L2-026)
- **AC-7** Given a snippet longer than the column, when the row renders, then it is cut to one line with an ellipsis and the full snippet is in the link's accessible name. (L2-050)
- **AC-8** Given Amara activates Grace's row, when the link is followed, then `opened` emits Grace's conversation id once. (L2-026)

### Keyboard and focus

- **AC-9** Given the inbox, when Amara tabs through it, then each row receives a visible 2 px focus ring of at least 3:1 contrast drawn inside the row, including on the current row. (L2-050)

### Screen readers

- **AC-10** Given Daniel's unread row, when a screen reader reads it, then it hears "Daniel Reyes, unread. Yes. I can do Saturday after the Prayer Breakfast, say 10 am?, 8:42 am" and not the badge digit separately. (L2-050)

### Theming

- **AC-11** Given the dark theme, when the inbox renders, then surface, current fill, text and badge colours come from tokens only. (L2-051)
- **AC-12** Given either theme, when measured, then name, snippet and time reach 4.5:1 on both the surface and the current fill. (L2-050)

### Content

- **AC-13** Given a last message on Thursday 1 October 2026, when the row renders on Friday 9 October, then the time reads "Thu 1 Oct". (L2-052)

### Responsive

- **AC-14** Given 320 px, when the inbox renders, then rows span the width, snippets truncate to one line, each row is at least 44 px tall and nothing scrolls horizontally. (L2-049)

### Performance

- **AC-15** Given a change to the inbox, when the perf test runs `Inbox`, `InboxLong` and `InboxDark` against the base branch with `--fail-on-regression`, then no scenario is flagged as a possible regression. (L2-048)

## Implementation notes

- Folder `frontend/projects/components/src/lib/inbox/`: `inbox.ts` (class `Inbox`), `inbox.css`
  with `.inbox*`, `.badge--count`, `.avatar`, skeleton classes, and the new
  `.inbox__snippet--unread`, hover and inset focus rules.
- Selector `ul[bn-inbox]`; host class `inbox`; `[attr.aria-label]` while loading.
- `InboxConversation` exported from `public-api.ts`.
- Perf scenarios as listed under *Performance*.

## Decisions

- **D-1** *The design system says "Do not make the selected thread visible only by tint", but the
  mock marks it only by tint.* The mock's tint stays (visual parity), plus `aria-current`; the
  thread pane's heading names the open conversation, which is the non-colour cue. Raised with the
  lead in case design wants a stronger marker.
- **D-2** *The unread snippet is styled inline in the mock.* A modifier `.inbox__snippet--unread`
  carries `--font-weight-semibold` and `--color-fg-default`; the design system should add it.
- **D-3** *No hover or focus style for rows exists in `components.css`.* Hover uses
  `--color-bg-subtle`; focus uses the shared ring drawn inset so `overflow: hidden` cannot clip it.
- **D-4** *Time format for older messages has no mock.* Today: time; within six days: weekday;
  older: "Thu 1 Oct" (L2-052 pattern without the time).
