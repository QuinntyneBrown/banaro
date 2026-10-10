# Hero

| Field | Value |
|---|---|
| Selector | `bn-hero` |
| Library path | `frontend/projects/components/src/lib/hero/` |
| Status | planned |
| Traces to | L2-039, L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`hero.html`](../../design-system/components/hero.html) |
| Source mocks | [`pages/home/default`](../../mocks/pages/home/default.html), [`pages/home/loading`](../../mocks/pages/home/loading.html), [`pages/home/error`](../../mocks/pages/home/error.html), [`pages/home/partial`](../../mocks/pages/home/partial.html) |
| Rendering | [`hero.html`](hero.html) |

## Purpose and scope

The opening of the public home page: Banaro's promise, "Build what matters, with believers down the
street.", the sub-copy that names who it is for, the two actions ("Join Banaro", "Browse builders")
and, beside them on wide screens, one modest square photo with a caption and a member's
testimonial. It introduces Banaro's faith-aligned, local purpose with restrained imagery.

Use [page-header](page-header.md) for every other page's heading. The testimonial inside the hero is
the [testimonial](testimonial.md) component; the actions are [buttons](button.md).

Out of scope:

- Choosing the actions: the page passes "Join Banaro" and "Browse builders" to visitors and "Go to
  dashboard" to members (L2-039).
- The testimonial's own markup and rules ([testimonial](testimonial.md)).
- The statistics row that follows the hero ([stat](stat.md)) and the home page's sections.
- Server rendering and the document `title`/`description`/canonical link, which the page and SSR own.

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/home/default` | eyebrow + heading with accent + lead + actions + photo + testimonial | "For Christian builders in Toronto and the GTA"; "Build what matters, with" + accent "believers down the street."; lead "Banaro connects Christian founders, engineers, designers and product managers across Toronto and the GTA — so you can find collaborators, share what you're making, and meet in person."; actions primary lg "Join Banaro", quiet lg "Browse builders" with arrow; photo `coffee-together.jpg` alt "Two builders talking over coffee at a wooden table", caption "Coffee in Leslieville" / "Sat, 8:30 am"; testimonial Hannah Kowalski | default | canvas |
| `pages/home/loading`, `pages/home/error`, `pages/home/partial` | same | same | identical to default: the hero never loads or fails (D-3) | canvas |
| `/` for a signed-in member (L2-039 AC2) | same, actions changed | primary lg "Go to dashboard", quiet lg "Browse builders" | default | canvas |

Every row is buildable with the API below.

## Anatomy

1. **Section** — `section.hero`, labelled by the title. Grid of the copy column and the aside.
2. **Copy column** — an unclassed `div`.
3. **Eyebrow** — `p.eyebrow`.
4. **Title** — `h1.hero__title`; the accent phrase is an `em` in `--color-fg-accent`.
5. **Lead** — `p.lead.hero__lead`.
6. **Actions** — `div.hero__actions`, a wrapping row holding the `[slot=actions]` buttons.
7. **Aside (optional)** — `div.hero__aside`; rendered only when a photo or testimonial is given.
8. **Photo (optional)** — `figure.photo.photo--small` > `div.photo__frame` > `img`, then
   `figcaption.photo__caption` with two `span`s (place, time).
9. **Testimonial (optional)** — `[slot=testimonial]`, a `bn-testimonial`.

Host: `bn-hero` is `display: block`; it renders `section.hero` inside.

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `eyebrow` | `string \| undefined` | `undefined` | no | Renders `p.eyebrow` above the title when set. |
| `heading` | `string` | — | yes | First part of the `h1` text, before the accent. |
| `headingAccent` | `string \| undefined` | `undefined` | no | Rendered after `heading` and one space, inside `em`. |
| `lead` | `string` | — | yes | The sub-copy. |
| `headingId` | `string` | `'hero-title'` | no | `id` of the `h1`; the section's `aria-labelledby` points at it. |
| `photo` | `HeroPhoto \| null` | `null` | no | `{ src: string; alt: string; width: number; height: number; caption?: string; captionMeta?: string }`. Renders the figure; `alt` is required and never empty; the caption spans render only when given. |

Inputs are signal inputs. `HeroPhoto` is exported from the library.

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| None — the projected buttons and links emit their own events. | | |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `[slot=actions]` | one or two `bn-button` links or buttons, `size="lg"` | The first is the primary action. Projected into `.hero__actions`. |
| `[slot=testimonial]` | one `bn-testimonial` | Projected after the photo inside `.hero__aside`. |

The component renders `.hero__aside` when `photo` is set or the testimonial slot has content
(detected with a `contentChild` of the testimonial component). Each slot is declared once.

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Promise | no aside | Copy and actions only (a future landing page). |
| Photo | `photo` set, no testimonial | Copy beside the square photo. |
| Testimonial | testimonial slot, no photo | Copy beside a member's words. |
| Photo and testimonial | both | The home page. |

| Size | Modifier | Height | Padding | Type |
|---|---|---|---|---|
| One size | — | content | `--space-16` top, `--space-12` bottom; from 1024 px `--space-24` / `--space-16` | title `--text-display`, lead `--text-body-lg` |

The title is capped at `--size-hero-title-max-width-4`; the lead at `--layout-measure`; the photo at
`--size-photo--small-max-width-5`.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | As anatomy | Section named by the `h1` |
| Signed in | page passes "Go to dashboard" | Primary action label changes | Link name changes |
| Photo hover | `.photo:hover` | Photo scales to 1.03 over `--duration-deliberate` | — |
| Home loading, error, partial | page state | Hero unchanged | Unchanged |
| Focus | `:focus-visible` on an action | Button's focus ring | — |
| Disabled, busy | — | Not applicable: the hero's actions are navigation links | — |

## Markup

```html
<!-- rendered: photo and testimonial (pages/home/default) -->
<bn-hero>
  <section class="hero" aria-labelledby="hero-title">
    <div>
      <p class="eyebrow">For Christian builders in Toronto and the GTA</p>
      <h1 class="hero__title" id="hero-title">Build what matters, with <em>believers down the street.</em></h1>
      <p class="lead hero__lead">Banaro connects Christian founders, engineers, designers and product managers across Toronto and the GTA — so you can find collaborators, share what you're making, and meet in person.</p>
      <div class="hero__actions">
        <a class="btn btn--primary btn--lg" href="/join">Join Banaro</a>
        <a class="btn btn--quiet btn--lg" href="/builders">Browse builders <svg class="btn__arrow icon" viewBox="0 0 24 24" aria-hidden="true">…</svg></a>
      </div>
    </div>
    <div class="hero__aside">
      <figure class="photo photo--small">
        <div class="photo__frame"><img src="/images/coffee-together.jpg" width="480" height="480" alt="Two builders talking over coffee at a wooden table"></div>
        <figcaption class="photo__caption"><span>Coffee in Leslieville</span><span>Sat, 8:30 am</span></figcaption>
      </figure>
      <bn-testimonial>…</bn-testimonial>
    </div>
  </section>
</bn-hero>
```

```html
<!-- rendered: promise (no aside) -->
<section class="hero" aria-labelledby="hero-title">
  <div>
    <p class="eyebrow">For Christian builders in Toronto and the GTA</p>
    <h1 class="hero__title" id="hero-title">Build what matters, with <em>believers down the street.</em></h1>
    <p class="lead hero__lead">Banaro connects Christian founders, …</p>
    <div class="hero__actions">…</div>
  </div>
</section>
```

The photo-only and testimonial-only variants differ only in which child `.hero__aside` holds.

```html
<!-- consumer -->
<bn-hero
  [eyebrow]="'home.hero.eyebrow' | t"
  [heading]="'home.hero.titleStart' | t"
  [headingAccent]="'home.hero.titleEmphasis' | t"
  [lead]="'home.hero.lead' | t"
  [photo]="{ src: '/images/coffee-together.jpg', width: 480, height: 480, alt: ('home.hero.photoAlt' | t), caption: ('home.hero.photoPlace' | t), captionMeta: ('home.hero.photoTime' | t) }"
>
  @if (signedIn()) {
    <a slot="actions" bn-button variant="primary" size="lg" routerLink="/dashboard">{{ 'home.hero.dashboard' | t }}</a>
  } @else {
    <a slot="actions" bn-button variant="primary" size="lg" routerLink="/join">{{ 'home.hero.join' | t }}</a>
  }
  <a slot="actions" bn-button variant="quiet" size="lg" arrow routerLink="/builders">{{ 'home.hero.browse' | t }}</a>
  <bn-testimonial slot="testimonial" [text]="'home.testimonial.text' | t" [author]="'Hannah Kowalski'" [detail]="'home.testimonial.detail' | t" photo="/images/hannah-kowalski.jpg" />
</bn-hero>
```

One `@if` per slotted node, as AGENTS.md requires.

## Design

- Section: `display: grid`, gap `--space-12`, `padding-block: var(--space-16) var(--space-12)`.
  From 64 rem: `grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr)`, gap `--space-20`,
  `padding-block: var(--space-24) var(--space-16)`, `align-items: end`.
- Title: `--text-display`, `--letter-spacing-tight`, `max-width: var(--size-hero-title-max-width-4)`,
  `margin-top: var(--space-6)` below the eyebrow (replaces the mock's inline style), balanced
  wrapping. `em` is upright (`font-style: normal`) in `--color-fg-accent`.
- Lead: `.lead` (`--text-body-lg`, `--color-fg-muted`, `max-width: var(--layout-measure)`),
  `margin-top: var(--space-8)`.
- Actions: `display: flex; flex-wrap: wrap`, gap `--space-3`, `margin-top: var(--space-10)`.
- Aside: `display: grid`, gap `--space-6`, `align-content: end`.
- Photo: `.photo--small` `max-width: var(--size-photo--small-max-width-5)`; frame
  `border-radius: var(--radius-lg)`, `aspect-ratio: 1`, `overflow: hidden`, background
  `--color-bg-subtle` while the image loads; image `object-fit: cover`.
- Caption: `margin-top: var(--space-3)`, `--text-caption`, `--color-fg-subtle`, the two spans
  `justify-content: space-between` with `--space-4` between.
- Motion: photo `scale` transition `--duration-deliberate` `--ease-standard`, to 1.03 on hover,
  inside `prefers-reduced-motion: no-preference`.

Component tokens:

| Token | Aliases | Overridden by |
|---|---|---|
| None — the hero reads semantic and layout tokens directly. | | |

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Title | `--color-fg-default` | `--palette-ink-900` | `--palette-night-50` |
| Accent phrase | `--color-fg-accent` | `--palette-sage-700` | `--palette-sage-300` |
| Lead | `--color-fg-muted` | `--palette-stone-700` | `--palette-night-200` |
| Eyebrow, caption | `--color-fg-subtle` | `--palette-stone-600` | `--palette-night-300` |
| Photo placeholder | `--color-bg-subtle` | `--palette-oat-200` | `--palette-night-800` |
| Page behind | `--color-bg-canvas` | `--palette-oat-100` | `--palette-night-950` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-canvas` | 4.5:1 | Title |
| `--color-fg-accent` | `--color-bg-canvas` | 3:1 | Accent phrase (display size, large text) |
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Lead |
| `--color-fg-subtle` | `--color-bg-canvas` | 4.5:1 | Eyebrow and caption |
| `--color-focus-ring` | `--color-bg-canvas` | 3:1 | Focused action |

## Responsive behaviour

| Range | Layout |
|---|---|
| < 1024 px | One column: copy, actions, then the aside (photo, then testimonial). |
| ≥ 1024 px | Copy column (1.6 fr) beside the aside (1 fr), bottom-aligned. |

- Actions wrap onto a second line when they do not fit; each keeps its `lg` height.
- The title wraps within `--size-hero-title-max-width-4` and balances.
- At 320 px nothing scrolls horizontally or clips; at 200 % zoom everything stays available; both
  actions are at least 44 × 44 CSS px.

## Accessibility

### Role and pattern

`section` labelled by the `h1` through `aria-labelledby` (a named region); native links and
buttons for the actions; `figure`/`figcaption` for the photo.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | "Join Banaro" (or "Go to dashboard"), then "Browse builders", then the next control after the hero. Nothing else in the hero is focusable. |
| <kbd>Enter</kbd> | Follows the focused link. |

### Focus

The actions show the shared focus ring. The hero never moves focus.

### Labelling

The section's name is the full title, "Build what matters, with believers down the street." The
photo has a descriptive `alt`; the caption is read after it. The `em` adds no spoken emphasis.

### Announcements

None.

### Motion

The photo's hover scale and the button arrow nudge run only under
`prefers-reduced-motion: no-preference`; with reduced motion the duration tokens are near zero and
nothing scales.

## Content and internationalisation

- Title: the promise, sentence case, ending with a full stop inside the accent phrase.
- Lead: one sentence naming who Banaro is for and what they can do; it may use an em dash.
- Actions: verb first, two or three words ("Join Banaro", "Browse builders", "Go to dashboard").
- Caption: place and time ("Coffee in Leslieville", "Sat, 8:30 am"), formatted per L2-052.
- Translatable inputs: `eyebrow`, `heading`, `headingAccent`, `lead`, `photo.alt`,
  `photo.caption`, `photo.captionMeta`, action labels. Data values: none.
- Splitting the title into `heading` and `headingAccent` lets each locale choose its accent phrase;
  French runs about 30 % longer and wraps to more lines within the same cap.

## Performance

- Change detection: `OnPush`, signal inputs; the "has aside" flag is a `computed`.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Hero.ts` renders the home hero with
  the promise copy, "Join Banaro" and "Browse builders", the coffee photo captioned "Coffee in
  Leslieville" / "Sat, 8:30 am" and Hannah Kowalski's testimonial; iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly 100–300 ms.
- Composite scenarios: `DarkTheme`.
- Layout stability: the photo declares `width` and `height` and the frame has `aspect-ratio: 1`, so
  the image never shifts the aside; the image is not lazy-loaded because it is in the first
  viewport on desktop.
- Weight: composes `bn-button` (projected) and `bn-testimonial`; no other dependencies.

## Acceptance criteria

### Rendering

- **AC-1** Given the home page for a visitor, when the hero renders, then it shows the eyebrow "For Christian builders in Toronto and the GTA", the `h1` "Build what matters, with believers down the street." with "believers down the street." in an `em`, the lead, and the actions "Join Banaro" and "Browse builders". (L2-039)
- **AC-2** Given a signed-in member, when the page passes "Go to dashboard" as the primary action, then the hero shows "Go to dashboard" and "Browse builders" with no "Join Banaro". (L2-039)
- **AC-3** Given the home page served by the server, when its HTML is fetched without running script, then the response contains the hero's `h1` text and lead. (L2-039)
- **AC-4** Given a `photo` with caption "Coffee in Leslieville" and meta "Sat, 8:30 am" and a testimonial, when the hero renders, then `.hero__aside` contains the figure first and the testimonial second. (L2-039)
- **AC-5** Given no photo and no testimonial, when the hero renders, then no `.hero__aside` element exists. (L2-039)
- **AC-6** Given the photo, when it renders, then the `img` declares `width="480"` and `height="480"` and is not lazy-loaded. (L2-048)

### States

- **AC-7** Given the home page in its loading, error and partial states, when the hero renders, then it is identical to the default state. (L2-039)

### Keyboard and focus

- **AC-8** Given the hero, when a keyboard user tabs into it, then focus visits "Join Banaro" and then "Browse builders", each with a visible 2 px focus ring of at least 3:1, and nothing else in the hero takes focus. (L2-050)

### Screen readers

- **AC-9** Given the hero, when a screen reader lists regions and headings, then the section is a region named "Build what matters, with believers down the street." and its `h1` is the page's only level-1 heading. (L2-050)
- **AC-10** Given the photo, when it is read, then its name is "Two builders talking over coffee at a wooden table", followed by the caption. (L2-050)

### Theming

- **AC-11** Given the light and dark themes, when the hero renders, then the title and lead are at least 4.5:1, the accent phrase at least 3:1 (display size), and the eyebrow and caption at least 4.5:1 against the canvas. (L2-050)
- **AC-12** Given a theme change, when the hero re-renders, then its colours change without component code because the hero uses only design-system tokens. (L2-051)

### Responsive

- **AC-13** Given a 360 px viewport, when the hero renders, then the copy, actions, photo and testimonial stack in one column in that order and the page does not scroll horizontally. (L2-049)
- **AC-14** Given a 1280 px viewport, when the hero renders, then the copy column and the aside sit side by side, bottom-aligned, matching `pages/home/default` within the visual-parity threshold. (L2-049)
- **AC-15** Given a 320 px viewport, when "Join Banaro" and "Browse builders" do not fit on one line, then the second wraps below the first and both stay at least 44 × 44 px. (L2-049)

### Motion

- **AC-16** Given `prefers-reduced-motion: reduce`, when the pointer rests on the photo, then the photo does not scale. (L2-050)

### Content

- **AC-17** Given the hero's source, when it renders with the en-CA catalogue, then every visible string comes from an input or a slot and none is hard-coded in the component. (L2-052)

### Performance

- **AC-18** Given the home page on a simulated mid-range mobile device, when Lighthouse measures it, then the hero contributes no layout shift and LCP stays at or under 2.5 s. (L2-048)
- **AC-19** Given a change to the hero's template, inputs or styles, when the perf test runs the `Hero` scenario against the base branch, then it is not flagged as a possible regression. (L2-048)

## Implementation notes

- Folder `frontend/projects/components/src/lib/hero/`: `hero.ts` (`Hero` class, selector
  `bn-hero`, exports `HeroPhoto`), `hero.css`; export from `public-api.ts`.
- Move the hero styles (`.hero*`, `.photo*`) out of `pages/home/home.css` into `hero.css`; the home
  page's inline markup becomes `<bn-hero>`.
- Composes [testimonial](testimonial.md) (detects it with `contentChild(Testimonial)`) and expects
  [button](button.md) links with `size="lg"` in `[slot=actions]`; the "Browse builders" arrow is the
  button's `arrow` input.
- The mock's inline `style="margin-top: var(--space-6)"` on the title moves into `hero.css` as
  `.eyebrow + .hero__title`.
- Add `frontend/projects/perf-test/src/scenarios/Hero.ts` and export it from `index.ts`.

## Decisions

- **D-1** *The title's accent phrase is markup inside a translatable sentence. How does it arrive?*
  As two inputs, `heading` and `headingAccent`, joined by one space; this keeps copy in the
  catalogue (the built home page already uses `titleStart` and `titleEmphasis` keys) without
  passing HTML.
- **D-2** *The design-system README lists promise, photo and testimonial variants, but the page
  renders only the full hero. What does each look like?* The aside holds whatever is given; with
  neither, the aside is not rendered and the copy keeps its 1.6 fr column at ≥ 1024 px.
- **D-3** *L2-039 says skeletons show while the home page loads. Does the hero have a loading
  state?* No: its copy is static and server-rendered, and the loading, error and partial mocks all
  show the full hero; only the feeds below it load.
- **D-4** *Lazy-load the hero photo?* No. It is in the first viewport at 1280 px, and L2-048 lazy-
  loads only images below it; width and height are declared so it never shifts.
- **D-5** *Is the photo figure its own component?* No. `.photo` appears only in the hero, so the
  hero owns it; if another screen needs it, it moves to its own CRD then.
