# List

| Field | Value |
|---|---|
| Selector | `ul[bn-list]`, `ol[bn-list]`, `li[bn-list-item]` |
| Library path | `frontend/projects/components/src/lib/list/` |
| Status | planned |
| Traces to | L2-006, L2-019, L2-023, L2-048, L2-049, L2-050, L2-051 |
| Design system | [`list.html`](../../design-system/components/list.html) |
| Source mocks | [`pages/event-detail/default`](../../mocks/pages/event-detail/default.html), [`pages/event-detail/ended`](../../mocks/pages/event-detail/ended.html), [`pages/matching/reviewed`](../../mocks/pages/matching/reviewed.html), [`pages/onboarding/success`](../../mocks/pages/onboarding/success.html), [`dialogs/cancel-rsvp/default`](../../mocks/dialogs/cancel-rsvp/default.html), [`notifications/rsvp-toast/success`](../../mocks/notifications/rsvp-toast/success.html) |
| Rendering | [`list.html`](list.html) |

## Purpose and scope

A list shows a short run of related items in reading order, each a title with
a line of supporting facts, optionally led by an avatar and closed by a status
or an action: the evening's agenda, the six demos, this week's matches after
review, the next steps after onboarding. It keeps real `ul`/`ol` and `li`
semantics and never makes a whole row clickable without a real link.

The product's lists use the mocks' `.rows` block; the design system's page
normalises the same idea as `.list` (simple, two-line, avatar, interactive,
dividers). Both are rendered by this component through `variant`.

Use a richer block when the item has its own structure: [inbox](inbox.md) for
conversations, [notification-item](notification-item.md) for notifications,
[event-row](event-row.md) for events, [project-card](project-card.md) for
projects, [comment](comment.md) for feedback, [timeline](timeline.md) for
activity, [table](table.md) to compare columns.

Out of scope:

- The data and its order (chronological agenda, best match first): the page.
- Avatars ([avatar](avatar.md)), buttons ([button](button.md)) and inline
  statuses ([inline-message](inline-message.md)) placed in the slots.
- Section headings above the list.

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/event-detail/*` "Agenda" (and behind `dialogs/cancel-rsvp/*`, `notifications/rsvp-toast/*`) | rows, title as `p`, no media | "Doors and coffee" / "7:00 pm" … "Close" / "9:30 pm" | default | canvas |
| `pages/event-detail/*` "The six demos" | rows, media avatar, title `h3` | avatar Daniel Reyes, "Psalter", "Daniel Reyes · Scripture memory with spaced repetition." | default | canvas |
| `pages/matching/reviewed` "This week" | rows, media avatar, title `h3` with profile link, end inline status | "Daniel Reyes", "Full-stack engineer · 94% match", end "You said hello" (success) / Ruth Alvarez "Passed" | default | canvas |
| `pages/onboarding/success` "Next steps" (`aria-label`) | rows, title `p`, end button | "Browse builders" / "1,284 people across Toronto and the GTA. Esther Nguyen is 1.4 km away." / button "Browse builders"; "Share a project"; "See what's on" | default | surface |
| Design system *Simple* | plain, text items | "Daniel Reyes · Engineer", "Grace Liu · Designer" | default | surface |
| Design system *Two line*, *Interactive* | plain, linked item with meta | "Daniel Reyes" / "Engineer · Leslieville" | default, hover, focus, active, selected (`aria-current`) | surface |
| Design system *Avatar* | plain, linked item with avatar | as above | default | surface |
| Design system *Dividers* | plain | hairline between items (always on) | default | surface |

## Anatomy

**Rows variant (`.rows`)**

1. **List** — `ul.rows` or `ol.rows` (the host). No bullets.
2. **Item** — `li` (the host `li[bn-list-item]`): flex row, centred, gap
   `--space-4`, `--space-4` block padding, hairline bottom border.
3. **Media (optional)** — `[slot=media]`, a decorative 40 px avatar.
4. **Main** — `div.rows__main`, `flex: 1`, `min-width: 0`.
5. **Title** — `.rows__title` on an `h2`/`h3`/`h4`/`p`, optionally wrapping a link.
6. **Meta (optional)** — `p.rows__meta`.
7. **End (optional)** — `[slot=end]`: an inline status or one quiet small button.

**Plain variant (`.list`)**

1. **List** — `ul.list` / `ol.list`.
2. **Item** — `li`, `--space-3` block padding, hairline bottom border.
3. **Link (optional)** — `a`, flex row, gap `--space-3`, min height
   `--target-comfortable`; `aria-current="true"` when selected.
4. **Media (optional)** — `[slot=media]` avatar inside the link.
5. **Text** — `span` with the title, then `br` and `small` meta.

Host: both are attribute components on the native elements, so the list and
item semantics are the browser's own.

## API

### Inputs — `ul[bn-list]`, `ol[bn-list]`

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `variant` | `'rows' \| 'plain'` | `'rows'` | no | `rows` → `.rows`; `plain` → `.list`. Items read it through dependency injection. |

The consumer sets `aria-label` when the list has no visible heading ("Next steps").

### Inputs — `li[bn-list-item]`

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `title` | `string` | — | yes | The item's identity, first ("Psalter", "Daniel Reyes", "Doors and coffee"). |
| `titleLevel` | `'h2' \| 'h3' \| 'h4' \| 'p'` | `'p'` | no | Element of `.rows__title` (rows only). Use a heading when items are things a reader navigates to (demos, matches). |
| `link` | `string \| readonly unknown[] \| null` | `null` | no | `routerLink` for the title (rows) or the whole text-and-media link (plain). |
| `meta` | `string \| null` | `null` | no | Supporting line ("7:00 pm", "Full-stack engineer · 94% match"). `null` omits it. |
| `current` | `boolean` | `false` | no | Plain variant with a link: `aria-current="true"` on the link (the selected specimen). |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| None | — | Links route; projected buttons own their events. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `[slot=media]` | one decorative `bn-avatar` | Before the text. In plain mode it renders inside the link. |
| `[slot=end]` | one inline status (`.inline-status`, owned by [inline-message](inline-message.md)), or one `button[bn-button]`/`a[bn-button]` (`variant="quiet" size="sm"`) | After the main block (rows only). Never inside the title link. |

Each slot is declared once in an `ng-template` and rendered with
`ngTemplateOutlet` in both variant branches (AGENTS.md).

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Rows | `.rows` | Every product list in the mocks. |
| Plain · simple | `.list`, text item | Design system: name lists. |
| Plain · two line | `.list`, link + meta | Design system. |
| Plain · avatar | `.list`, link + media | Design system. |
| Plain · interactive | `.list`, link items, `aria-current` | Design system; hover tint comes from the link. |
| Plain · dividers | `.list` (always on) | The hairline between items is part of both variants. |

| Size | Modifier | Height | Padding | Type |
|---|---|---|---|---|
| Rows | — | content | `--space-4` block | title `--text-h4`, meta `--text-body-sm` |
| Plain | — | link min `--target-comfortable` | `--space-3` block | body text, meta `small` |

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Items with hairline separators | List with N items |
| Hover | `:hover` on a link | Link colour `--color-fg-link-hover`, underline per base link styles | — |
| Focus | `:focus-visible` on a link or button | 2 px `--color-focus-ring` ring, `--focus-ring-offset` | Focus on the real control |
| Active | `:active` on a link | As hover | — |
| Selected / current | `current` | `--color-accent-subtle` fill on the link | `aria-current="true"` |
| Disabled | not supported | — | Lists are not controls; a disabled action is the button's state |
| Empty | no items | The list is not rendered; the page shows its empty state | No empty list announced |

## Markup

```html
<!-- rendered: rows with avatar, heading title and link, end status -->
<ul bn-list class="rows">
  <li bn-list-item>
    <bn-avatar><img class="avatar" src="/media/builders/daniel-reyes.jpg" width="40" height="40" alt=""></bn-avatar>
    <div class="rows__main"><h3 class="rows__title"><a href="/builders/daniel-reyes">Daniel Reyes</a></h3><p class="rows__meta">Full-stack engineer · 94% match</p></div>
    <span class="inline-status inline-status--success">You said hello</span>
  </li>
</ul>
```

```html
<!-- rendered: rows, text only (agenda) -->
<ul bn-list class="rows"><li bn-list-item><div class="rows__main"><p class="rows__title">Doors and coffee</p><p class="rows__meta">7:00 pm</p></div></li></ul>
```

```html
<!-- rendered: rows with an end action -->
<li bn-list-item><div class="rows__main"><p class="rows__title">Browse builders</p><p class="rows__meta">1,284 people across Toronto and the GTA. Esther Nguyen is 1.4 km away.</p></div><a bn-button class="btn btn--quiet btn--sm" href="/builders">Browse builders</a></li>
```

```html
<!-- rendered: plain, linked with avatar, current -->
<ul bn-list class="list"><li bn-list-item><a href="/builders/daniel-reyes" aria-current="true"><bn-avatar>…</bn-avatar><span>Daniel Reyes<br><small>Engineer · Leslieville</small></span></a></li></ul>
```

```html
<!-- consumer -->
<ul bn-list>
  @for (m of week(); track m.id) {
    <li bn-list-item titleLevel="h3" [title]="m.name" [link]="['/builders', m.slug]" [meta]="m.meta">
      <bn-avatar slot="media" decorative [name]="m.name" [src]="m.photoUrl" [initials]="m.initials" />
      <span slot="end" class="inline-status" [class.inline-status--success]="m.contacted">{{ m.outcome }}</span>
    </li>
  }
</ul>
```

## Design

- Rows: `list-style: none`, padding 0; item flex, gap `--space-4`, block
  padding `--space-4`, bottom rule `--border-width-hairline`
  `--color-border-default`; main `flex: 1; min-width: 0`; title `--text-h4`;
  meta `--text-body-sm` `--color-fg-muted`.
- Plain: grid; item block padding `--space-3` with the same rule; link flex,
  gap `--space-3`, min height `--target-comfortable`; current link
  `--color-accent-subtle`.
- Motion: link colour transitions over `--duration-fast` (base link styles),
  only without reduced motion.

Component tokens:

| Token | Aliases | Overridden by |
|---|---|---|
| None | — | Semantic tokens directly. |

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Title | `--color-fg-default` | `--palette-ink-900` | `--palette-night-50` |
| Title link | `--color-fg-link` | `--palette-sage-700` | `--palette-sage-300` |
| Meta | `--color-fg-muted` | `--palette-stone-700` | `--palette-night-200` |
| Separator | `--color-border-default` | `--palette-oat-300` | `--palette-night-700` |
| Current fill | `--color-accent-subtle` | `--palette-sage-50` | `--palette-sage-950` |
| Focus ring | `--color-focus-ring` | `--palette-sage-700` | `--palette-sage-300` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-canvas` | 4.5:1 | Title on the page |
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Meta on the page |
| `--color-fg-link` | `--color-bg-canvas` | 4.5:1 | Linked title |
| `--color-fg-muted` | `--color-bg-surface` | 4.5:1 | Meta on a surface |
| `--color-fg-default` | `--color-accent-subtle` | 4.5:1 | Current item |
| `--color-focus-ring` | `--color-bg-canvas` | 3:1 | Focus ring |

## Responsive behaviour

- No breakpoints of its own. Title and meta wrap inside `.rows__main`; the
  media keeps 40 px; an end action stays on the row and the main text wraps
  around it. Below 576 px an end button keeps a 44 × 44 target.
- At 320 px nothing scrolls horizontally or clips; at 200 % zoom everything stays available; every target is at least 44 × 44 CSS px on touch devices.

## Accessibility

### Role and pattern

Native `ul`/`ol` with `li`; headings inside items when items are navigable
units. No ARIA widget pattern; the design system forbids fake list markers
and whole-row click targets without a link.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Visits each title link and each end action in order; passive items take no focus. |
| <kbd>Enter</kbd> | Follows a link or activates a button. |

### Focus

The real link or button shows the shared ring. The list never moves focus.

### Labelling

- A list with a visible heading needs nothing more; one without
  (onboarding "Next steps") carries `aria-label`.
- Item identity first, then stage, date or neighbourhood (design system
  *Content*).
- An end button whose text repeats in several rows names its row when the text
  alone is ambiguous ("Say hello to Daniel Reyes"); the onboarding buttons are
  already distinct.

### Announcements

None. Changes to the list are announced by the page.

### Motion

Only colour transitions on links, removed under reduced motion.

## Content and internationalisation

- Title: the thing's name in sentence case ("Doors and coffee", "Psalter").
- Meta: "{owner} · {one line}" or "{role} · {score}% match" or a time "7:00 pm"
  (12-hour clock with am/pm, America/Toronto, L2-018 AC5 and L2-052).
- Agenda items stay in chronological order; matches best first.
- Translatable: the list `aria-label`, fixed titles such as "Browse builders",
  end texts. Data: names, one-liners, times, scores.

## Performance

- Change detection: `OnPush` on both; the item's variant comes from the
  injected parent as a signal.
- Perf-test scenarios: `frontend/projects/perf-test/src/scenarios/List.ts`
  renders the six demos of Fall Demo Night (Psalter, Gather, Ledgerline,
  Kindred, Sabbath, Wellspring with their owners' avatars);
  `frontend/projects/perf-test/src/scenarios/ListItem.ts` renders Daniel
  Reyes's reviewed match row with "You said hello"; iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep each at roughly
  100–300 ms.
- Composite scenarios: `DarkTheme`.
- Layout stability: avatars have fixed size; rows have no async parts.
- Weight: imports `RouterLink` and `NgTemplateOutlet` only.

## Acceptance criteria

### Rendering

- **AC-1** Given the Fall Demo Night agenda, when the event page renders, then a `ul.rows` shows six items in order from "Doors and coffee" "7:00 pm" to "Close" "9:30 pm", each a `.rows__title` and a `.rows__meta` in a `.rows__main`. (L2-019)
- **AC-2** Given the ended Fall Demo Night, when "The six demos" renders, then each item shows a decorative 40 px avatar, an `h3.rows__title` ("Psalter") and the meta "Daniel Reyes · Scripture memory with spaced repetition.". (L2-019)
- **AC-3** Given Amara has reviewed all three matches, when `/matching` shows the reviewed state, then the list shows Daniel Reyes and Noah Fischer with "You said hello" and Ruth Alvarez with "Passed" at the end of their rows, each name linking to the builder's profile. (L2-023)
- **AC-4** Given onboarding succeeded, when the success state renders, then a list labelled "Next steps" shows "Browse builders", "Share a project" and "See what's on", each with its meta line and a quiet small button at the end. (L2-006)
- **AC-5** Given a plain list item with `current`, when it renders, then its link has `aria-current="true"` and the `--color-accent-subtle` fill. (L2-050)

### Keyboard and focus

- **AC-6** Given the reviewed matches list, when the member tabs through it, then focus visits the three name links in order and nothing else in the list, and each shows a 2 px `--color-focus-ring` outline. (L2-050)

### Screen readers

- **AC-7** Given the agenda, when a screen reader reaches it, then it is announced as a list of 6 items, and each item reads its title then its time. (L2-050)
- **AC-8** Given any list, when inspected, then items are `li` children of a `ul` or `ol`, and no `li` is itself made clickable by script without a link. (L2-050)

### Theming

- **AC-9** Given the light and dark themes, when a list renders on the canvas, then titles and meta measure at least 4.5:1, and colours change only through token values. (L2-051)

### Responsive

- **AC-10** Given the onboarding "Next steps" list at 320 px, when it renders, then the meta lines wrap, each "Browse builders"-style button keeps a target of at least 44 × 44 CSS px, and the page has no horizontal scroll. (L2-049)

### Performance

- **AC-11** Given a change to the list, when the `List` and `ListItem` perf-test scenarios run against the base branch with `--fail-on-regression`, then neither is flagged as a possible regression. (L2-048)

## Implementation notes

- Planned. Folder `frontend/projects/components/src/lib/list/`: `list.ts`
  (class `List`, selector `ul[bn-list], ol[bn-list]`) and `list-item.ts` (class
  `ListItem`, selector `li[bn-list-item]`), with templates and styles; export
  from `public-api.ts`.
- `ListItem` injects `List` to read `variant`; its template has one
  `ng-template` per slot (`media`, `end`) and switches the title element with
  `@switch` on `titleLevel`, keeping the title link markup in one template.
- Move `.rows*` and `.list*` rules into the component styles, keeping names.
- Composes [avatar](avatar.md), [button](button.md) and
  [inline-message](inline-message.md) through slots.
- Scenarios: add `List.ts` and `ListItem.ts`; export from `scenarios/index.ts`.

## Decisions

- **D-1** *The mocks use `.rows`; the design system documents `.list`. Which does the component render?* Both, by `variant`, with `rows` the default. Every product screen uses `.rows` and e2e locators follow the mocks; the design system's `.list` specimens stay buildable. Raised with the lead so the design-system page can show `.rows`.
- **D-2** *Where does the `.rows` block used for the profile header's `.rows__title`/`.rows__meta` in `.dialog__who` belong?* Those are text styles reused outside a list; they stay with their owners ([message-thread](message-thread.md), [matching-panel](matching-panel.md), dialogs), and this component renders them only inside its items.
- **D-3** *Should the title be a heading?* Only when the items are navigable things (demos, matches), as in the mocks (`h3`); agenda and next-step items use `p`. Hence `titleLevel` with `p` as the default.
- **D-4** *Can an end slot hold more than one control?* No, one status or one action, as in every mock; two actions would crowd the row at 320 px and belong in a menu.
