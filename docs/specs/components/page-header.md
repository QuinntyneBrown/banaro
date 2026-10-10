# Page header

| Field | Value |
|---|---|
| Selector | `bn-page-header` |
| Library path | `frontend/projects/components/src/lib/page-header/` |
| Status | built |
| Traces to | L2-009, L2-026, L2-030, L2-041, L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`page-header.html`](../../design-system/components/page-header.html) |
| Source mocks | [`pages/dashboard/default`](../../mocks/pages/dashboard/default.html), [`pages/dashboard/loading`](../../mocks/pages/dashboard/loading.html), [`pages/dashboard/error`](../../mocks/pages/dashboard/error.html), [`pages/directory/default`](../../mocks/pages/directory/default.html), [`pages/project-edit/default`](../../mocks/pages/project-edit/default.html), [`pages/project-detail/error`](../../mocks/pages/project-detail/error.html), [`pages/privacy/default`](../../mocks/pages/privacy/default.html), [`pages/about/default`](../../mocks/pages/about/default.html), [`pages/messages/error`](../../mocks/pages/messages/error.html), and every row of Usage |
| Rendering | [`page-header.html`](page-header.html) |

## Purpose and scope

The heading block at the top of a routed screen: a quiet uppercase eyebrow that places the page
("Builder directory", "Friday 9 October"), the page's only `h1`, a supporting sentence that says
what the page is for or what changed, and optionally the action the page exists for (the
directory's search). It introduces every member and public page except the home page, the builder
profile and the error pages.

Use [hero](hero.md) on the home page, the [profile-header](profile-header.md) on a builder's
profile, the [error-page](error-page.md) for 404/403/500/offline/maintenance, the
[auth-card](auth-card.md) title on sign-in and join, and a section heading (`h2.section__title`)
for headings inside a page.

Out of scope:

- The breadcrumb's own markup and behaviour ([breadcrumb](breadcrumb.md)); the header only gives it
  a place.
- The search form's behaviour ([search-box](search-box.md)); the header only projects it.
- Composing the greeting, counts and date in the sub-copy: the page builds that sentence from L2
  rules (L2-030 greeting and summary line) and passes it in.
- Moving focus after navigation: the router decides when; the header only offers the target.
- Tabs, toolbars and filters that follow the header on events, projects and settings.

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/dashboard/default`, `partial`, `empty`; `dialogs/account-menu`; `notifications/account-banner/*`, `notifications/site-banner/*` | eyebrow + heading + sub | "Friday 9 October" / "Good morning, Amara" / "You have 2 new matches, 1 unread message and 1 event in the next 7 days."; empty: "Welcome to Banaro, Amara" / "Your week is quiet because you have just arrived. Three small steps will fill it." | default | canvas |
| `pages/dashboard/loading` | eyebrow + heading + sub, busy | sub "Loading your week…" | loading (`aria-busy="true"`) | canvas |
| `pages/dashboard/error`, `pages/messages/error`, `pages/notifications/error`, `pages/profile-edit/error` | eyebrow + heading, no sub | "Inbox" / "Messages" | error | canvas |
| `pages/project-detail/error` | heading only, breadcrumb before | breadcrumb "Projects / Project"; "Project" | error | canvas |
| `pages/directory/default`, `filtered`, `no-results`; `dialogs/say-hello/*`; `notifications/toast/*` | eyebrow + heading + sub + default slot | "Builder directory" / "Builders near you" / "1,284 builders in Toronto and the GTA, within 40 km of Leslieville." + search form ("Name, skill or project", "Search") | default, no-results (query "Kotlin") | canvas |
| `pages/project-edit/*`, `dialogs/delete-project/*` | breadcrumb + eyebrow + heading + sub, inside `.narrow` | "Projects / Harvest / Edit"; "Project showcase" / "Edit Harvest" / "Changes appear on your project page as soon as you save." | default, invalid, submitting, loading, error | canvas |
| `pages/privacy/default`, `pages/code-of-conduct/default` | eyebrow + heading + rich sub | "Your privacy" / "What we collect, why, and what we never do. Last updated 1 September 2026." (date in `time`) | default | canvas |
| `pages/about`, `pages/contact/*` | eyebrow + heading + sub inside `.page-block.narrow` | "About" / "Build with believers down the street"; contact success "Thank you, Amara" | default, invalid, submitting, success | canvas |
| `pages/events/default`, `past`, `empty`, `error`, `loading` | eyebrow + heading + sub | "Toronto and the GTA" / "Events"; past: "Last season" | default, past | canvas |
| `pages/projects/*`, `pages/project-new/*` | eyebrow + heading + long sub | "Projects made nearby" / "312 projects from builders in Toronto and the GTA. Read what is being made, leave feedback, or offer a hand." | default, loading, error, no-results | canvas |
| `pages/matching/*`, `pages/matching-setup/*`, `dialogs/pass-suggestion`, `dialogs/pause-matching` | eyebrow + heading + sub | "Co-founder matching" / "Your three this week", "All three reviewed", "Matching is paused", "Matching is on" | default, empty, reviewed, paused, success | canvas |
| `pages/messages/*`, `pages/notifications/*`, `pages/settings/*`, `pages/profile-edit/*` and their dialogs/banners | eyebrow + heading + sub; loading sub | "Inbox" / "Messages" / "Loading your conversations…"; "Updates" / "Notifications" / "3 unread. Matches arrive on Monday, everything else as it happens." | default, loading, empty, read | canvas |

Every row is buildable with the API below: `heading`, optional `eyebrow`, optional `sub` (or
`[slot=sub]`), `busy`, the default slot and `[slot=breadcrumb]`.

## Anatomy

1. **Breadcrumb (optional)** — `[slot=breadcrumb]`, projected before the block. Owned by
   [breadcrumb](breadcrumb.md).
2. **Block** — `.page-head`. One-column grid, `--space-5` between parts.
3. **Eyebrow (optional)** — `p.eyebrow`. Overline text with a short leading rule.
4. **Title** — `h1.page-head__title`. The page's only `h1`.
5. **Supporting sentence (optional)** — `p.page-head__sub`. Muted large body text.
6. **Actions (optional)** — default slot, after the sentence (the directory's `form.search`).

Host: `bn-page-header` is `display: block`; it renders the projected breadcrumb, then the
`div.page-head`.

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `heading` | `string` | — | yes | Text of the `h1.page-head__title`. Never empty. |
| `eyebrow` | `string \| undefined` | `undefined` | no | When set, renders `p.eyebrow` before the title; when unset, renders nothing. |
| `sub` | `string \| undefined` | `undefined` | no | Plain-text supporting sentence. Use `[slot=sub]` instead when it needs markup. |
| `headingId` | `string \| undefined` | `undefined` | no | `id` on the `h1`, for `aria-labelledby` elsewhere on the page. |
| `busy` | `boolean` | `false` | no | Sets `aria-busy="true"` on `.page-head` while the page's data loads; omitted when false. |

Inputs are signal inputs; `busy` uses `booleanAttribute`.

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| None — the header is passive; actions in the default slot emit their own events. | | |

### Methods

| Method | Rule |
|---|---|
| `focusHeading(): void` | Focuses the `h1` (which carries `tabindex="-1"`), for the router's focus-on-navigation. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `[slot=breadcrumb]` | one `nav[aria-label]` breadcrumb | Rendered before `.page-head`, outside it. |
| `[slot=sub]` | inline content (text, `time`, `a`) | Rendered inside `p.page-head__sub` after `sub`; use one or the other. |
| default | the page's primary action or search form | Rendered last inside `.page-head`. |

Each slot is declared once. Every string arrives through an input or a slot.

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Default | — | Eyebrow, title and sentence (most pages). |
| Actions | default slot filled | A search or primary action that belongs to the heading (directory). |
| Breadcrumb | `[slot=breadcrumb]` filled | Pages below another page (edit project, project error). |

| Size | Modifier | Height | Padding | Type |
|---|---|---|---|---|
| One size | — | content | `--space-16` top, `--space-10` bottom | title `--text-h1`, sentence `--text-body-lg`, eyebrow `--text-overline` |

Width follows the parent: the full `.wrap`, or `.narrow` on form and legal pages.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Eyebrow, title, sentence | `h1` in the outline; eyebrow and sentence read as text |
| No sentence | `sub` unset and `[slot=sub]` empty | `p.page-head__sub` is `display: none` (`:empty`) | Nothing read for it |
| No eyebrow | `eyebrow` unset | Title is the first part | — |
| Loading | `busy` true | Unchanged; the page passes a loading sentence ("Loading your week…") | `aria-busy="true"` on `.page-head` |
| Error | page in its error state | Eyebrow and title only; no sentence | — |
| Heading focused | `focusHeading()` after navigation | Shared focus ring on the `h1` | Screen reader reads the `h1` |
| Hover, active, disabled | — | Not applicable: the block is passive | — |

## Markup

```html
<!-- rendered: default (pages/dashboard/default) -->
<bn-page-header>
  <div class="page-head">
    <p class="eyebrow">Friday 9 October</p>
    <h1 class="page-head__title" tabindex="-1">Good morning, Amara</h1>
    <p class="page-head__sub">You have 2 new matches, 1 unread message and 1 event in the next 7 days.</p>
  </div>
</bn-page-header>
```

```html
<!-- rendered: loading (pages/dashboard/loading) -->
<div class="page-head" aria-busy="true">
  <p class="eyebrow">Friday 9 October</p>
  <h1 class="page-head__title" tabindex="-1">Good morning, Amara</h1>
  <p class="page-head__sub">Loading your week…</p>
</div>
```

```html
<!-- rendered: actions (pages/directory/default) -->
<div class="page-head">
  <p class="eyebrow">Builder directory</p>
  <h1 class="page-head__title" tabindex="-1">Builders near you</h1>
  <p class="page-head__sub">1,284 builders in Toronto and the GTA, within 40 km of Leslieville.</p>
  <form class="search" role="search" action="/builders">
    <label class="vh" for="q">Search builders</label>
    <input class="search__input" id="q" name="q" type="search" placeholder="Name, skill or project" autocomplete="off">
    <button type="submit" class="btn btn--primary">Search</button>
  </form>
</div>
```

```html
<!-- rendered: breadcrumb, no eyebrow, no sentence (pages/project-detail/error) -->
<bn-page-header>
  <nav aria-label="Breadcrumb"><ol class="breadcrumb"><li><a href="/projects">Projects</a></li><li aria-current="page">Project</li></ol></nav>
  <div class="page-head">
    <h1 class="page-head__title" tabindex="-1">Project</h1>
    <p class="page-head__sub"></p>
  </div>
</bn-page-header>
```

```html
<!-- rendered: rich sentence (pages/privacy/default) -->
<p class="page-head__sub">What we collect, why, and what we never do. Last updated <time datetime="2026-09-01">1 September 2026</time>.</p>
```

```html
<!-- consumer -->
<bn-page-header [eyebrow]="today() | bnDate: 'weekdayLong'" [heading]="greeting()" [sub]="summary()" [busy]="loading()" />

<bn-page-header [eyebrow]="'directory.eyebrow' | t" [heading]="'directory.title' | t" [sub]="'directory.count' | t: { count: total() }">
  <bn-search-box … />
</bn-page-header>

<bn-page-header [eyebrow]="'projects.edit.eyebrow' | t" [heading]="'projects.edit.title' | t: { name: project().name }" [sub]="'projects.edit.sub' | t">
  <nav slot="breadcrumb" [attr.aria-label]="'common.breadcrumb' | t">…</nav>
</bn-page-header>

<bn-page-header [eyebrow]="'privacy.eyebrow' | t" [heading]="'privacy.title' | t">
  <span slot="sub">{{ 'privacy.sub' | t }} {{ 'privacy.lastUpdated' | t }} <time [attr.datetime]="updated">{{ updatedLabel }}</time>.</span>
</bn-page-header>
```

The empty `p.page-head__sub` is the only difference from the mocks' DOM, and it is not rendered
visibly or to assistive technology (D-2).

## Design

- Block: `display: grid; grid-template-columns: minmax(0, 1fr)`; gap `--space-5`;
  `padding-block: var(--space-16) var(--space-10)`.
- Eyebrow: `--text-overline`, `--letter-spacing-wide`, uppercase by CSS, colour `--color-fg-subtle`;
  a `::before` rule `--space-5` wide and `--border-width-hairline` high in `currentColor`, `--space-2`
  from the text (the global `.eyebrow` foundation).
- Title: `--text-h1`, `--letter-spacing-tight`, colour `--color-fg-default`, `text-wrap: balance`.
- Sentence: `--text-body-lg`, colour `--color-fg-muted`, `text-wrap: pretty`.
- No elevation, no motion, no layer.

Component tokens:

| Token | Aliases | Overridden by |
|---|---|---|
| None — the header reads semantic tokens directly. | | |

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Eyebrow and its rule | `--color-fg-subtle` | `--palette-stone-600` | `--palette-night-300` |
| Title | `--color-fg-default` | `--palette-ink-900` | `--palette-night-50` |
| Sentence | `--color-fg-muted` | `--palette-stone-700` | `--palette-night-200` |
| Page behind | `--color-bg-canvas` | `--palette-oat-100` | `--palette-night-950` |
| Heading focus ring | `--color-focus-ring` | `--palette-sage-700` | `--palette-sage-300` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-canvas` | 4.5:1 | Title |
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Sentence |
| `--color-fg-subtle` | `--color-bg-canvas` | 4.5:1 | Eyebrow |
| `--color-focus-ring` | `--color-bg-canvas` | 3:1 | Focused heading |

## Responsive behaviour

- The layout does not change across breakpoints: one column at every width; the title's size comes
  from `--text-h1`, which scales with the type tokens.
- Long titles balance across lines; long sentences wrap; nothing truncates.
- The directory search form in the default slot shrinks to the column (its input has
  `min-width: 0`), keeping the "Search" button on the same line at 320 px.
- At 320 px nothing scrolls horizontally or clips; at 200 % zoom everything stays available; every
  target in the default slot is at least 44 × 44 CSS px on touch devices.

## Accessibility

### Role and pattern

Native heading semantics; [landmark guidance](https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/).
The block sits inside `main`; it adds no landmark. The breadcrumb brings its own `nav` landmark.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Breadcrumb links, then the default slot's controls, in DOM order. The `h1` is not in the Tab order. |

### Focus

The `h1` has `tabindex="-1"` so `focusHeading()` can move focus to it after route changes; it then
shows the shared `--focus-ring-width` ring at `--focus-ring-offset` in `--color-focus-ring`. The
header never moves focus on its own.

### Labelling

The `h1` is the page's name and matches the document title's first part ("Messages · Banaro").
The eyebrow is plain text, not a heading. `headingId` lets a region use `aria-labelledby`.

### Announcements

None. `aria-busy` tells assistive technology the page below is loading; the page announces
completion through its own live region.

### Motion

None.

## Content and internationalisation

- Eyebrow: a place or date in two or three words, sentence case in source, uppercase by CSS
  ("Builder directory", "Your account", "Friday 9 October").
- Title: names the page or greets ("Builders near you", "Good morning, Amara"), sentence case, no
  full stop.
- Sentence: one or two sentences, ending with a full stop; numbers with thousands separators
  ("1,284 builders"), distances per L2-052 ("within 40 km of Leslieville").
- Translatable inputs: `eyebrow`, `heading`, `sub`, and slot content. Data values interpolated by
  the page: names ("Amara"), counts, dates.
- French copy is about 30 % longer: titles wrap to a second line and sentences to a third without
  truncation.

## Performance

- Change detection: `OnPush`, signal inputs; no computed work in the template.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/PageHeader.ts` renders the About
  page header ("About" / "Build with believers down the street" / "Banaro is a small, local
  community for Christian product builders in Toronto and the GTA."); iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly 100–300 ms.
- Composite scenarios: `DarkTheme`.
- Layout stability: the loading sentence occupies the sentence's place, so the block's height
  changes only if the loaded sentence wraps to more lines (L2-048).
- Weight: no dependencies beyond Angular core.

## Acceptance criteria

### Rendering

- **AC-1** Given eyebrow "Friday 9 October", heading "Good morning, Amara" and sub "You have 2 new matches, 1 unread message and 1 event in the next 7 days.", when the header renders, then it shows `p.eyebrow`, `h1.page-head__title` and `p.page-head__sub` in that order inside `.page-head`. (L2-030)
- **AC-2** Given any page that uses the header, when axe runs, then the page has exactly one `h1`, the header's title. (L2-050)
- **AC-3** Given the project error page with heading "Project" and no eyebrow, when it renders, then no `.eyebrow` element is present. (L2-050)
- **AC-4** Given the messages error state with eyebrow "Inbox", heading "Messages" and no sub, when it renders, then `p.page-head__sub` is not displayed and contributes nothing to the accessibility tree. (L2-026)
- **AC-5** Given the privacy page with a `[slot=sub]` that contains "Last updated" and a `time datetime="2026-09-01"` reading "1 September 2026", when it renders, then the `time` element sits inside `p.page-head__sub`. (L2-041)
- **AC-6** Given the directory with sub "1,284 builders in Toronto and the GTA, within 40 km of Leslieville." and a search form in the default slot, when it renders, then the form is the last child of `.page-head`, after the sentence. (L2-009)
- **AC-7** Given the edit-project page with a breadcrumb "Projects / Harvest / Edit" in `[slot=breadcrumb]`, when it renders, then the `nav[aria-label="Breadcrumb"]` precedes `.page-head` and is not inside it. (L2-050)

### States

- **AC-8** Given the dashboard while its data loads, when the header renders with `busy` and sub "Loading your week…", then `.page-head` has `aria-busy="true"`; when loading ends, the attribute is removed and the sub reads the summary line. (L2-030)
- **AC-9** Given the dashboard error state, when the header renders, then it shows "Friday 9 October" and "Good morning, Amara" with no supporting sentence. (L2-030)

### Keyboard and focus

- **AC-10** Given a member navigates to `/events`, when the app calls `focusHeading()`, then focus moves to the `h1` "Events", the 2 px focus ring shows with at least 3:1 contrast, and a further Tab moves to the next control after the header. (L2-050)
- **AC-11** Given the directory header, when the member tabs from the skip link target, then the search input and "Search" button are reached in DOM order and the `h1` is skipped. (L2-050)

### Screen readers

- **AC-12** Given `headingId="dashboard-title"`, when another region uses `aria-labelledby="dashboard-title"`, then that region's accessible name is "Good morning, Amara". (L2-050)

### Theming

- **AC-13** Given the light and the dark theme, when the header renders on the canvas, then the title, sentence and eyebrow each have at least 4.5:1 contrast. (L2-050)
- **AC-14** Given the dark theme toggled at runtime, when the header re-renders, then its colours change with no component code, because its styles reference only design-system tokens. (L2-051)

### Responsive

- **AC-15** Given a 320 px viewport and the projects header "Projects made nearby" with its two-sentence sub, when it renders, then the text wraps and the page has no horizontal scroll. (L2-049)
- **AC-16** Given a 360 px viewport and the directory header, when it renders, then the search input and the "Search" button share one row inside the column and the button is at least 44 × 44 px. (L2-049)

### Content

- **AC-17** Given the component source, when it is reviewed or rendered with an empty catalogue, then it contains no user-facing string of its own: every visible string comes from `heading`, `eyebrow`, `sub` or a slot. (L2-052)

### Performance

- **AC-18** Given a change to the header's template, inputs or styles, when the perf test runs `PageHeader` against the base branch, then it is not flagged as a possible regression. (L2-048)

## Implementation notes

- Current code (`page-header.ts`, `page-header.css`) has `heading`, `eyebrow`, `sub`, `headingId`,
  `[slot=sub]` and the default slot, `OnPush`, and hides an empty sentence with
  `.page-head__sub:empty`. Gaps:
  - add `busy` (`booleanAttribute`) → `[attr.aria-busy]="busy() || null"` on `.page-head`;
  - add `[slot=breadcrumb]`, projected before `.page-head`;
  - add `tabindex="-1"` on the `h1` and the public `focusHeading()` method;
  - nothing else in the template changes.
- The `PageHeader` perf-test scenario exists; keep it.
- Pages `about`, `contact` and `privacy` already use the header; dashboard, directory, projects,
  events, matching, messages, notifications and settings pages will use it as their slices land.

## Decisions

- **D-1** *The design-system page lists a "breadcrumb" variant but renders none, and every mock puts
  the breadcrumb before `.page-head`, not in it. Where does it go?* In `[slot=breadcrumb]`, rendered
  before `.page-head` inside the host, so the DOM order and spacing match the mocks while the page
  keeps one composition point.
- **D-2** *The mocks omit `p.page-head__sub` when there is no sentence; the component cannot tell
  whether `[slot=sub]` was filled. Render it always?* Yes: the paragraph is always rendered and
  `.page-head__sub:empty { display: none }` hides it, so it is neither visible nor in the
  accessibility tree. Angular strips whitespace, so the empty paragraph matches `:empty`.
- **D-3** *The design system says "the route's main heading is the focus destination". Does the
  header own that?* It offers the target (`tabindex="-1"` and `focusHeading()`); the router decides
  when to call it, so the header never steals focus on background refresh.
- **D-4** *The "actions" variant renders no actions on the design-system page. What goes in the
  default slot?* The page's primary action or search: the directory's search form is the only
  mocked case. Other toolbars (projects filters, events tabs) stay outside the header, as mocked.
- **D-5** *`aria-busy` on a heading block?* Kept, as the dashboard loading mock does, so assistive
  technology knows the summary sentence is provisional.
