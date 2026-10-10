# Profile header

| Field | Value |
|---|---|
| Selector | `header[bn-profile-header]` |
| Library path | `frontend/projects/components/src/lib/profile-header/` |
| Status | planned |
| Traces to | L2-007, L2-008, L2-011, L2-036, L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`profile-header.html`](../../design-system/components/profile-header.html) |
| Source mocks | [`pages/builder-profile/default`](../../mocks/pages/builder-profile/default.html), [`pages/builder-profile/own`](../../mocks/pages/builder-profile/own.html), [`pages/builder-profile/sparse`](../../mocks/pages/builder-profile/sparse.html), [`pages/builder-profile/loading`](../../mocks/pages/builder-profile/loading.html), [`dialogs/report/default`](../../mocks/dialogs/report/default.html), [`dialogs/block-builder/default`](../../mocks/dialogs/block-builder/default.html) |
| Rendering | [`profile-header.html`](profile-header.html) |

## Purpose and scope

The profile header opens a builder's profile: a 96 px square portrait (or initials on a soft tile
when there is no photo), the name as the page's heading, their role, where they are and how far
away, whether they are around, and the actions — "Say hello" and a "More" menu with "Report" and
"Block" when you are visiting, "Edit profile" and "Who can see this" when it is your own.

Use the [page-header](page-header.md) for other pages' headings, the [person](person.md) row for a
builder in a list, and the [avatar](avatar.md) for small portraits.

Out of scope:

- The breadcrumb above it, the About / Skills / "What Daniel is building" sections and the
  "Why you match" aside: page content.
- Which actions appear (own versus visiting, blocked, hidden fields): the page decides from the
  API response and projects them (L2-007, L2-011, L2-036).
- The "More" menu's behaviour: the [menu](menu.md) component; the `report` and `block-builder`
  [dialog](dialog.md)s it opens.
- The not-found and error states of the profile page (page-level [error-page](error-page.md) and
  [empty-state](empty-state.md)).

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/builder-profile/default`; also behind every `dialogs/report/*` and `dialogs/block-builder/*` state | portrait, visiting | Daniel Reyes, "Full-stack engineer", "Mississauga · 26.9 km away", online "Online now"; actions: primary "Say hello", quiet "More" disclosure with "Report Daniel", "Block Daniel" | default, menu open (dialogs opened from it) | canvas |
| `pages/builder-profile/own` | portrait, own | Amara Osei, "Founder · Product", "Leslieville" (no distance), online "Online"; actions: primary "Edit profile", quiet "Who can see this" | default | canvas |
| `pages/builder-profile/sparse` | initials, visiting | "EN" on sage tile labelled "Esther Nguyen, no photo"; "Product designer", "Riverdale · 1.4 km away", offline "Seen 4 h ago"; Say hello + More | default | canvas |
| `pages/builder-profile/loading` | `loading` | skeleton portrait, title, two lines, one pill-shaped action placeholder | loading | canvas |
| Privacy "City only" or online status hidden (L2-036, no mock) | `place` city only, `presence` null | "Mississauga · about 25 km away"; no status line | default | canvas |

Every row is buildable with the API below.

## Anatomy

1. **Header** — host `header.profile-head`. Grid, gap `--space-6`, block padding `--space-12`
   top, `--space-8` bottom.
2. **Who** — `div.profile-head__who`: portrait and the identity stack.
3. **Portrait** — `img.profile-head__photo` (96 × 96, `alt="Portrait of Daniel Reyes"`) or
   `span.profile-head__initials.tile--{tone}[role=img]` with an `aria-label`.
4. **Identity stack** — `div.stack` with `--space-2` gap: `h1.profile-head__name`, `p.muted`
   role, `p.card__place` with the pin icon, `span.status` (+ `.status--online`) with
   `span.status__dot`.
5. **Actions** — `div.profile-head__actions`, wrapping row of the projected actions.

Host: attribute component on the native `header`.

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `name` | `string` | — | yes | Public name; output-encoded; the heading. |
| `headingLevel` | `1 \| 2 \| 3` | `1` | no | 1 on the profile page; the design-system specimens use 3. |
| `role` | `string \| null` | `null` | no | Headline role, "Full-stack engineer". |
| `place` | `string \| null` | `null` | no | "Mississauga · 26.9 km away", "Leslieville", or a city-only string; null hides the line. |
| `photo` | `string \| null` | `null` | no | Portrait URL; null shows initials. |
| `photoAlt` | `string` | — | yes when `photo` is set | "Portrait of Daniel Reyes". |
| `initials` | `string` | `''` | yes when `photo` is null | "EN". |
| `initialsLabel` | `string` | — | yes when `photo` is null | "Esther Nguyen, no photo". |
| `tone` | `'sage' \| 'clay' \| 'fjord' \| 'oat'` | `'sage'` | no | Initials tile tone. |
| `presence` | `{ online: boolean; text: string } \| null` | `null` | no | `online` adds `.status--online` (green dot, breathing); `text` is "Online now", "Online" or "Seen 4 h ago". Null (hidden by privacy) renders nothing. |
| `loading` | `boolean` | `false` | no | Renders the skeleton header with `aria-busy="true"`. |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| None | — | Actions are projected. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `[slot=actions]` | `a[bn-button]`, `button[bn-button]`, `bn-menu` trigger | In order. Visiting: primary "Say hello" + the [menu](menu.md) "More" (quiet) with "Report {first name}" and danger "Block {first name}". Own: primary "Edit profile" + quiet "Who can see this". Declared once. |

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Portrait | `img.profile-head__photo` | Builder with a photo |
| Initials | `span.profile-head__initials.tile--{tone}` | Builder without a photo (L2-008) |
| Owner actions | projected set | The member's own profile (L2-007) |
| Loading | skeleton children | While the profile loads |

One size: portrait `--space-24` square. Width is the page's content width.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Portrait, name, lines, actions | `h1` names the page subject |
| Online | `presence.online` | Status text in `--color-success-fg`, filled `--color-online` dot that breathes (motion allowed) | Status text read; dot `aria-hidden` |
| Offline | `presence.online` false | Muted text, hollow dot with `--color-border-strong` ring | "Seen 4 h ago" read |
| Presence hidden | `presence` null | No status line | Nothing read |
| No photo | `photo` null | Initials tile | `role="img"` "Esther Nguyen, no photo" |
| Long name | data | Name wraps (`text-wrap: balance`); portrait keeps its size (`flex: none`) | — |
| Loading | `loading` | Skeleton 96 px square, title, lines, pill; same paddings | `aria-busy="true"` on the header; page `h1` is visually hidden "Loading builder profile" |
| Actions hover/focus/active | on projected controls | Per [button](button.md) | — |

## Markup

```html
<!-- rendered: visiting, portrait (pages/builder-profile/default) -->
<header class="profile-head">
  <div class="profile-head__who">
    <img class="profile-head__photo" src="/media/daniel-reyes.jpg" width="96" height="96" alt="Portrait of Daniel Reyes">
    <div class="stack">
      <h1 class="profile-head__name">Daniel Reyes</h1>
      <p class="muted">Full-stack engineer</p>
      <p class="card__place"><svg class="icon icon--sm" aria-hidden="true">…pin…</svg>Mississauga · 26.9 km away</p>
      <span class="status status--online"><span class="status__dot" aria-hidden="true"></span>Online now</span>
    </div>
  </div>
  <div class="profile-head__actions">
    <a class="btn btn--primary" href="/builders/daniel-reyes/hello">Say hello</a>
    <!-- bn-menu trigger and menu: see menu.md -->
  </div>
</header>
```

```html
<!-- rendered: initials -->
<span class="profile-head__initials tile--sage" role="img" aria-label="Esther Nguyen, no photo">EN</span>

<!-- rendered: loading -->
<header class="profile-head" aria-busy="true"><div class="profile-head__who"><span class="skeleton" style="width:6rem;height:6rem;border-radius:var(--radius-lg)"></span><div style="flex:1"><span class="skeleton skeleton--title"></span><span class="skeleton skeleton--text" style="width:40%"></span><span class="skeleton skeleton--text is-short"></span></div></div><div class="profile-head__actions"><span class="skeleton skeleton--pill" style="width:7rem;height:var(--control-height-lg)"></span></div></header>
```

The mock's inline `style` values (stack gap, skeleton sizes, `margin:0` on the place line) move
into component CSS; the stack's `--space-2` gap is part of the contract, the inline styles are not.

```html
<!-- consumer -->
<header bn-profile-header [name]="b.name" [role]="b.role" [place]="b | bnPlace" [photo]="b.photoUrl"
        [photoAlt]="'profile.portraitOf' | t: { name: b.name }" [initials]="b.initials"
        [initialsLabel]="'profile.noPhoto' | t: { name: b.name }" [presence]="b | bnPresence">
  @if (isOwn()) {
    <a bn-button variant="primary" slot="actions" routerLink="/profile/edit">{{ 'profile.edit' | t }}</a>
  }
  @if (isOwn()) {
    <a bn-button variant="quiet" slot="actions" routerLink="/settings/privacy">{{ 'profile.whoCanSee' | t }}</a>
  }
  @if (!isOwn()) {
    <a bn-button variant="primary" slot="actions" (click)="sayHello()">{{ 'profile.hello' | t }}</a>
  }
  @if (!isOwn()) {
    <bn-menu slot="actions" [label]="'profile.more' | t: { name: b.name }">…</bn-menu>
  }
</header>
```

One `@if` per projected node keeps each slot projection (NG8011).

## Design

- Header grid gap `--space-6`; padding-block `--space-12` / `--space-8`.
- Who row: flex, centred, gap `--space-5`.
- Portrait `--space-24` square, `--radius-lg`, `object-fit: cover`, placeholder fill
  `--color-bg-subtle`. Initials: same box, `--font-family-display` `--font-size-3xl`
  `--font-weight-light`, `--color-tile-fg`, `flex: none`.
- Name `--text-h1`, `--letter-spacing-tight`. Role `--color-fg-muted`. Place `--text-body-sm`,
  `--color-fg-muted`, pin icon `--space-4`, gap `--space-2`.
- Status `--text-caption`, gap `--space-2`; dot `--space-2` round, hairline ring.
- Actions: wrap, gap `--space-3`.
- Motion: dot breathing over `--duration-breath` with `--ease-breath` only under
  `prefers-reduced-motion: no-preference`.

Component tokens: none.

| Token | Aliases | Overridden by |
|---|---|---|
| — | — | — |

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Name | `--color-fg-default` | `--palette-ink-900` | `--palette-night-50` |
| Role, place | `--color-fg-muted` | `--palette-stone-700` | `--palette-night-200` |
| Offline status | `--color-fg-subtle` | `--palette-stone-600` | `--palette-night-300` |
| Online status text | `--color-success-fg` | `--palette-sage-700` | `--palette-sage-200` |
| Online dot | `--color-online` | `--palette-sage-500` | `--palette-sage-300` |
| Offline dot ring | `--color-border-strong` | `--palette-stone-500` | `--palette-night-500` |
| Initials tile, letters | `--color-tile-sage`, `--color-tile-fg` | sage 100, ink 900 | sage 900, night 50 |
| Portrait placeholder | `--color-bg-subtle` | `--palette-oat-200` | `--palette-night-800` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-canvas` | 4.5:1 | Name |
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Role, place |
| `--color-success-fg` | `--color-bg-canvas` | 4.5:1 | "Online now" |
| `--color-fg-subtle` | `--color-bg-canvas` | 4.5:1 | "Seen 4 h ago" |
| `--color-tile-fg` | `--color-tile-sage` | 4.5:1 | Initials (exposed through the image name, still legible) |
| `--color-online` | `--color-bg-canvas` | 3:1 | Online dot |

## Responsive behaviour

- At every width the portrait sits left of the identity stack; the actions row wraps under it.
- At 320 px a long name wraps beside the 96 px portrait, the portrait keeps its square, and the
  actions wrap onto two lines when needed; no horizontal scroll.
- Action buttons are `--control-height-md` or taller and at least 44 × 44 CSS px on touch.

## Accessibility

### Role and pattern

Native `header` inside `main` (not a banner landmark, since it is not the page header). The name
is the page's only `h1`. The "More" control follows the [menu](menu.md) button pattern built on
CDK Overlay; its trigger is named "More actions for Daniel Reyes".

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | "Say hello", then "More" (or "Edit profile", then "Who can see this") |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Activates; on "More" opens the menu |
| <kbd>Escape</kbd> | Closes the open menu, focus back on "More" (menu CRD) |

### Focus

Shared 2 px ring on the actions. Opening a dialog from the menu returns focus to "More" when
the dialog closes.

### Labelling

Portrait `alt` "Portrait of Daniel Reyes"; initials `role="img"` named "Esther Nguyen, no
photo". Online status is text with a decorative dot. Menu items name the person: "Report
Daniel", "Block Daniel".

### Announcements

None. The loading header carries `aria-busy`; the page's live region announces the load.

### Motion

The online dot breathes only under `prefers-reduced-motion: no-preference`; reduced motion shows
a still dot.

## Content and internationalisation

- Name, role and place come from the profile (output-encoded). Distances follow L2-052: "5.8 km",
  "27 km" (D-3). City-only precision shows the city and the distance rounded to 5 km, "about
  25 km away", never the neighbourhood (L2-036).
- "Portrait of {name}", "{name}, no photo", "Online now", "Seen {time} ago", "Say hello",
  "More", "Report {first name}", "Block {first name}", "Edit profile", "Who can see this" come
  from the catalogue.
- Names may be long ("Abigail Turner", up to the profile's limit) and wrap.

## Performance

- Change detection: `OnPush`, signal inputs.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/ProfileHeader.ts` renders Daniel
  Reyes visiting, with photo, "Mississauga · 27 km away", "Online now", "Say hello" and "More".
- Composite scenarios: `ProfileHeaderVariants.ts` renders Daniel, Amara (own) and Esther
  (initials) together; `ProfileHeaderDark.ts` renders them in `data-theme="dark"`. Iterations
  tuned in `e2e/perf-test/config/scenario-iterations.mjs` to 100–300 ms. The header does not repeat
  in lists, so no list scenario is needed.
- Regression rule: changes run the perf test against the base branch with `--fail-on-regression`
  before they are pushed.
- Layout stability: the portrait declares 96 × 96 and the loading skeleton has the same box,
  paddings and action-row height, so the loaded header replaces it without shift.

## Acceptance criteria

### Rendering

- **AC-1** Given Amara opens Daniel Reyes's profile, when the header renders, then it shows his 96 × 96 portrait named "Portrait of Daniel Reyes", the `h1` "Daniel Reyes", "Full-stack engineer", "Mississauga · 27 km away" and "Online now". (L2-011)
- **AC-2** Given Amara views Daniel's profile, when the actions render, then "Say hello" and "More" are present and "More" opens "Report Daniel" and "Block Daniel". (L2-011)
- **AC-3** Given Amara opens her own profile, when the header renders, then the actions are "Edit profile" and "Who can see this", and no "Say hello", "Report" or "Block" control exists. (L2-007)
- **AC-4** Given Esther Nguyen has no photo, when her header renders, then an "EN" tile on the sage tone with `role="img"` named "Esther Nguyen, no photo" replaces the portrait. (L2-008)
- **AC-5** Given a member's name is `<img src=x>`, when the header renders, then those characters show in the heading and no image element is created from them. (L2-007)

### States

- **AC-6** Given Daniel has hidden his online status, when Amara views his header, then no status line is rendered. (L2-036)
- **AC-7** Given Daniel set his neighbourhood precision to "City only", when Amara views his header, then the place line shows "Mississauga · about 25 km away" with no neighbourhood. (L2-036)
- **AC-8** Given the profile is loading, when the header renders, then it shows a 96 px skeleton portrait, a title bar, two lines and an action placeholder with `aria-busy="true"`, and the loaded header occupies the same height so nothing below moves. (L2-007)
- **AC-9** Given Esther last seen 4 hours ago, when her header renders, then the status reads "Seen 4 h ago" with a hollow dot and no success colour. (L2-011)

### Keyboard and focus

- **AC-10** Given Daniel's header, when Amara presses Tab, then focus moves to "Say hello" and then "More", each with a 2 px ring of at least 3:1 contrast; Escape closes the open menu and returns focus to "More". (L2-050)

### Screen readers

- **AC-11** Given Daniel is online, when a screen reader reads the header, then it hears "Online now" as text; the dot itself is hidden from assistive technology. (L2-050)

### Theming

- **AC-12** Given the dark theme, when the header renders, then name, role, place, status, dot and initials tile take their colours from tokens only. (L2-051)
- **AC-13** Given either theme, when measured, then name, role, place and status text reach 4.5:1 on the canvas. (L2-050)

### Content

- **AC-14** Given Daniel is 26.9 km from Leslieville and Esther 1.4 km, when their headers render, then the distances read "27 km away" and "1.4 km away". (L2-052)

### Responsive

- **AC-15** Given 320 px, when the header for "Abigail Turner" renders, then the name wraps beside the unchanged 96 px portrait, the actions wrap with targets of at least 44 × 44 CSS px, and nothing scrolls horizontally. (L2-049)

### Motion

- **AC-16** Given `prefers-reduced-motion: reduce`, when Daniel is online, then the status dot does not animate. (L2-050)

### Performance

- **AC-17** Given a change to the header, when the perf test runs `ProfileHeader`, `ProfileHeaderVariants` and `ProfileHeaderDark` against the base branch with `--fail-on-regression`, then no scenario is flagged as a possible regression. (L2-048)

## Implementation notes

- Folder `frontend/projects/components/src/lib/profile-header/`: `profile-header.ts` (class
  `ProfileHeader`), `profile-header.css` with `.profile-head*`, `.card__place`, `.status*`,
  `.tile--*`, the skeleton classes it uses, and the breathe keyframes.
- Selector `header[bn-profile-header]`; host class `profile-head`; `[attr.aria-busy]` when
  `loading`.
- The "More" control is the [menu](menu.md) component projected by the page; the mock's native
  `details.more` is replaced by the CDK-based menu (AGENTS.md: CDK for overlays), keeping the
  `.more`, `.menu`, `.menu__item` and `.menu__item--danger` classes as the menu CRD defines.
- Type `Presence` exported from `public-api.ts`.
- Perf scenarios as listed under *Performance*.

## Decisions

- **D-1** *Actions inside the component or projected?* Projected: which actions show depends on
  ownership, blocks and privacy that only the page knows; the header owns their layout.
- **D-2** *The loading mock uses a `div.profile-head`, not a `header`.* The component keeps one
  host element (`header`) and sets `aria-busy`; the BEM classes, which the locators use, are the
  same.
- **D-3** *The mocks write "26.9 km away"; L2-052 says no decimal above 10 km.* "27 km away".
  Raised with the lead (the same drift appears across the mocks).
- **D-4** *City-only privacy (L2-036) has no mock.* The place line takes the city and the
  rounded distance as one string, "Mississauga · about 25 km away"; the API supplies the rounded
  value and the catalogue the wording.
- **D-5** *The design-system page renders the name as `h3`.* The profile page needs its single
  `h1`; `headingLevel` defaults to 1, and the design-system specimen's 3 is a page-embedding
  artifact.
