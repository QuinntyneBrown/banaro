# Breadcrumb

| Field | Value |
|---|---|
| Selector | `bn-breadcrumb` |
| Library path | `frontend/projects/components/src/lib/breadcrumb/` |
| Status | planned |
| Traces to | L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`breadcrumb.html`](../../design-system/components/breadcrumb.html) |
| Source mocks | [`pages/builder-profile/default`](../../mocks/pages/builder-profile/default.html), [`pages/builder-profile/loading`](../../mocks/pages/builder-profile/loading.html), [`pages/project-detail/default`](../../mocks/pages/project-detail/default.html), [`pages/project-detail/error`](../../mocks/pages/project-detail/error.html), [`pages/project-edit/default`](../../mocks/pages/project-edit/default.html), [`pages/project-new/default`](../../mocks/pages/project-new/default.html), [`pages/event-detail/default`](../../mocks/pages/event-detail/default.html) |
| Rendering | [`breadcrumb.html`](breadcrumb.html) |

## Purpose and scope

The breadcrumb shows where a detail screen sits: "Builders / Daniel Reyes", "Projects / Psalter",
"Events / Fall Demo Night", "Projects / Harvest / Edit". Each ancestor is a link back up; the last
item is the current page as text.

Use a [link](link.md) or a quiet [button](button.md) for "Back to builders"-style recovery
actions, and the top bar's navigation for the four areas.

Out of scope:

- Deciding the path: the page passes the items (the router does not generate them).
- Spacing above and below (`padding-top`/`margin-top: var(--space-8)` in the mocks): the page
  layout applies it to the host.
- A history-based "Back" action (design-system don't).

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/builder-profile` `default`, `own`, `sparse`, `not-found`; `dialogs/report`, `dialogs/block-builder` (page behind) | 2 items | "Builders" → `/builders`; current "Daniel Reyes", "Amara Osei", "Esther Nguyen" | default, hover, focus | canvas |
| `pages/builder-profile` `loading`, `error` | 2 items, placeholder current | "Builders"; current "Builder" | loading, error | canvas |
| `pages/project-detail` `default`, `own`, `empty`, `not-found`; `dialogs/give-feedback`, `dialogs/offer-to-help` (page behind) | 2 items | "Projects" → `/projects`; current "Psalter", "Harvest", "Hearth" | default | canvas |
| `pages/project-detail` `loading`, `error` | 2 items, placeholder current | "Projects"; current "Project" | loading, error | canvas |
| `pages/project-edit` (all states), `dialogs/delete-project` (page behind) | 3 items | "Projects" → `/projects`; "Harvest" → `/projects/harvest`; current "Edit" | default | canvas |
| `pages/project-new` (all states) | 2 items | "Projects"; current "Share a project" | default | canvas |
| `pages/event-detail` (all states), `dialogs/cancel-rsvp`, `notifications/rsvp-toast` (page behind) | 2 items | "Events" → `/events`; current "Fall Demo Night" | default | canvas |
| Design-system specimen "collapsed" | same markup as full | "Builders / Daniel Reyes" | — | canvas |

## Anatomy

1. **Navigation landmark** — `nav` with `aria-label` ("Breadcrumb").
2. **Ordered ancestry** — `ol.breadcrumb`, a wrapping flex row, `--text-body-sm`,
   `--color-fg-muted`.
3. **Ancestor item** — `li > a`, a link styled by the base link rule.
4. **Separator** — `li + li::before`, content "/" in `--color-fg-subtle`, with `--space-2` after
   it; decorative and not announced (D-3).
5. **Current page** — the last `li` with `aria-current="page"`, plain text.

Host: `bn-breadcrumb` is `display: block`; it renders the `nav` and everything inside it. Page
spacing classes go on the host.

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `items` | `readonly BreadcrumbItem[]` where `BreadcrumbItem = { label: string; link?: string \| readonly unknown[] }` | — | yes | 2–4 items. Every item but the last needs `link` (a `routerLink` value); the last is the current page and its `link` is ignored. |
| `label` | `string` | — | yes | The `nav`'s `aria-label`, from the catalogue ("Breadcrumb"). |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| None | — | Navigation is by `routerLink`. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| None | — | Items are data so the separator, order and `aria-current` stay correct. |

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Full | `.breadcrumb` | Every detail screen; all levels shown and wrapped. |
| Collapsed | none (D-2) | The design system's collapsed specimen renders the same markup as full; no screen has more than three levels, so no collapse behaviour exists. |

One size: `--text-body-sm`; width comes from the labels.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Muted text, links in `--color-fg-link`, "/" separators | "Breadcrumb, navigation"; list of N items |
| Hover | `:hover` on a link | `--color-fg-link-hover` | — |
| Focus | `:focus-visible` on a link | Global focus ring | — |
| Active | `:active` on a link | Same as hover | — |
| Current | last item, `aria-current="page"` | `--color-fg-muted` text, not a link | "current page" |
| Loading or error | the page passes a placeholder current label | Same visual; current "Builder" or "Project" | Same; the page's heading announces the state |
| Disabled | — | Not applicable: ancestors are always reachable | — |
| Long names | a label longer than the row | Wraps; long words break anywhere | — |

## Markup

```html
<!-- rendered: two levels -->
<bn-breadcrumb class="page-crumbs">
  <nav aria-label="Breadcrumb">
    <ol class="breadcrumb">
      <li><a href="/builders">Builders</a></li>
      <li aria-current="page">Daniel Reyes</li>
    </ol>
  </nav>
</bn-breadcrumb>
```

```html
<!-- rendered: three levels -->
<nav aria-label="Breadcrumb"><ol class="breadcrumb"><li><a href="/projects">Projects</a></li><li><a href="/projects/harvest">Harvest</a></li><li aria-current="page">Edit</li></ol></nav>
```

```html
<!-- consumer -->
<bn-breadcrumb
  [label]="'common.breadcrumb' | t"
  [items]="[{ label: 'nav.projects' | t, link: '/projects' }, { label: project().name, link: ['/projects', project().id] }, { label: 'project.edit.crumb' | t }]"
/>
```

The `nav[aria-label]`, `ol.breadcrumb` and `li[aria-current="page"]` are the e2e contract.

## Design

- `ol.breadcrumb`: `display: flex`, `flex-wrap: wrap`, gap `--space-2`, `--text-body-sm`,
  `--color-fg-muted`, list style none, no padding.
- Separator: "/" in `--color-fg-subtle`, `margin-right: --space-2`.
- Labels: `overflow-wrap: anywhere` so a long project name never overflows.
- Links: base link rule (underline, `--color-fg-link`); focus ring global.
- No motion, no elevation.

Component tokens: none.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Current text | `--color-fg-muted` | `--palette-stone-700` | `--palette-night-200` |
| Separator | `--color-fg-subtle` | `--palette-stone-600` | `--palette-night-300` |
| Ancestor link | `--color-fg-link` | `--palette-sage-700` | `--palette-sage-300` |
| Ancestor link, hover | `--color-fg-link-hover` | `--palette-sage-800` | `--palette-sage-200` |
| Focus ring | `--color-focus-ring` | `--palette-sage-700` | `--palette-sage-300` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Current page |
| `--color-fg-link` | `--color-bg-canvas` | 4.5:1 | Ancestor links |
| `--color-fg-subtle` | `--color-bg-canvas` | 4.5:1 | Separator |
| `--color-focus-ring` | `--color-bg-canvas` | 3:1 | Focus indicator |

Links are underlined, so they are not told apart from the current item by colour alone.

## Responsive behaviour

- The same row at every breakpoint; items wrap onto further lines when they do not fit, keeping
  the parent destination visible (design-system do).
- Ancestor links have a minimum block size of `--target-comfortable` below 576 px (padding inside
  the `li`, not extra gap) so each is a 44 × 44 px touch target (D-4).
- At 320 px "Projects / Harvest / Edit" and a 40-character project name wrap without horizontal
  scroll; at 200 % zoom every item is visible.

## Accessibility

### Role and pattern

`nav` landmark with `aria-label`, ordered list, `aria-current="page"` on the last item, per the
[WAI-ARIA breadcrumb pattern](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/).

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Visits each ancestor link; the current page is not focusable. |
| <kbd>Enter</kbd> | Follows the focused link. |

### Focus

Global focus ring on links. The breadcrumb is the first focus stop inside `main` on detail
screens (after the skip link moves focus to `main`).

### Labelling

The landmark is named "Breadcrumb". Link text is the exact destination name ("Builders",
"Projects", "Events").

### Announcements

None.

### Motion

None.

## Content and internationalisation

- Area names match the primary navigation exactly: "Builders", "Projects", "Events".
- Current item: the record's name from data ("Daniel Reyes", "Fall Demo Night") or a page title
  ("Share a project", "Edit"); while loading or failed, the singular noun "Builder" or "Project".
- Translatable: `label`, area names, page titles and placeholders. Data values: builder, project
  and event names.
- The separator is not text and is not translated.

## Performance

- Change detection: `OnPush`, signal inputs; `@for` over `items` tracked by index; the "is last"
  check is in the template loop variables, not a method call.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Breadcrumb.ts` renders
  "Projects / Harvest / Edit" with router links; iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly 100–300 ms.
- Composite scenarios: none.
- Layout stability: the breadcrumb renders immediately with the placeholder label while the
  record loads and swaps only the last label's text, so the header below it does not move.
- Weight: `RouterLink` only.

## Acceptance criteria

### Rendering

- **AC-1** Given the builder profile of Daniel Reyes, when it renders, then `nav[aria-label="Breadcrumb"]` contains `ol.breadcrumb` with a link "Builders" to `/builders` followed by the text "Daniel Reyes" in an `li` with `aria-current="page"`, matching the mock at 360, 768 and 1280 px. (L2-049)
- **AC-2** Given the project edit page for Harvest, when it renders, then the items are "Projects" (link), "Harvest" (link to the project) and "Edit" (current), separated by "/" in `--color-fg-subtle`. (L2-049)
- **AC-3** Given the builder profile is loading, when the breadcrumb renders, then the current item reads "Builder", and when the profile arrives it reads "Daniel Reyes" without the content below moving. (L2-048)

### Keyboard and focus

- **AC-4** Given the event detail page, when the member tabs into `main`, then "Events" receives focus with the 2 px `--color-focus-ring` ring at 3:1 or more, the current item "Fall Demo Night" is skipped, and Enter on "Events" opens `/events`. (L2-050)

### Screen readers

- **AC-5** Given any page with a breadcrumb, when a screen reader reads it, then it announces a navigation landmark "Breadcrumb" with a list of items, does not announce the "/" separators, and announces the last item as the current page. (L2-050)
- **AC-6** Given every route with a breadcrumb in both themes, when axe-core runs, then there are no violations (landmark names unique, list structure valid, contrast). (L2-050)

### Theming

- **AC-7** Given the dark theme, when the breadcrumb renders, then the current text, separator and links resolve through `--color-fg-muted`, `--color-fg-subtle` and `--color-fg-link` to their dark palette values and keep at least 4.5:1 against the page. (L2-051)

### Content

- **AC-8** Given the app in en-CA, when the breadcrumb renders, then "Breadcrumb", "Builders", "Projects", "Events", "Edit", "Share a project" and the placeholders come from the catalogue, and names come from data. (L2-052)

### Responsive

- **AC-9** Given a 320 px viewport and the project "Open Table GTA community kitchen volunteer roster", when the edit breadcrumb renders, then it wraps without horizontal scroll and each ancestor link is at least 44 px high. (L2-049)

### Performance

- **AC-10** Given a change to the breadcrumb, when the perf test runs `Breadcrumb` against the base branch, then it is not flagged as a possible regression. (L2-048)

## Implementation notes

- Folder `frontend/projects/components/src/lib/breadcrumb/`; files `breadcrumb.ts`,
  `breadcrumb.html`, `breadcrumb.css`; class `Breadcrumb`; type `BreadcrumbItem` exported;
  selector `bn-breadcrumb`; export from `public-api.ts`.
- Separator rule: `content: "/" / ""` (CSS alternative text) so it is not announced; fall back to
  the plain rule only where unsupported.
- Move `.breadcrumb` styles from `components.css` into the component stylesheet.
- Add `common.breadcrumb` to the en-CA catalogue.
- Add `Breadcrumb.ts` to the perf-test scenarios and export it from `scenarios/index.ts`.

## Decisions

- **D-1** *Content projection or data?* Data (`items`): every mock is a flat list of label and
  link, and data keeps the separator, order and `aria-current` correct by construction.
- **D-2** *What is the "collapsed" variant?* The design-system specimen renders identical markup
  to "full" and no screen has more than three levels; the component has no collapse behaviour and
  wraps instead, which keeps the parent destination visible.
- **D-3** *Is the "/" announced?* No. It is decorative; the list already conveys structure, so the
  separator uses CSS alternative text to stay silent.
- **D-4** *Do breadcrumb links meet the 44 px target?* Yes below 576 px, through block padding on
  the links, because L2-049 makes 44 × 44 px a rule for every interactive element on phones.
- **D-5** *What does the current item say while loading or failed?* "Builder" or "Project", as the
  loading and error mocks show.
- **D-6** *Is the current item a link?* No, plain text with `aria-current="page"`, as in every
  mock.
