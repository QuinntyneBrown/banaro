# Container, grid and stack

| Field | Value |
|---|---|
| Selector | None: global layout utility classes `.wrap`, `.grid`, `.stack`, `.stack--sm`, `.stack--lg`, `.stack--end`, `.cluster`, `.cluster--between`, `.cluster--top`, `.two-col`, `.narrow`, `.page-block` (see D-1) |
| Library path | `frontend/projects/components/src/styles/layout.css` (`.wrap` stays in `base.css`) |
| Status | planned |
| Traces to | L2-030, L2-048, L2-049, L2-050, L2-051 |
| Design system | [`container-grid-stack.html`](../../design-system/components/container-grid-stack.html), [layout foundation](../../design-system/foundations/layout.html) |
| Source mocks | [`pages/dashboard/default`](../../mocks/pages/dashboard/default.html), [`pages/builder-profile/default`](../../mocks/pages/builder-profile/default.html), [`pages/event-detail/default`](../../mocks/pages/event-detail/default.html), [`pages/settings/default`](../../mocks/pages/settings/default.html), [`pages/about/default`](../../mocks/pages/about/default.html), [`pages/project-new/default`](../../mocks/pages/project-new/default.html), [`pages/messages/default`](../../mocks/pages/messages/default.html), [`pages/notifications/default`](../../mocks/pages/notifications/default.html), every other page, dialog and notification (`.wrap`) |
| Rendering | [`container-grid-stack.html`](container-grid-stack.html) |

## Purpose and scope

The layout primitives every Banaro screen is composed from: the centred **container** that caps
content at 74 rem inside the responsive page margins, the **grid** of equal cards, the vertical
**stack** and the wrapping horizontal **cluster**, plus the three page templates the layout
foundation names: the **two-column** reading column with an aside, the **narrow** single-column
reading area for forms and legal pages, and the **page block** that spaces blocks under a page
header. They keep the mocks' generous spacing without each page inventing its own.

They are passive: no state, no events, no copy. Use [page-header](page-header.md) for the heading
block, the [card](card.md) for a framed surface (`.aside-card` belongs to it), and the
[form-layout](form-layout.md) for field rows and form sections.

Out of scope:

- The home page section wrapper `.section` with `.section__head`, `.section__title` and
  `.section__more` (D-7).
- Outer margins between blocks that a single page needs (`margin-top: var(--space-8)` above a
  stack); the consuming page's stylesheet sets them with `--space-*` tokens.
- The directory's filter sidebar and result grid, the inbox `.split`, the settings layout and the
  profile header, which belong to their own components.
- Loading content: skeletons belong to [skeleton](skeleton.md); these primitives only carry
  `aria-busy` while a skeleton fills them.

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| Every page, dialog and notification mock (49 screens) | `div.wrap` around `main` content | page content | default | canvas |
| Built [top-bar](top-bar.md), [footer](footer.md), [banner](banner.md) | `.wrap` mixed into `.header__inner`, `.footer__grid`, `.banner__inner` | their own content | default | canvas, banner |
| `pages/dashboard/*`, `pages/builder-profile/*`, `pages/event-detail/*`, `pages/project-detail/*`, `pages/matching/*`, dialogs over them | `div.two-col`: main column + `aside` | main `div.stack.stack--lg` + `aside.stack[aria-label]` of aside cards | default; loading `aria-busy="true" aria-label="Loading your dashboard"` | canvas |
| `pages/settings/*`, `pages/notifications/*`, `pages/events/*`, `pages/builder-profile/*`, `pages/event-detail/*`, `pages/project-detail/*`, `pages/matching-setup/*` | `div.stack.stack--lg` of `section`s | sections with `h2.section__title` | default; `pages/events/loading` `aria-busy="true"` | canvas |
| `pages/dashboard/*`, `pages/matching/*`, `dialogs/pass-suggestion`, `dialogs/pause-matching` | `ul.stack` / `section.stack[aria-label]` | list items (suggestions, matches) | default | canvas |
| `pages/builder-profile/*`, `dialogs/report`, `dialogs/block-builder` | `div.stack` with gap `--space-2` | name, role, place, status | default | canvas, dialog |
| `pages/project-detail/*`, `dialogs/give-feedback`, `dialogs/offer-to-help` | `ul.stack` with gap `--space-2` | help offers | default | surface |
| `pages/dashboard/*`, `pages/messages/*`, `notifications/connection-banner/*` | `div.stack` gap `--space-2`, items aligned to the end | inbox time + unread count | default | surface |
| `pages/messages/*` | `div.stack[role=log][aria-label]` | message bubbles | default, send-failed | surface |
| `pages/onboarding/*` | `fieldset.stack` | goal checkboxes | default, invalid | surface |
| `pages/settings/loading` | `div.stack[aria-busy=true]` | skeletons | loading | canvas |
| `dialogs/delete-project/*`, `dialogs/block-builder/*` | `ul.stack` (bulleted, indented) | consequences list | default, busy | dialog |
| `pages/about`, error pages (`not-found`, `forbidden`, `server-error`, `offline`, `maintenance`), `pages/builder-profile` | `div.cluster` | buttons ("Join Banaro", "Contact us"; "Browse builders", "Go to your dashboard") | default | canvas |
| `pages/dashboard/*`, `pages/matching/*` | `div.cluster` | `btn--sm` "Say hello", "Pass" | default | surface |
| `pages/event-detail/*`, `dialogs/cancel-rsvp`, `notifications/rsvp-toast/*` | `ul.cluster[aria-label="Some of the people going"]`; `div.cluster` aligned to the top | avatars; RSVP details | default, going, waitlist | surface |
| `pages/dashboard/*`, `pages/notifications/*`, `pages/projects/*`, `pages/project-detail/*`, `dialogs/give-feedback`, `dialogs/offer-to-help`, `notifications/account-banner`, `notifications/site-banner` | `div.cluster.cluster--between` | heading + action ("New" + "Mark all as read") | default, read | canvas |
| `pages/project-new/*`, `pages/project-edit/*`, `pages/matching-setup/*`, `pages/profile-edit/*`, `dialogs/change-photo`, `dialogs/session-expired`, `dialogs/delete-project` | `div.narrow` (with page padding on profile-edit) | breadcrumb, page header, form card | default, invalid, submitting, success, loading `aria-busy` | canvas |
| `pages/about`, `pages/code-of-conduct`, `pages/contact`, `pages/privacy` | `div.narrow.page-block` | page header + prose / form | default, invalid, submitting, success | canvas |
| `pages/project-new/*`, `pages/project-edit/*`, `pages/project-detail/error` | `div.page-block` (first block flush: `padding-top: 0`) | form, empty state | default, error | canvas |
| None yet | `.grid` | equal cards | default | canvas |

Every row is buildable with the classes below. The inline `style="gap: var(--space-2)"`,
`justify-items: end` and `align-items: flex-start` in the mocks become the `.stack--sm`,
`.stack--end` and `.cluster--top` modifiers (D-3).

## Anatomy

1. **Container** — `.wrap`. Full width up to `--layout-container-max` plus two
   `--layout-margin`s, centred, with `--layout-margin` side padding. Outer margins and content cap.
2. **Grid** — `.grid`. Auto-fit columns no narrower than `--layout-card-min` (or 100 % when the
   space is narrower), separated by `--layout-gutter`.
3. **Stack** — `.stack`. One column; children separated by the vertical spacing role.
   Modifiers `.stack--sm`, `.stack--lg`, `.stack--end`.
4. **Cluster** — `.cluster`. A wrapping row of items, vertically centred, `--space-3` apart.
   Modifiers `.cluster--between`, `.cluster--top`.
5. **Two-column** — `.two-col`. One column below 1024 px; from 1024 px a fluid main column and an
   aside of `--size-two-col-grid-template-columns-34`, `--space-12` apart.
6. **Narrow** — `.narrow`. Caps a reading or form column at `--size-search-max-width-18`.
7. **Page block** — `.page-block`. Top padding `--space-10` below a page header; consecutive
   blocks `--space-12` apart.

There is no Angular host: each class goes on the semantic element the content needs (`div`,
`section`, `aside`, `ul`, `ol`, `fieldset`, `main`), so lists stay lists and landmarks stay
landmarks.

## API

### Inputs

None. These are global CSS classes, not components (D-1). The classes are the API:

| Class | On | Rule |
|---|---|---|
| `.wrap` | any block element, usually the first child of `main`, `header`, `footer` | Exactly one per horizontal band; never nested. |
| `.grid` | `ul`, `ol`, `div` | Children are equal-width cells; use for cards of one kind. |
| `.stack` | any block element | Gap `--space-5`. |
| `.stack--sm` | with `.stack` | Gap `--space-2` (tight groups: name, role, place). |
| `.stack--lg` | with `.stack` | Gap `--space-8` (sections of a page column). |
| `.stack--end` | with `.stack` | Children align to the inline end (`justify-items: end`). |
| `.cluster` | `div`, `ul`, `p` | Wraps; gap `--space-3`; items centred on the cross axis. |
| `.cluster--between` | with `.cluster` | `justify-content: space-between` (heading left, action right). |
| `.cluster--top` | with `.cluster` | Items align to the top (`align-items: flex-start`). |
| `.two-col` | `div` | First child is the main column, second the `aside`; DOM order is reading order. |
| `.narrow` | `div` | Caps width; combine with `.page-block` or `.stack`. |
| `.page-block` | `div`, `section` | Vertical rhythm under a page header. |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| None — layout has no behaviour. | | |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| None — the classes go on the consumer's own elements. | | |

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Container | `.wrap` | The page band: main content, header, footer, banners. |
| Grid | `.grid` | Equal cards that reflow by available width. |
| Stack | `.stack`, `.stack--sm`, `.stack--lg`, `.stack--end` | Vertical groups: sections (`--lg`), cards and lists (default), name blocks (`--sm`), right-aligned meta (`--end`). |
| Cluster | `.cluster`, `.cluster--between`, `.cluster--top` | Button rows, avatar rows, heading-plus-action rows. |
| Two-column | `.two-col` | Detail pages: reading column plus aside. |
| Narrow | `.narrow` | Forms and legal reading pages. |
| Page block | `.page-block` | Blocks after a page header. |

| Size | Modifier | Height | Padding | Type |
|---|---|---|---|---|
| One content-driven size | — | content | `--layout-margin` (container only) | inherited |

The width of the container comes from `--layout-container-max`; the spacing roles come from
`--layout-margin` and `--layout-gutter`, which change by breakpoint (Responsive behaviour).

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Layout only | Nothing announced; no role added |
| Loading | `aria-busy="true"` and an `aria-label` on the `.two-col` or `.stack` that a skeleton fills | Unchanged layout; skeletons inside | Region reports busy with its label ("Loading your dashboard") |
| Hover, focus, active, disabled | — | Not applicable: layout wrappers are not focusable or interactive | — |

## Markup

```html
<!-- rendered: container -->
<main id="main"><div class="wrap">…</div></main>
```

```html
<!-- rendered: two-column page with a stacked main column and aside (pages/builder-profile/default) -->
<div class="two-col">
  <div class="stack stack--lg">
    <section aria-labelledby="about-title"><h2 class="section__title" id="about-title">About</h2>…</section>
    <section aria-labelledby="skills-title"><h2 class="section__title" id="skills-title">Skills</h2>…</section>
  </div>
  <aside class="stack" aria-label="About Daniel">
    <div class="aside-card">…</div>
    <div class="aside-card">…</div>
  </aside>
</div>
```

```html
<!-- rendered: loading (pages/dashboard/loading) -->
<div class="two-col" aria-busy="true" aria-label="Loading your dashboard">…skeletons…</div>
```

```html
<!-- rendered: tight stack and end-aligned stack -->
<div class="stack stack--sm"><h1 class="profile-head__name">Daniel Reyes</h1><p class="muted">Full-stack engineer</p></div>
<div class="stack stack--sm stack--end"><span class="inbox__time">8:42 am</span><span class="badge badge--count" aria-hidden="true">1</span></div>
```

```html
<!-- rendered: clusters -->
<div class="cluster"><a class="btn btn--quiet" href="/builders">Browse builders</a><a class="btn btn--quiet" href="/dashboard">Go to your dashboard</a></div>
<div class="cluster cluster--between"><h2 class="section__title" id="new-title">New</h2><button type="button" class="btn btn--quiet btn--sm">Mark all as read</button></div>
<ul class="cluster" aria-label="Some of the people going"><li>…</li></ul>
```

```html
<!-- rendered: narrow page block (pages/about/default) -->
<div class="wrap"><div class="page-block narrow"><bn-page-header …></bn-page-header><div class="prose">…</div></div></div>
```

```html
<!-- rendered: grid -->
<ul class="grid"><li>…</li><li>…</li><li>…</li></ul>
```

```html
<!-- consumer (Angular template) -->
<div class="wrap">
  <div class="two-col" [attr.aria-busy]="loading() || null" [attr.aria-label]="loading() ? ('dashboard.loading' | t) : null">
    <div class="stack stack--lg">…</div>
    <aside class="stack" [attr.aria-label]="'profile.aside' | t: { name: builder().firstName }">…</aside>
  </div>
</div>
```

The class names are the contract: e2e page objects and visual parity depend on them.

## Design

- Container: `max-width: calc(var(--layout-container-max) + 2 * var(--layout-margin))`,
  `margin-inline: auto`, `padding-inline: var(--layout-margin)`, `width: 100%`.
- Grid: `grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--layout-card-min)), 1fr))`,
  gap `--layout-gutter`.
- Stack: `display: grid`; gap `--space-5`; `.stack--sm` `--space-2`; `.stack--lg` `--space-8`;
  `.stack--end` `justify-items: end`.
- Cluster: `display: flex; flex-wrap: wrap; align-items: center`; gap `--space-3`;
  `.cluster--between` `justify-content: space-between`; `.cluster--top` `align-items: flex-start`.
- Two-column: gap `--space-12`; from 64 rem
  `grid-template-columns: minmax(0, 1fr) var(--size-two-col-grid-template-columns-34)` and
  `align-items: start`.
- Narrow: `max-width: var(--size-search-max-width-18)`.
- Page block: `padding-block: var(--space-10) 0`; `.page-block + .page-block` `padding-top: var(--space-12)`.
- Every grid track uses `minmax(0, …)` so long names and URLs wrap inside the track instead of
  widening it.
- No colour, elevation, motion or layer of their own.

Component tokens:

| Token | Aliases | Overridden by |
|---|---|---|
| None — the primitives read the layout tokens directly. | | |

## Colour

The primitives paint nothing. Content inside them takes its colours from its own component.

| Part | Token | Light | Dark |
|---|---|---|---|
| Page behind the container | `--color-bg-canvas` | `--palette-oat-100` | `--palette-night-950` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-canvas` | 4.5:1 | Text placed directly in a container on the page |
| `--color-focus-ring` | `--color-bg-canvas` | 3:1 | Focus ring of controls inside a cluster |

## Responsive behaviour

| Range | `--layout-margin` | `--layout-gutter` | Two-column | Grid |
|---|---|---|---|---|
| Base (< 768 px) | `--space-5` (20 px) | 20 px | One column, aside after main | One column below `--layout-card-min` + gutter |
| MD (≥ 768 px) | 40 px | 32 px | One column | Two or more columns as width allows |
| LG (≥ 1024 px) | 64 px | 40 px | Main + aside side by side | As many 18 rem columns as fit |
| ≥ 1200 px | 64 px | 40 px | Same | Same; content capped at 74 rem |

- Clusters wrap onto further lines; they never scroll or clip.
- Stacks and narrow columns are fluid below their cap.
- At 320 px nothing scrolls horizontally or clips; at 200 % zoom everything stays available; the
  primitives never shrink a child's 44 × 44 CSS px touch target.

## Accessibility

### Role and pattern

Native semantics; [landmark regions](https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/).
The classes add no role. The consumer chooses the element: `ul`/`ol` for lists, `aside` with an
`aria-label` for asides, `section` with `aria-labelledby` for sections, `fieldset` with a `legend`
for grouped choices.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves through the controls inside in DOM order; the wrappers themselves are never focusable. |

### Focus

Layout never takes focus and never reorders it: no `order`, `grid-row` or `flex-direction:
*-reverse` on interactive children, so visual order equals DOM and tab order (design-system
do/don't). `.two-col` places the aside after the main column in the DOM.

### Labelling

`aria-label` on a busy region names what is loading ("Loading your dashboard"); an `aside` is
labelled by its subject ("About Daniel").

### Announcements

None. A busy region relies on `aria-busy`; the page announces completion through its own live
region (L2-050).

### Motion

None. The primitives do not animate.

## Content and internationalisation

- The primitives hold no copy. Labels on busy regions and asides are translatable strings from the
  catalogue, passed by the page.
- Wrapped clusters keep working for French copy about 30 % longer than English: buttons wrap to a
  new line rather than shrink.

## Performance

- Change detection: not applicable; plain CSS with no Angular code.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/ContainerGridStack.ts` renders the
  builder-profile body for Daniel Reyes: a `.wrap` holding a `.two-col` whose main column is a
  `.stack.stack--lg` of three sections and whose aside is a `.stack` of two aside cards, plus a
  `.cluster` with "Say hello" and "More"; iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly 100–300 ms.
- Composite scenarios: `DarkTheme`.
- Layout stability: the busy region keeps its final grid, so skeletons and content occupy the same
  tracks (L2-048).
- Weight: CSS only; no script.

## Acceptance criteria

### Rendering

- **AC-1** Given the home page in a 1440 px viewport, when the `.wrap` renders, then its content box is 74 rem wide, centred, with `--layout-margin` (64 px) on both sides. (L2-049)
- **AC-2** Given a 360 px viewport, when any page whose content sits in a `.wrap` renders, then the side padding is 20 px and the page has no horizontal scroll. (L2-049)
- **AC-3** Given `pages/builder-profile/default` for Daniel Reyes at 1280 px, when the `.two-col` renders, then the "About", "Skills" and "What Daniel is building" sections sit in a fluid left column and the aside "About Daniel" sits in a right column of `--size-two-col-grid-template-columns-34`, `--space-12` apart. (L2-049)
- **AC-4** Given the same page at 768 px, when the `.two-col` renders, then it is one column and the aside follows the main column. (L2-049)
- **AC-5** Given a `.stack.stack--lg` of settings sections, when it renders, then the sections are `--space-8` apart; a plain `.stack` is `--space-5`, a `.stack--sm` is `--space-2`. (L2-049)
- **AC-6** Given the dashboard inbox preview, when a `.stack.stack--sm.stack--end` holds "8:42 am" and the unread count, then both align to the inline end. (L2-030)
- **AC-7** Given a `.cluster.cluster--between` holding "New" and "Mark all as read" at 1280 px, when it renders, then the heading sits at the start and the button at the end; at 320 px the button wraps below the heading without overflow. (L2-049)
- **AC-8** Given the not-found page's `.cluster` with "Browse builders" and "Go to your dashboard" at 320 px, when the buttons do not fit on one line, then they wrap to a second line `--space-3` below and each keeps a 44 × 44 px target. (L2-049)
- **AC-9** Given a `.grid` of six builder cards at 1280 px, when it renders, then the columns are equal, at least `--layout-card-min` wide and `--layout-gutter` apart; at 360 px it is one column. (L2-049)
- **AC-10** Given `pages/about/default`, when the `.page-block.narrow` renders, then its content is capped at `--size-search-max-width-18` and starts `--space-10` below the top of the block. (L2-049)

### States

- **AC-11** Given `pages/dashboard/loading`, when the `.two-col` has `aria-busy="true"` and `aria-label="Loading your dashboard"`, then the skeletons occupy the same tracks as the loaded content, and replacing them moves no content outside the region (CLS 0). (L2-048)

### Keyboard and focus

- **AC-12** Given the builder profile at 1280 px, when the member tabs through it, then focus moves through the main column before the aside, matching the visual order, and no layout wrapper receives focus. (L2-050)

### Screen readers

- **AC-13** Given the event page's `ul.cluster` labelled "Some of the people going", when a screen reader reads it, then it is announced as a list with its label and item count; the class adds no role. (L2-050)

### Theming

- **AC-14** Given the dark theme, when a page using these classes renders, then no primitive sets a colour, background or border, and the CSS of the primitives contains only `--space-*`, `--layout-*` and `--size-*` tokens. (L2-051)

### Responsive

- **AC-15** Given a 1024 px viewport, when `--layout-margin` and `--layout-gutter` are read on a `.wrap`, then they are 64 px and 40 px; at 768 px they are 40 px and 32 px. (L2-049)

### Performance

- **AC-16** Given a change to `layout.css`, when the perf test runs the `ContainerGridStack` scenario against the base branch, then it is not flagged as a possible regression. (L2-048)

## Implementation notes

- Today `frontend/projects/components/src/styles/base.css` has `.wrap`, and `layout.css` has
  `.page-block`, `.narrow`, `.cluster` (declared twice, identically) and `.cluster--between`.
  Missing: `.grid`, `.stack`, `.stack--sm`, `.stack--lg`, `.stack--end`, `.cluster--top`,
  `.two-col`. Remove the duplicate `.cluster` rule.
- Declare `.stack--sm`, `.stack--lg` and `.stack--end` after `.stack` so they win (D-2).
- Pages replace the mocks' inline `style="gap: var(--space-2)"`, `justify-items: end` and
  `align-items: flex-start` with the modifiers; page-specific outer margins move into the page's
  stylesheet with `--space-*` tokens.
- Add the `ContainerGridStack` perf-test scenario and export it from `src/scenarios/index.ts`.
- Built components that mix `.wrap` into their own block (`top-bar`, `footer`, `banner`) keep doing
  so; they rely on the global class.

## Decisions

- **D-1** *Are the primitives Angular components or directives?* Neither: global utility classes in
  the `components` library's `styles/`. AGENTS.md limits global styles to "shared foundations and
  utilities", the built code already ships `.wrap`, `.narrow`, `.page-block` and `.cluster` this
  way, and a host element or directive would either break `ul > li` and grid-child relationships or
  add no behaviour.
- **D-2** *`components.css` declares `.stack` twice (`--space-5` near line 622 and `--space-4` near
  line 851); the later rule also overrides `.stack--lg`, so the mocks render `stack--lg` at 16 px.
  Which is right?* `.stack` is `--space-5` and `.stack--lg` is `--space-8`, the values the page
  layout section of the design system declares on purpose; the second rule is a specimen
  correction that collides by accident. The library declares the modifiers after the base rule.
  Raised to the lead for the design system to fix.
- **D-3** *The mocks write tight, end-aligned and top-aligned groups as inline styles. Do they get
  classes?* Yes: `.stack--sm` (`--space-2`), `.stack--end` and `.cluster--top`, so no page needs
  inline styles and the values stay tokens. The design-system page should add them.
- **D-4** *`.grid` has no mock usage. Keep it?* Yes, as the design system's grid variant, so a later
  card list needs no new primitive.
- **D-5** *The design-system page names only container, grid, stack and cluster; are `.two-col`,
  `.narrow` and `.page-block` in this CRD?* Yes: the layout foundation describes them as the page
  templates ("narrow single-column reading area", "reading column with an aside") and no other
  design-system page owns them.
- **D-6** *How is a loading region marked?* With `aria-busy="true"` and a translatable `aria-label`
  on the layout element itself, as the dashboard and events loading mocks do; the primitives add
  no busy styling.
- **D-7** *Does this CRD own `.section` and `.section__head`?* No. They are the home page's section
  heading block, not a generic layout primitive; they are listed for the lead to assign.
