# Featured builder

| Field | Value |
|---|---|
| Selector | `ul[bn-people]`, `li[bn-person]` |
| Library path | `frontend/projects/components/src/lib/person/` |
| Status | planned |
| Traces to | L2-039, L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`person.html`](../../design-system/components/person.html) |
| Source mocks | [`pages/home/default`](../../mocks/pages/home/default.html), [`pages/home/loading`](../../mocks/pages/home/loading.html), [`pages/home/partial`](../../mocks/pages/home/partial.html), [`pages/home/error`](../../mocks/pages/home/error.html) |
| Rendering | [`person.html`](person.html) |

## Purpose and scope

A compact builder identity for the home page's "Featured builders": a small square portrait (or
initials on a soft tile), the builder's name linking to their profile, their role and neighbourhood,
and what they are open to. Six of them sit in hairline-separated rows, "Neighbours worth knowing".
It is deliberately lighter than the directory card.

Use the directory [card](card.md) for search results (match score, distance, skills, two-fact
footer), the [profile-header](profile-header.md) on a profile, and the [avatar](avatar.md) for a
portrait on its own.

Out of scope:

- Choosing which six builders are featured, and hiding the section when the feed fails (L2-039 AC3):
  the page does both.
- The section heading and "Browse all 1,284 builders" link above the list.
- Match score, distance and messaging actions, which are the directory card's.

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/home/default`, `partial` | `ul[bn-people]` of six `li[bn-person]` with portraits and open-to tags | Daniel Reyes, "Full-stack engineer · Mississauga", "Open to co-founding"; Grace Liu, "Product designer · Markham", "Open to contributing"; Noah Fischer, "Backend & data engineer · The Annex"; Sofia Marquez, "Growth & marketing · Liberty Village"; Hannah Kowalski, "UX researcher · Roncesvalles", "Open to advising"; Ruth Alvarez, "Product manager, health tech · Scarborough" | default | canvas |
| `pages/home/loading` | list `busy`, `busyLabel` "Loading featured builders", six skeleton cards | skeleton cards | loading | canvas |
| `pages/home/error` | not rendered: the section shows the error empty state | — | — | — |
| Design-system "initials" variant (builders 12–23 have no photo) | `initials` + `tone` instead of `photo` | Esther Nguyen, "EN" on sage, "Product designer · Riverdale", "Open to co-founding" | default | canvas |
| Design-system "status" variant (members only) | `status` + `online` | Grace Liu, "Online now" | default | canvas |

Every row is buildable with the API below.

## Anatomy

1. **List** — `ul.people`. Grid of rows; hairline above.
2. **Row** — `li.person`. Portrait and text side by side; hairline below.
3. **Portrait** — `img.person__photo`, 64 × 64, `alt=""`, lazy. Or, without a photo,
   `span.person__photo.card__initials.tile--{tone}` with the initials, `aria-hidden="true"`.
4. **Text** — an unclassed `div`.
5. **Name** — `h3.person__name` containing the profile link.
6. **Meta** — `p.person__meta`: role, " · ", neighbourhood.
7. **Open to (optional)** — `p.person__open` holding a sage tag (`.pill.pill--sage`) from
   [chip](chip.md).
8. **Status (optional)** — `p.person__open` holding `.status` with a dot and a word, from
   [avatar](avatar.md)'s status.

Hosts: `ul[bn-people]` adds `class="people"` to the native list; `li[bn-person]` adds
`class="person"` to the native item and renders the parts inside.

## API

### Inputs — `ul[bn-people]`

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `busy` | `boolean` | `false` | no | Sets `aria-busy="true"` while skeleton cards fill the list. |
| `busyLabel` | `string \| undefined` | `undefined` | no | `aria-label` while busy ("Loading featured builders"). Required when `busy` is true. |

### Inputs — `li[bn-person]`

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `name` | `string` | — | yes | Full name; the link text. |
| `profileLink` | `string \| readonly unknown[]` | — | yes | Passed to `routerLink` on the name link (`/builders/{id}`). |
| `role` | `string` | — | yes | "Full-stack engineer". |
| `neighbourhood` | `string` | — | yes | "Mississauga". |
| `photo` | `string \| undefined` | `undefined` | no | Portrait URL; rendered 64 × 64 with `alt=""` and `loading="lazy"`. |
| `initials` | `string \| undefined` | `undefined` | no | One or two letters shown when `photo` is unset; required then. |
| `tone` | `'sage' \| 'clay' \| 'fjord' \| 'oat'` | `'sage'` | no | Initials tile colour. |
| `openTo` | `string \| undefined` | `undefined` | no | Tag text ("Open to co-founding"); omitted when unset. |
| `status` | `string \| undefined` | `undefined` | no | Last-seen word ("Online now", "2 h ago"); omitted when unset (visitors never get it). |
| `online` | `boolean` | `false` | no | Adds `.status--online` (filled, breathing dot) to the status. |

All inputs are signal inputs; booleans use `booleanAttribute`.

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| None — navigation is the native link's. | | |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `ul[bn-people]` default | `li[bn-person]` items or `li` skeleton cards | Six on the home page. |
| `li[bn-person]` | None | Everything comes from inputs. |

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Portrait | `photo` set | Builders with a photo. |
| Initials | `initials` + `tone`, no `photo` | Builders without a photo (12–23 in the cast). |
| Status | `status` set | Signed-in viewers; shows last seen as a word and a dot. |

| Size | Modifier | Height | Padding | Type |
|---|---|---|---|---|
| One size | — | content | `--space-6` block | name `--text-h4`, meta `--text-body-sm` |

Portrait and initials tile are `--space-16` square.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Portrait, name, meta, tag | Name is a link inside a level-3 heading |
| Name hover | `:hover` on the link | Underline | — |
| Name focus | `:focus-visible` on the link | Shared focus ring | — |
| Online | `status` + `online` | Sage filled dot that breathes, word in `--color-success-fg` | Word read ("Online now"); dot hidden |
| Offline / last seen | `status`, `online` false | Hollow dot, word in `--color-fg-subtle` | Word read ("2 h ago") |
| Loading | list `busy` | Skeleton cards | List busy, named "Loading featured builders" |
| Disabled, active | — | Not applicable | — |

## Markup

```html
<!-- rendered: portrait (pages/home/default) -->
<ul class="people">
  <li class="person">
    <img class="person__photo" src="/images/daniel-reyes.jpg" width="64" height="64" alt="" loading="lazy">
    <div>
      <h3 class="person__name"><a href="/builders/daniel-reyes">Daniel Reyes</a></h3>
      <p class="person__meta">Full-stack engineer · Mississauga</p>
      <p class="person__open"><span class="pill pill--sage">Open to co-founding</span></p>
    </div>
  </li>
  …
</ul>
```

```html
<!-- rendered: initials -->
<li class="person">
  <span class="person__photo card__initials tile--sage" aria-hidden="true">EN</span>
  <div>
    <h3 class="person__name"><a href="/builders/esther-nguyen">Esther Nguyen</a></h3>
    <p class="person__meta">Product designer · Riverdale</p>
    <p class="person__open"><span class="pill pill--sage">Open to co-founding</span></p>
  </div>
</li>
```

```html
<!-- rendered: status -->
<p class="person__open"><span class="status status--online"><span class="status__dot" aria-hidden="true"></span>Online now</span></p>
```

```html
<!-- rendered: loading (pages/home/loading) -->
<ul class="people" aria-busy="true" aria-label="Loading featured builders">
  <li><div class="skeleton-card" aria-hidden="true">…</div></li>
  …six items…
</ul>
```

```html
<!-- consumer -->
<ul bn-people [busy]="loading()" [busyLabel]="'home.builders.loading' | t">
  @for (b of featured(); track b.id) {
    <li bn-person [name]="b.name" [profileLink]="['/builders', b.id]" [role]="b.role" [neighbourhood]="b.neighbourhood"
        [photo]="b.photoUrl" [initials]="b.initials" [tone]="b.tone" [openTo]="'builders.openTo.' + b.openTo | t"></li>
  }
</ul>
```

## Design

- List: `display: grid`, no gap, top hairline `--border-width-hairline` solid
  `--color-border-default`; from 48 rem two columns with `column-gap: var(--layout-gutter)`; from
  64 rem three columns.
- Row: `display: grid; grid-template-columns: auto 1fr`, gap `--space-5`, `align-items: center`,
  `padding-block: var(--space-6)`, bottom hairline `--color-border-default`.
- Portrait: `--space-16` square, `--radius-md`, `object-fit: cover`, background `--color-bg-subtle`
  while loading. Initials: the same box; light display `--font-size-xl`, centred, `--color-tile-fg`
  on `--color-tile-{tone}`.
- Name `--text-h4`, link `color: inherit`, no underline until hover.
- Meta `--text-body-sm`, `--color-fg-muted`. Open-to and status lines `margin-top: var(--space-2)`.
- Motion: the portrait declares a `scale` transition (`--duration-deliberate`) but does not scale;
  the online dot breathes over `--duration-breath` under `prefers-reduced-motion: no-preference`.

Component tokens:

| Token | Aliases | Overridden by |
|---|---|---|
| None — the row reads semantic tokens directly. | | |

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Rules | `--color-border-default` | `--palette-oat-300` | `--palette-night-700` |
| Name | `--color-fg-default` | `--palette-ink-900` | `--palette-night-50` |
| Meta | `--color-fg-muted` | `--palette-stone-700` | `--palette-night-200` |
| Portrait placeholder | `--color-bg-subtle` | `--palette-oat-200` | `--palette-night-800` |
| Initials text | `--color-tile-fg` | `--palette-ink-900` | `--palette-night-50` |
| Initials tile (sage) | `--color-tile-sage` | `--palette-sage-100` | `--palette-sage-900` |
| Tag | `--color-fg-accent` on `--color-accent-subtle` | `--palette-sage-700` / `--palette-sage-50` | `--palette-sage-300` / `--palette-sage-950` |
| Online word / dot | `--color-success-fg` / `--color-online` | `--palette-sage-700` / `--palette-sage-500` | `--palette-sage-200` / `--palette-sage-300` |
| Focus ring | `--color-focus-ring` | `--palette-sage-700` | `--palette-sage-300` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-canvas` | 4.5:1 | Name |
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Meta |
| `--color-fg-accent` | `--color-accent-subtle` | 4.5:1 | Open-to tag |
| `--color-tile-fg` | `--color-tile-sage` | 4.5:1 | Initials (each tone has the same pair) |
| `--color-success-fg` | `--color-bg-surface` | 4.5:1 | "Online now" |
| `--color-online` | `--color-bg-surface` | 3:1 | Online dot |
| `--color-focus-ring` | `--color-bg-canvas` | 3:1 | Focused name link |

## Responsive behaviour

| Range | Columns |
|---|---|
| < 768 px | 1 |
| 768–1023 px | 2, `--layout-gutter` apart |
| ≥ 1024 px | 3 |

- Long roles wrap under the name ("Product manager, health tech · Scarborough"); names wrap rather
  than truncate.
- At 320 px nothing scrolls horizontally or clips; at 200 % zoom everything stays available; the
  name link's line box is at least 24 px tall and the row is at least 44 px tall.

## Accessibility

### Role and pattern

A native list of items; each item's name is an `h3` containing a native link. The portrait is
decorative beside the name.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves to each builder's name link in list order. |
| <kbd>Enter</kbd> | Opens the builder's profile. |

### Focus

Only the name link is focusable; it shows the shared focus ring.

### Labelling

The link's name is the builder's name ("Daniel Reyes"). The portrait has `alt=""` and the initials
are `aria-hidden`, because the name follows. Status is a word plus a dot, never colour alone.

### Announcements

None.

### Motion

The online dot's breathing ring stops under `prefers-reduced-motion: reduce`; nothing else moves.

## Content and internationalisation

- Meta is "Role · Neighbourhood" with the cast's roles and places; the component renders " · ".
- Open-to tag: "Open to co-founding", "Open to contributing", "Open to advising" (from the
  catalogue).
- Status: "Online now", "1 h ago", "Yesterday" (from the catalogue, computed by the page).
- Translatable inputs: `openTo`, `status`, `busyLabel`. Data values: `name`, `role`,
  `neighbourhood`, `photo`, `initials`.
- Right-to-left names (the directory edge cast) render in their own direction inside the link with
  `dir="auto"`.

## Performance

- Change detection: `OnPush`, signal inputs; the meta string is a `computed`.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Person.ts` renders Daniel Reyes
  ("Full-stack engineer · Mississauga", "Open to co-founding", portrait); iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly 100–300 ms.
- Composite scenarios: `FeaturedBuilders` renders the home list of six (Daniel Reyes, Grace Liu,
  Noah Fischer, Sofia Marquez, Hannah Kowalski, Ruth Alvarez); `DarkTheme`.
- Layout stability: portraits declare 64 × 64 and the initials tile has the same box, so rows never
  shift when images load; skeleton cards occupy the same grid while loading.
- Weight: composes the [chip](chip.md) tag and the [avatar](avatar.md) status; uses `RouterLink`.

## Acceptance criteria

### Rendering

- **AC-1** Given the home page, when the featured builders render, then the list holds six rows in order: Daniel Reyes, Grace Liu, Noah Fischer, Sofia Marquez, Hannah Kowalski, Ruth Alvarez. (L2-039)
- **AC-2** Given Daniel Reyes, when his row renders, then it shows his portrait, `h3` with a link "Daniel Reyes" to his profile, "Full-stack engineer · Mississauga" and the sage tag "Open to co-founding". (L2-039)
- **AC-3** Given Esther Nguyen without a photo, when her row renders with initials "EN" and tone sage, then a 64 × 64 initials tile replaces the portrait and the row height equals a portrait row's. (L2-039)
- **AC-4** Given each portrait, when it renders, then the `img` declares `width="64"` and `height="64"` and `loading="lazy"`. (L2-048)

### States

- **AC-5** Given the home page while loading, when the list is `busy` with label "Loading featured builders", then it has `aria-busy="true"` and that label and holds six skeleton cards. (L2-039)
- **AC-6** Given the loaded rows replace the skeletons, when the swap happens, then nothing below the list moves (CLS 0 for the replacement). (L2-048)
- **AC-7** Given Grace Liu with status "Online now" and `online`, when her row renders, then it shows a filled dot and the word "Online now"; the dot alone never carries the status. (L2-050)

### Keyboard and focus

- **AC-8** Given a keyboard user, when they tab through the list, then focus moves from name link to name link in list order with a visible 2 px focus ring of at least 3:1, and Enter opens the profile. (L2-050)

### Screen readers

- **AC-9** Given Daniel Reyes's row, when a screen reader reads it, then it hears a level-3 heading with the link "Daniel Reyes", then "Full-stack engineer · Mississauga" and "Open to co-founding", and nothing for the portrait. (L2-050)

### Theming

- **AC-10** Given the light and dark themes, when the rows render, then name and meta have at least 4.5:1 on the canvas, the tag at least 4.5:1 on its tint, and initials at least 4.5:1 on each tile tone. (L2-050)
- **AC-11** Given a theme change, when the rows re-render, then colours change without component code because only design-system tokens are used. (L2-051)

### Responsive

- **AC-12** Given a 360 px viewport, when the list renders, then rows stack in one column with a hairline between each and no horizontal scroll. (L2-049)
- **AC-13** Given a 768 px viewport, when the list renders, then it has two columns. (L2-049)
- **AC-14** Given a 1280 px viewport, when the list renders, then it has three columns, matching `pages/home/default` within the visual-parity threshold. (L2-049)

### Motion

- **AC-15** Given `prefers-reduced-motion: reduce`, when an online status renders, then its dot does not animate. (L2-050)

### Content

- **AC-16** Given the component source, when it renders with the en-CA catalogue, then tags, status words and the busy label come from inputs and the component hard-codes no copy other than the " · " separator. (L2-052)

### Performance

- **AC-17** Given a change to the row's template, inputs or styles, when the perf test runs `Person` and `FeaturedBuilders` against the base branch, then neither is flagged as a possible regression. (L2-048)

## Implementation notes

- Folder `frontend/projects/components/src/lib/person/`: `people.ts` (`People`, selector
  `ul[bn-people]`), `person.ts` (`Person`, selector `li[bn-person]`), `person.css`; export both from
  `public-api.ts`.
- Composes the [chip](chip.md) static tag (sage tone) for "Open to" and the [avatar](avatar.md)
  status for last seen, through their library components, not copied markup.
- Imports `RouterLink` for the name link; sets `dir="auto"` on the link.
- Add the `Person` and `FeaturedBuilders` perf-test scenarios and export them from `index.ts`.
- The featured builders are not yet on the built home page; the home slice adds them.

## Decisions

- **D-1** *The design-system page renders the portrait specimen for all three variants. What do
  "initials" and "status" look like?* Initials reuse the directory card's `.card__initials` and
  `.tile--{tone}` on the `.person__photo` box (64 px, same radius), as the cast requires for builders
  12–23; status reuses the avatar CRD's `.status` in a second `.person__open` line.
- **D-2** *Should the status show on the public home page?* Only when the page passes it; L2-009
  hides online status from visitors, so the home page passes none to visitors.
- **D-3** *Lazy-load portraits?* Yes, as the mock does; the list is below the first viewport.
- **D-4** *The kit declares a portrait scale transition but no hover rule. Does it scale?* No; the
  card is not a link, only the name is, so there is nothing to scale towards.
- **D-5** *Name and meta overflow: truncate or wrap?* Wrap. Home rows have room, and wrapping keeps
  full names readable; only the directory card truncates (L2-010).
