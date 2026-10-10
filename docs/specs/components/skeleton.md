# Skeleton

| Field | Value |
|---|---|
| Selector | `span[bn-skeleton]`, `div[bn-skeleton-card]` |
| Library path | `frontend/projects/components/src/lib/skeleton/` |
| Status | planned |
| Traces to | L2-007, L2-009, L2-011, L2-018, L2-026, L2-027, L2-030, L2-035, L2-048, L2-049, L2-050, L2-051 |
| Design system | [`skeleton.html`](../../design-system/components/skeleton.html) |
| Source mocks | [`pages/directory/loading`](../../mocks/pages/directory/loading.html), [`pages/home/loading`](../../mocks/pages/home/loading.html), [`pages/dashboard/loading`](../../mocks/pages/dashboard/loading.html), [`pages/builder-profile/loading`](../../mocks/pages/builder-profile/loading.html), [`pages/profile-edit/loading`](../../mocks/pages/profile-edit/loading.html), [`pages/project-detail/loading`](../../mocks/pages/project-detail/loading.html), [`pages/project-edit/loading`](../../mocks/pages/project-edit/loading.html), [`pages/projects/loading`](../../mocks/pages/projects/loading.html), [`pages/events/loading`](../../mocks/pages/events/loading.html), [`pages/event-detail/loading`](../../mocks/pages/event-detail/loading.html), [`pages/matching/loading`](../../mocks/pages/matching/loading.html), [`pages/messages/loading`](../../mocks/pages/messages/loading.html), [`pages/notifications/loading`](../../mocks/pages/notifications/loading.html), [`pages/settings/loading`](../../mocks/pages/settings/loading.html) |
| Rendering | [`skeleton.html`](skeleton.html) |

## Purpose and scope

A skeleton holds the place of content that is still loading, in the shape and size that content will
have: a title bar where the builder's name will be, a square where the photo will be, lines where the
bio will be. When the data arrives the real layout replaces it without moving anything around it
(L2-048). It quietly pulses so the page does not look broken.

The library gives two pieces: **`span[bn-skeleton]`**, one placeholder shape, and
**`div[bn-skeleton-card]`**, the bordered card that groups shapes, with a ready-made "media" layout for
the person, project and event cards that repeat in lists.

Use a [spinner](spinner.md) inside a control that is working, and a [progress bar](progress-bar.md)
when progress is known. Use the [empty state](empty-state.md) or an [alert](alert.md) when loading
failed.

Out of scope:

- The loading region around the skeletons: the page's container carries `aria-busy="true"` and an
  `aria-label` ("Loading builders"), and the page swaps skeletons for content. This CRD states the rules
  that region must follow (see *Accessibility*) but does not render it.
- How many skeletons a page shows (12 directory cards per L2-009, 3 matches, 5 notifications); each page
  decides from its final layout.

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `directory`, `projects`, `home` (areas, people, projects), `dashboard` (matches, events), `matching`, `events`, `event-detail` (attendees), `project-detail` (feedback) | `div[bn-skeleton-card] layout="media"` per list item: photo + two lines in the top row, then a full and a short line | — | loading (pulsing) | card on the canvas |
| `builder-profile`, `project-detail`, `dashboard` aside | `div[bn-skeleton-card]` with projected shapes: title + 2–3 text lines + short line; title + pill; one block | — | loading | card |
| `builder-profile` header, `profile-edit` | `span[bn-skeleton]` with `width="6rem" height="6rem" radius="lg"` (the 96 px photo); title; text at 40 %; pill `width="7rem" height="var(--control-height-lg)"` (the action button) | — | loading | canvas |
| `profile-edit`, `project-edit`, `settings` | `span[bn-skeleton] shape="block"` at `height="var(--control-height-lg)"` (inputs) and full blocks (text areas, sections); title; text | — | loading | canvas / form card |
| `home` events, `events` | shapes in the event row: photo, text at 50 %, short text | — | loading | list row |
| `messages` inbox | photo `width="2.5rem" height="2.5rem"`, text at 50 %, short text | — | loading | inbox list |
| `notifications` | photo `width="2.75rem" height="2.75rem"`, text at 55 %, full text, text `width="4rem"` (time) | — | loading | notice list |
| `event-detail` header | block `width="6rem"` (date tile), title, text | — | loading | canvas |
| Design-system page | text, title, circle, rectangle (block), card, row | "Loading builders" | loading | canvas |

Every row is buildable with the API below.

## Anatomy

`span[bn-skeleton]`:

1. **Shape** — `span.skeleton` (+ `.skeleton--{shape}`, + `.is-short`). A block of `--color-bg-subtle`
   with the shape's size and radius. `aria-hidden="true"`.

`div[bn-skeleton-card]`:

1. **Card** — `div.skeleton-card`, `aria-hidden="true"`. Grid with `--space-4` gap, `--space-6`
   padding, surface fill, hairline border, `--radius-lg`.
2. **Top row (media layout)** — `div.skeleton-card__top`: a photo shape and a column with a 60 % text
   line and a short text line.
3. **Lines (media layout)** — a full text line and a short text line under the top row.
4. **Projected shapes (custom layout)** — whatever `span[bn-skeleton]` children the page projects.

Hosts: both are attribute components on native elements, so the DOM matches the mocks exactly
(`<span class="skeleton …">`, `<div class="skeleton-card">`).

## API

### Inputs

`span[bn-skeleton]`:

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `shape` | `'text' \| 'title' \| 'photo' \| 'circle' \| 'block' \| 'pill' \| 'none'` | `'text'` | no | Adds `.skeleton--{shape}`; `none` adds no modifier (a bare `.skeleton` sized only by `width`/`height`). |
| `short` | `boolean` (`booleanAttribute`) | `false` | no | Adds `.is-short` (60 % width); only meaningful with `text`. |
| `width` | `string` | — | no | Inline `width`: a percentage, a `rem` length matching the final element, or `var(--token)`. |
| `height` | `string` | — | no | Inline `height`, same rules (for example `var(--control-height-lg)` for an input). |
| `radius` | `'sm' \| 'md' \| 'lg' \| 'full'` | — | no | Inline `border-radius: var(--radius-{value})`, to match the final element's corners. |

`div[bn-skeleton-card]`:

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `layout` | `'custom' \| 'media'` | `'custom'` | no | `media` renders the top row and two lines itself; `custom` renders only projected content. |

### Outputs

None.

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `div[bn-skeleton-card]` default | `span[bn-skeleton]` elements (and plain layout `div`s) | Rendered in `custom` layout; ignored in `media` layout. |
| `span[bn-skeleton]` | None | The shape is empty. |

## Variants and sizes

| Shape | Modifier | Size | Radius | Stands in for |
|---|---|---|---|---|
| Text | `.skeleton--text` | full width × `--size-skeleton--text-height-31`, `--space-3` above | `--radius-sm` | A line of body text |
| Text, short | `.skeleton--text.is-short` | 60 % width | `--radius-sm` | The last line of a paragraph, a meta line |
| Title | `.skeleton--title` | 55 % × `--space-8` | `--radius-sm` | A heading |
| Photo | `.skeleton--photo` | `--space-16` square (overridable) | `--radius-md` | A portrait or event tile |
| Circle | `.skeleton--circle` | `--space-12` square | `--radius-full` | A round avatar |
| Block | `.skeleton--block` | full width × `--space-32` (overridable) | `--radius-lg` | A text area, a card body, an input when given a control height |
| Pill | `.skeleton--pill` | `--space-20` × `--size-switch-control-height-24` (overridable) | `--radius-full` | A chip or a button |
| None | — | only `width`/`height` | `--radius-sm` unless `radius` | A one-off geometry such as the 96 px profile photo |

| Card layout | Contents |
|---|---|
| `media` | top row (photo + 60 % line + short line), then a full line and a short line |
| `custom` | the projected shapes |

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Loading (pulsing) | rendered, motion allowed | Opacity eases to 0.55 and back every `--duration-breath` with `--ease-breath` | Hidden; the page's region is `aria-busy="true"` with a name |
| Loading (still) | `prefers-reduced-motion: reduce` | Static `--color-bg-subtle` shapes | Same |
| Replaced | data arrives | The page removes the skeletons and renders content in the same boxes | The region drops `aria-busy`; content is read |

No interaction states: skeletons are never focusable or clickable.

## Markup

```html
<!-- rendered: media card in a list (pages/directory/loading) -->
<ul class="results" aria-busy="true" aria-label="Loading builders">
  <li>
    <div aria-hidden="true" class="skeleton-card">
      <div class="skeleton-card__top">
        <span aria-hidden="true" class="skeleton skeleton--photo"></span>
        <div><span aria-hidden="true" class="skeleton skeleton--text" style="width: 60%"></span><span aria-hidden="true" class="skeleton skeleton--text is-short"></span></div>
      </div>
      <span aria-hidden="true" class="skeleton skeleton--text"></span>
      <span aria-hidden="true" class="skeleton skeleton--text is-short"></span>
    </div>
  </li>
  <!-- … one per final card -->
</ul>
```

```html
<!-- rendered: custom card (pages/builder-profile/loading) -->
<div aria-hidden="true" class="skeleton-card">
  <span aria-hidden="true" class="skeleton skeleton--title"></span>
  <span aria-hidden="true" class="skeleton skeleton--pill"></span>
</div>
```

```html
<!-- rendered: one-off geometry (pages/profile-edit/loading) -->
<span aria-hidden="true" class="skeleton" style="width: 6rem; height: 6rem; border-radius: var(--radius-lg)"></span>
<span aria-hidden="true" class="skeleton skeleton--block" style="height: var(--control-height-lg)"></span>
```

```html
<!-- consumer -->
<ul class="results" aria-busy="true" [attr.aria-label]="'directory.loading' | translate">
  @for (i of placeholders; track i) { <li><div bn-skeleton-card layout="media"></div></li> }
</ul>

<div bn-skeleton-card>
  <span bn-skeleton shape="title"></span>
  <span bn-skeleton shape="pill"></span>
</div>

<span bn-skeleton shape="none" width="6rem" height="6rem" radius="lg"></span>
<span bn-skeleton shape="text" width="60%"></span>
<span bn-skeleton shape="text" short></span>
```

Page objects locate loading states by the region's `[aria-busy="true"]`, `.skeleton-card` and
`.skeleton`.

## Design

- Shapes: `display: block`; fill `--color-bg-subtle`; radius `--radius-sm` unless the shape sets one.
- Shape sizes as in *Variants and sizes*; text lines carry `margin-top: var(--space-3)` so stacked
  lines match body line spacing.
- Card: `display: grid; gap: var(--space-4); padding: var(--space-6)`; radius `--radius-lg`; fill
  `--color-bg-surface`; border `--border-width-hairline` `--color-border-default`. Top row: flex,
  `align-items: center`, gap `--space-4`, the text column `flex: 1`.
- Motion: `animation: shimmer var(--duration-breath) var(--ease-breath) infinite` (opacity 0.55 at the
  midpoint), only inside `prefers-reduced-motion: no-preference`.
- Geometry rule: every skeleton matches the final element's box (width, height, radius, margins), so
  the replacement causes no layout shift (L2-048).

Component tokens: none.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Shape fill | `--color-bg-subtle` | `--palette-oat-200` | `--palette-night-800` |
| Card fill | `--color-bg-surface` | `--palette-birch-50` | `--palette-night-900` |
| Card border | `--color-border-default` | `--palette-oat-300` | `--palette-night-700` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-bg-subtle` | `--color-bg-surface` | none (decorative, hidden from assistive technology) | Shape on a card |
| `--color-bg-subtle` | `--color-bg-canvas` | none (decorative) | Shape on the page |

Skeletons convey no information, so WCAG 1.4.11 does not apply; the region's accessible name
("Loading builders") carries the meaning. In forced-colours mode the shapes may disappear, which is
acceptable for the same reason.

## Responsive behaviour

- Skeletons inherit the page's responsive layout: the same grid that places twelve builder cards in two
  columns at 768 px places twelve skeleton cards there (L2-049).
- Percent widths scale with their container; `rem` geometry (the 96 px profile photo) stays fixed, as
  the final element does.
- At 320 px no skeleton overflows its column and the page has no horizontal scroll.

## Accessibility

### Role and pattern

Every shape and card is `aria-hidden="true"`: placeholders are never narrated one by one. The page's
loading region (out of scope) must have `aria-busy="true"` and an accessible name ("Loading builders",
"Loading your dashboard"), or a heading inside it, so assistive technology knows the section is
loading.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Never stops on a skeleton. Real controls in the loading page (the sort select, "Filters") stay reachable. |

### Focus

Skeletons never take focus. Replacing them does not move focus.

### Labelling

None on the skeletons; the region's name says what is loading.

### Announcements

When loading completes, the page removes `aria-busy` and the new content becomes available; outcomes
that matter (a results count) are announced by the page's own live text (L2-050).

### Motion

The pulse stops under `prefers-reduced-motion: reduce`; shapes stay as static blocks (L2-050).

## Content and internationalisation

Skeletons hold no copy. The loading region's name ("Loading builders", "Loading your profile") comes
from the catalogue through the page.

## Performance

- Change detection: `OnPush`; inputs are signals; classes and inline styles are `computed`.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Skeleton.ts` renders one
  `bn-skeleton-card` in the media layout (the builder card placeholder) plus the profile header shapes
  (96 px photo, title, 40 % line, pill); iterations in `e2e/perf-test/config/scenario-iterations.mjs`
  keep it at roughly 100–300 ms.
- Composite scenario: `SkeletonList.ts` renders the directory's loading list of twelve media cards in
  the two-column results grid, the render-heavy repetition.
- Layout stability: geometry matches the final layout; the CLS of replacing skeletons with content is 0
  (L2-048).
- Weight: `@angular/core` only; the animation is pure CSS.

## Acceptance criteria

### Rendering

- **AC-1** Given the directory is loading, when its results list renders, then it holds twelve `div.skeleton-card` placeholders in the media layout, each with a photo shape, a 60 % line and a short line in `.skeleton-card__top`, then a full and a short text line. (L2-009)
- **AC-2** Given a `div[bn-skeleton-card]` with projected `span[bn-skeleton] shape="title"` and `shape="pill"`, when it renders, then the card contains exactly `.skeleton.skeleton--title` and `.skeleton.skeleton--pill`, in that order. (L2-011)
- **AC-3** Given `<span bn-skeleton shape="none" width="6rem" height="6rem" radius="lg">`, when it renders on the profile-edit loading page, then the span has class `skeleton` only and an inline width and height of 6rem and a `--radius-lg` radius, matching the profile photo it stands in for. (L2-007)
- **AC-4** Given `<span bn-skeleton shape="text" short>`, when it renders, then it has `.skeleton--text.is-short` and is 60 % of its container's width. (L2-027)

### Layout stability

- **AC-5** Given Amara's profile page is loading, when the profile data arrives and replaces the skeletons, then the header and the two columns keep their positions and the measured layout shift of the replacement is 0. (L2-048)
- **AC-6** Given the dashboard is loading, when it renders, then it shows media skeleton cards in the matches section and a custom card in the aside, in the same columns the loaded dashboard uses. (L2-030)
- **AC-7** Given the settings page is loading, when it renders, then a title, two blocks and a text line hold the places of the sections, and the loaded page replaces them in the same boxes. (L2-035)
- **AC-8** Given the events list is loading, when it renders, then each event row shows a photo shape, a 50 % line and a short line in the row's final grid. (L2-018)
- **AC-9** Given the messages inbox is loading, when it renders, then each inbox row shows a 2.5 rem photo shape and two lines, and the thread pane keeps its final width. (L2-026)

### Screen readers

- **AC-10** Given any skeleton shape or card, when the accessibility tree is inspected, then it is hidden (`aria-hidden="true"`) and has no role or name. (L2-050)
- **AC-11** Given the directory is loading, when a screen reader reaches the results list, then it reads the region's name "Loading builders" and its busy state, and none of the placeholders. (L2-050)
- **AC-12** Given a loading page, when it is navigated with Tab, then no skeleton is a tab stop and the real controls on the page stay reachable. (L2-050)

### Theming

- **AC-13** Given the theme switches while a page is loading, when the skeletons re-render, then their fill, the card surface and the border change through `--color-bg-subtle`, `--color-bg-surface` and `--color-border-default` alone. (L2-051)

### Responsive

- **AC-14** Given a 768 px viewport, when the directory is loading, then the skeleton cards sit in the same two-column grid as the loaded cards; given 320 px, then they are one column with no horizontal scroll. (L2-049)

### Motion

- **AC-15** Given motion is allowed, when skeletons render, then they pulse to 0.55 opacity and back every `--duration-breath`; given `prefers-reduced-motion: reduce`, then they do not animate. (L2-050)

### Performance

- **AC-16** Given a change to the skeleton components, when the perf test runs `Skeleton` and `SkeletonList` against the base branch with `--fail-on-regression`, then neither is flagged as a possible regression. (L2-048)

## Implementation notes

- Folder `frontend/projects/components/src/lib/skeleton/`, files `skeleton.ts` (`Skeleton`, selector
  `span[bn-skeleton]`) and `skeleton-card.ts` (`SkeletonCard`, selector `div[bn-skeleton-card]`), style
  `skeleton.css` with the `.skeleton*` and `.skeleton-card*` rules and the `shimmer` keyframe from
  `components.css`.
- Host bindings: `class`, `aria-hidden="true"`, `[style.width]`, `[style.height]`,
  `[style.border-radius]` (`var(--radius-{radius})`).
- `SkeletonCard` in `media` layout renders `span[bn-skeleton]` children itself (it imports `Skeleton`).
- Export both from `public-api.ts`; add `Skeleton.ts` and `SkeletonList.ts` to the perf-test scenarios
  and `index.ts`.

## Decisions

- **D-1** *Element or attribute components?* Attribute components on `<span>` and `<div>`, so the
  rendered DOM is the mocks' `span.skeleton` and `div.skeleton-card` with no wrapper that could change
  the grid or flex layout around them.
- **D-2** *Does every shape get `aria-hidden`?* Yes, including shapes outside a hidden card (the mocks
  leave some unmarked, for example in `settings/loading`); empty shapes have nothing to say and the
  region's name covers the meaning (design system: "Skeleton shapes are aria-hidden").
- **D-3** *How do pages express one-off geometry such as the 96 px profile photo?* With `width`,
  `height` and `radius` inputs, as the mocks do with inline styles. Values are tokens where a token
  exists (`var(--control-height-lg)`) and the final element's own `rem` size otherwise.
- **D-4** *Is the repeated card layout a component input or page markup?* The `media` layout is built
  in, because 39 placeholders across eight pages repeat it exactly; anything else is projected.
- **D-5** *The design system shows a circle shape no mock uses; keep it?* Yes (`shape="circle"`), for
  round avatars, so the API does not change when a screen first needs it.
- **D-6** *How many directory skeleton cards?* Twelve, as L2-009 criterion 7 requires and as one page of
  results holds. The `directory/loading` mock draws six; the page follows L2. Listed for the lead.
