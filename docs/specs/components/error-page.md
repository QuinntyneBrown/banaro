# Error page

| Field | Value |
|---|---|
| Selector | `bn-error-page` |
| Library path | `frontend/projects/components/src/lib/error-page/` |
| Status | built |
| Traces to | L2-011, L2-013, L2-019, L2-042, L2-043, L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`error-page.html`](../../design-system/components/error-page.html) |
| Source mocks | [`pages/not-found/default`](../../mocks/pages/not-found/default.html), [`pages/forbidden/default`](../../mocks/pages/forbidden/default.html), [`pages/server-error/default`](../../mocks/pages/server-error/default.html), [`pages/offline/default`](../../mocks/pages/offline/default.html), [`pages/maintenance/default`](../../mocks/pages/maintenance/default.html), [`pages/builder-profile/not-found`](../../mocks/pages/builder-profile/not-found.html), [`pages/event-detail/not-found`](../../mocks/pages/event-detail/not-found.html), [`pages/project-detail/not-found`](../../mocks/pages/project-detail/not-found.html) |
| Rendering | [`error-page.html`](error-page.html) |

## Purpose and scope

The error page is the body of every screen that replaces a route which cannot be shown: a page that
does not exist ("We can't find that page"), one Amara may not open ("This one isn't yours to open"), a
server failure ("Something went wrong on our side", with a reference ID), no connection ("You're
offline") and maintenance ("Down for a short maintenance"). It keeps the normal shell around it and
always offers a way forward. Detail pages reuse it for their own not-found state ("We can't find that
builder").

Use the [empty state](empty-state.md) when one collection or section on an otherwise working page is
empty or failed, and an [alert](alert.md) for a failure inside a form or dialog.

Out of scope:

- Routing to the page, the HTTP status, the document title, `noindex` and the response headers; the
  page components (`NotFoundPage`, `ForbiddenPage`, `ServerErrorPage`, `OfflinePage`,
  `MaintenancePage`) and `ErrorPageBase` own them (detailed designs `resilience/show-error-pages`,
  `resilience/handle-offline-and-maintenance`).
- The search box on the not-found page (`bn-search-box`) and the buttons (`bn-button`); they are
  projected.
- Choosing the member or visitor wording ("Go to your dashboard" / "Go to the home page").

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/not-found/default` (`/404`) | `code="404"` | h1 "We can't find that page"; lead "The link may be old, or the page may have moved. Search for a builder, or go back to where you were."; extra slot: search form "Search builders" / "Name, skill or project" / "Search"; actions "Browse builders", "Go to your dashboard" (both quiet) | default | canvas, normal shell |
| `pages/forbidden/default` (`/403`) | `code="403"` | "This one isn't yours to open"; "You don't have access to this page. If you think that's a mistake, let us know and we will take a look."; actions "Go to your dashboard" (primary link), "Go back" (quiet button), "Contact us" (text link) | default | canvas |
| `pages/server-error/default` (`/500`) | `code="500"`, `referenceId`, `referenceLabel="Reference ID"` | "Something went wrong on our side"; "It isn't you. We've been told and are looking into it…"; "Reference ID: 7c1e4a52-9b3d-4f08-a6e2-5d90b1c3e847"; actions "Try again" (primary button), "Go to your dashboard" (quiet link) | with reference; without reference (browser error) | canvas |
| `pages/offline/default` (`/offline`) | `icon="offline"` | "You're offline"; "Banaro can't reach the internet right now…"; action "Try again" (primary button) | default | canvas |
| `pages/maintenance/default` (`/maintenance`) | `icon="clock"` | "Down for a short maintenance"; "We're tending to Banaro and expect to be back by 10:30 am Eastern…"; actions "Check again" (primary button), "Contact us" (quiet `mailto:` link) | default | canvas |
| `pages/builder-profile/not-found` | `code="404"` | "We can't find that builder"; "The profile may have been removed, or the link is mistyped…"; "Browse builders" (primary), "Go to your dashboard" (quiet) | default | canvas |
| `pages/event-detail/not-found` | `code="404"` | "We couldn't find that event"; "See upcoming events" (primary), "Go to your dashboard" (quiet) | default | canvas |
| `pages/project-detail/not-found` | `code="404"` | "We couldn't find that project"; "Browse projects" (primary), "Share a project" (quiet) | default | canvas |
| Design-system page | 404, 403, 500, OFFLINE, MAINTENANCE specimens | "Page not found", "You don't have access", "We couldn't load this page" | — | canvas |

Every row is buildable with the API below.

## Anatomy

1. **Container** — `div.error-page`. A start-aligned grid with `--space-6` between parts and
   `--space-24` block padding.
2. **Status code (optional)** — `p.error-page__code`, `aria-hidden="true"`: "404", "403", "500" in the
   large light display face.
3. **Icon tile (optional, instead of the code)** — `span.empty__icon`, rendered by
   `span[bn-empty-icon]` from the [empty state](empty-state.md): offline or clock.
4. **Title** — `h1.error-page__title`, the page's only `h1`, `tabindex="-1"` so route focus can land
   on it.
5. **Lead** — `p.lead`, the explanation.
6. **Reference (optional)** — `p.muted.error-page__reference`: the label, a colon and the ID in
   `<code>`, selectable as one unit.
7. **Extra content (optional)** — the default slot, between the explanation and the actions (the
   not-found search form).
8. **Actions** — `div.cluster` holding the projected `[slot=actions]` buttons and links.

Host: `bn-error-page` is `display: block` inside the page's `<main>` and `.wrap`.

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `heading` | `string` | — | yes | Text of the `h1`. |
| `lead` | `string` | — | yes | Text of `p.lead`. |
| `code` | `string` | — | no | Status shown in `.error-page__code` ("404"). Mutually exclusive with `icon`; `code` wins if both are set. |
| `icon` | `'offline' \| 'clock'` | — | no | Renders `span[bn-empty-icon]` with that icon. |
| `referenceId` | `string \| null` | `null` | no | When set, renders the reference line. `null` or empty renders nothing (browser errors). |
| `referenceLabel` | `string` | — | when `referenceId` is set | "Reference ID" from the catalogue; the component adds the colon. |

### Outputs

None. Actions are projected.

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| default | Extra content, such as `bn-search-box` | Rendered after the lead and reference, before the actions. |
| `[slot=actions]` | One to three `a[bn-button]` / `button[bn-button]` | Rendered inside `div.cluster` in order: primary first, then quiet, then text. |

## Variants and sizes

| Variant | Inputs | Use for |
|---|---|---|
| Status code | `code` | 404, 403, 500 and detail-page not-found states |
| Icon | `icon` | Offline (`offline`) and maintenance (`clock`), where a number would mean nothing |
| With reference | `code="500"` + `referenceId` | A server error that came from an API response |

One size; the code's display size is fluid (`--font-size-5xl` is a clamp), the rest follows the type
scale.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | rendered | Code or tile, title, lead, actions | `h1` is the page heading; code hidden |
| With reference | `referenceId` set | Muted line "Reference ID: …" with the ID in code style | Read as text; the whole ID selects with one click (`user-select: all`) |
| Without reference | `referenceId` null | No reference element | — |
| Heading focused | the shell moves route focus to the `h1` | No ring on the heading (programmatic focus, `tabindex="-1"`) | Screen reader reads the heading |

The block itself has no interactive states; actions follow the [button](button.md) contract.

## Markup

```html
<!-- rendered: server error with reference (pages/server-error/default) -->
<bn-error-page>
  <div class="error-page">
    <p aria-hidden="true" class="error-page__code">500</p>
    <h1 class="error-page__title" tabindex="-1">Something went wrong on our side</h1>
    <p class="lead">It isn't you. We've been told and are looking into it. Try again in a moment; your profile and messages are safe.</p>
    <p class="muted error-page__reference">Reference ID: <code>7c1e4a52-9b3d-4f08-a6e2-5d90b1c3e847</code></p>
    <div class="cluster">
      <button class="btn btn--primary" type="button">Try again</button>
      <a class="btn btn--quiet" href="/dashboard">Go to your dashboard</a>
    </div>
  </div>
</bn-error-page>
```

```html
<!-- rendered: offline (pages/offline/default) -->
<div class="error-page">
  <span aria-hidden="true" class="empty__icon"><svg aria-hidden="true" class="icon" viewBox="0 0 24 24"><path d="M3.5 3.5 20.5 20.5"></path><path d="M8.5 15.5a5 5 0 0 1 4-1.4M5 12a9 9 0 0 1 3.5-2M19 12a9 9 0 0 0-6-3"></path><path d="M12 19h.01"></path></svg></span>
  <h1 class="error-page__title" tabindex="-1">You're offline</h1>
  <p class="lead">Banaro can't reach the internet right now. Check your connection; we will reconnect on our own and keep what you were writing. Nothing is sent until you send it.</p>
  <div class="cluster"><button class="btn btn--primary" type="button">Try again</button></div>
</div>
```

```html
<!-- rendered: not found with search (pages/not-found/default) -->
<div class="error-page">
  <p aria-hidden="true" class="error-page__code">404</p>
  <h1 class="error-page__title" tabindex="-1">We can't find that page</h1>
  <p class="lead">The link may be old, or the page may have moved. Search for a builder, or go back to where you were.</p>
  <form action="/builders" class="search" role="search">…bn-search-box…</form>
  <div class="cluster"><a class="btn btn--quiet" href="/builders">Browse builders</a><a class="btn btn--quiet" href="/dashboard">Go to your dashboard</a></div>
</div>
```

```html
<!-- consumer -->
<bn-error-page code="500" [heading]="'errors.server.title' | translate" [lead]="'errors.server.lead' | translate"
               [referenceId]="referenceId()" [referenceLabel]="'errors.server.reference' | translate">
  <button slot="actions" bn-button variant="primary" type="button" (click)="retry()">{{ 'common.tryAgain' | translate }}</button>
  <a slot="actions" bn-button variant="quiet" [routerLink]="homeLink()">{{ homeLabel() | translate }}</a>
</bn-error-page>

<bn-error-page icon="clock" [heading]="'maintenance.title' | translate"
               [lead]="'maintenance.lead' | translate: { time: expectedBackAt() | bnTime }">
  <button slot="actions" bn-button variant="primary" type="button" (click)="checkAgain()">{{ 'maintenance.checkAgain' | translate }}</button>
  <a slot="actions" bn-button variant="quiet" [href]="'mailto:' + supportEmail">{{ 'common.contactUs' | translate }}</a>
</bn-error-page>
```

The mock's server-error reference paragraph is `p.muted`; the component adds `.error-page__reference`
for the `user-select: all` rule. Page objects locate by `.error-page`, `.error-page__code`,
`.error-page__title`, `.error-page__reference` and the actions inside `.cluster`.

## Design

- Container: `display: grid; justify-items: start; gap: var(--space-6); padding-block: var(--space-24)`.
- Code: `font: var(--font-weight-light) var(--font-size-5xl) / 1 var(--font-family-display)`, colour
  `--color-fg-subtle`, `font-variant-numeric: tabular-nums`.
- Title: `--text-h1`, `letter-spacing: var(--letter-spacing-tight)`.
- Lead: `.lead` (`--text-body-lg`, `--color-fg-muted`, max width `--layout-measure`).
- Reference: `.muted`; the `<code>` uses the code face and `user-select: all`.
- Icon tile: the [empty state](empty-state.md) tile (56 px, `--color-accent-subtle`).
- Actions: `.cluster` (wrapping flex, gap `--space-3`).
- Motion: none.

Component tokens: none.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Code | `--color-fg-subtle` | `--palette-stone-600` | `--palette-night-300` |
| Title | `--color-fg-default` | `--palette-ink-900` | `--palette-night-50` |
| Lead and reference | `--color-fg-muted` | `--palette-stone-700` | `--palette-night-200` |
| Tile fill / icon | `--color-accent-subtle` / `--color-fg-accent` | `--palette-sage-50` / `--palette-sage-700` | `--palette-sage-950` / `--palette-sage-300` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-canvas` | 4.5:1 | Title |
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Lead and reference ID |
| `--color-fg-subtle` | `--color-bg-canvas` | 3:1 (large text; hidden from assistive technology) | Status code |
| `--color-fg-accent` | `--color-accent-subtle` | 3:1 | Tile icon |

## Responsive behaviour

- Start-aligned in the page container at every width; the code scales with `--font-size-5xl`'s clamp
  (44 px at 320 px to 84 px on wide screens).
- The title and lead wrap; the lead stops at `--layout-measure`.
- Actions wrap onto more lines; the search form fills the column width up to its own maximum.
- At 320 px nothing overflows; the 36-character reference ID wraps inside its line if it must
  (`overflow-wrap: anywhere` on the code) (L2-049).

## Accessibility

### Role and pattern

Native content inside the page's `<main>`: one `h1`, paragraphs, a search landmark (not-found) and
buttons and links. The status code is `aria-hidden="true"` because the heading says the same thing in
words; the icon tile is decorative.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | From the shell, reaches the search field and "Search" (not-found), then each action in order. The heading is not in the tab order (`tabindex="-1"`). |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Native activation; Enter in the search field submits to `/builders?q=`. |

### Focus

After a route change to an error page, the shell moves focus to the `h1` (design system: "Route
navigation sends focus to the page heading"); the component makes it focusable with `tabindex="-1"`
and never moves focus itself. Programmatic focus on the heading shows no ring; Tab continues from it.

### Labelling

- The `h1` names the page; the document title is set by the page ("Page not found", "No access",
  "Something went wrong").
- The reference reads "Reference ID: 7c1e4a52-…" with its visible label (L2-042).

### Announcements

None; the page itself is the message.

### Motion

None.

## Content and internationalisation

- Title says what happened in the person's words, not the status name: "We can't find that page", "This
  one isn't yours to open".
- Lead reassures and points forward: "It isn't you…", "Nothing is lost.", "Nothing is sent until you
  send it."
- Never show a stack trace, exception class or internal path; only the request ID (L2-042).
- Maintenance time in America/Toronto, 12-hour clock: "10:30 am Eastern" (L2-052).
- Translatable: `heading`, `lead`, `referenceLabel`, action labels. Data: `referenceId`, the time.

## Performance

- Change detection: `OnPush`; signal inputs.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/ErrorPage.ts` renders the server-error
  page body with the reference ID 7c1e4a52-9b3d-4f08-a6e2-5d90b1c3e847, "Try again" and "Go to the home
  page" (already present; 300 iterations in `e2e/perf-test/config/scenario-iterations.mjs`).
- Composite scenarios: none.
- Layout stability: rendered on the server for direct requests; nothing loads after first paint.
- Weight: imports `EmptyIcon` only; it must stay out of any heavy dependency because the static 500
  document must render even when the app fails.

## Acceptance criteria

### Rendering

- **AC-1** Given a URL that matches no route, when the not-found page renders, then it shows `p.error-page__code` "404" with `aria-hidden="true"`, `h1` "We can't find that page", the lead, the projected search form labelled "Search builders" with placeholder "Name, skill or project", and "Browse builders" and "Go to your dashboard" in `.cluster`. (L2-042)
- **AC-2** Given a visitor on the not-found page, when it renders, then the home action reads "Go to the home page" and the component layout is otherwise identical. (L2-042)
- **AC-3** Given Amara opens a page she may not access, when the forbidden page renders, then it shows "403", `h1` "This one isn't yours to open" and, in order, "Go to your dashboard" (primary), "Go back" (quiet button) and "Contact us" (text link). (L2-042)
- **AC-4** Given an API call for essential data returns 500 with request ID 7c1e4a52-9b3d-4f08-a6e2-5d90b1c3e847, when the server-error page renders, then below the lead a `p.error-page__reference` reads "Reference ID: 7c1e4a52-9b3d-4f08-a6e2-5d90b1c3e847", the ID is inside `<code>` and selects as one unit, and "Try again" is the first action. (L2-042)
- **AC-5** Given an unhandled browser error, when the server-error page renders with `referenceId` null, then no reference element is rendered and no stack trace, exception name or internal detail appears anywhere in the component. (L2-042)
- **AC-6** Given the browser is offline and the route cannot load, when the offline page renders, then it shows the offline icon tile instead of a code, `h1` "You're offline" and "Try again". (L2-043)
- **AC-7** Given maintenance mode with an expected return at 10:30 Toronto time, when the maintenance page renders, then it shows the clock icon tile, `h1` "Down for a short maintenance", a lead containing "10:30 am Eastern", "Check again", and "Contact us" as a `mailto:` link. (L2-043)
- **AC-8** Given a builder id that does not exist, when the builder profile's not-found state renders, then it uses the component with "404", "We can't find that builder", "Browse builders" and "Go to your dashboard". (L2-011)
- **AC-9** Given an event id that does not exist, when the event's not-found state renders, then it shows "We couldn't find that event" with "See upcoming events". (L2-019)
- **AC-10** Given a deleted project, when its not-found state renders, then it shows "We couldn't find that project" with "Browse projects" and "Share a project". (L2-013)

### Keyboard and focus

- **AC-11** Given any error page, when it renders, then it contains exactly one `h1` (the title) with `tabindex="-1"`, and no other element of the component is a heading. (L2-042)
- **AC-12** Given the shell has moved focus to the error page's `h1`, when Amara presses Tab on the not-found page, then focus reaches the search field, "Search", "Browse builders" and "Go to your dashboard" in that order, each with a visible 2 px focus ring. (L2-050)

### Screen readers

- **AC-13** Given the server-error page, when a screen reader reads it, then it reads the heading, the lead and "Reference ID: …" and does not read "500". (L2-050)

### Theming

- **AC-14** Given each error page in light and dark, when contrast is measured, then the title and lead reach 4.5:1 on the canvas and the status code at least 3:1. (L2-050)
- **AC-15** Given the theme switches, when the page re-renders, then its colours change through tokens alone. (L2-051)

### Responsive

- **AC-16** Given a 320 px viewport, when the server-error page renders, then the code, title, lead, reference ID and actions fit the column, the ID wraps if needed, and the page has no horizontal scroll. (L2-049)

### Content

- **AC-17** Given the `en-CA` catalogue, when any error page renders, then its heading, lead, reference label and action labels come from the catalogue, and the maintenance time is formatted for America/Toronto ("10:30 am"). (L2-052)

### Performance

- **AC-18** Given a change to the error page, when the perf test runs `ErrorPage` against the base branch with `--fail-on-regression`, then it is not flagged as a possible regression. (L2-048)

## Implementation notes

Gaps between the built code and this CRD:

- Actions are projected through the default slot and the consumer writes its own `div.cluster`; add a
  `[slot=actions]` slot rendered inside a component-owned `div.cluster`, and keep the default slot for
  extra content such as the search form (rendered before the actions).
- The icon tile duplicates the `.empty__icon` CSS and inlines the SVGs; render `span[bn-empty-icon]`
  from the [empty state](empty-state.md) library folder and delete the copied rule.
- `referenceLabel` defaults to the English "Reference ID"; make it required when `referenceId` is set
  and pass it from the catalogue (AC-17).
- The `h1` lacks `tabindex="-1"` (AC-11).
- The reference `<code>` needs `overflow-wrap: anywhere` so the 36-character ID wraps at 320 px
  (AC-16).
- `ErrorPage.ts` scenario exists; after the slot change, move its actions to `slot="actions"`.

## Decisions

- **D-1** *Code or icon for offline and maintenance?* The icon tile, as the mocks draw; the
  design-system specimens' "OFFLINE" and "MAINTENANCE" codes are placeholders and would be long words in
  a display face at 320 px.
- **D-2** *Does the component wrap the actions?* Yes, in `div.cluster`, so every error page has the same
  action row; the search form stays in the default slot because only not-found has it.
- **D-3** *Heading element?* Always `h1` (L2-042 criterion 5: one `h1`); the design-system specimens use
  `h3` only because they sit inside a documentation page.
- **D-4** *Who focuses the heading?* The shell, on route change; the component only makes the heading
  focusable. Moving focus from inside the component would fire on server render and on re-render.
- **D-5** *Is the status code read aloud?* No (`aria-hidden="true"`, as the mocks mark it); "404" adds
  nothing to "We can't find that page" for a listener.
- **D-6** *How does a long reference ID behave at 320 px?* It wraps anywhere inside its `<code>`; it is
  copied with `user-select: all`, so the wrap never splits what is copied.
