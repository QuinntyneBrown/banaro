# Testimonial and verse

| Field | Value |
|---|---|
| Selector | `bn-testimonial`, `bn-verse` |
| Library path | `frontend/projects/components/src/lib/testimonial/` |
| Status | planned |
| Traces to | L2-039, L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`testimonial.html`](../../design-system/components/testimonial.html) |
| Source mocks | [`pages/home/default`](../../mocks/pages/home/default.html), [`pages/home/loading`](../../mocks/pages/home/loading.html), [`pages/home/error`](../../mocks/pages/home/error.html), [`pages/home/partial`](../../mocks/pages/home/partial.html) |
| Rendering | [`testimonial.html`](testimonial.html) |

## Purpose and scope

Two quiet ways to support community trust with real words and an identifiable source. The
**testimonial** is a member's sentence about Banaro with their name, role and neighbourhood, and
optionally their small square portrait, on a birch card. The **verse** is a short passage of
scripture, centred and set large in the display face, with its reference and a short sage rule
above it, standing on its own between home page sections.

Use [hero](hero.md) to place the testimonial in the home page's opening; use a
[feedback comment](comment.md) for members' comments on projects and the
[message-thread](message-thread.md) for conversation.

Out of scope:

- Choosing which testimonial or verse to show: the page passes the catalogue copy.
- The verse's scroll drift (`.reveal`), which the page applies to its sections.
- Linking the author to their profile: the cast testimonial has no link; if one is wanted later the
  attribution slot takes it (see API).

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/home/*` hero aside | testimonial with portrait | "“Within a week I was advising two founders, both a streetcar ride from my house.”" / "Hannah Kowalski · UX researcher, Roncesvalles"; `hannah-kowalski.jpg` 56 × 56, `alt=""` | default (same in loading, error, partial) | surface card on canvas |
| `pages/home/*` between events and matching | verse, `aria-label="Verse"` | "“Two are better than one, because they have a good return for their labour.”" / "Ecclesiastes 4:9" | default (same in loading, error, partial) | canvas |

Every row is buildable with the API below.

## Anatomy

Testimonial:

1. **Card** — `blockquote.quote`. Two-column grid: portrait and words.
2. **Portrait (optional)** — `img.quote__photo`, `alt=""` (the name follows).
3. **Words wrapper** — an unclassed `div`.
4. **Quotation** — `p.quote__text`.
5. **Attribution** — `p.quote__by`: author, a middle dot, then role and neighbourhood.

Verse:

1. **Section** — `section.verse`, labelled "Verse". Centred one-column grid.
2. **Rule** — `span.verse__rule`, `aria-hidden="true"`, a short sage line.
3. **Text** — `p.verse__text`.
4. **Reference** — `p.verse__ref`.

Hosts: `bn-testimonial` and `bn-verse` are `display: block`; they render the `blockquote` and the
`section` inside.

## API

### Inputs — `bn-testimonial`

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `text` | `string` | — | yes | The quotation, including its quotation marks from the catalogue. |
| `author` | `string` | — | yes | The member's name (data). |
| `detail` | `string \| undefined` | `undefined` | no | Role and neighbourhood ("UX researcher, Roncesvalles"); rendered after " · ". |
| `photo` | `string \| undefined` | `undefined` | no | Portrait URL; rendered 56 × 56 with `alt=""`; omitted when unset. |

### Inputs — `bn-verse`

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `text` | `string` | — | yes | The passage, including its quotation marks from the catalogue. |
| `reference` | `string` | — | yes | Book, chapter and verse ("Ecclesiastes 4:9"). |
| `label` | `string` | — | yes | Accessible name of the section ("Verse"), from the catalogue. |

All inputs are signal inputs.

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| None — both are passive. | | |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `bn-testimonial` `[slot=by]` | inline content, for example a link around the author | Replaces the generated attribution text inside `p.quote__by` when present. |
| `bn-verse` | None | — |

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Testimonial with portrait | `photo` set | The hero aside (the cast's Hannah Kowalski). |
| Testimonial without portrait | `photo` unset | A member without a photo. |
| Verse | `bn-verse` | A passage between home page sections. |

| Size | Modifier | Height | Padding | Type |
|---|---|---|---|---|
| Testimonial, one size | — | content | `--space-6` | `--text-body`; attribution `--text-caption` |
| Verse, one size | — | content | `--layout-section-gap` above | `--font-size-2xl` light display, `--font-size-3xl` from 1024 px |

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | As anatomy | Blockquote / named region |
| No portrait | `photo` unset | Words span the full card width | — |
| Hover, focus, active, disabled | — | Not applicable: both are passive; a link in `[slot=by]` follows the link contract | — |
| Home loading, error, partial | page state | Unchanged: the copy is static | Unchanged |

## Markup

```html
<!-- rendered: testimonial with portrait -->
<bn-testimonial>
  <blockquote class="quote">
    <img class="quote__photo" src="/images/hannah-kowalski.jpg" width="56" height="56" alt="">
    <div>
      <p class="quote__text">“Within a week I was advising two founders, both a streetcar ride from my house.”</p>
      <p class="quote__by">Hannah Kowalski · UX researcher, Roncesvalles</p>
    </div>
  </blockquote>
</bn-testimonial>
```

```html
<!-- rendered: testimonial without portrait -->
<blockquote class="quote quote--no-photo">
  <div>
    <p class="quote__text">“Within a week I was advising two founders, both a streetcar ride from my house.”</p>
    <p class="quote__by">Hannah Kowalski · UX researcher, Roncesvalles</p>
  </div>
</blockquote>
```

```html
<!-- rendered: verse -->
<bn-verse>
  <section class="verse" aria-label="Verse">
    <span class="verse__rule" aria-hidden="true"></span>
    <p class="verse__text">“Two are better than one, because they have a good return for their labour.”</p>
    <p class="verse__ref">Ecclesiastes 4:9</p>
  </section>
</bn-verse>
```

```html
<!-- consumer -->
<bn-testimonial [text]="'home.testimonial.text' | t" author="Hannah Kowalski" [detail]="'home.testimonial.detail' | t" photo="/images/hannah-kowalski.jpg" />
<bn-verse class="reveal" [text]="'home.verse.text' | t" [reference]="'home.verse.reference' | t" [label]="'home.verse.label' | t" />
```

## Design

Testimonial:

- Card: `display: grid; grid-template-columns: auto 1fr`, gap `--space-5`, `align-items: center`,
  padding `--space-6`, `border-radius: var(--radius-lg)`, background `--color-bg-surface`,
  `--border-width-hairline` solid `--color-border-default`. `.quote--no-photo` uses one column.
- Portrait: `--size-quote-photo-width-9` × `--size-quote-photo-height-10`, `--radius-md`,
  `object-fit: cover`.
- Quotation `--text-body`, `--color-fg-default`; attribution `margin-top: var(--space-2)`,
  `--text-caption`, `--color-fg-subtle`.
- Transition on transform and shadow (`--duration-base`, `--duration-slow`, `--ease-standard`)
  is declared by the kit but no hover changes them: the card does not lift because it is not a link.

Verse:

- Section: `display: grid`, gap `--space-5`, `justify-items: center`, `text-align: center`,
  `padding-block: var(--layout-section-gap) 0`.
- Rule: `--space-10` wide, `--border-width-hairline` high, `--color-accent`.
- Text: light weight (`--font-weight-light`), `--font-size-2xl` (`--font-size-3xl` from 64 rem),
  line height 1.45, `--font-family-display`, `max-width: var(--size-verse-text-max-width-8)`,
  tight negative tracking (`--size-uttons----------------------------------------letter-spacing-3`).
- Reference: `--text-overline`, `--letter-spacing-wide`, uppercase by CSS, `--color-fg-subtle`.

Component tokens:

| Token | Aliases | Overridden by |
|---|---|---|
| None — both read semantic tokens directly. | | |

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Card background | `--color-bg-surface` | `--palette-birch-50` | `--palette-night-900` |
| Card rule | `--color-border-default` | `--palette-oat-300` | `--palette-night-700` |
| Quotation, verse text | `--color-fg-default` | `--palette-ink-900` | `--palette-night-50` |
| Attribution, reference | `--color-fg-subtle` | `--palette-stone-600` | `--palette-night-300` |
| Verse rule | `--color-accent` | `--palette-sage-600` | `--palette-sage-300` |
| Page behind the verse | `--color-bg-canvas` | `--palette-oat-100` | `--palette-night-950` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-surface` | 4.5:1 | Quotation |
| `--color-fg-subtle` | `--color-bg-surface` | 4.5:1 | Attribution |
| `--color-fg-default` | `--color-bg-canvas` | 4.5:1 | Verse text |
| `--color-fg-subtle` | `--color-bg-canvas` | 4.5:1 | Verse reference |

The verse rule and card border are decorative; no minimum applies.

## Responsive behaviour

- Testimonial: the same two-column card at every width; the words wrap beside the 56 px portrait.
  At 320 px the words column keeps at least 12 rem.
- Verse: text `--font-size-2xl` below 1024 px, `--font-size-3xl` from 1024 px; always centred and
  capped at `--size-verse-text-max-width-8`.
- At 320 px nothing scrolls horizontally or clips; at 200 % zoom everything stays available; any
  link in the attribution is at least 24 × 24 CSS px and the line is at least 44 px tall.

## Accessibility

### Role and pattern

Testimonial: native `blockquote` (quotation). Verse: `section` with `aria-label` (a named region),
following [landmark guidance](https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/).

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Skips both, unless a link is projected into `[slot=by]`, which is reached in DOM order. |

### Focus

Neither takes focus; a projected link shows the shared focus ring.

### Labelling

The portrait is decorative (`alt=""`) because the author's name follows it. The verse region's name
comes from `label`. The verse rule is hidden from assistive technology.

### Announcements

None.

### Motion

None of their own. The page's `.reveal` drift on the verse is disabled by
`prefers-reduced-motion: reduce`.

## Content and internationalisation

- Use the cast's own words and the scripture reference exactly as provided; never paraphrase.
- Quotation marks are part of the catalogue string, so each locale uses its own (“ ” in English,
  « » in French); the component adds none.
- Attribution: "Name · role, neighbourhood". The middle dot and its spaces are rendered by the
  component between `author` and `detail`.
- Translatable inputs: `text`, `detail`, `reference`, `label`. Data values: `author`, `photo`.
- Long quotations wrap; nothing truncates.

## Performance

- Change detection: `OnPush`, signal inputs; the attribution string is a `computed`.
- Perf-test scenarios: `frontend/projects/perf-test/src/scenarios/Testimonial.ts` renders Hannah
  Kowalski's testimonial with her portrait, and `frontend/projects/perf-test/src/scenarios/Verse.ts`
  renders Ecclesiastes 4:9; iterations in `e2e/perf-test/config/scenario-iterations.mjs` keep each
  at roughly 100–300 ms.
- Composite scenarios: `Hero` (the testimonial inside it), `DarkTheme`.
- Layout stability: the portrait declares 56 × 56, so it never shifts the words.
- Weight: no dependencies beyond Angular core.

## Acceptance criteria

### Rendering

- **AC-1** Given Hannah Kowalski's testimonial with her portrait, when it renders, then a `blockquote.quote` holds an `img.quote__photo` of 56 × 56 with `alt=""`, a `p.quote__text` reading "“Within a week I was advising two founders, both a streetcar ride from my house.”" and a `p.quote__by` reading "Hannah Kowalski · UX researcher, Roncesvalles". (L2-039)
- **AC-2** Given a testimonial without `photo`, when it renders, then no `img` is present, the card has `.quote--no-photo`, and the words fill the card width. (L2-039)
- **AC-3** Given the verse "“Two are better than one, because they have a good return for their labour.”" with reference "Ecclesiastes 4:9", when it renders, then a `section.verse` shows the rule, the text and the reference in that order, centred. (L2-039)
- **AC-4** Given a link projected into `[slot=by]`, when the testimonial renders, then the link replaces the generated attribution inside `p.quote__by`. (L2-039)

### Keyboard and focus

- **AC-5** Given the home page, when a keyboard user tabs past the hero actions, then neither the testimonial nor the verse receives focus. (L2-050)

### Screen readers

- **AC-6** Given the verse with `label` "Verse", when a screen reader lists regions, then it finds a region named "Verse", and the rule is not announced. (L2-050)
- **AC-7** Given the testimonial, when a screen reader reads it, then it announces a quotation containing the words and "Hannah Kowalski · UX researcher, Roncesvalles", and does not announce the portrait. (L2-050)

### Theming

- **AC-8** Given the light and dark themes, when both render, then the quotation and verse text are at least 4.5:1 and the attribution and reference at least 4.5:1 against their backgrounds. (L2-050)
- **AC-9** Given a theme change, when both re-render, then their colours change without component code because they use only design-system tokens. (L2-051)

### Responsive

- **AC-10** Given a 320 px viewport, when the testimonial renders with its portrait, then the words wrap beside the portrait without horizontal scroll or clipping. (L2-049)
- **AC-11** Given a 360 px viewport, when the verse renders, then its text is `--font-size-2xl`; given 1280 px, then it is `--font-size-3xl`, centred and no wider than `--size-verse-text-max-width-8`. (L2-049)

### Motion

- **AC-12** Given `prefers-reduced-motion: reduce`, when the verse scrolls into view with the page's `reveal` class, then it does not move. (L2-050)

### Content

- **AC-13** Given both components' source, when rendered with the en-CA catalogue, then the quotation, detail, reference and label come from inputs and the components hard-code no copy other than the " · " separator. (L2-052)

### Performance

- **AC-14** Given a change to either component's template, inputs or styles, when the perf test runs `Testimonial` and `Verse` against the base branch, then neither is flagged as a possible regression. (L2-048)

## Implementation notes

- Folder `frontend/projects/components/src/lib/testimonial/`: `testimonial.ts` (`Testimonial`,
  selector `bn-testimonial`), `verse.ts` (`Verse`, selector `bn-verse`), `testimonial.css`,
  `verse.css`; export both from `public-api.ts`.
- Move `.quote*` and `.verse*` from `pages/home/home.css` into the component styles; add
  `.quote--no-photo { grid-template-columns: minmax(0, 1fr) }`.
- Add `Testimonial.ts` and `Verse.ts` perf-test scenarios and export them from `index.ts`.
- The [hero](hero.md) detects `bn-testimonial` in its `[slot=testimonial]`.

## Decisions

- **D-1** *One CRD or two?* One, because the design system documents both on one page
  ("Testimonial and verse"), with two selectors in one library folder.
- **D-2** *The portrait is "optional" in the design system's anatomy, but the CSS always reserves
  an `auto` column. What happens without it?* A `.quote--no-photo` modifier switches to one column,
  so the words never sit in a shrunken first column. The design-system page should add it.
- **D-3** *Who supplies the quotation marks?* The catalogue string, so each locale uses its own
  marks; the component adds none.
- **D-4** *Is the verse a `blockquote`?* No: the mock and design system use a labelled `section`
  with paragraphs, which e2e locators depend on; the reference is visible text, so meaning is not
  lost.
- **D-5** *Does the testimonial card lift on hover like `.area`?* No. The kit declares a transition
  on `.quote` but no hover rule; lifting signals a link, and the card is not one.
