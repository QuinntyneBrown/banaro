# Empty state

| Field | Value |
|---|---|
| Selector | `bn-empty-state`, `span[bn-empty-icon]` |
| Library path | `frontend/projects/components/src/lib/empty-state/` |
| Status | planned |
| Traces to | L2-008, L2-009, L2-010, L2-011, L2-012, L2-013, L2-015, L2-018, L2-023, L2-026, L2-027, L2-030, L2-043, L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`empty-state.html`](../../design-system/components/empty-state.html) |
| Source mocks | [`pages/directory/no-results`](../../mocks/pages/directory/no-results.html), [`pages/projects/no-results`](../../mocks/pages/projects/no-results.html), [`pages/events/empty`](../../mocks/pages/events/empty.html), [`pages/messages/empty`](../../mocks/pages/messages/empty.html), [`pages/notifications/empty`](../../mocks/pages/notifications/empty.html), [`pages/project-detail/empty`](../../mocks/pages/project-detail/empty.html), [`pages/project-new/success`](../../mocks/pages/project-new/success.html), [`pages/*/error`](../../mocks/pages/directory/error.html) (builder-profile, dashboard, directory, event-detail, events, home, matching, messages, notifications, profile-edit, project-detail, project-edit, projects, settings), [`pages/offline/default`](../../mocks/pages/offline/default.html), [`dialogs/change-photo/default`](../../mocks/dialogs/change-photo/default.html), [`dialogs/change-photo/invalid`](../../mocks/dialogs/change-photo/invalid.html) |
| Rendering | [`empty-state.html`](empty-state.html) |

## Purpose and scope

An empty state fills the space where a collection or a section would be when there is nothing to show,
and says why and what to do next: no builders match Amara's filters ("Clear all filters"), no events
are scheduled near Leslieville ("Tell us what you would host"), her inbox is empty ("Find builders to
talk to"), or the section could not load ("We couldn't load the builders" with "Try again"). It is a
centred block with a small icon tile, a heading, one or two sentences and one to three actions, inside
a dashed outline.

It also carries a one-off success: "Hearth is shared" after a project is created. The icon tile on its
own (`span[bn-empty-icon]`) is reused by the error pages, the auth pages and the photo drop zone.

Use the [error page](error-page.md) when a whole route fails (404, 403, 500, offline, maintenance), an
[alert](alert.md) when one part of a page failed and the rest is useful (dashboard partial), and a
[skeleton](skeleton.md) while loading.

Out of scope:

- Deciding which state applies (empty, no results, error) and what the actions do; the page decides.
- The active filter chips that the directory's no-results state shows above the empty state (L2-010);
  the filter toolbar renders them.

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/directory/no-results` | neutral, search icon, h2 | "No builders match those filters" / "Nobody in Oakville who designs, knows Kotlin and is open to advising yet. Clear a filter or two and more people will appear."; "Clear all filters" (primary button), "Search within 60 km" (quiet button) | no results | canvas, results column |
| `pages/projects/no-results` | neutral, search icon | "No projects match those filters" / "Try a wider stage…"; "Clear filters" (primary), "Share a project" (quiet link) | no results | canvas |
| `pages/events/empty` | neutral, calendar icon | "No events near you yet" / "Nothing is scheduled within 40 km of Leslieville right now…"; "Tell us what you would host" (primary link), "See last season" (quiet link) | empty | canvas |
| `pages/messages/empty` | neutral, message icon | "No conversations yet" / "Say hello to a builder…"; "Find builders to talk to" (primary link) | empty | canvas |
| `pages/notifications/empty` | neutral, bell icon | "No notifications yet" / "New matches, replies and event reminders will show up here…"; "Browse builders" (primary link) | empty | canvas |
| `pages/project-detail/empty` | neutral, message icon | "Be the first to say something" / "Hearth was shared today and has no feedback yet…"; "Give the first feedback" (primary, opens the dialog) | empty | canvas, feedback section |
| `pages/project-new/success` | neutral, check icon, **h1**, `live` | "Hearth is shared" / "Builders nearby can now read it…"; "View Hearth" (primary link), "See co-founder matches" (quiet link), "Back to projects" (text link) | success | canvas |
| `pages/{builder-profile, dashboard, directory, event-detail, events, home, matching, messages, notifications, profile-edit, project-detail, project-edit, projects, settings}/error` | **error**, alert icon, h2 | "We couldn't load the builders", "We couldn't load your week", "We couldn't load Harvest", …; "Try again" (primary button) + one quiet link ("Browse builders", "See your matches", "Back to your home", "All events", "Back to projects", "Back to Harvest", "Back to your profile", "Back to builders") | error | canvas |
| Design-system page | first run, no results, permission, error | "Your first project starts here", "No builders match yet", "This profile is private", "We couldn't load builders" | — | canvas |
| `pages/offline`, `pages/maintenance` (via [error page](error-page.md)) | `span[bn-empty-icon]` offline / clock | — | — | canvas |
| `pages/{join, forgot-password, verify-email}/success`, `verify-email/default`, `verify-email/error`, `reset-password/{success, error}`, `sign-in/signed-out`, `onboarding/success` | `span[bn-empty-icon]` mail / check / alert / clock above the auth title | — | — | auth card |
| `dialogs/change-photo/default` drop zone; `dialogs/change-photo/invalid` rejected file | `span[bn-empty-icon]` photo; alert with `tone="danger"` | — | default, invalid | dialog surface |

Every row is buildable with the API below.

## Anatomy

`bn-empty-state`:

1. **Container** — `div.empty` (+ `.empty--error`, `.empty--compact`). Centred grid, dashed
   `--color-border-strong` outline, `--radius-lg`. `role="status"` only when `live`.
2. **Icon tile** — `span.empty__icon` (the `span[bn-empty-icon]` component): a 56 px rounded square,
   `--color-accent-subtle` fill, with a 28 px icon; danger colours inside `.empty--error`.
3. **Heading** — `h2.empty__title` (or `h1` / `h3` by `headingLevel`).
4. **Description** — `p`, a direct child, `--color-fg-muted`, at most `--size-match-text-max-width-16`
   wide.
5. **Actions** — `div.empty__actions`, centred wrapping row; the first action is the primary recovery.

`span[bn-empty-icon]`: the tile alone, `aria-hidden="true"`, with an inner `svg.icon`.

Hosts: `bn-empty-state` is `display: block` and renders `div.empty`; `span[bn-empty-icon]` is an
attribute component on a native `<span>`, so the tile is the mocks' `span.empty__icon`.

## API

### Inputs

`bn-empty-state`:

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `heading` | `string` | — | yes | Text of `.empty__title`. |
| `headingLevel` | `1 \| 2 \| 3` | `2` | no | Element of the title. `1` only when the empty state is the page's main content (project-new success); the page must then have no other `h1`. |
| `icon` | `EmptyIconName` | `'alert'` when `tone="error"`, else required | see rule | The tile's icon. |
| `tone` | `'neutral' \| 'error'` | `'neutral'` | no | `error` adds `.empty--error` (danger tile). |
| `compact` | `boolean` (`booleanAttribute`) | `false` | no | Adds `.empty--compact` (`--space-6` padding) for panels and asides. |
| `live` | `boolean` (`booleanAttribute`) | `false` | no | Sets `role="status"` so the state is announced when it replaces a form (project-new success). |

`span[bn-empty-icon]`:

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `icon` | `EmptyIconName` | — | yes | One of `'alert' \| 'search' \| 'calendar' \| 'message' \| 'bell' \| 'mail' \| 'clock' \| 'check' \| 'offline' \| 'photo'`, the icons the mocks draw. |
| `tone` | `'accent' \| 'danger'` | `'accent'` | no | `danger` adds `.empty--error` on the tile itself (as `change-photo/invalid` does) so it takes `--color-danger-bg` and `--color-danger-icon` outside an `.empty--error` block. |

### Outputs

None. Actions are projected buttons and links with their own handlers.

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| default | Inline text | Projected into the description `<p>`. One or two sentences. |
| `[slot=actions]` | One to three `button[bn-button]` / `a[bn-button]` | Projected into `.empty__actions` in order: one `primary`, then `quiet`, then `text`. The element is omitted when nothing is projected. |

## Variants and sizes

| Variant | Modifier | Tile | Use for |
|---|---|---|---|
| Neutral (empty, no results, first run, success) | none | `--color-accent-subtle` with `--color-fg-accent` icon | Nothing to show yet, filters too narrow, a finished creation |
| Error | `.empty--error` | `--color-danger-bg` with `--color-danger-icon` icon | The collection or page section failed to load |

| Size | Modifier | Padding | Use for |
|---|---|---|---|
| Default | none | `--space-16` × `--space-6` | A whole collection or page section |
| Compact | `.empty--compact` | `--space-6` | A panel, aside or dialog area |

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | rendered | Tile, heading, description, actions, dashed outline | Heading in the outline; actions in tab order |
| Error | `tone="error"` | Danger tile | Heading says what failed ("We couldn't load…") |
| Live | `live` | Unchanged | `role="status"`: announced politely when inserted |
| Long copy | long heading or French text | Wraps, centred, description capped at the measure | Full text read |

The block itself has no hover, focus or disabled state; its actions follow the [button](button.md)
contract.

## Markup

```html
<!-- rendered: no results (pages/directory/no-results) -->
<bn-empty-state>
  <div class="empty">
    <span aria-hidden="true" class="empty__icon"><svg aria-hidden="true" class="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 4.5 4.5"></path></svg></span>
    <h2 class="empty__title">No builders match those filters</h2>
    <p>Nobody in Oakville who designs, knows Kotlin and is open to advising yet. Clear a filter or two and more people will appear.</p>
    <div class="empty__actions">
      <button class="btn btn--primary" type="button">Clear all filters</button>
      <button class="btn btn--quiet" type="button">Search within 60 km</button>
    </div>
  </div>
</bn-empty-state>
```

```html
<!-- rendered: error (pages/directory/error) -->
<div class="empty empty--error">
  <span aria-hidden="true" class="empty__icon"><svg aria-hidden="true" class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"></circle><path d="M12 7.5v5M12 15.5h.01"></path></svg></span>
  <h2 class="empty__title">We couldn't load the builders</h2>
  <p>Banaro had trouble reaching the server. Nothing you've set up is lost. Try again, or open your matches while we sort it out.</p>
  <div class="empty__actions"><button class="btn btn--primary" type="button">Try again</button><a class="btn btn--quiet" href="/matching">See your matches</a></div>
</div>
```

```html
<!-- rendered: live success with h1 (pages/project-new/success) -->
<div class="empty" role="status">
  <span aria-hidden="true" class="empty__icon"><svg aria-hidden="true" class="icon" viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"></path></svg></span>
  <h1 class="empty__title">Hearth is shared</h1>
  <p>Builders nearby can now read it and leave feedback…</p>
  <div class="empty__actions"><a class="btn btn--primary" href="/projects/hearth">View Hearth</a><a class="btn btn--quiet" href="/matching">See co-founder matches</a><a class="btn btn--text" href="/projects">Back to projects</a></div>
</div>
```

```html
<!-- rendered: standalone danger tile (dialogs/change-photo/invalid) -->
<span aria-hidden="true" class="empty__icon empty--error"><svg aria-hidden="true" class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"></circle><path d="M12 7.5v5M12 15.5h.01"></path></svg></span>
```

```html
<!-- consumer -->
<bn-empty-state icon="search" [heading]="'directory.noResults.title' | translate">
  {{ 'directory.noResults.body' | translate: { place: 'Oakville' } }}
  <button slot="actions" bn-button variant="primary" type="button" (click)="clearFilters()">{{ 'directory.clearAll' | translate }}</button>
  <button slot="actions" bn-button variant="quiet" type="button" (click)="widen(60)">{{ 'directory.widen' | translate: { km: 60 } }}</button>
</bn-empty-state>

<bn-empty-state tone="error" [heading]="'directory.error.title' | translate">…</bn-empty-state>
<span bn-empty-icon icon="mail"></span>
```

Page objects locate by `.empty`, `.empty--error`, `.empty__title`, `.empty__actions` and
`.empty__icon`.

## Design

- Block: `display: grid; justify-items: center; gap: var(--space-4)`; padding `--space-16` (block) ×
  `--space-6` (inline), `--space-6` when compact; `text-align: center`; border `--border-width-hairline`
  dashed `--color-border-strong`; radius `--radius-lg`.
- Tile: `--size-quote-photo-width-9` × `--size-quote-photo-height-10` (56 px), radius `--radius-md`,
  grid centred; icon `--size-empty-icon-icon-width-32` × `--size-switch-control-height-24` (28 px),
  stroke 1.5 in `currentColor`.
- Heading `--text-h3` (whatever its level, so an `h1` here looks like the others); description
  `--color-fg-muted`, max width `--size-match-text-max-width-16`.
- Actions: wrapping flex row, centred, gap `--space-3`, `margin-top: var(--space-2)`.
- Motion: none of its own.

Component tokens: none.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Outline | `--color-border-strong` | `--palette-stone-500` | `--palette-night-500` |
| Tile fill | `--color-accent-subtle` | `--palette-sage-50` | `--palette-sage-950` |
| Tile icon | `--color-fg-accent` | `--palette-sage-700` | `--palette-sage-300` |
| Error tile fill | `--color-danger-bg` | `--palette-lingon-100` | `--palette-lingon-950` |
| Error tile icon | `--color-danger-icon` | `--palette-lingon-600` | `--palette-lingon-300` |
| Heading | `--color-fg-default` | `--palette-ink-900` | `--palette-night-50` |
| Description | `--color-fg-muted` | `--palette-stone-700` | `--palette-night-200` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-canvas` | 4.5:1 | Heading |
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Description |
| `--color-fg-accent` | `--color-accent-subtle` | 3:1 | Icon on the neutral tile |
| `--color-danger-icon` | `--color-danger-bg` | 3:1 | Icon on the error tile |

The dashed outline is decorative (it frames the area; the heading carries the meaning).

## Responsive behaviour

- Centred at every width; the description wraps at its measure, and on narrow screens at the column
  width.
- Actions wrap onto several centred lines below 576 px; each keeps its natural width (not full width).
- At 320 px the outline, text and actions fit the column with no horizontal scroll (L2-049); buttons
  meet the 44 px target through the [button](button.md) rule.

## Accessibility

### Role and pattern

Native content: a heading, a paragraph and buttons or links. The tile is decorative
(`aria-hidden="true"`); the heading states the situation in words, so the error is not conveyed by the
red tile alone (L2-050). With `live`, the block is a polite `role="status"` region.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Reaches each action in order; the primary recovery action first. The block is not a tab stop. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Native activation of the focused action. |

### Focus

The empty state never takes focus when a list becomes empty or a load fails (design system: "do not
move focus just because a list becomes empty"). After "Clear all filters", focus stays on the page's
filter toolbar (the page's concern).

### Labelling

The heading names the state. Heading level follows the page outline: `h2` inside a page section, `h1`
only when it is the page's only main heading.

### Announcements

None unless `live`. A failure that happens after the page loaded is announced by the page (the region
changes from `aria-busy` to content).

### Motion

None.

## Content and internationalisation

- Heading: plain, specific, no blame: "No builders match those filters", "We couldn't load your week".
- Description: one or two sentences — what happened, what is safe ("Nothing you've set up is lost"),
  what to try. Distances and places from data per L2-052 ("within 40 km of Leslieville").
- Actions: the recovery first ("Try again", "Clear all filters"), then an alternative route.
- Never ask someone to retry a permission denial (design system); a 403 is an [error page](error-page.md).
- Translatable: `heading`, description and action labels. Data: place names, distances, project names
  ("Hearth", "Harvest").

## Performance

- Change detection: `OnPush`; signal inputs; the icon is chosen in a `computed`.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/EmptyState.ts` renders the directory
  no-results state (search icon, "No builders match those filters", "Clear all filters", "Search within
  60 km"); iterations in `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly 100–300 ms.
- Composite scenarios: none; `ErrorPage` covers the tile in the offline and maintenance pages.
- Layout stability: an empty or error state replaces a skeleton region in the same column; its height
  differs from the loaded list, which is expected (no content follows it within the region).
- Weight: `@angular/core` only; icons are inline SVG in the template.

## Acceptance criteria

### Rendering

- **AC-1** Given Amara filters for designers in Oakville who know Kotlin and are open to advising, when no builder matches, then `.empty` shows the search icon, `h2.empty__title` "No builders match those filters", the description, and "Clear all filters" (primary) then "Search within 60 km" (quiet) in `.empty__actions`. (L2-010)
- **AC-2** Given no project matches the filters, when the projects page renders, then the empty state reads "No projects match those filters" with "Clear filters" and "Share a project". (L2-015)
- **AC-3** Given nothing is scheduled within 40 km of Leslieville, when `/events` loads, then the empty state shows the calendar icon, "No events near you yet" and the primary link "Tell us what you would host" to `/contact`. (L2-018)
- **AC-4** Given Amara has no conversations, when `/messages` loads, then the empty state shows the message icon, "No conversations yet" and "Find builders to talk to". (L2-026)
- **AC-5** Given Hearth has no feedback, when its project page loads, then the feedback section shows "Be the first to say something" with the primary "Give the first feedback". (L2-013)
- **AC-6** Given Amara has no notifications, when `/notifications` loads, then the empty state shows the bell icon and "No notifications yet". (L2-027)
- **AC-7** Given Amara shares the project Hearth, when the success state shows, then it renders `div.empty[role="status"]` with the check icon, `h1.empty__title` "Hearth is shared" styled at `--text-h3`, and the links "View Hearth", "See co-founder matches", "Back to projects", and the page has no other `h1`. (L2-012)

### States

- **AC-8** Given the directory request fails, when the error state shows, then `.empty.empty--error` has the alert icon on a `--color-danger-bg` tile, the heading "We couldn't load the builders", and "Try again" as the first action. (L2-009)
- **AC-9** Given the builder profile request fails, when Amara activates "Try again", then the page requests the profile again; the empty state emits nothing itself and the button runs the page's handler once per press. (L2-011)
- **AC-10** Given the dashboard request fails entirely, when the error state shows, then it reads "We couldn't load your week" with "Try again" and "Browse builders". (L2-030)
- **AC-11** Given the matching request fails, when the error state shows, then it reads "We couldn't load your three" with "Try again" and "Browse builders". (L2-023)
- **AC-12** Given the change-photo dialog rejects "team-offsite.heic", when the invalid state shows, then the file row's `span.empty__icon.empty--error` shows the alert icon on the danger tile. (L2-008)
- **AC-13** Given the offline page, when it renders, then its icon is a `span[bn-empty-icon]` with the offline icon on the accent tile. (L2-043)

### Keyboard and focus

- **AC-14** Given the directory list becomes empty after a filter change, when the empty state appears, then focus stays where it was, and Tab then reaches "Clear all filters" before "Search within 60 km". (L2-050)

### Screen readers

- **AC-15** Given any empty state, when read by a screen reader, then the tile is not announced, the heading is reached as a heading of the given level, and the error tone is stated by the heading's words. (L2-050)

### Theming

- **AC-16** Given the neutral and error states in light and dark, when contrast is measured, then the heading and description reach 4.5:1 on the canvas and the tile icons reach 3:1 on their tiles. (L2-050)
- **AC-17** Given the theme switches, when the empty state re-renders, then all its colours change through tokens alone. (L2-051)

### Responsive

- **AC-18** Given a 320 px viewport, when the project-new success state renders its three actions, then they wrap onto centred lines, the description wraps, and the page has no horizontal scroll. (L2-049)

### Content

- **AC-19** Given the `en-CA` catalogue, when the events empty state renders, then its heading, description and actions come from the catalogue with "40 km" and "Leslieville" inserted from data. (L2-052)

### Performance

- **AC-20** Given a change to the empty state, when the perf test runs `EmptyState` against the base branch with `--fail-on-regression`, then it is not flagged as a possible regression. (L2-048)

## Implementation notes

- Folder `frontend/projects/components/src/lib/empty-state/`, files `empty-state.ts` (`EmptyState`,
  selector `bn-empty-state`) and `empty-icon.ts` (`EmptyIcon`, selector `span[bn-empty-icon]`,
  `EmptyIconName` type), style `empty-state.css` with the `.empty*` rules from `components.css`, plus a
  rule giving `.empty__icon.empty--error` the danger fill and icon colour (the mock sets them inline).
- The built `error-page` copies the `.empty__icon` CSS and inlines the clock and offline SVGs; it should
  render `span[bn-empty-icon]` instead (see [error page](error-page.md)). The auth card and the photo
  drop zone use `span[bn-empty-icon]` too.
- `bn-empty-state` renders the title with `@switch (headingLevel())` over `h1`/`h2`/`h3`, and
  `.empty__actions` only when actions are projected.
- Export both from `public-api.ts`; add `EmptyState.ts` to the perf-test scenarios and `index.ts`.

## Decisions

- **D-1** *Does the library own the icon tile on its own?* Yes, as `span[bn-empty-icon]`. The mocks use
  `.empty__icon` in error pages, auth pages and the photo drop zone; AGENTS.md says reusable pieces
  live in the library and are never copied, and the built error page already copies its CSS. Listed for
  the lead because the auth-card and file-upload CRDs consume it.
- **D-2** *Which heading level?* `h2` by default, as every in-page use; `h1` for project-new success,
  which replaces the form as the page's main content (L2-050 criterion 5: one `h1`). The design-system
  page's `h3` is a specimen inside a documentation page. The visual size is always `--text-h3`.
- **D-3** *How is a standalone danger tile drawn?* With `tone="danger"`, which adds `.empty--error` to
  the tile as the mock does, plus a component rule for the colours the mock writes inline.
- **D-4** *Is "permission" (design system: "This profile is private") a separate variant?* No; it is
  the neutral variant with its own copy. No mock uses it, and a forbidden route uses the error page.
- **D-5** *Is compact used?* No mock uses `.empty--compact`; it stays in the API from the design system
  for panels so the API does not change when a panel first needs it.
- **D-6** *Does the empty state announce itself?* Only with `live` (project-new success, which the mock
  marks `role="status"`); other empty and error states are page states the page announces through its
  busy region.
