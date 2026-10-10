# Feature area

| Field | Value |
|---|---|
| Selector | `ul[bn-feature-areas]`, `a[bn-feature-area]` |
| Library path | `frontend/projects/components/src/lib/feature-area/` |
| Status | planned |
| Traces to | L2-039, L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`feature-area.html`](../../design-system/components/feature-area.html) |
| Source mocks | [`pages/home/default`](../../mocks/pages/home/default.html), [`pages/home/loading`](../../mocks/pages/home/loading.html), [`pages/home/error`](../../mocks/pages/home/error.html), [`pages/home/partial`](../../mocks/pages/home/partial.html) |
| Rendering | [`feature-area.html`](feature-area.html) |

## Purpose and scope

The four doors into Banaro on the home page, "Four quiet ways to build together": the builder
directory, the project showcase, meetups and events, and co-founder matching. Each area is one
calm card that is a single link: a small index number, a sage icon tile, the area's name, a
one-line promise and "Explore" with an arrow. It describes the product without turning the page
into a dashboard.

Use a [card](card.md) for content items (builders, projects), a [project card](project-card.md) for
projects and [link](link.md) for inline navigation.

Out of scope:

- The section heading above the list ("What Banaro is for" / "Four quiet ways to build together"),
  which belongs to the page's section.
- The skeleton cards shown while loading ([skeleton](skeleton.md)); the list only carries the busy
  state.
- The About page's list of the four areas, which is prose ([prose](prose.md)).

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/home/default`, `error`, `partial` | `ul[bn-feature-areas]` with four `li > a[bn-feature-area]` | 01 directory "Builder directory" / "Find local builders by skill, role and neighbourhood." → `/builders`; 02 projects "Project showcase" / "Share what you're building, ask for feedback, find collaborators." → `/projects`; 03 events "Meetups and events" / "Demo nights, prayer breakfasts and workshops across the GTA." → `/events`; 04 matching "Co-founder matching" / "Meet a co-founder, an advisor or a contributor who shares your faith." → `/matching`; go label "Explore" | default, hover, focus | surface cards on canvas |
| `pages/home/loading` | list `busy`, `busyLabel` "Loading", four `li` with skeleton cards | skeleton cards | loading (`aria-busy="true"`) | canvas |

Every row is buildable with the API below.

## Anatomy

1. **List** — `ul.areas`. Responsive grid of the four items; each item is a plain `li`.
2. **Area** — `a.area`. The whole card is the link: surface, hairline, large radius.
3. **Index** — `span.area__index`. Two-digit position ("01"), tabular numerals.
4. **Icon tile** — `span.area__icon` holding a 24 px `svg.icon`, `aria-hidden="true"`.
5. **Title** — `h3.area__title`. The area's name; the link's accessible name.
6. **Promise** — `p.area__text`. One line describing the area; the link's description.
7. **Go** — `span.area__go`. "Explore" and a small arrow `svg.icon.icon--sm`, `aria-hidden`.

Hosts: `ul[bn-feature-areas]` adds `class="areas"` and the busy attributes to the native list;
`a[bn-feature-area]` adds `class="area"` to the native anchor, which keeps `href`/`routerLink`.

## API

### Inputs — `ul[bn-feature-areas]`

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `busy` | `boolean` | `false` | no | Sets `aria-busy="true"` while skeleton cards fill the list. |
| `busyLabel` | `string \| undefined` | `undefined` | no | `aria-label` of the list while busy ("Loading"); removed when not busy. Required when `busy` is true. |

### Inputs — `a[bn-feature-area]`

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `index` | `string` | — | yes | Position label, two digits ("01"). |
| `icon` | `'directory' \| 'projects' \| 'events' \| 'matching'` | — | yes | Selects one of the four glyphs (people, stacked layers, calendar, chain link). |
| `heading` | `string` | — | yes | Text of `h3.area__title`. |
| `text` | `string` | — | yes | Text of `p.area__text`. |
| `goLabel` | `string` | — | yes | Text before the arrow ("Explore"). |

The anchor's `href` or `routerLink` is set by the consumer on the host. All inputs are signal inputs;
`busy` uses `booleanAttribute`.

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| None — navigation is the native link's. | | |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `ul[bn-feature-areas]` default | `li` elements, each with one `a[bn-feature-area]` or one skeleton card | Four items in the product. |
| `a[bn-feature-area]` | None | Everything comes from inputs. |

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Directory | `icon="directory"` | Builder directory. |
| Projects | `icon="projects"` | Project showcase. |
| Events | `icon="events"` | Meetups and events. |
| Matching | `icon="matching"` | Co-founder matching. |

The variants differ only in their glyph and copy; the card is the same.

| Size | Modifier | Height | Padding | Type |
|---|---|---|---|---|
| One size | — | content; items in a row stretch to the tallest | `--space-8` block, `--space-6` inline | title `--text-h3`, promise `--text-body`, index `--text-caption`, go `--text-label` |

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Surface card, hairline | Link named by the title, described by the promise |
| Hover | `:hover` | Lifts by `--lift` with `--shadow-3` (motion allowed) or gains `--shadow-2` (reduced motion); arrow nudges by `--size-btn-translate-20` | — |
| Focus | `:focus-visible` | Shared 2 px `--color-focus-ring` outline at `--focus-ring-offset`; no lift | — |
| Active | `:active` | Same as hover | — |
| Visited | `:visited` | Unchanged (colour is inherited) | — |
| Loading | list `busy` | Skeleton cards in each `li` | List busy, named "Loading" |
| Disabled | — | Not applicable: every area is always available | — |

## Markup

```html
<!-- rendered: default -->
<ul class="areas">
  <li>
    <a class="area" href="/builders" aria-labelledby="area-directory-title" aria-describedby="area-directory-text">
      <span class="area__index">01</span>
      <span class="area__icon"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8.5" r="3.2"/><path d="M3.5 19.5c.6-3.3 2.8-5 5.5-5s4.9 1.7 5.5 5"/><circle cx="16.8" cy="9.5" r="2.5"/><path d="M15.6 14.6c2.6-.3 4.4 1.3 4.9 4.4"/></svg></span>
      <h3 class="area__title" id="area-directory-title">Builder directory</h3>
      <p class="area__text" id="area-directory-text">Find local builders by skill, role and neighbourhood.</p>
      <span class="area__go">Explore <svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 12h15"/><path d="m13.5 6 6 6-6 6"/></svg></span>
    </a>
  </li>
  …02 projects, 03 events, 04 matching…
</ul>
```

The four glyphs are copied exactly from `pages/home/default`. Ids are generated per instance.

```html
<!-- rendered: loading (pages/home/loading) -->
<ul class="areas" aria-busy="true" aria-label="Loading">
  <li><div class="skeleton-card" aria-hidden="true">…</div></li>
  …four items…
</ul>
```

```html
<!-- consumer -->
<ul bn-feature-areas [busy]="false">
  @for (area of areas; track area.icon) {
    <li><a bn-feature-area [routerLink]="area.route" [index]="area.index" [icon]="area.icon" [heading]="area.titleKey | t" [text]="area.textKey | t" [goLabel]="'home.areas.explore' | t"></a></li>
  }
</ul>
```

## Design

- List: `display: grid`, gap `--space-4`; two columns from 48 rem, four from 80 rem
  (`repeat(n, minmax(0, 1fr))`).
- Area: `display: grid`, gap `--space-4`, `align-content: start`,
  `padding: var(--space-8) var(--space-6)`, background `--color-bg-surface`,
  `border-radius: var(--radius-lg)`, `--border-width-hairline` solid `--color-border-default`,
  `color: inherit`, no underline.
- Index: `--text-caption`, `--color-fg-subtle`, tabular numerals.
- Icon tile: `--space-12` square, `--radius-md`, background `--color-accent-subtle`, glyph
  `--color-fg-accent` at `--space-6`.
- Title `--text-h3`; promise `--color-fg-muted`; go `--text-label`, `--color-fg-link`, gap
  `--space-2`, `margin-top: var(--space-2)`.
- Motion (inside `prefers-reduced-motion: no-preference`): transform `--duration-base`, shadow
  `--duration-slow`, both `--ease-standard`; hover `translateY(var(--lift))` with `--shadow-3`;
  arrow `translate` `--duration-base`. Without motion the hover is only `--shadow-2`.

Component tokens:

| Token | Aliases | Overridden by |
|---|---|---|
| None — the area reads semantic tokens directly. | | |

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Card | `--color-bg-surface` | `--palette-birch-50` | `--palette-night-900` |
| Card rule | `--color-border-default` | `--palette-oat-300` | `--palette-night-700` |
| Index | `--color-fg-subtle` | `--palette-stone-600` | `--palette-night-300` |
| Icon tile | `--color-accent-subtle` | `--palette-sage-50` | `--palette-sage-950` |
| Icon glyph | `--color-fg-accent` | `--palette-sage-700` | `--palette-sage-300` |
| Title | `--color-fg-default` | `--palette-ink-900` | `--palette-night-50` |
| Promise | `--color-fg-muted` | `--palette-stone-700` | `--palette-night-200` |
| "Explore" | `--color-fg-link` | `--palette-sage-700` | `--palette-sage-300` |
| Focus ring | `--color-focus-ring` | `--palette-sage-700` | `--palette-sage-300` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-surface` | 4.5:1 | Title |
| `--color-fg-muted` | `--color-bg-surface` | 4.5:1 | Promise |
| `--color-fg-subtle` | `--color-bg-surface` | 4.5:1 | Index |
| `--color-fg-link` | `--color-bg-surface` | 4.5:1 | "Explore" |
| `--color-fg-accent` | `--color-accent-subtle` | 3:1 | Icon glyph (graphic) |
| `--color-focus-ring` | `--color-bg-canvas` | 3:1 | Focus ring around the card |

## Responsive behaviour

| Range | Columns |
|---|---|
| < 768 px | 1 |
| 768–1279 px | 2 |
| ≥ 1280 px | 4 |

- Text wraps inside the card; cards in a row share the tallest height.
- At 320 px nothing scrolls horizontally or clips; at 200 % zoom everything stays available; each
  card is far larger than 44 × 44 CSS px.

## Accessibility

### Role and pattern

A native list of native links ([link pattern](https://www.w3.org/WAI/ARIA/apg/patterns/link/)).
Each link contains a heading, so the areas appear in the heading outline under the section's `h2`.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves to each area's link in order 01–04. |
| <kbd>Enter</kbd> | Follows the link. |

### Focus

The whole card shows the shared focus ring; nothing inside the card is focusable.

### Labelling

The link is named by its title through `aria-labelledby` ("Builder directory") and described by its
promise through `aria-describedby`; the index, icon and "Explore" are not part of the name. The
visible title is the whole name (WCAG 2.5.3).

### Announcements

None. While busy, the list's `aria-busy` and label "Loading" tell assistive technology it is
filling.

### Motion

Hover lift, shadow and arrow nudge run only under `prefers-reduced-motion: no-preference`; with
reduced motion the hover shows only `--shadow-2` and nothing moves.

## Content and internationalisation

- Title: the area's product name, sentence case ("Meetups and events").
- Promise: one sentence of under 80 characters with a full stop, from the cast's four areas.
- Go label: one verb ("Explore"), the same on all four.
- Index: two digits, not translated.
- Translatable inputs: `heading`, `text`, `goLabel`, `busyLabel`. Data values: none.
- French runs about 30 % longer; promises wrap to a third line and cards in a row grow together.

## Performance

- Change detection: `OnPush`, signal inputs; the glyph is chosen with `@switch` on `icon`.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/FeatureArea.ts` renders the
  "Builder directory" area (01, "Find local builders by skill, role and neighbourhood.",
  "Explore"); iterations in `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly
  100–300 ms.
- Composite scenarios: `FeatureAreas` renders the full list of four, as on the home page;
  `DarkTheme`.
- Layout stability: the loading list keeps four items in the same grid, so the areas replace the
  skeletons without moving the sections below.
- Weight: inline SVG glyphs only; no icon library.

## Acceptance criteria

### Rendering

- **AC-1** Given the home page, when the areas render, then the list holds four links in order: "Builder directory" → `/builders`, "Project showcase" → `/projects`, "Meetups and events" → `/events`, "Co-founder matching" → `/matching`, indexed 01–04. (L2-039)
- **AC-2** Given the directory area, when it renders, then the card shows "01", the people glyph in a sage tile, `h3` "Builder directory", "Find local builders by skill, role and neighbourhood." and "Explore" with an arrow, in that order. (L2-039)

### States

- **AC-3** Given the home page while loading, when the list is `busy` with label "Loading", then it has `aria-busy="true"` and `aria-label="Loading"` and holds four skeleton cards; when loaded, both attributes are removed. (L2-039)
- **AC-4** Given the loaded areas replace the skeletons, when the swap happens, then nothing below the list moves (CLS 0 for the replacement). (L2-048)

### Keyboard and focus

- **AC-5** Given a keyboard user on the home page, when they tab into the areas, then each card receives focus in order 01–04 with a visible 2 px focus ring of at least 3:1 and Enter follows its link. (L2-050)

### Screen readers

- **AC-6** Given the "Meetups and events" link, when a screen reader focuses it, then it announces "Meetups and events, link" with the description "Demo nights, prayer breakfasts and workshops across the GTA.", and does not read "03", the icon or "Explore". (L2-050)

### Theming

- **AC-7** Given the light and dark themes, when the areas render, then the title, promise, index and "Explore" each have at least 4.5:1 contrast on the card and the glyph at least 3:1 on its tile. (L2-050)
- **AC-8** Given a theme change, when the areas re-render, then colours change without component code because only design-system tokens are used. (L2-051)

### Responsive

- **AC-9** Given a 360 px viewport, when the areas render, then they stack in one column with no horizontal scroll. (L2-049)
- **AC-10** Given a 768 px viewport, when the areas render, then they sit in two columns. (L2-049)
- **AC-11** Given a 1280 px viewport, when the areas render, then the four sit in one row, matching `pages/home/default` within the visual-parity threshold. (L2-049)

### Motion

- **AC-12** Given `prefers-reduced-motion: reduce`, when a card is hovered, then it does not move and only its shadow changes to `--shadow-2`. (L2-050)

### Content

- **AC-13** Given the component source, when it renders with the en-CA catalogue, then the title, promise, go label and busy label come from inputs and the component hard-codes no copy. (L2-052)

### Performance

- **AC-14** Given a change to the area's template, inputs or styles, when the perf test runs `FeatureArea` and `FeatureAreas` against the base branch, then neither is flagged as a possible regression. (L2-048)

## Implementation notes

- Folder `frontend/projects/components/src/lib/feature-area/`: `feature-areas.ts` (`FeatureAreas`,
  selector `ul[bn-feature-areas]`), `feature-area.ts` (`FeatureArea`, selector `a[bn-feature-area]`),
  `feature-area.css`; export both from `public-api.ts`.
- Move `.areas`, `.area*` and their motion rules out of `pages/home/home.css`; the built home page
  currently inlines the four cards and an `#explore` template, which become four
  `a[bn-feature-area]`.
- Generate the title and text ids per instance (a counter), for `aria-labelledby` and
  `aria-describedby`.
- Add the `FeatureArea` and `FeatureAreas` perf-test scenarios and export them from `index.ts`.

## Decisions

- **D-1** *A whole card as one link reads every word as its name. How is it named?* By the title
  (`aria-labelledby`) and described by the promise (`aria-describedby`), so the name is short, the
  visible label is the name, and "01" and "Explore" are not repeated four times.
- **D-2** *How are the four icons supplied?* As an `icon` input with the four area values, each
  rendering the mock's exact glyph, because the variants on the design-system page are exactly the
  four areas and no icon set exists in the library yet.
- **D-3** *The design-system page renders the directory card for all four variants. What do the
  others contain?* The home page mock's copy, glyphs and routes, listed in Usage.
- **D-4** *Does focus lift the card like hover?* No. The kit lifts on `:hover` only; the focus ring
  already marks the card, and moving it on focus would shift the ring.
- **D-5** *The areas are static copy; why a loading state?* `pages/home/loading` shows four skeleton
  cards in the list with `aria-busy`, and L2-039 asks for skeletons while the page loads; the list
  supports it so the page can match the mock.
- **D-6** *Heading level?* Always `h3`, under the section's `h2`, as in the design system and mock.
