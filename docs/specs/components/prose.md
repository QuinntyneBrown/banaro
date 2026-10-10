# Prose and legal content

| Field | Value |
|---|---|
| Selector | `div[bn-prose]`, `section[bn-prose]`, `article[bn-prose]` |
| Library path | `frontend/projects/components/src/lib/prose/` |
| Status | planned |
| Traces to | L2-007, L2-011, L2-013, L2-019, L2-034, L2-041, L2-048, L2-049, L2-050, L2-051 |
| Design system | [`prose.html`](../../design-system/components/prose.html) |
| Source mocks | [`pages/code-of-conduct/default`](../../mocks/pages/code-of-conduct/default.html), [`pages/privacy/default`](../../mocks/pages/privacy/default.html), [`pages/about/default`](../../mocks/pages/about/default.html), [`pages/builder-profile/default`](../../mocks/pages/builder-profile/default.html), [`pages/project-detail/default`](../../mocks/pages/project-detail/default.html), [`pages/event-detail/ended`](../../mocks/pages/event-detail/ended.html), [`dialogs/report/default`](../../mocks/dialogs/report/default.html), [`dialogs/give-feedback/default`](../../mocks/dialogs/give-feedback/default.html) |
| Rendering | [`prose.html`](prose.html) |

## Purpose and scope

Prose sets running text with Banaro's calm reading typography: the About,
Privacy and Code of conduct pages (headings, paragraphs, bulleted lists,
inline links), a builder's bio, a project's description and an event's recap.
It caps the line length, spaces blocks evenly and colours body text muted so
headings lead.

It renders two kinds of content: **authored** copy from the translation
catalogue, projected as real headings, paragraphs and lists; and
**member-written** text (bios, descriptions), passed as a plain string, split
into paragraphs and output as text, never as HTML.

Use [page-header](page-header.md) for the page title and "Last updated" line,
[alert](alert.md) for a notice, [list](list.md) for structured items, and
[description-list](description-list.md) for facts.

Out of scope:

- The page title, eyebrow and sub-copy ("Last updated 1 September 2026").
- The code of conduct's table of contents (L2-034 AC1) — the page builds it
  from the prose's heading ids.
- Versioning legal text (L2-034 AC3, L2-041 AC2).
- The narrow column (`.page-block.narrow`) the legal pages sit in.

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/code-of-conduct/default` | legal, authored | intro `p`; five `h2` ("Be kind and be honest" … "If something goes wrong"); two `ul` of three; contact link "the contact page" | default | canvas, narrow column |
| `pages/privacy/default` | legal, authored | intro; six `h2` ("What we collect" … "Your choices"); two `ul`; link | default | canvas, narrow column |
| `pages/about/default` | body, authored | four `h2`, three `p`, one `ul` of the four areas | default | canvas |
| `pages/builder-profile/default`, `sparse`, `own` (and behind `dialogs/block-builder/*`, `dialogs/report/*`) bio | body, member text | Daniel Reyes: "Ten years shipping Laravel apps; …" and a second paragraph; Esther Nguyen one line "Product designer in Riverdale." | default, sparse | canvas |
| `pages/project-detail/*` (and behind `dialogs/give-feedback/*`, `dialogs/offer-to-help/*`) description | body, member text | "Psalter helps you hide Scripture in your heart …", two or three paragraphs | default | canvas |
| `pages/event-detail/ended` recap | body, authored by the host | "Sixty-four builders came to the Centre for Social Innovation …" plus a `ul` of three highlights | default | canvas |
| `pages/event-detail/*` description | body | event description with a `ul` and a map link | default | canvas |
| Design system *Contact* | contact, authored | contact details as text and links | default | surface |

## Anatomy

1. **Container** — `.prose` on the host `div`/`section`/`article`: a grid with
   `--space-5` row gap, max width `--size-search-max-width-18`.
2. **Section heading** — `h2` (`--text-h2` at `--font-size-2xl`,
   `--space-6` extra top margin), with an `id` for a table of contents.
3. **Paragraph** — `p`, `--text-body-lg`, `--color-fg-muted`.
4. **List** — `ul` with `--space-6` left padding and `--space-2` gap; `li` as
   paragraphs.
5. **Link** — `a`, base link styles (underlined, `--color-fg-link`).

Host: an attribute component on the native element the page chooses; the
component adds `.prose` and, in `text` mode, renders the paragraphs itself.

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `text` | `string \| null` | `null` | no | Member-written plain text. When set, the projected content is ignored; the text is split on blank lines into `p` elements and single line breaks are kept as `br`. Rendered by interpolation, so markup shows literally. |
| `variant` | `'body' \| 'legal' \| 'contact'` | `'body'` | no | No visual difference (D-1); sets nothing but documents intent for tests. |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| None | — | Static text; links route on their own. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| default | `h2`, `h3`, `p`, `ul`, `ol`, `li`, `a`, `strong`, `em` | Authored copy from the catalogue, written as elements in the page template. Headings start at `h2` (the page owns `h1`). Each `h2` has an `id`. |

The slot is declared once, in the branch where `text` is null.

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Body | `.prose` | Bios, descriptions, recaps, About. |
| Legal | `.prose` | Privacy and Code of conduct: headed sections with lists. |
| Contact | `.prose` | Contact details as real text and `mailto:` links. |

| Size | Modifier | Height | Padding | Type |
|---|---|---|---|---|
| One size | — | content | none | `--text-body-lg`, headings `--text-h2` at `--font-size-2xl` |

Width: up to `--size-search-max-width-18`, never wider; narrower containers
win.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Muted body text under default-colour headings | Headings navigable |
| Sparse | one-line `text` | A single paragraph; no extra space | — |
| Long words or URLs | unbroken strings in member text | Wrap with `overflow-wrap: anywhere` | Full text |
| Link hover / focus | `:hover` / `:focus-visible` on `a` | `--color-fg-link-hover`; shared focus ring | Link name is its text |
| Disabled, busy, error | not supported | — | Static content; loading is the page's skeleton |

## Markup

```html
<!-- rendered: legal, authored -->
<div bn-prose class="prose">
  <p>Banaro is a gathering of people who share a faith and a craft. …</p>
  <h2 id="be-kind">Be kind and be honest</h2>
  <ul>
    <li>Treat every member with respect, whatever their church, background, seniority or experience.</li>
    …
  </ul>
  <h2 id="if-something-goes-wrong">If something goes wrong</h2>
  <p>Use Report on any profile, project or message, or write to us at <a href="/contact">the contact page</a>. …</p>
</div>
```

```html
<!-- rendered: member text -->
<div bn-prose class="prose">
  <p>Ten years shipping Laravel apps; now building Psalter after hours and looking for a founder to go full time with.</p>
  <p>I led the platform team at a Mississauga logistics firm until this spring. …</p>
</div>
```

```html
<!-- consumer -->
<div bn-prose [text]="profile.bio"></div>
<div bn-prose variant="legal">
  <p>{{ t('conduct.intro') }}</p>
  <h2 id="be-kind">{{ t('conduct.kind.title') }}</h2>
  <ul>@for (key of kindKeys; track key) { <li>{{ t(key) }}</li> }</ul>
</div>
```

## Design

- Container grid, gap `--space-5`, max width `--size-search-max-width-18`.
- `h2`: `--text-h2` with `--font-size-2xl`, top margin `--space-6`
  (added to the gap), `--color-fg-default`.
- `p`, `li`: `--text-body-lg` in `--color-fg-muted`.
- `ul`: padding left `--space-6`, grid gap `--space-2`.
- Links: base `a` styles.
- No motion of its own; no elevation.

Component tokens:

| Token | Aliases | Overridden by |
|---|---|---|
| None | — | Semantic tokens directly. |

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Headings | `--color-fg-default` | `--palette-ink-900` | `--palette-night-50` |
| Body and list text | `--color-fg-muted` | `--palette-stone-700` | `--palette-night-200` |
| Links | `--color-fg-link` | `--palette-sage-700` | `--palette-sage-300` |
| Link hover | `--color-fg-link-hover` | `--palette-sage-800` | `--palette-sage-200` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-canvas` | 4.5:1 | Headings |
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Body |
| `--color-fg-link` | `--color-bg-canvas` | 4.5:1 | Links |
| `--color-focus-ring` | `--color-bg-canvas` | 3:1 | Focus ring on links |

Under `prefers-contrast: more` muted body text takes `--color-fg-default`
through tokens.

## Responsive behaviour

- No breakpoints of its own; text reflows in the column. At 360 px the
  measure is the viewport minus the page margin.
- At 320 px nothing scrolls horizontally or clips; at 200 % zoom everything stays available; every target is at least 44 × 44 CSS px on touch devices (inline links in running text are exempt from the target size under WCAG 2.5.8; their line height gives them a comfortable height).

## Accessibility

### Role and pattern

Native document structure: headings, paragraphs, lists, links. No ARIA.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Visits inline links in document order. |
| <kbd>Enter</kbd> | Follows a link. |

### Focus

Shared ring on links; the component never moves focus.

### Labelling

- Headings form an outline under the page's single `h1`; no level is skipped.
- Link text says where it goes ("the contact page"), never "click here".
- Contact details are text, never images.

### Announcements

None.

### Motion

None.

## Content and internationalisation

- Plain language and sentence case; say who can see profile information.
- Legal copy is authored per locale in the catalogue, one key per paragraph or
  list item, so a translation can reorder sentences inside a paragraph.
- Member text is shown as written, encoded on output (L2-007 AC6, L2-045 AC5);
  blank lines make paragraphs.
- Dates inside copy follow L2-052 ("1 September 2026").
- Translatable: every authored string. Data: bios, descriptions, recaps.

## Performance

- Change detection: `OnPush`; the paragraph split is a `computed` of `text`.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Prose.ts`
  renders the Code of conduct (intro, five sections, two lists, contact link);
  iterations in `e2e/perf-test/config/scenario-iterations.mjs` keep it at
  roughly 100–300 ms.
- Composite scenarios: `DarkTheme`.
- Layout stability: text only; the page's skeleton reserves the block.
- Weight: no markdown parser, no sanitiser (member text is never HTML).

## Acceptance criteria

### Rendering

- **AC-1** Given `/code-of-conduct`, when the page renders, then the prose shows the intro paragraph, five `h2` sections from "Be kind and be honest" to "If something goes wrong", two bulleted lists, and a link "the contact page" to `/contact`. (L2-034)
- **AC-2** Given the code of conduct, when it renders, then every `h2` has a unique `id` that the page's table of contents links to. (L2-034)
- **AC-3** Given `/privacy`, when the page renders, then the prose shows the sections "What we collect", "What we do with it", "What we never do", "Where it lives", "Cookies" and "Your choices" as `h2` headings. (L2-041)
- **AC-4** Given Daniel Reyes's bio with two paragraphs separated by a blank line, when his profile renders, then the prose shows exactly two `p` elements with that text. (L2-011)
- **AC-5** Given a bio containing `<script>alert(1)</script>` and `<a href="x">link</a>`, when the profile renders, then the characters appear literally as text and no `script` or `a` element is created. (L2-007)
- **AC-6** Given the Psalter description, when the project page renders, then it is shown in prose with its paragraphs intact. (L2-013)
- **AC-7** Given Fall Demo Night has ended, when the recap renders, then the prose shows "Sixty-four builders came to the Centre for Social Innovation." and a list of three highlights. (L2-019)

### Screen readers

- **AC-8** Given the code of conduct page, when a screen reader lists headings, then it finds one `h1` (the page's) followed by the five `h2`s with no skipped level, and axe-core reports no violations in the prose. (L2-050)

### Keyboard and focus

- **AC-9** Given the privacy page, when the visitor tabs to "the contact page", then the link shows the 2 px `--color-focus-ring` outline with at least 3:1 contrast. (L2-050)

### Theming

- **AC-10** Given the light theme, when legal prose renders on the canvas, then body text measures at least 4.5:1, headings at least 4.5:1, and links at least 4.5:1. (L2-050)
- **AC-11** Given the dark theme, when the same prose renders, then its colours change only through the theme's token values and every pair in AC-10 still measures at least 4.5:1. (L2-051)

### Responsive

- **AC-12** Given a bio containing the unbroken URL `https://psalter.example.ca/memorise/psalm-23/verse-by-verse` at 320 px, when the profile renders, then the URL wraps inside the column and the page has no horizontal scroll. (L2-049)
- **AC-13** Given a 1280 px viewport, when the privacy page renders, then no prose line is wider than `--size-search-max-width-18`. (L2-049)

### Performance

- **AC-14** Given a change to prose, when the `Prose` perf-test scenario runs against the base branch with `--fail-on-regression`, then it is not flagged as a possible regression. (L2-048)

## Implementation notes

- Planned. Folder `frontend/projects/components/src/lib/prose/`: `prose.ts`
  (class `Prose`, selector `div[bn-prose], section[bn-prose], article[bn-prose]`),
  `prose.html`, `prose.css`; export from `public-api.ts`.
- Template: `@if (paragraphs(); as ps) { @for (p of ps; track $index) { <p>…</p> } } @else { <ng-content /> }`;
  line breaks inside a paragraph render as `br` from a split, never via `innerHTML`.
- Styles for projected children must reach them: use `:host ::ng-deep`-free
  selectors by keeping `.prose h2`, `.prose p`, `.prose li`, `.prose ul` in the
  global foundations stylesheet, or `ViewEncapsulation.None` scoped to `.prose`
  (D-3).
- Add `overflow-wrap: anywhere` to `.prose p, .prose li` (D-4).
- Scenario: add `Prose.ts`; export from `scenarios/index.ts`.

## Decisions

- **D-1** *How do the design system's Body, Legal and Contact variants differ?* Not visually: the three specimens are identical. The variant input documents intent; the legal look comes from content (headings and lists), not a modifier.
- **D-2** *Line length: the design system says a 58 ch measure (`--layout-measure`), but `components.css` caps `.prose` at `--size-search-max-width-18` (44 rem).* The CRD keeps 44 rem, because the mocks render with `components.css` and visual parity is measured against them. Raised with the lead.
- **D-3** *How are projected elements styled when component styles are encapsulated?* `.prose` is a typography foundation that styles child elements the component does not render, so its rules use `ViewEncapsulation.None` limited to `.prose`-prefixed selectors; this is the one place AGENTS.md's encapsulation rule yields to the "global styles for foundations" rule.
- **D-4** *Long URLs in member text?* They wrap (`overflow-wrap: anywhere`), which `components.css` does not yet set; without it a pasted link overflows at 320 px (L2-049).
- **D-5** *Are links in member text made clickable?* No. Bios are plain text (L2-045 AC5); links live in the profile's links field, rendered by [profile-header](profile-header.md).
- **D-6** *Where does the code of conduct's table of contents (L2-034 AC1), absent from the mock, come from?* The page builds it from the prose `h2` ids; the prose only guarantees the ids. Raised with the lead because the mock lacks the TOC that L2 requires.
