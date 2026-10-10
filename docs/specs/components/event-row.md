# Event row

| Field | Value |
|---|---|
| Selector | `li[bn-event-row]` |
| Library path | `frontend/projects/components/src/lib/event-row/` |
| Status | planned |
| Traces to | L2-018, L2-030, L2-039, L2-045, L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`event-row.html`](../../design-system/components/event-row.html) |
| Source mocks | [`pages/events/default`](../../mocks/pages/events/default.html), [`pages/events/past`](../../mocks/pages/events/past.html), [`pages/home/default`](../../mocks/pages/home/default.html), [`pages/home/partial`](../../mocks/pages/home/partial.html), [`pages/home/loading`](../../mocks/pages/home/loading.html), [`pages/dashboard/default`](../../mocks/pages/dashboard/default.html), [`dialogs/account-menu/default`](../../mocks/dialogs/account-menu/default.html), [`dialogs/cancel-rsvp/default`](../../mocks/dialogs/cancel-rsvp/default.html), [`notifications/site-banner/info`](../../mocks/notifications/site-banner/info.html), [`notifications/account-banner/info`](../../mocks/notifications/account-banner/info.html), [`notifications/rsvp-toast/success`](../../mocks/notifications/rsvp-toast/success.html), [`pages/event-detail/default`](../../mocks/pages/event-detail/default.html) |
| Rendering | [`event-row.html`](event-row.html) |

## Purpose and scope

An event row is one gathering in a list: a large day number with its month, the event's name,
when and where it is, how many people are going, and — where the list allows it — a quiet way
to reserve a spot. Rows sit on hairlines, one under another, on the events page, the home page's
"Upcoming gatherings", and the dashboard's "This week and next".

Use the [rsvp-panel](rsvp-panel.md) for the RSVP decision on the event page, and the event page's
own header (`.event-head`, page-owned) for an event's title block.

Out of scope:

- The list (`ul.events` / `ol.events`), month grouping, ordering, the area filter chips and the
  "Upcoming / Last season" tabs: the events page owns them (L2-018).
- Which events the dashboard lists (going only, next 14 days): the page decides (L2-030).
- The event-detail header `.event-head` reuses `.event__day`, `.event__mon` and `.event__meta`
  inside `.event-head__date` and its meta line. That header belongs to the event-detail page;
  this component does not render it (D-6).
- Whatever the action slot holds: a projected [button](button.md).

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/events/default` (4 rows) | `layout="list"`, `href` set | 15 Oct, Fall Demo Night, "Thu 15 Oct, 7:00–9:30 pm" (clock icon), "Centre for Social Innovation, 192 Spadina Ave" (pin icon), "64 going · 16 spots left"; action: quiet sm link "Reserve a spot" | upcoming, title link focus | canvas, `ul.events` |
| `pages/events/past` (3 rows) | `layout="list"`, `status="ended"` | Builders' Prayer Breakfast 12 Sep, "Ended · 24 came"; Summer Demo Night "Ended · 58 came · 5 demos"; no action | ended | canvas |
| `pages/home/default`, `pages/home/partial` "Upcoming gatherings" (4 rows) | `layout="feature"`, no `href`, `datetime` set | visible date "15" / "Thu · Oct" in `<time>`, title text, meta "7:00–9:30 pm" and venue, "64 going · 16 spots left · 6 demos"; action: quiet sm button "Save a seat" | upcoming | canvas, `ol.events` |
| `pages/home/loading` (4 rows) | `loading` | skeleton photo, two text lines, one short line; `aria-hidden` | loading | canvas, `ol.events[aria-busy]` |
| `pages/dashboard/default` "This week and next" (2 rows) | `layout="compact"`, `href` set | single meta line "Thu 15 Oct, 7:00–9:30 pm · Centre for Social Innovation, 192 Spadina Ave"; attendance "You're going · 64 going · 16 spots left" | upcoming | canvas |
| Behind `dialogs/account-menu/default`, `notifications/site-banner/*`, `notifications/account-banner/*` (dashboard copy) | `layout="compact"` | "64 going · 16 spots left", "22 going" | upcoming | canvas |
| Design system "Cancelled" | any layout, `status="cancelled"` | badge "Cancelled" after the attendance | cancelled | canvas |
| `pages/event-detail/*`, `dialogs/cancel-rsvp/*`, `notifications/rsvp-toast/*` | not this component | `.event__day`, `.event__mon`, `.event__meta` inside `.event-head` | — | page header (D-6) |

Every row is buildable with the API below.

## Anatomy

1. **Row** — host `li.event`. Two-column grid (date, content); three columns from 1024 px.
2. **Date tile** — `div.event__date[aria-hidden="true"]` (list, compact) or `p.event__date >
   time[datetime]` (feature), holding `span.event__day` and `span.event__mon`.
3. **Title** — `h3.event__title`, with an `<a>` when `href` is set.
4. **Meta** — `p.event__meta`: two `span`s with small clock and pin icons (list, feature), or one
   text line joined with " · " (compact).
5. **Content wrapper** — an unclassed `div` around title and meta, in every layout (D-7).
6. **Side** — `div.event__side`: `span.event__going` and the `[slot=action]` content.
7. **Status badge (cancelled)** — `span.badge.badge--danger` with the status label, first inside `.event__side` (D-9).

Host: attribute component on the native `li` (`li.event`), so `ul.events > li` stays valid.

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `layout` | `'list' \| 'compact' \| 'feature'` | `'list'` | no | Chooses the date tile and meta shapes above. |
| `title` | `string` | — | yes | Event name; output-encoded. |
| `href` | `string \| null` | `null` | no | Wraps the title in a link to `/events/{id}`. |
| `datetime` | `string` (ISO 8601 with offset) | — | yes | Start time; written on `time[datetime]` in the feature layout. |
| `day` | `string` | — | yes | "15", formatted in America/Toronto. |
| `month` | `string` | — | yes | List and compact: "Oct". Feature: "Thu · Oct" (weekday and month). |
| `when` | `string` | — | yes | List and compact: "Thu 15 Oct, 7:00–9:30 pm". Feature: "7:00–9:30 pm". |
| `venue` | `string` | — | yes | "Centre for Social Innovation, 192 Spadina Ave". |
| `attendance` | `string` | — | yes | "64 going · 16 spots left", "22 going", "Ended · 24 came", "You're going · 22 going". |
| `status` | `'upcoming' \| 'ended' \| 'cancelled'` | `'upcoming'` | no | `cancelled` renders the badge; `ended` changes nothing visible beyond `attendance` and suppresses the action slot. |
| `statusLabel` | `string \| null` | `null` | with `cancelled` | Badge text, "Cancelled". |
| `headingLevel` | `2 \| 3` | `3` | no | Heading level of the title. |
| `loading` | `boolean` | `false` | no | Renders the skeleton row (`aria-hidden="true"` on the host) and ignores the other inputs. |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| None | — | Navigation is the title link; reserving is the projected action. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `[slot=action]` | one `a[bn-button]` or `button[bn-button]`, quiet, sm | Placed inside `.event__side` after the attendance; not rendered when `status` is `ended` or `cancelled`. Declared once. |

All copy is passed in already translated and formatted (L2-052); the component holds no strings.

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| List | `layout="list"` | Events page, upcoming and past. Hidden date tile, two meta lines with icons, action. |
| Compact | `layout="compact"` | Dashboard: one meta line, attendance includes "You're going", no action. |
| Feature | `layout="feature"` | Home page: the date is the visible `<time>` with weekday, the meta omits the date. |

| Status | Modifier | Use for |
|---|---|---|
| Upcoming | — | Default |
| Ended | — | Past events: "Ended · 24 came" |
| Cancelled | `span.badge.badge--danger` | A cancelled event still listed |

One size. Width comes from the list; the date column is `--size-event-grid-template-columns-7`
wide below 1024 px and `--space-24` from 1024 px.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Hairline bottom rule, `--space-6` block padding (`--space-8` from 1024 px) | Title heading; date read from the meta (list) or the `<time>` (feature) |
| Title link hover | `:hover` | Link colour `--color-fg-link-hover` | — |
| Title link focus | `:focus-visible` | Shared focus ring | Link named by the event title |
| Ended | `status="ended"` | Attendance text says "Ended · …"; no action | Same |
| Cancelled | `status="cancelled"` | Danger badge "Cancelled" | Badge text read before the attendance; not colour alone |
| Loading | `loading` | Skeleton photo and lines on the same grid | Host `aria-hidden="true"`; the list carries `aria-busy` |
| Long title or venue | data | Wraps; never truncated | Full text |

## Markup

```html
<!-- rendered: list (pages/events/default) -->
<li class="event">
  <div class="event__date" aria-hidden="true"><span class="event__day">15</span><span class="event__mon">Oct</span></div>
  <div>
    <h3 class="event__title"><a href="/events/fall-demo-night">Fall Demo Night</a></h3>
    <p class="event__meta"><span><svg class="icon icon--sm" aria-hidden="true">…clock…</svg>Thu 15 Oct, 7:00–9:30 pm</span><span><svg class="icon icon--sm" aria-hidden="true">…pin…</svg>Centre for Social Innovation, 192 Spadina Ave</span></p>
  </div>
  <div class="event__side"><span class="event__going">64 going · 16 spots left</span><a class="btn btn--quiet btn--sm" href="/events/fall-demo-night">Reserve a spot</a></div>
</li>
```

```html
<!-- rendered: compact (pages/dashboard/default) -->
<li class="event">
  <div class="event__date" aria-hidden="true"><span class="event__day">17</span><span class="event__mon">Oct</span></div>
  <div><h3 class="event__title"><a href="/events/prayer-breakfast">Builders' Prayer Breakfast</a></h3>
  <p class="event__meta">Sat 17 Oct, 8:00–9:30 am · St. Matthew's Hall, Leslieville</p></div>
  <div class="event__side"><span class="event__going">You're going · 22 going</span></div>
</li>
```

```html
<!-- rendered: feature (pages/home/default) -->
<li class="event">
  <p class="event__date"><time datetime="2026-10-15T19:00"><span class="event__day">15</span> <span class="event__mon">Thu · Oct</span></time></p>
  <div><h3 class="event__title">Fall Demo Night</h3><p class="event__meta"><span><svg …clock…></svg>7:00–9:30 pm</span><span><svg …pin…></svg>Centre for Social Innovation, 192 Spadina Ave</span></p></div>
  <div class="event__side"><span class="event__going">64 going · 16 spots left · 6 demos</span><button type="button" class="btn btn--quiet btn--sm">Save a seat</button></div>
</li>
```

```html
<!-- rendered: cancelled -->
<li class="event">… <div class="event__side"><span class="badge badge--danger">Cancelled</span><span class="event__going">64 going · 16 spots left</span></div></li>

<!-- rendered: loading (pages/home/loading) -->
<li class="event" aria-hidden="true"><span class="skeleton skeleton--photo"></span><div><span class="skeleton skeleton--text" style="width:50%"></span><span class="skeleton skeleton--text is-short"></span></div><span class="skeleton skeleton--text is-short"></span></li>
```

```html
<!-- consumer -->
<ul class="events">
  @for (e of month.events; track e.id) {
    <li bn-event-row [title]="e.title" [href]="'/events/' + e.id" [datetime]="e.startsAt"
        [day]="e.startsAt | bnDay" [month]="e.startsAt | bnMonth" [when]="e | bnEventWhen" [venue]="e.venue.name"
        [attendance]="e | bnAttendance">
      <a bn-button variant="quiet" size="sm" slot="action" [routerLink]="'/events/' + e.id">{{ 'events.reserve' | t }}</a>
    </li>
  }
</ul>
```

The skeleton width `style` values in the loading row come from the mock and are free to move into
component CSS.

## Design

- Row: grid `--size-event-grid-template-columns-7` + `1fr`, gap `--space-2` `--space-5`, block
  padding `--space-6`, bottom rule hairline `--color-border-default`. From 1024 px: columns
  `--space-24`, content, `auto`; padding `--space-8`; side aligned end and centred.
- Day `--font-family-display`, `--font-size-3xl`, `--font-weight-light`, tabular numbers,
  `--letter-spacing-tight`. Month `--text-overline`, uppercase by CSS, `--letter-spacing-wide`,
  `--color-fg-subtle`, `nowrap`, `--space-1` above.
- Title `--text-h3`. Meta `--text-body-sm`, `--color-fg-muted`, spans with `--space-2` icon gap,
  `--space-1` between lines. Attendance `--text-body-sm`, `--color-fg-muted`, tabular numbers.
- Icons `.icon--sm` (`--space-4`), `currentColor`.

Component tokens: none.

| Token | Aliases | Overridden by |
|---|---|---|
| — | — | — |

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Rule | `--color-border-default` | `--palette-oat-300` | `--palette-night-700` |
| Day, title | `--color-fg-default` | `--palette-ink-900` | `--palette-night-50` |
| Title link | `--color-fg-link` | `--palette-sage-700` | `--palette-sage-300` |
| Month | `--color-fg-subtle` | `--palette-stone-600` | `--palette-night-300` |
| Meta, attendance | `--color-fg-muted` | `--palette-stone-700` | `--palette-night-200` |
| Cancelled badge | `--color-danger-fg` on `--color-danger-bg` | `--palette-lingon-700` on `--palette-lingon-100` | `--palette-lingon-300` on `--palette-lingon-950` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-link` | `--color-bg-canvas` | 4.5:1 | Title link |
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Meta and attendance |
| `--color-fg-subtle` | `--color-bg-canvas` | 4.5:1 | Month |
| `--color-danger-fg` | `--color-danger-bg` | 4.5:1 | Cancelled badge |
| `--color-focus-ring` | `--color-bg-canvas` | 3:1 | Focus indicator |

## Responsive behaviour

- Below 1024 px: two columns; the date spans two rows; the side sits under the content in
  column 2 and wraps (`flex-wrap`).
- From 1024 px: three columns; the side is right-aligned beside the content.
- At 320 px the venue and title wrap; the action button wraps under the attendance; no
  horizontal scroll; the action keeps a 44 × 44 CSS px target on touch devices.

## Accessibility

### Role and pattern

A list item in a native list. The title is a heading so rows can be navigated by heading. In the
list and compact layouts the date tile is `aria-hidden` because the meta repeats the full date;
in the feature layout the date tile is the only date, so it is a visible, readable `<time>`.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Title link, then the action |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Native activation of the link or button |

### Focus

Shared 2 px focus ring on the link and the action; nothing else in the row is focusable.

### Labelling

Link name: the event title. The action's name must stay unique enough in context; when several
rows say "Reserve a spot", the consumer adds `aria-describedby` pointing at the title's id
(D-4). Cancellation is read as the badge's text, never only its colour.

### Announcements

None. The list's loading region carries `aria-busy`.

### Motion

None of its own; link colour transitions follow the global reduced-motion rule.

## Content and internationalisation

- Dates and times in America/Toronto, Canadian English, 12-hour clock with lower-case am/pm and
  an en dash range: "Thu 15 Oct, 7:00–9:30 pm", "Sat 17 Oct, 8:00–9:30 am" (L2-018, L2-052).
  The year is omitted in lists of the current season (D-5).
- Attendance patterns from the catalogue: "{n} going", "{n} going · {m} spots left",
  "Ended · {n} came", "You're going · …". Numbers use comma thousands.
- Event names and venues are data and output-encoded.
- Translatable inputs: `attendance` pattern, `statusLabel`, slot labels, `month` names. Data:
  `title`, `venue`.

## Performance

- Change detection: `OnPush`, signal inputs.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/EventRow.ts` renders Fall Demo
  Night in the list layout with "64 going · 16 spots left" and "Reserve a spot".
- Composite scenarios: `EventList.ts` renders the four October rows of `pages/events/default` in
  `ul.events`; `EventListDark.ts` renders them in `data-theme="dark"`. Iterations tuned in
  `e2e/perf-test/config/scenario-iterations.mjs` to roughly 100–300 ms.
- Regression rule: changes are measured against the base branch with `--fail-on-regression`
  before they are pushed.
- Layout stability: the loading row uses the same grid and padding as a loaded row.
- Weight: two inline icons; no icon library.

## Acceptance criteria

### Rendering

- **AC-1** Given the events page in October 2026, when Fall Demo Night renders, then the row shows "15" and "Oct", the title link "Fall Demo Night", "Thu 15 Oct, 7:00–9:30 pm", "Centre for Social Innovation, 192 Spadina Ave", "64 going · 16 spots left" and the "Reserve a spot" action. (L2-018)
- **AC-2** Given the Builders' Prayer Breakfast without a capacity, when its row renders, then the attendance reads "22 going" with no spots-left text. (L2-018)
- **AC-3** Given the "Last season" view, when the Summer Demo Night row renders, then it reads "Ended · 58 came · 5 demos" and has no action even if one is projected. (L2-018)
- **AC-4** Given Amara's dashboard, when "This week and next" renders, then each compact row shows one meta line joined by " · " and an attendance starting "You're going". (L2-030)
- **AC-5** Given the home page's "Upcoming gatherings", when Fall Demo Night renders, then the date tile is a `time[datetime="2026-10-15T19:00"]` reading "15 Thu · Oct", the meta reads "7:00–9:30 pm" and the "Save a seat" button is in the side. (L2-039)
- **AC-6** Given an event titled `<script>Mixer</script>`, when its row renders, then the title shows those literal characters and no script element exists. (L2-045)

### States

- **AC-7** Given a cancelled Fall Demo Night, when its row renders, then a "Cancelled" badge with the danger style leads the row's side, before the attendance, so the status is in text and not colour alone. (L2-050)
- **AC-8** Given the home page loading, when the events section renders four `loading` rows, then each row is `aria-hidden="true"` and the list has `aria-busy="true"`; when data arrives, the rows replace the skeletons without moving the sections below. (L2-048)

### Keyboard and focus

- **AC-9** Given the events list, when the member tabs through Fall Demo Night, then focus goes to the title link and then to "Reserve a spot", each with a visible 2 px ring of at least 3:1 contrast. (L2-050)

### Screen readers

- **AC-10** Given a list row, when a screen reader reads it, then it hears the title heading and the meta's full date once; the hidden date tile is not read. (L2-050)

### Content

- **AC-11** Given an event starting 7:00 pm on Thursday 29 October 2026 in Toronto, when its row renders, then the meta reads "Thu 29 Oct, 7:00–9:00 pm" in America/Toronto with a 12-hour clock and lower-case "pm". (L2-018)
- **AC-12** Given an event with 1,284 going, when its row renders, then the attendance reads "1,284 going". (L2-052)

### Theming

- **AC-13** Given the dark theme, when the event list renders, then rule, day, link, month, meta and badge colours come from the semantic tokens with no per-component colour code. (L2-051)
- **AC-14** Given either theme, when meta, month and title link are measured on the canvas, then each reaches at least 4.5:1. (L2-050)

### Responsive

- **AC-15** Given the events page at 320 px, when a row renders, then the date stays in its column, the title and venue wrap, the action wraps under the attendance with a 44 × 44 CSS px target, and the page has no horizontal scroll. (L2-049)

- **AC-16** Given the events page at 1280 px, when a list row renders, then the date, the title-and-meta block and the side (attendance and "Reserve a spot") sit on one row in three columns, with the side right-aligned inside the content edge. (L2-049)

### Performance

- **AC-17** Given a change to the row, when the perf test runs `EventRow`, `EventList` and `EventListDark` against the base branch with `--fail-on-regression`, then no scenario is flagged as a possible regression. (L2-048)

## Implementation notes

- Folder `frontend/projects/components/src/lib/event-row/`: `event-row.ts` (class `EventRow`),
  `event-row.html`, `event-row.css` with the `.event*` rules and the skeleton classes it uses.
- Selector `li[bn-event-row]`; host class `event`, host `[attr.aria-hidden]` when `loading`.
- The badge is the [badge](badge.md) markup (`span.badge.badge--danger`); the skeleton spans are
  the [skeleton](skeleton.md) classes.
- Date and time strings come from the `api` library's i18n formatters; the component formats
  nothing.
- Perf scenarios `EventRow.ts`, `EventList.ts`, `EventListDark.ts`, exported from
  `src/scenarios/index.ts`.

## Decisions

- **D-1** *Three layouts in one component?* Yes, `layout` input. The mocks use three shapes of
  the same block; separate components would duplicate the grid and the BEM classes.
- **D-2** *The home rows have no title link and a "Save a seat" button; the events page links the
  title and says "Reserve a spot".* Both are kept for mock parity; `href` is optional and the
  action is a slot, so the page decides the label and behaviour.
- **D-3** *The design system lists "Capacity" as a variant, identical to the date row.* Capacity
  is not a variant; it is the attendance text ("… · 16 spots left").
- **D-4** *Repeated "Reserve a spot" names.* The consumer links each action to its row title
  with `aria-describedby`; the component exposes the title id as `{id}-title` derived from the
  host `id` attribute when present.
- **D-5** *L2-052's example includes the year ("Thu 15 Oct 2026"); list rows omit it.* Lists of
  the current season omit the year as the mocks do; the event page header keeps it.
- **D-6** *The event-detail header reuses `.event__day`, `.event__mon` and `.event__meta`.* Those
  elements there are page markup inside `.event-head`; this component does not render the
  header. Because component styles are encapsulated, the event-detail page carries its own copy
  of those element rules.
- **D-7** *In the mocks the list and compact rows put the title and meta directly in the row, so at
  ≥ 1024 px the three-column grid places the meta in the third column and pushes the side onto a
  second row, outside the content edge (visible in `pages/events/default` at 1280 px). The home
  rows wrap title and meta in a `div` and lay out as intended.* Every layout wraps title and meta in
  one unclassed `div`, giving date | title and meta | side on one row from 1024 px. This differs
  from the list and compact mocks at ≥ 1024 px; raised with the lead so the mocks can be
  corrected before visual-parity baselines are taken.
- **D-8** *The list date tile shows day and month side by side ("15 OCT"), the feature tile
  stacks them (`.event__date time` is a grid).* Kept as in the mocks.
- **D-9** *The design system appends the cancelled badge after `.event__side`, which makes it a
  fifth grid item: it drops under the date column and, below 1024 px, sits beneath the date tile
  away from the text it qualifies.* The badge goes first inside `.event__side`, so it wraps with the
  attendance and stays beside the event's facts at every width.
