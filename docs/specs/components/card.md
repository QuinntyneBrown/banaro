# Card

| Field | Value |
|---|---|
| Selector | `article[bn-card]` |
| Library path | `frontend/projects/components/src/lib/card/` |
| Status | planned |
| Traces to | L2-007, L2-009, L2-010, L2-048, L2-049, L2-050, L2-051 |
| Design system | [`card.html`](../../design-system/components/card.html) |
| Source mocks | [`pages/directory/default`](../../mocks/pages/directory/default.html), [`pages/directory/edge`](../../mocks/pages/directory/edge.html), [`pages/directory/filtered`](../../mocks/pages/directory/filtered.html), [`dialogs/say-hello/default`](../../mocks/dialogs/say-hello/default.html), [`notifications/toast/success`](../../mocks/notifications/toast/success.html) |
| Rendering | [`card.html`](card.html) |

## Purpose and scope

The card shows one builder in the directory with enough to judge whether to
collaborate nearby: portrait or initials, name, role, match score,
neighbourhood and distance, up to a handful of skills, what they are building,
what they are open to, whether they are around, and a way to say hello. In the
design system the `.card` block *is* the builder card; whole-card styling never
replaces the real name link.

Use a sibling instead when the content is not a directory result:
[project-card](project-card.md) (`.project`) for a project,
[person](person.md) (`.person`) for a featured builder on the home page,
[event-row](event-row.md) (`.event`) for an event, and
[profile-header](profile-header.md) for the top of a profile. Those blocks share
the card's surface treatment (surface fill, hairline border, large radius) but
are separate blocks with their own classes; they do not render `.card`.

Out of scope:

- The result grid, the two-column layout at 768 px and the 74 rem cap (the
  directory page and [container-grid-stack](container-grid-stack.md)).
- Sorting, filtering, paging and the result count (the directory page, L2-009, L2-010).
- The loading placeholders: `.skeleton-card` belongs to [skeleton](skeleton.md).
- The other card-shaped surfaces in the mocks — `.aside-card` (profile and
  project side panels), `.form-card` (project edit) and `.auth__card`
  ([auth-card](auth-card.md)) — are separate blocks owned by their pages,
  [rsvp-panel](rsvp-panel.md) and [container-grid-stack](container-grid-stack.md).
- Opening the `say-hello` dialog and what it sends (the page and L2-026); the
  card only hosts the action.
- Formatting the distance, the match number and "Seen 4 h ago" (the page, using
  the `api` library's formatters, L2-052).
- The presence indicator's own rules ([badge](badge.md), `bn-status`), the pill
  ([chip](chip.md)) and the button ([button](button.md)).

## Usage

The `.card` block occurs only in the directory results. The `say-hello` dialog
and the `toast` notifications show the directory page behind them, so they
render the same cards (inert) and need nothing extra.

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/directory/default` (12 results) | member, photo, match, skills, facts | Daniel Reyes "Full-stack engineer", "94% match", "Mississauga · 26.9 km away", Laravel/Angular/PostgreSQL, Building "Psalter", Open to "Co-founding"; status "Online now"; action "Say hello" | default, hover, focus-within | canvas, two-column grid |
| `pages/directory/default` builders 12–23 | member, initials tile | Esther Nguyen "EN" on `tile--sage`, "Riverdale · 1.4 km away", Building "No project listed" (`.is-empty`), status "Seen 4 h ago" | default | canvas |
| `pages/directory/edge` | member, initials, very long name, long role, long skill, long project | "Maximilian Alexander Wolfeschlegelsteinhausen-Reyes", "Principal full-stack engineer and technical co-founder, healthcare and public-sector platforms", "Domain-driven design and event sourcing", "Harvest Hands Volunteer Scheduling Platform for GTA Food Banks" | wrapping | canvas |
| `pages/directory/filtered` (6 results) | member, photo, Ruth Alvarez, Elijah Brooks | "Scarborough · 13.5 km away", status "Seen yesterday" | default | canvas |
| `dialogs/say-hello/*`, `notifications/toast/*` | as directory default | the page behind an open dialog or toast | inert | canvas under backdrop |
| L2-009 AC6 (signed-out directory; no mock) | visitor | name, role, neighbourhood, skills, photo only | default | canvas |
| L2-010 AC7 (edge, no skills) | member, no skills | skills row omitted | default | canvas |
| Design system *Selected* specimen | member, selected | as default | selected | canvas |

The tile colour of the initials cycles through `tile--sage`, `tile--clay`,
`tile--fjord` and `tile--oat` in the mocks; the page chooses it from the builder's
id so a builder keeps the same colour everywhere.

## Anatomy

1. **Container** — `article.card`, the Angular host (`article[bn-card]`). Grid with
   `--space-5` gap, `--space-6` padding, `--radius-lg`, hairline
   `--color-border-default`, `--color-bg-surface`. Labelled by the name heading
   (`aria-labelledby`). `id="b-{slug}"` so a fragment link can return to it.
2. **Top** — `.card__top`, a three-column grid: media, name block, match.
3. **Photo** — `img.card__photo`, 64 × 64, `alt=""`, `width="64" height="64"`.
   **or Initials** — `span.card__initials.tile--{tile}`, 64 × 64, `aria-hidden="true"`.
4. **Name block** — an unclassed `div` (free to change) holding:
   - **Name** — `h3.card__name#n-{slug}` containing the profile link `a`. The
     link is the card's only navigation.
   - **Role** — `p.card__role`.
5. **Match** — `p.card__match` with `<strong>94%</strong>` and the word "match".
6. **Place** — `p.card__place`, a 16 px location icon (`svg.icon.icon--sm`,
   `aria-hidden="true"`) then the neighbourhood and distance text.
7. **Skills** — `ul.tags` with `aria-label="Skills"`, each skill a `li.pill`
   ([chip](chip.md) owns `.pill`).
8. **Facts** — `dl.card__facts`, two `div` groups of `dt`/`dd`: "Building" and
   "Open to". An empty "Building" uses `dd.is-empty` with "No project listed".
9. **Foot** — `div.card__foot`: the presence indicator (`[slot=status]`, a
   `bn-status`) at the start and the actions (`[slot=actions]`) at the end.

Host: the consumer writes `<article bn-card …>`; the component adds the `card`
class, the `id`, `aria-labelledby` and `data-state`, and renders parts 2–9
inside it. There is no wrapper element around the article.

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `slug` | `string` | — | yes | Sets `id="b-{slug}"` on the article and `id="n-{slug}"` on the name; `aria-labelledby="n-{slug}"`. Must be unique on the page (the builder's handle, `daniel-reyes`). |
| `name` | `string` | — | yes | Text of the name link. Rendered by interpolation, never as HTML. |
| `link` | `string \| readonly unknown[]` | — | yes | Profile route (`/builders/{id}`), bound to `routerLink` on the name anchor. |
| `role` | `string` | — | yes | Headline role ("Full-stack engineer"). |
| `photo` | `string \| null` | `null` | no | Photo URL (480 px source). When `null`, or when the image fails to load, the initials render instead. |
| `initials` | `string` | — | yes | One or two letters ("EN"). Always required so the fallback never renders empty. |
| `tile` | `'sage' \| 'clay' \| 'fjord' \| 'oat'` | `'sage'` | no | Adds `tile--{tile}` to the initials. |
| `lazy` | `boolean` | `false` | no | Adds `loading="lazy"` to the photo; the page sets it for cards below the first viewport (results 7–12). |
| `headingLevel` | `2 \| 3 \| 4` | `3` | no | Element of `.card__name`. The directory uses `h3` under its `h2`. |
| `variant` | `'member' \| 'visitor'` | `'member'` | no | `visitor` omits the match, the facts and the whole foot, whatever is projected (L2-009 AC6). |
| `match` | `number \| null` | `null` | no | Integer 0–100. `null` omits `.card__match`. |
| `matchLabel` | `string` | — | yes | The word after the number ("match"), from the catalogue. |
| `place` | `string` | — | yes | Already formatted by the page ("The Annex · 5.8 km away"; visitors get the neighbourhood only). |
| `skills` | `readonly string[]` | `[]` | no | Rendered in the given order. Empty omits the `ul.tags` entirely. |
| `skillsLabel` | `string` | — | yes | `aria-label` of the skills list ("Skills"). |
| `building` | `string \| null` | `null` | no | Project name for the "Building" fact; `null` shows `noProjectLabel` in `dd.is-empty`. |
| `openTo` | `string` | — | yes | "Co-founding", "Advising" or "Contributing" (already translated). |
| `buildingLabel` | `string` | — | yes | "Building". |
| `openToLabel` | `string` | — | yes | "Open to". |
| `noProjectLabel` | `string` | — | yes | "No project listed". |
| `selected` | `boolean` | `false` | no | Sets `data-state="selected"` and `aria-current="true"` on the article. |

- Inputs are signal inputs; booleans use `booleanAttribute`.
- Every visible word that is not data (match, Skills, Building, Open to, No
  project listed) is an input, so the card never hard-codes English (L2-052).

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| None | — | The card is passive. Its interactive parts are the name link (routing) and the projected actions, which own their events. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `[slot=status]` | one `bn-status` | Presence ("Online now", "Seen 4 h ago"). Omitted by the page when the builder hides online status (L2-036). Not rendered for `visitor`. |
| `[slot=actions]` | one or more `button[bn-button]` / `a[bn-button]` | `variant="quiet" size="sm"` "Say hello". Never a card-wide link or a nested anchor. Not rendered for `visitor`. |

Each slot is declared once in the template, inside the single `.card__foot`.

## Variants and sizes

The design system's five specimens share one markup; they are parts and
behaviours of one card rather than separate looks:

| Variant | Modifier / trigger | Use for |
|---|---|---|
| Builder (member) | — | Every signed-in directory result. |
| Visitor | `variant="visitor"` (no class) | Signed-out directory: no match, facts or foot (L2-009 AC6). |
| Interactive | always on | Hover and `:focus-within` lift; nothing extra to set. |
| Header and footer | always on | `.card__top` and `.card__foot` are the header and footer. |
| Media | `photo` set → `.card__photo`; `photo` null → `.card__initials.tile--*` | Builders with and without a portrait. |
| Selected | `selected` → `[data-state="selected"]` + `aria-current="true"` | The card the member returned to (fragment `#b-{slug}`), chosen by the page. |

| Size | Modifier | Height | Padding | Type |
|---|---|---|---|---|
| One size | — | Content-driven | `--space-6` | Name `--text-h4` at `--font-size-lg`; body `--text-body-sm`; match `--font-size-xl` light display |

Width comes from the grid column; the card fills it and never sets a width.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Surface fill, `--color-border-default` hairline | Article named by the builder's name |
| Hover | `:hover` (`data-state="hover"` in specimens) | Lifts by `--lift`, `--shadow-3`; specimen also shows `--color-border-strong` | — |
| Focus within | `:focus-within` (focus on the name link or an action) | Same lift and shadow; the focused control shows the 2 px `--color-focus-ring` ring at `--focus-ring-offset` | Focus is on the real control |
| Active | `:active` on the link or action (`data-state="active"` in specimens) | Same as hover | — |
| Selected | `selected` | `--color-accent` border, `--color-accent-subtle` fill | `aria-current="true"` ("current") |
| Photo missing or failed | `photo` null or `error` event | Initials tile in the same 64 × 64 box | Tile is `aria-hidden`; the name is the identity |
| No project | `building` null | `dd.is-empty`, regular weight, `--color-fg-subtle` | Reads "Building, No project listed" |
| No skills | `skills` empty | Skills row absent; gaps close up | No empty list announced |
| Long content | long name, role, skill or project | Wraps (`overflow-wrap: anywhere`); never truncates | Full text available |
| Disabled | not supported | — (the design system's *Disabled* column renders the default card) | A card is not a control; see D-3 |
| Inert | page behind a modal dialog or under a toast | Unchanged | Removed from the tab order and the accessibility tree by the page's `inert` |

## Markup

```html
<!-- rendered: member with photo -->
<article bn-card class="card" id="b-daniel-reyes" aria-labelledby="n-daniel-reyes">
  <div class="card__top">
    <img class="card__photo" src="/media/builders/daniel-reyes.jpg" width="64" height="64" alt="">
    <div>
      <h3 class="card__name" id="n-daniel-reyes"><a href="/builders/daniel-reyes">Daniel Reyes</a></h3>
      <p class="card__role">Full-stack engineer</p>
    </div>
    <p class="card__match"><strong>94%</strong>match</p>
  </div>
  <p class="card__place"><svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/></svg>Mississauga · 26.9 km away</p>
  <ul class="tags" aria-label="Skills"><li class="pill">Laravel</li><li class="pill">Angular</li><li class="pill">PostgreSQL</li></ul>
  <dl class="card__facts">
    <div><dt>Building</dt><dd>Psalter</dd></div>
    <div><dt>Open to</dt><dd>Co-founding</dd></div>
  </dl>
  <div class="card__foot">
    <bn-status class="status status--online"><span class="status__dot" aria-hidden="true"></span>Online now</bn-status>
    <button bn-button class="btn btn--quiet btn--sm" type="button">Say hello</button>
  </div>
</article>
```

```html
<!-- rendered: initials, no project (only the changed parts) -->
<span class="card__initials tile--sage" aria-hidden="true">EN</span>
…
<div><dt>Building</dt><dd class="is-empty">No project listed</dd></div>
```

```html
<!-- rendered: visitor (no match, no facts, no foot) -->
<article bn-card class="card" id="b-grace-liu" aria-labelledby="n-grace-liu">
  <div class="card__top">
    <img class="card__photo" src="/media/builders/grace-liu.jpg" width="64" height="64" alt="">
    <div><h3 class="card__name" id="n-grace-liu"><a href="/builders/grace-liu">Grace Liu</a></h3><p class="card__role">Product designer</p></div>
  </div>
  <p class="card__place"><svg class="icon icon--sm" …></svg>Markham</p>
  <ul class="tags" aria-label="Skills"><li class="pill">Figma</li><li class="pill">Design systems</li><li class="pill">Prototyping</li></ul>
</article>
```

```html
<!-- rendered: selected -->
<article bn-card class="card" id="b-daniel-reyes" aria-labelledby="n-daniel-reyes" data-state="selected" aria-current="true">…</article>
```

```html
<!-- consumer: directory result -->
<article bn-card
  [slug]="b.slug" [name]="b.name" [link]="['/builders', b.slug]" [role]="b.role"
  [photo]="b.photoUrl" [initials]="b.initials" [tile]="b.tile" [lazy]="$index >= 6"
  [match]="b.match" [matchLabel]="t('directory.card.match')"
  [place]="b.place" [skills]="b.skills" [skillsLabel]="t('directory.card.skills')"
  [building]="b.building" [openTo]="b.openTo"
  [buildingLabel]="t('directory.card.building')" [openToLabel]="t('directory.card.openTo')"
  [noProjectLabel]="t('directory.card.noProject')">
  <bn-status slot="status" [online]="b.online">{{ b.presence }}</bn-status>
  <button slot="actions" bn-button variant="quiet" size="sm" type="button" (click)="sayHello(b)">{{ t('directory.card.sayHello') }}</button>
</article>
```

The unclassed `div` around the name and role is free to change; every classed
element above is part of the contract the e2e page objects use.

## Design

- Container: `--space-6` padding, `--space-5` row gap, `--radius-lg`, rule
  `--border-width-hairline` in `--color-border-default`, fill
  `--color-bg-surface`; `scroll-margin-top: --space-8` so a fragment link clears
  the sticky header.
- Top: grid `auto 1fr auto`, gap `--space-4`, items centred; the name block has
  `min-width: 0` so long text wraps.
- Photo and initials: `--space-16` square, `--radius-md`, photo `object-fit:
  cover` on `--color-bg-subtle`; initials light display weight
  (`--font-weight-light`, `--font-size-xl`, `--font-family-display`) in
  `--color-tile-fg`.
- Name `--text-h4` at `--font-size-lg`; the link inherits colour and shows an
  underline only on hover.
- Role and place `--text-body-sm` in `--color-fg-muted`; place gap `--space-2`.
- Match: `--text-caption` in `--color-fg-subtle`, number in light display
  `--font-size-xl`, `--color-fg-accent`, tabular figures; gap `--space-1`.
- Facts: two equal columns, gap `--space-4`, `--space-4` block padding between
  hairline rules; `dt` `--text-overline`, `--letter-spacing-wide`, uppercase,
  `--color-fg-subtle`; `dd` `--text-body-sm` semibold with `--space-1` top margin.
- Foot: flex, space-between, gap `--space-3`, centred.
- Motion: transform over `--duration-base`, shadow over `--duration-slow`,
  border colour over `--duration-base`, all with `--ease-standard`, only under
  `prefers-reduced-motion: no-preference`.
- Elevation: resting none; hover and focus-within `--shadow-3`. No z-index.

Component tokens:

| Token | Aliases | Overridden by |
|---|---|---|
| None | — | The card reads semantic tokens directly, as `components.css` does; no surface re-skins it. |

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Card fill | `--color-bg-surface` | `--palette-birch-50` | `--palette-night-900` |
| Card rule, facts rules | `--color-border-default` | `--palette-oat-300` | `--palette-night-700` |
| Hover rule (specimen) | `--color-border-strong` | `--palette-stone-500` | `--palette-night-500` |
| Name | `--color-fg-default` | `--palette-ink-900` | `--palette-night-50` |
| Role, place | `--color-fg-muted` | `--palette-stone-700` | `--palette-night-200` |
| Match word, fact terms, empty fact | `--color-fg-subtle` | `--palette-stone-600` | `--palette-night-300` |
| Match number | `--color-fg-accent` | `--palette-sage-700` | `--palette-sage-300` |
| Photo backdrop | `--color-bg-subtle` | `--palette-oat-200` | `--palette-night-800` |
| Initials text | `--color-tile-fg` | `--palette-ink-900` | `--palette-night-50` |
| Initials tiles | `--color-tile-sage`, `--color-tile-clay`, `--color-tile-fjord`, `--color-tile-oat` | sage-100, clay-100, fjord-100, oat-200 | sage-900, clay-900, fjord-900, night-800 |
| Selected rule | `--color-accent` | `--palette-sage-600` | `--palette-sage-300` |
| Selected fill | `--color-accent-subtle` | `--palette-sage-50` | `--palette-sage-950` |
| Focus ring | `--color-focus-ring` | `--palette-sage-700` | `--palette-sage-300` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-surface` | 4.5:1 | Name |
| `--color-fg-muted` | `--color-bg-surface` | 4.5:1 | Role, place |
| `--color-fg-subtle` | `--color-bg-surface` | 4.5:1 | Fact terms, "match", "No project listed" |
| `--color-fg-accent` | `--color-bg-surface` | 4.5:1 | Match number |
| `--color-tile-fg` | `--color-tile-sage` (and clay, fjord, oat) | 4.5:1 | Initials |
| `--color-fg-default` | `--color-accent-subtle` | 4.5:1 | Name on a selected card |
| `--color-fg-subtle` | `--color-accent-subtle` | 4.5:1 | Terms on a selected card |
| `--color-focus-ring` | `--color-bg-surface` | 3:1 | Focus ring on the name link and actions |

Under `prefers-contrast: more` the hairline takes `--color-border-strong` and
muted text takes the default colour (tokens do this). Under `forced-colors:
active` the border becomes `CanvasText` and the focus ring `Highlight`; the
selected state keeps `aria-current` so it does not rely on the fill.

## Responsive behaviour

- The card has no breakpoints of its own; the grid gives it one column below
  768 px and two at 768 px and above (L2-049 AC2, page-owned).
- Below 576 px the foot wraps: when the status and the action do not fit on one
  line, the action drops below the status (`flex-wrap: wrap` on `.card__foot`).
- Name, role, place, skills and facts wrap with `overflow-wrap: anywhere`; the
  card never truncates and never scrolls (D-1).
- The "Say hello" action has a target of at least 44 × 44 CSS px below 576 px
  ([button](button.md) supplies the size; the card does not shrink it).
- At 320 px nothing scrolls horizontally or clips; at 200 % zoom everything stays available; every target is at least 44 × 44 CSS px on touch devices.

## Accessibility

### Role and pattern

Native `article` labelled by its heading (`aria-labelledby`), containing a
heading, a list and a description list. No ARIA widget pattern: the card is
static content with ordinary links and buttons
([landmark and structure guidance](https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/)).
The whole card is never wrapped in a link, and no button sits inside a link.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Visits the name link, then each action. The article itself is not a tab stop. |
| <kbd>Enter</kbd> | Follows the name link; activates a focused action. |
| <kbd>Space</kbd> | Activates a focused action button. |

### Focus

The focused link or button shows the shared ring (`--focus-ring-width`
`--color-focus-ring`, offset `--focus-ring-offset`), and the card lifts with
`:focus-within`. The card never moves focus. When the page returns to a card
by fragment, it is the page that focuses the name link.

### Labelling

- Article name: the builder's name, through `aria-labelledby="n-{slug}"`.
- Photo `alt=""` and initials `aria-hidden="true"`: the name is already read.
- Skills list named by `skillsLabel` ("Skills").
- Match reads as "94% match" (number and word in one paragraph).
- Presence is a word and a dot (`bn-status`); the dot is `aria-hidden`.
- Selected: `aria-current="true"`, so the state is not colour alone.
- The action's accessible name is its visible text "Say hello"; when several
  cards are listed, the article name gives it context.

### Announcements

None. The card does not change while it is shown; result changes are announced
by the directory's result count.

### Motion

Hover and focus-within lift by `--lift` with `--shadow-3`, transitions only
under `prefers-reduced-motion: no-preference`. With reduced motion the tokens
zero `--lift` and the durations, so the card stays still and only the shadow
and colour change. The online dot's breathing belongs to `bn-status`.

## Content and internationalisation

- Name and role come from the profile and are shown as text, encoded on
  output; markup typed into a name is shown literally (L2-007 AC6).
- Place is "{neighbourhood} · {distance} away" for members, built by the page;
  distance follows L2-052 (one decimal under 10 km: "The Annex · 5.8 km away").
  A member who chose "City only" (L2-036) gets "Mississauga · about 25 km
  away"-style copy from the page; the card just shows the string.
- Match is an integer followed by `%` and the translated word ("94%" "match").
- Skills keep the member's order and spelling ("PostgreSQL", "UX writing").
- "Building" shows the project name ("Psalter"); with no project, "No project
  listed" in the empty style.
- Presence copy ("Online now", "Seen 4 h ago", "Seen yesterday") comes from the
  page; sentence case after "Seen" (D-5).
- Translatable inputs: `matchLabel`, `skillsLabel`, `buildingLabel`,
  `openToLabel`, `noProjectLabel`, `openTo`, and the projected action text.
  Data values: `name`, `role`, `place`, `skills`, `building`, `initials`.
- Longer French copy ("Ouvert à", "Aucun projet indiqué") wraps inside the fact
  columns without truncation.

## Performance

- Change detection: `OnPush`, signal inputs; the heading element, the initials
  fallback and the visitor omissions are `computed` values, not template calls.
- The photo declares `width="64" height="64"`, so it never shifts the card on
  load; cards 7–12 set `lazy` (L2-048 AC3).
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Card.ts`
  renders Daniel Reyes ("Full-stack engineer", 94% match, "Mississauga · 26.9 km
  away", Laravel/Angular/PostgreSQL, Building "Psalter", Open to "Co-founding",
  "Online now", "Say hello"); iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly 100–300 ms.
- Composite scenarios: `DirectoryResults.ts` (new) renders the twelve
  directory cards of `pages/directory/default` in the `.results` grid, six
  with photos and six with initials, because the card repeats twelve times per
  page; `DarkTheme` gains one card.
- A change to the card's template, inputs, styles or change detection is
  measured against the base branch with `--fail-on-regression` before it is
  pushed.
- Layout stability: the media box is a fixed 64 × 64 whether photo or initials,
  and the skeleton card ([skeleton](skeleton.md)) uses the same padding, radius
  and border, so replacing skeletons moves nothing around the grid (L2-048 AC4).
- Weight: imports only `RouterLink`; no image library, no icon font (the
  location icon is inline SVG).

## Acceptance criteria

### Rendering

- **AC-1** Given Noah Fischer with role "Backend & data engineer", match 88, place "The Annex · 5.8 km away", skills Python, PostgreSQL and Data pipelines, building "Ledgerline" and open to "Co-founding", when the member card renders in the directory, then it shows, in this order, the photo, the name link "Noah Fischer", "Backend & data engineer", "88% match", "The Annex · 5.8 km away", the three skills as pills, "Building Ledgerline", "Open to Co-founding", the status and the "Say hello" action. (L2-009)
- **AC-2** Given a builder with a photo, when the card renders, then the `img.card__photo` has `width="64"`, `height="64"` and `alt=""`, and the card's height does not change when the image finishes loading. (L2-048)
- **AC-3** Given the twelve cards of `pages/directory/default`, when the page renders, then cards 7 to 12 have `loading="lazy"` on their photos and cards 1 to 6 do not. (L2-048)
- **AC-4** Given Esther Nguyen with no photo, initials "EN" and tile sage, when the card renders, then a `span.card__initials.tile--sage` with `aria-hidden="true"` and the text "EN" occupies the same 64 × 64 box a photo would, and no `img` is rendered. (L2-010)
- **AC-5** Given Daniel Reyes's photo URL fails to load, when the image raises its error event, then the card replaces it with the initials "DR" in the same box without moving any other part. (L2-010)
- **AC-6** Given Esther Nguyen with no project, when the card renders, then the "Building" fact reads "No project listed" in a `dd.is-empty`. (L2-009)
- **AC-7** Given a builder with no skills, when the card renders, then there is no `ul.tags` element and no empty gap where it would be. (L2-010)
- **AC-8** Given a signed-out visitor and Grace Liu, when the visitor card renders, then it shows the photo, "Grace Liu", "Product designer", "Markham" and her skills, and has no `.card__match`, no `.card__facts` and no `.card__foot`, even if a status or action was projected. (L2-009)
- **AC-9** Given a builder whose name is `<b>Daniel</b> Reyes`, when the card renders, then the name link shows the literal characters `<b>Daniel</b> Reyes` and no `b` element exists in the card. (L2-007)

### States

- **AC-10** Given the selected card for Daniel Reyes, when it renders, then the article has `data-state="selected"` and `aria-current="true"`, a `--color-accent` border and a `--color-accent-subtle` fill. (L2-050)
- **AC-11** Given a card whose name link has keyboard focus, when it is shown with motion allowed, then the link shows a 2 px `--color-focus-ring` outline at a 3:1 or better contrast and the card is raised by `--lift` with `--shadow-3`. (L2-050)
- **AC-12** Given "Maximilian Alexander Wolfeschlegelsteinhausen-Reyes" with the role "Principal full-stack engineer and technical co-founder, healthcare and public-sector platforms", the skill "Domain-driven design and event sourcing" and the project "Harvest Hands Volunteer Scheduling Platform for GTA Food Banks", when the card renders at 320 px, then every string is shown in full on wrapped lines, nothing is cut off or ellipsised, and the page has no horizontal scroll. (L2-049)

### Keyboard and focus

- **AC-13** Given a member card with one "Say hello" action, when the member tabs through it, then focus visits the name link and then "Say hello", and the article itself never receives focus. (L2-050)
- **AC-14** Given any card, when its markup is inspected, then no `button` is inside an `a`, and no `a` wraps the whole article. (L2-050)

### Screen readers

- **AC-15** Given the card for Daniel Reyes, when a screen reader lists articles, then the article's accessible name is "Daniel Reyes", the skills list is announced as "Skills" with 3 items, and the facts are read as the pairs "Building, Psalter" and "Open to, Co-founding". (L2-050)
- **AC-16** Given a card with a photo and a card with initials, when a screen reader reads them, then neither the photo nor the initials are announced, so the name is read once. (L2-050)
- **AC-17** Given Daniel Reyes is online, when the card renders, then the foot shows the word "Online now" beside the dot, so presence is not conveyed by colour alone. (L2-050)

### Theming

- **AC-18** Given the light theme, when the default card renders, then the name, role, place, fact terms and match number each measure at least 4.5:1 against `--color-bg-surface`. (L2-050)
- **AC-19** Given the dark theme, when the same card renders, then its fill, rules and text change only through the theme's token values, with no per-component dark-mode CSS, and every pair in AC-18 still measures at least 4.5:1. (L2-051)
- **AC-20** Given initials on each of the sage, clay, fjord and oat tiles, when rendered in light and in dark, then the initials measure at least 4.5:1 against their tile. (L2-050)

### Responsive

- **AC-21** Given a viewport of 360 px, when the card renders, then the "Say hello" action's target is at least 44 × 44 CSS px and, if the status and the action do not fit on one line, the action wraps below the status without overflowing the card. (L2-049)

### Motion

- **AC-22** Given `prefers-reduced-motion: reduce`, when the member hovers the card or focuses its name link, then the card does not move (`transform` stays `none`). (L2-050)

### Performance

- **AC-23** Given a change to the card, when the `Card` and `DirectoryResults` perf-test scenarios run against the base branch with `--fail-on-regression`, then neither is flagged as a possible regression. (L2-048)
- **AC-24** Given the directory's twelve skeleton cards, when the results arrive and twelve cards replace them, then content after the grid does not move (layout shift 0 for the replacement). (L2-048)

## Implementation notes

- Planned. Folder `frontend/projects/components/src/lib/card/`: `card.ts`
  (class `Card`, selector `article[bn-card]`), `card.html`, `card.css`; export
  from `public-api.ts`.
- Composes [badge](badge.md)'s `bn-status` and [button](button.md) through slots,
  and renders the `.pill` markup of [chip](chip.md) directly for the skills (a
  passive pill needs no component; if chip ships `li[bn-pill]`, use it).
- Host bindings: `[class.card]`, `[attr.id]`, `[attr.aria-labelledby]`,
  `[attr.data-state]`, `[attr.aria-current]`.
- The heading element switches by `headingLevel` with `@switch`; the name link
  markup sits in one `ng-template` rendered in each branch, so it is declared
  once.
- The photo's `(error)` handler sets a signal that swaps to initials.
- Styles: the `.card` rules in `components.css` move into the component's
  encapsulated stylesheet (global styles keep only foundations), keeping the
  class names. Add `flex-wrap: wrap` to `.card__foot` (D-4).
- Scenarios: add `Card.ts` and `DirectoryResults.ts`, export both from
  `scenarios/index.ts`, and add the card to `DarkTheme.ts`.

## Decisions

- **D-1** *Do long names and skills truncate with an ellipsis (L2-010 AC7) or wrap?* They wrap. The design system's *Do* says "Wrap long builder names and skills" and "Do not truncate the two collaboration facts", `components.css` sets `overflow-wrap: anywhere` on the card text, the `edge` mock wraps, and truncation would hide information (WCAG 1.4.10 reflow). Raised with the lead as a conflict with L2-010 AC7.
- **D-2** *Are the design system's Builder, Interactive, Header and footer, and Media variants separate looks?* No. Their specimens share one markup; the CRD treats them as the default card, its always-on hover behaviour, its top and foot parts, and its photo-or-initials media.
- **D-3** *Does the card have a disabled state?* No. The design system's *Disabled* column renders the default card and `components.css` has no rule for it; a card is not a control, and the signed-out case is the `visitor` variant.
- **D-4** *What happens in the foot at narrow widths?* It wraps. The mocks never show a long status, but "Seen 2 days ago" plus "Say hello" at 320 px needs room, and wrapping keeps both whole.
- **D-5** *"Seen Yesterday" in `pages/directory/filtered` or "Seen yesterday" elsewhere?* Sentence case, "Seen yesterday", as in the other 22 uses; the capital is a mock typo.
- **D-6** *How is "selected" exposed, given `aria-selected` is not allowed on an article?* With `aria-current="true"` plus the `data-state="selected"` hook `components.css` already styles, so the state is announced and not colour alone.
- **D-7** *Which builder may the visitor card show?* Exactly the L2-009 AC6 fields: name, role, neighbourhood, skills, photo. The facts are omitted too, because AC6 lists what remains and "Building" and "Open to" are not in it.
- **D-8** *Do the related card-shaped blocks (`.aside-card`, `.form-card`, `.skeleton-card`, `.project`, `.person`, `.event`) compose `bn-card`?* No. They are different BEM blocks with different content; making them compose `.card` would break the mock class parity the e2e locators depend on. Raised with the lead.
