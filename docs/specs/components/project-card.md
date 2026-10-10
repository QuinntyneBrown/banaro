# Project card

| Field | Value |
|---|---|
| Selector | `li[bn-project-card]`, `article[bn-project-card]`, `div[bn-project-card]` (one component; the host element follows `variant`, see D-1) |
| Library path | `frontend/projects/components/src/lib/project-card/` |
| Status | planned |
| Traces to | L2-007, L2-011, L2-015, L2-030, L2-039, L2-045, L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`project-card.html`](../../design-system/components/project-card.html) |
| Source mocks | [`pages/projects/default`](../../mocks/pages/projects/default.html), [`pages/home/default`](../../mocks/pages/home/default.html), [`pages/builder-profile/default`](../../mocks/pages/builder-profile/default.html), [`pages/builder-profile/own`](../../mocks/pages/builder-profile/own.html), [`pages/dashboard/default`](../../mocks/pages/dashboard/default.html), [`pages/dashboard/partial`](../../mocks/pages/dashboard/partial.html), [`dialogs/report/default`](../../mocks/dialogs/report/default.html), [`dialogs/block-builder/default`](../../mocks/dialogs/block-builder/default.html), [`dialogs/account-menu/default`](../../mocks/dialogs/account-menu/default.html), [`notifications/site-banner/info`](../../mocks/notifications/site-banner/info.html), [`notifications/account-banner/info`](../../mocks/notifications/account-banner/info.html) |
| Rendering | [`project-card.html`](project-card.html) |

## Purpose and scope

The project card is how a product in progress appears outside its own page: a small coloured
mark with the project's initial, the name, who is building it, the one-line pitch, and three
facts — the stage, who they are looking for and how much feedback it has had. It says "work in
progress, come and help", never "invest in us". It appears in the project showcase grid, the
home page's "Made nearby, shared early" row, a builder profile's "What Daniel is building", and
the dashboard's "Your project" summary.

Use the [card](card.md) for any other framed surface, the [person](person.md) row for a builder,
and the project page's own header (`.proj-head`, owned by the project-detail page) for the
project's title block. A feedback comment on the project is a [comment](comment.md).

Out of scope:

- The grid that lays cards out (`ul.projects`, `.projects--list`): the page owns it, with the
  [container-grid-stack](container-grid-stack.md) rules (1 column, 2 at ≥ 768 px, 3 or 4 at
  ≥ 1280 px).
- Loading placeholders: the page renders [skeleton](skeleton.md) cards (`.skeleton-card`) in the
  same grid cells while the list loads.
- Filtering, sorting, paging, the result count and the no-results state (L2-015, page-owned).
- The project page header `.proj-head` and its `.proj-head__mark`, which reuses the
  `.project__mark--{tone}` tone classes on a larger tile (project-detail page).
- Whatever the actions slot holds: the consumer projects a [button](button.md).

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/projects/default` result grid (7 cards) | `variant="card"`, `href` set, `headingLevel` 3 | mark H/P/G/L/K/W/S in sage, clay, fjord, oat; "by Amara Osei"; line; facts Stage / Looking for / Feedback ("23 comments") | default, hover lift, link focus | canvas, `ul.projects.projects--list` |
| `pages/home/default`, `pages/home/partial` "Made nearby, shared early" (4 cards) | `variant="card"`, no `href` | Harvest, Psalter, Gather, Ledgerline with the same three facts | default, hover lift | canvas, `ul.projects` |
| `pages/builder-profile/default` "What Daniel is building"; also behind `dialogs/report/*`, `dialogs/block-builder/*` | `variant="feature"`, `headingId="proj-name"`, `href` set | mark P (sage); byline is the pitch "Scripture memory with spaced repetition"; facts Stage, Looking for (no Feedback); actions: quiet sm button "Read about Psalter" | default, link focus | `article.aside-card` on canvas |
| `pages/builder-profile/own` "What you are building" | `variant="feature"` | Harvest; "Read about Harvest" | default | `article.aside-card` |
| `pages/dashboard/default`, `pages/dashboard/partial` "Your project" aside; also behind `dialogs/account-menu/default` and every `notifications/site-banner/*` and `notifications/account-banner/*` | `variant="summary"`, `eyebrow="Your project"`, `headingLevel` 2 | Harvest; pitch as byline; facts Stage, Looking for, Feedback "23 comments, 4 new" in `dl.facts`; actions: "Read the feedback" | default, link focus | `div.aside-card` inside `aside` |
| `pages/builder-profile/sparse` | not rendered | "No project listed yet. Esther is here to meet people first." is page copy | — | — |

Every row is buildable with the API below. The home cards carry no link in the mock; the API
keeps `href` optional for that (D-3).

## Anatomy

1. **Container** — `.project` (card) or `.aside-card` (feature, summary). Grid, `--space-4` gap.
2. **Eyebrow (summary only)** — `p.eyebrow`, "Your project".
3. **Head** — `.project__head`, flex row with the mark and the title block.
4. **Mark** — `span.project__mark.project__mark--{tone}`, `aria-hidden="true"`, the project's
   first letter on a tile.
5. **Name** — `h{2|3}.project__name`, containing `<a>` when `href` is set.
6. **Byline** — `p.project__owner`: "by Amara Osei" on cards, the pitch on feature and summary.
7. **Line (card only)** — `p.project__line`, the one-line description.
8. **Facts** — `dl.project__facts` (card, feature) or `dl.facts` (summary), one `div` per
   `dt`/`dd` pair.
9. **Actions (feature, summary)** — `[slot=actions]` projected last.

Host: the component is an attribute component; the host **is** the container element (`li` in a
list, `article` for the feature, `div` for the summary) and carries the block classes, so list
semantics stay valid (`ul > li`).

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `variant` | `'card' \| 'feature' \| 'summary'` | `'card'` | no | `card` puts `.project` on the host; `feature` and `summary` put `.aside-card`. Must match the host element (D-1). |
| `name` | `string` | — | yes | Project name, ≤ 80 characters (L2-012). Rendered as text, never as HTML. |
| `href` | `string \| null` | `null` | no | When set, the name is wrapped in `<a [href]>` (or `routerLink` via `routerLinkHref`, D-4). |
| `byline` | `string` | — | yes | Card: the translated "by {owner}" string. Feature and summary: the one-line pitch. |
| `ownerHref` | `string \| null` | `null` | no | Card only: when set, the owner's name inside the byline becomes a link; `ownerName` must be set too (D-5). |
| `ownerName` | `string \| null` | `null` | no | The owner's display name, used to place the owner link inside `byline`. |
| `line` | `string \| null` | `null` | no | Card only: one-line description in `.project__line`; omitted when null. |
| `facts` | `ProjectFact[]` (`{ term: string; value: string }`) | `[]` | no | Rendered in order; an empty array renders no `<dl>`. Labels and values arrive translated and formatted. |
| `tone` | `'sage' \| 'clay' \| 'fjord' \| 'oat'` | `'sage'` | no | Adds `.project__mark--{tone}`. |
| `mark` | `string \| null` | `null` | no | The mark's letter; when null, the first grapheme of `name`, upper-cased by the formatter. |
| `headingLevel` | `2 \| 3` | `3` | no | `summary` on the dashboard uses 2. |
| `headingId` | `string \| null` | `null` | no | Sets `id` on the heading; on `feature` the host gets `aria-labelledby` with it. |
| `eyebrow` | `string \| null` | `null` | no | Summary only: rendered as `p.eyebrow` above the head. |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| None | — | The card has no behaviour of its own; navigation is the name link, actions belong to the projected buttons. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `[slot=actions]` | one `a[bn-button]` or `button[bn-button]` (quiet, sm) | Feature and summary only; projected after the facts. Declared once. |

All copy (fact terms, "by …", eyebrow, action labels) arrives through inputs or the slot from the
`en-CA` catalogue (L2-052); the component holds no strings.

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Card | `li.project` | A project in a list or grid: showcase, home page. Hover lifts the card. |
| Feature | `article.aside-card` | One project inside a profile ("What Daniel is building"), with a "Read about …" action. |
| Summary | `div.aside-card` | The owner's own project on the dashboard, with feedback counts and "Read the feedback". |

| Tone | Modifier | Use for |
|---|---|---|
| Sage | `.project__mark--sage` | Default |
| Clay | `.project__mark--clay` | Assigned per project, stable across screens |
| Fjord | `.project__mark--fjord` | Assigned per project |
| Oat | `.project__mark--oat` | Assigned per project |

One size. The width comes from the grid cell or the aside column; the height comes from the
content. The mark is `--space-12` square.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Surface `--color-bg-surface`, hairline `--color-border-default`, `--radius-lg` | Heading names the project; facts read as a description list |
| Hover (card) | `:hover` on `.project`, only with `prefers-reduced-motion: no-preference` | Lifts by `--lift` and deepens to `--shadow-3` over `--duration-base` / `--duration-slow` | — |
| Link hover | `:hover` on `.project__name a` | Underline with `--size-project-name-a-text-underline-offset-38` offset | — |
| Link focus | `:focus-visible` on the name link | `--color-focus-ring` outline, `--focus-ring-width`, `--focus-ring-offset` | Link name is the project name |
| No link | `href` null | Name is plain text | Heading only, no tab stop |
| No line | `line` null | `.project__line` absent; facts move up | — |
| No facts | `facts` empty | `<dl>` absent | — |
| Long name | name of 80 characters | Name wraps (`text-wrap: balance`); never truncated | Full name read |
| Loading | page-owned | The page shows a `.skeleton-card` in the same grid cell | Page sets `aria-busy` on the list |

The card has no disabled, selected or busy state: it is passive content.

## Markup

```html
<!-- rendered: card, linked (pages/projects/default) -->
<li class="project">
  <div class="project__head">
    <span class="project__mark project__mark--clay" aria-hidden="true">P</span>
    <div><h3 class="project__name"><a href="/projects/psalter">Psalter</a></h3><p class="project__owner">by Daniel Reyes</p></div>
  </div>
  <p class="project__line">Scripture memory with spaced repetition</p>
  <dl class="project__facts">
    <div><dt>Stage</dt><dd>1,900 beta users</dd></div>
    <div><dt>Looking for</dt><dd>Contributors (open source)</dd></div>
    <div><dt>Feedback</dt><dd>41 comments</dd></div>
  </dl>
</li>
```

The home card is the same without the `<a>`. With `ownerHref` the byline reads
`<p class="project__owner">by <a href="/builders/daniel-reyes">Daniel Reyes</a></p>`.

```html
<!-- rendered: feature (pages/builder-profile/default) -->
<article class="aside-card" aria-labelledby="proj-name">
  <div class="project__head"><span class="project__mark project__mark--sage" aria-hidden="true">P</span><div><h3 class="project__name" id="proj-name"><a href="/projects/psalter">Psalter</a></h3><p class="project__owner">Scripture memory with spaced repetition</p></div></div>
  <dl class="project__facts"><div><dt>Stage</dt><dd>1,900 beta users</dd></div><div><dt>Looking for</dt><dd>Contributors (open source)</dd></div></dl>
  <a class="btn btn--quiet btn--sm" href="/projects/psalter">Read about Psalter</a>
</article>
```

```html
<!-- rendered: summary (pages/dashboard/default) -->
<div class="aside-card">
  <p class="eyebrow">Your project</p>
  <div class="project__head"><span class="project__mark project__mark--sage" aria-hidden="true">H</span><div><h2 class="project__name"><a href="/projects/harvest">Harvest</a></h2><p class="project__owner">Volunteer scheduling for GTA food banks</p></div></div>
  <dl class="facts"><div><dt>Stage</dt><dd>Beta · 6 food banks</dd></div><div><dt>Looking for</dt><dd>Technical co-founder</dd></div><div><dt>Feedback</dt><dd>23 comments, 4 new</dd></div></dl>
  <a class="btn btn--quiet btn--sm" href="/projects/harvest">Read the feedback</a>
</div>
```

```html
<!-- consumer -->
<ul class="projects projects--list">
  @for (p of projects(); track p.id) {
    <li bn-project-card [name]="p.name" [href]="'/projects/' + p.id" [byline]="'projects.by' | t: { owner: p.owner.name }"
        [line]="p.oneLine" [tone]="p.tone" [facts]="p.facts" headingLevel="3"></li>
  }
</ul>

<div bn-project-card variant="summary" eyebrow="{{ 'dashboard.project.eyebrow' | t }}" [headingLevel]="2"
     name="Harvest" href="/projects/harvest" byline="Volunteer scheduling for GTA food banks" [facts]="harvestFacts()">
  <a bn-button variant="quiet" size="sm" slot="actions" routerLink="/projects/harvest">{{ 'dashboard.project.read' | t }}</a>
</div>
```

The e2e page objects locate cards by `.project`, `.project__name` and `.project__facts dt`; the
inner `<div>` around name and byline is free to change.

## Design

- Container: padding `--space-6`, gap `--space-4`, radius `--radius-lg`, hairline
  `--border-width-hairline` in `--color-border-default`, fill `--color-bg-surface`.
- Head: gap `--space-4`. Mark: `--space-12` square with `flex: none` so a long name never squeezes it (D-9), radius `--radius-md`, letter in
  `--font-family-display` at `--font-size-2xl`, `--font-weight-light`, colour `--color-tile-fg`.
- Name `--text-h3`; byline `--text-body-sm` in `--color-fg-subtle`; line in `--color-fg-muted`.
- Facts: `--text-body-sm`, gap `--space-2`, top rule hairline and `--space-4` padding; terms in
  `--color-fg-subtle`, `nowrap`; values right-aligned and wrapping.
- Summary facts use `.facts` (overline terms `--text-overline`, `--letter-spacing-wide`).
- Motion: hover lift `--lift`, `--shadow-3`; transform over `--duration-base`, shadow over
  `--duration-slow`, both `--ease-standard`.

Component tokens: none. The card has no surface overrides; tones are modifier classes.

| Token | Aliases | Overridden by |
|---|---|---|
| — | — | The card declares no `--bn-` knobs. |

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Card surface | `--color-bg-surface` | `--palette-birch-50` | `--palette-night-900` |
| Card rule, facts rule | `--color-border-default` | `--palette-oat-300` | `--palette-night-700` |
| Name | `--color-fg-default` | `--palette-ink-900` | `--palette-night-50` |
| Byline, fact terms | `--color-fg-subtle` | `--palette-stone-600` | `--palette-night-300` |
| Line | `--color-fg-muted` | `--palette-stone-700` | `--palette-night-200` |
| Mark letter | `--color-tile-fg` | `--palette-ink-900` | `--palette-night-50` |
| Mark sage / clay / fjord / oat | `--color-tile-sage` … `--color-tile-oat` | `--palette-sage-100`, `--palette-clay-100`, `--palette-fjord-100`, `--palette-oat-200` | `--palette-sage-900`, `--palette-clay-900`, `--palette-fjord-900`, `--palette-night-800` |
| Focus ring | `--color-focus-ring` | `--palette-sage-700` | `--palette-sage-300` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-surface` | 4.5:1 | Name, fact values |
| `--color-fg-muted` | `--color-bg-surface` | 4.5:1 | One-line description |
| `--color-fg-subtle` | `--color-bg-surface` | 4.5:1 | Byline, fact terms |
| `--color-tile-fg` | `--color-tile-clay` | 3:1 | Mark letter (large, decorative and `aria-hidden`) |
| `--color-focus-ring` | `--color-bg-surface` | 3:1 | Focus indicator |

In forced-colours mode the hairline border stays visible as `CanvasText`; the mark keeps its
letter, so the tone is never the only identifier.

## Responsive behaviour

- The card itself does not change across breakpoints; the page grid sets 1, 2 (≥ 768 px), 3
  (`.projects--list` ≥ 1280 px) or 4 (`.projects` ≥ 1280 px) columns.
- Fact rows keep term and value on one line while they fit; a long value ("Contributors (open
  source)") wraps under its own right edge, never under the term.
- At 320 px nothing scrolls horizontally or clips; at 200 % zoom everything stays available.
- Targets: the name link is a heading text link (inline exception, D-6); the projected action
  button keeps the [button](button.md) target of at least 44 × 44 CSS px on touch devices.

## Accessibility

### Role and pattern

Native semantics: `li` in a list, `article` with `aria-labelledby` for the feature, a plain `div`
for the summary inside the dashboard's labelled `aside`. The project name is a heading so screen
reader users can jump between cards. The whole card is never a link (design-system don't: no
owner link inside a whole-card anchor).

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves to the project link, then the owner link (when set), then the action button |
| <kbd>Enter</kbd> | Follows the focused link |

### Focus

Focus stays on the real link or button, with the shared 2 px ring at 3 px offset. Hover lift is
pointer-only; focus does not lift the card.

### Labelling

The link's accessible name is the project name ("Psalter"). The mark is `aria-hidden`, so the
initial is never read twice. Facts are read as term–value pairs ("Stage, 1,900 beta users").

### Announcements

None. The card does not change after render.

### Motion

The hover lift runs only under `prefers-reduced-motion: no-preference`; reduced motion removes
the transform and transition and keeps the shadow-free resting card.

## Content and internationalisation

- Name and pitch come from the owner's data and are output-encoded: "<b>Psalter</b>" shows as
  those characters (L2-045).
- Byline pattern from the catalogue: "by {owner}" → "by Daniel Reyes".
- Facts: "Stage", "Looking for", "Feedback" from the catalogue; values from data. Counts use
  comma thousands: "1,900 beta users", "41 comments", "23 comments, 4 new" (L2-052).
- Stage values are the L2-012 vocabulary (Idea, Design, Prototype, Beta, Pilot, Launched) plus
  the owner's own detail after a middle dot ("Beta · 6 food banks").
- Strings wrap; nothing truncates. French runs about 30 % longer, so values must wrap inside the
  fact row.
- Translatable inputs: `byline` (pattern), `facts[].term`, `eyebrow`, slot labels. Data values:
  `name`, `line`, pitch, `facts[].value`.

## Performance

- Change detection: `OnPush`, signal inputs; the host classes and the mark letter are
  `computed`.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/ProjectCard.ts` renders one
  card: Psalter, "by Daniel Reyes", "Scripture memory with spaced repetition", Stage "1,900 beta
  users", Looking for "Contributors (open source)", Feedback "41 comments", clay tone.
- Composite scenarios: `ProjectCardGrid.ts` renders the seven showcase cards of
  `pages/projects/default` in a `ul.projects.projects--list`; `ProjectCardGridDark.ts` renders
  the same inside `data-theme="dark"`. Iterations for all three are tuned in
  `e2e/perf-test/config/scenario-iterations.mjs` to roughly 100–300 ms.
- Regression rule: a change to the template, inputs, styles or change detection runs the perf
  test against the base branch with `--fail-on-regression` before it is pushed.
- Layout stability: the card is content-sized; the page's skeleton card sits in the same grid
  cell so the replacement moves no neighbour.
- Weight: imports only Angular core and `RouterLink`; no icon set (the mark is a letter).

## Acceptance criteria

### Rendering

- **AC-1** Given the projects page lists Psalter, when the card renders, then `li.project` contains a `.project__mark--clay` mark "P", the heading link "Psalter", the byline "by Daniel Reyes", the line "Scripture memory with spaced repetition" and facts Stage "1,900 beta users", Looking for "Contributors (open source)" and Feedback "41 comments", in that order. (L2-015)
- **AC-2** Given the home page's "Made nearby, shared early" section, when its four cards render, then Harvest, Psalter, Gather and Ledgerline each show name, owner, line and the three facts in the same `.project` markup. (L2-039)
- **AC-3** Given Daniel Reyes's profile, when "What Daniel is building" renders, then an `article.aside-card` labelled by its `h3#proj-name` shows Psalter linked to its project page, the pitch as byline, the Stage and Looking for facts, and the "Read about Psalter" action. (L2-011)
- **AC-4** Given Amara Osei opens her own profile, when "What you are building" renders, then the feature card shows Harvest with "Read about Harvest" linking to her own project page. (L2-007)
- **AC-5** Given Amara's dashboard, when the "Your project" summary renders, then it shows the eyebrow "Your project", an `h2` "Harvest" link, a `dl.facts` with Feedback "23 comments, 4 new" and the "Read the feedback" action. (L2-030)
- **AC-6** Given a project named `<b>Harvest</b>`, when any variant renders, then the name shows those literal characters and no `<b>` element exists in the card. (L2-045)

### States

- **AC-7** Given a card with `line` null and `facts` empty, when it renders, then neither `.project__line` nor a `<dl>` is in the DOM and the head is the last child. (L2-015)
- **AC-8** Given a card with an 80-character name in a 320 px wide column, when it renders, then the name wraps onto several lines, is not truncated, the mark stays a `--space-12` square, and the page has no horizontal scroll. (L2-049)

### Keyboard and focus

- **AC-9** Given a summary card with its action, when the member presses Tab from the eyebrow, then focus moves to the "Harvest" link and then to "Read the feedback", each showing a 2 px focus ring with at least 3:1 contrast against the surface. (L2-050)

### Screen readers

- **AC-10** Given the Psalter card, when a screen reader reads it, then it announces the heading "Psalter" once (the mark is `aria-hidden`) followed by the term–value pairs of the description list. (L2-050)

### Theming

- **AC-11** Given the dark theme, when the Psalter card renders, then its surface, rule, text and mark colours resolve from `--color-bg-surface`, `--color-border-default`, `--color-fg-*` and `--color-tile-clay` with no per-component colour code. (L2-051)
- **AC-12** Given either theme, when the card's text is measured, then name, line, byline and fact terms each reach at least 4.5:1 against `--color-bg-surface`. (L2-050)

### Content

- **AC-13** Given Harvest's feedback count of 1,234 comments, when the Feedback fact renders, then it reads "1,234 comments" with a comma thousands separator. (L2-052)

### Responsive

- **AC-14** Given the projects page at 360 px, when the grid renders, then each card spans the single column with no clipped text, and the "Read about Psalter" action on the profile has a target of at least 44 × 44 CSS px. (L2-049)

### Motion

- **AC-15** Given `prefers-reduced-motion: reduce`, when the pointer hovers a card, then the card neither moves nor animates. (L2-050)

### Performance

- **AC-16** Given a change to the card, when the perf test runs `ProjectCard`, `ProjectCardGrid` and `ProjectCardGridDark` against the base branch with `--fail-on-regression`, then no scenario is flagged as a possible regression. (L2-048)
- **AC-17** Given the projects page loading, when the seven cards replace the skeleton cards, then the replacement causes no layout shift of the toolbar, count or footer (CLS 0 for the replacement). (L2-048)

## Implementation notes

- Folder `frontend/projects/components/src/lib/project-card/`: `project-card.ts`
  (class `ProjectCard`), `project-card.html`, `project-card.css` with the `.project*`, `.facts`
  and `.aside-card` rules the card needs, copied from `components.css` (the `.aside-card`
  surface stays aligned with the [card](card.md) CRD).
- Selector `li[bn-project-card], article[bn-project-card], div[bn-project-card]`; host binding
  `[class]` from a `computed` (`project` or `aside-card`) and `[attr.aria-labelledby]` for the
  feature.
- `ProjectFact` and `ProjectTone` types exported from `public-api.ts`.
- Composes nothing from the library except projected [button](button.md)s; the mark is a
  styled `span`, not an [avatar](avatar.md).
- Perf scenarios `ProjectCard.ts`, `ProjectCardGrid.ts`, `ProjectCardGridDark.ts`, exported from
  `src/scenarios/index.ts`.

## Decisions

- **D-1** *One component or three for the card, feature and summary shapes?* One component with a
  `variant` input and an attribute selector on `li`, `article` and `div`. All three share the
  head, mark, name and facts markup; a list item must be the `li` itself to keep `ul > li` valid
  and BEM parity with the mocks.
- **D-2** *The summary uses `dl.facts`, the others `dl.project__facts`. Normalise?* No. The mocks
  are the visual reference and the e2e locators depend on the classes; the summary keeps
  `.facts` (overline terms stacked above values) because the dashboard aside is narrow.
- **D-3** *The home page cards have no link. Should they?* The API keeps `href` optional and the
  home page matches its mock (no link) for visual parity; the showcase, profile and dashboard
  pass `href`. The home section's "See all 312 projects" link is the route onward.
- **D-4** *`href` or `routerLink`?* The input is a URL string; the component renders it with
  `RouterLink` for internal paths (starting with `/`) and a plain `href` otherwise, so the
  consumer never chooses.
- **D-5** *The design system says the owner link is reachable separately, but no mock links the
  owner.* `ownerHref`/`ownerName` are optional inputs, unset everywhere in the current mocks;
  they exist so a later screen can link the owner without an API change.
- **D-6** *L2-049 asks for 44 × 44 px targets; the name is a text link inside a heading.* The
  heading link follows WCAG 2.5.8's inline exception and is not padded; buttons in the actions
  slot meet 44 × 44 through the [button](button.md) component.
- **D-7** *`.project__more` exists in `components.css` but in no mock or design-system
  specimen.* Not rendered by this component; it stays unused until a mock needs it.
- **D-8** *The design-system page lists a "list" variant as `.project--list`, but the mocks put
  `.projects--list` on the grid.* The modifier belongs to the page grid (three columns at
  ≥ 1280 px); the card has no list modifier.
- **D-9** *The rendering shows the mark squeezed narrow beside an 80-character name at 320 px,
  because `.project__mark` has no `flex: none` in `components.css`.* The component's mark is
  `flex: none` and stays square; `components.css` should catch up (the same rule `.proj-head__mark`
  and `.profile-head__initials` already have).
