# Brand

| Field | Value |
|---|---|
| Selector | `a[bn-brand]` |
| Library path | `frontend/projects/components/src/lib/brand/` |
| Status | built |
| Traces to | L2-039, L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`brand.html`](../../design-system/components/brand.html) |
| Source mocks | The header of every mock (196 files): visitor pages such as [`pages/home/default`](../../mocks/pages/home/default.html) link it to home; member pages, dialogs and notifications such as [`pages/dashboard/default`](../../mocks/pages/dashboard/default.html) link it to the dashboard |
| Rendering | [`brand.html`](brand.html) |

## Purpose and scope

The brand is Banaro's mark and wordmark as a home link: a small house with a sun beside the lowercase
wordmark "banaro". It opens the [top bar](top-bar.md) on every page and takes a visitor home (`/`)
and a member to their dashboard (`/dashboard`).

It is an attribute component on a native `<a>`, so the link keeps its own semantics, router
directives and name. Nothing else in the product draws the mark.

Out of scope:

- Where the brand links to (the top bar's `brandLink`).
- Favicon, social images and e-mail headers (application assets, not this component).

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| Header of 34 visitor screens (`home`, `about`, `sign-in`, `join`, legal, error, offline) | `a[bn-brand]` → `/`, `aria-label` "Banaro home", name "banaro" | mark + "banaro" | default, hover, focus | canvas |
| Header of 162 member screens, dialogs and notifications | `a[bn-brand]` → `/dashboard`, same label and name | mark + "banaro" | default, hover, focus; inert behind dialogs | canvas |
| Design-system "wordmark" and "mark" specimens | same | mark + "banaro" (both specimens identical) | default | canvas |

## Anatomy

1. **Link** — the host `a.brand`: inline-flex, gap `--space-3`, the accessible name from the
   consumer's `aria-label`.
2. **Mark** — `svg.brand__mark[aria-hidden=true]`, `--space-8` square: house outline in
   `currentColor` coloured `--color-accent`, plus the sun `circle.brand__sun`.
3. **Wordmark** — `span` with the `name` text.

Host: the native `<a>` is the component; the classes go on it (`class="brand"`).

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `name` | `string` | — | yes | Visible wordmark, "banaro". Not translated (it is the product name). |

The consumer sets `aria-label` ("Banaro home", translatable) and `routerLink` or `href` on the host.

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| None | | It is a link; navigation is the router's. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| None | | Mark and wordmark come from the template and `name`. |

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Wordmark (mark + name) | — | Every header. |

| Size | Modifier | Height | Padding | Type |
|---|---|---|---|---|
| One size | — | at least `--target-comfortable` | none | `--font-size-lg`, `--font-weight-semibold`, tightened letter spacing |

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Mark `--color-accent`, sun `--color-warning-icon`, name `--color-fg-default` | Link "Banaro home" |
| Hover | `:hover` | No change (the colour stays `--color-fg-default`, no underline) | — |
| Focus | `:focus-visible` | 2 px `--color-focus-ring` ring, `--radius-sm` | — |
| Current | on the brand's own target | No change; the brand never carries `aria-current` | — |
| Inert | a dialog is open | Unchanged | Hidden by the dialog |

## Markup

```html
<!-- rendered -->
<a class="brand" href="/dashboard" aria-label="Banaro home">
  <svg class="brand__mark" viewBox="0 0 32 32" aria-hidden="true">
    <path d="M5 27V14.5L16 5.5l11 9V27" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M12.5 27v-6.5h7V27" fill="none" stroke="currentColor" stroke-width="1.6"/>
    <circle class="brand__sun" cx="25.5" cy="6.5" r="2.4"/>
  </svg>
  <span>banaro</span>
</a>
```

```html
<!-- consumer -->
<a bn-brand [routerLink]="brandLink()" [attr.aria-label]="'shell.home' | t" name="banaro"></a>
```

## Design

- Link: inline-flex, `align-items: center`, gap `--space-3`, min height `--target-comfortable`,
  `--color-fg-default`, no underline, `--font-weight-semibold`, `--font-size-lg`, letter spacing
  `calc(-1 * var(--size-rand-and-header-------------------------------letter-spacing-2))`.
- Mark: `--space-8` square, `flex: none`, `--color-accent`; sun fill `--color-warning-icon`.
- No motion.

Component tokens: none.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Wordmark | `--color-fg-default` | resolved live | resolved live |
| Mark | `--color-accent` | resolved live | resolved live |
| Sun | `--color-warning-icon` | resolved live | resolved live |
| Focus ring | `--color-focus-ring` | resolved live | resolved live |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-canvas` | 4.5:1 | Wordmark |
| `--color-accent` | `--color-bg-canvas` | 3:1 | Mark outline |
| `--color-focus-ring` | `--color-bg-canvas` | 3:1 | Focus ring |

The sun is decorative and has no contrast minimum.

## Responsive behaviour

- The layout does not change across breakpoints: mark and wordmark stay together at 320 px and the
  wordmark never wraps.
- The link is at least 44 × 44 CSS px at every width.

## Accessibility

### Role and pattern

A native link. The mark is `aria-hidden`; the name comes from `aria-label`.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Reaches the brand right after the skip link. |
| <kbd>Enter</kbd> | Goes home (visitor) or to the dashboard (member). |

### Focus

2 px `--color-focus-ring` ring at `--focus-ring-offset`, `--radius-sm`.

### Labelling

"Banaro home" contains the visible "banaro" (WCAG 2.5.3, case-insensitive), so voice users can say
"click banaro".

### Announcements

None.

### Motion

None.

## Content and internationalisation

- Wordmark always "banaro", lowercase, as drawn; in running text the product is "Banaro".
- Translatable: the `aria-label` ("Banaro home"), set by the consumer. Not translatable: `name`.

## Performance

- Change detection: `OnPush`, one signal input, static SVG.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Brand.ts` (exists) renders the
  brand linking to `/` with "Banaro home" and "banaro"; iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly 100–300 ms.
- Composite scenarios: `TopBar`, `DarkTheme`.
- Layout stability: inline SVG with a fixed size; nothing loads.
- Weight: none beyond Angular core.

## Acceptance criteria

### Rendering

- **AC-1** Given a visitor on `/about`, when the header renders, then the brand is a link named "Banaro home" to `/`, showing the house-and-sun mark and "banaro". (L2-039)
- **AC-2** Given Amara signed in on `/events`, when she activates the brand, then the dashboard opens. (L2-039)

### Keyboard and focus

- **AC-3** Given keyboard navigation from the top of a page, when Tab passes the skip link, then the brand receives focus next and shows a 2 px `--color-focus-ring` outline with at least 3:1 contrast. (L2-050)

### Screen readers

- **AC-4** Given the brand, when read by assistive technology, then the mark is hidden and the name "Banaro home" contains the visible text "banaro". (L2-050)

### Theming

- **AC-5** Given the dark theme, when the brand renders, then the wordmark measures at least 4.5:1 and the mark at least 3:1 against the canvas. (L2-050)
- **AC-6** Given the brand's styles, when inspected, then every colour comes from a design-system token. (L2-051)

### Responsive

- **AC-7** Given 320 px, when the header renders, then the mark and "banaro" sit on one line and the link is at least 44 × 44 px. (L2-049)

### Content

- **AC-8** Given the en-CA catalogue, when the brand renders, then its accessible name comes from the catalogue and the wordmark stays "banaro". (L2-052)

### Performance

- **AC-9** Given a change to the brand, when the perf test runs the `Brand` scenario against the base branch, then it is not flagged as a possible regression. (L2-048)

## Implementation notes

The built `a[bn-brand]` matches this CRD (inputs, markup, styles, the 44 px minimum height and the
`Brand` scenario). No gaps. The top bar passes the brand's target (`brandLink`, see
[top bar](top-bar.md)).

## Decisions

- **D-1** *A mark-only variant?* Not built. The design system lists "mark" but draws the same
  wordmark specimen, and every screen shows mark and wordmark together ("keep the wordmark beside the
  mark when space permits"; there is room at 320 px).
- **D-2** *Hover feedback?* None beyond the cursor, as in components.css (`.brand:hover` keeps the
  colour); the focus ring is the visible state for keyboard users.
- **D-3** *Translate the wordmark?* No; "banaro" is the product name. Only the link's name is
  translated.
