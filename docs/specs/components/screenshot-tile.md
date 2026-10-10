# Project screenshot

| Field | Value |
|---|---|
| Selector | `figure[bn-screenshot-tile]` |
| Library path | `frontend/projects/components/src/lib/screenshot-tile/` |
| Status | planned |
| Traces to | L2-045, L2-048, L2-049, L2-050, L2-051, L2-052 |
| Design system | [`screenshot-tile.html`](../../design-system/components/screenshot-tile.html) (page "Project screenshot") |
| Source mocks | [`pages/project-detail/default`](../../mocks/pages/project-detail/default.html), [`pages/project-detail/own`](../../mocks/pages/project-detail/own.html), [`dialogs/give-feedback/default`](../../mocks/dialogs/give-feedback/default.html), [`dialogs/offer-to-help/default`](../../mocks/dialogs/offer-to-help/default.html) |
| Rendering | [`screenshot-tile.html`](screenshot-tile.html) |

## Purpose and scope

A project screenshot is one captioned picture of a screen in the "Screens" section of a project
page: a 4:3 tile on a soft tone with the caption underneath ("Today's review queue"). When the
owner has not provided a picture, the tile shows a quiet illustrated placeholder — three bars on
the project's tone — that is named as a placeholder, never passed off as evidence.

Use the [avatar](avatar.md) for people, the project card's mark ([project-card](project-card.md))
for a project's identity, and a plain image inside [prose](prose.md) for anything that is not a
screen of the product.

Out of scope:

- The gallery grid `div.shots` (two columns, three at ≥ 768 px): owned by the project-detail
  page.
- Opening a larger view. The design system requires a named link or button for that; the
  current mocks have none, so the tile is passive (D-3).
- Uploading screenshots: no L2 requirement or mock defines it (D-1).

## Usage

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/project-detail/default` "Screens" (Psalter, 3 tiles); also behind every `dialogs/give-feedback/*` and `dialogs/offer-to-help/*` state | illustrated, `tone="clay"` | captions "Today's review queue", "A verse card", "Deck for Psalm 121"; labels "Screenshot placeholder: …" | default | canvas, `div.shots` |
| `pages/project-detail/own` "Screens" (Harvest, 3 tiles) | illustrated, `tone="sage"` | "Coordinator's week view", "Volunteer shift picker", "Reminder message" | default | canvas, `div.shots` |
| Design system "Image" variant | image, `src` set | a real screenshot with `alt` and intrinsic size | default, image loading | canvas |

Every row is buildable with the API below. `pages/project-detail/empty` and `loading` render no
tiles.

## Anatomy

1. **Figure** — host `figure.shot`. Grid, `--space-2` gap.
2. **Tile** — `div.shot__tile.tile--{tone}`, 4:3 aspect ratio, hairline border, `--radius-md`.
3. **Bars (illustrated only)** — `span.shot__bars` with three `span`s, `aria-hidden="true"`.
4. **Image (image only)** — `img.shot__img` inside the tile, `object-fit: cover` (D-2).
5. **Caption** — `figcaption`, the visible description of the screen.

Host: attribute component on the native `figure`, which carries `.shot`.

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `caption` | `string` | — | yes | Visible caption; output-encoded text. |
| `tone` | `'sage' \| 'clay' \| 'fjord' \| 'oat'` | `'sage'` | no | Adds `.tile--{tone}` to the tile; the project's tone. |
| `src` | `string \| null` | `null` | no | When set, the image variant renders `img.shot__img`; when null, the illustrated placeholder. |
| `alt` | `string \| null` | `null` | no | Image variant: the image's text alternative; when null, `caption` is used. |
| `width` / `height` | `number` | `640` / `480` | no | Intrinsic size written on the `img` (L2-048). |
| `placeholderLabel` | `string` | — | yes when `src` is null | Accessible name of the placeholder tile, translated: "Screenshot placeholder: Today's review queue". |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| None | — | The tile is passive. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| None | — | Caption and label arrive as inputs so they stay translatable and encoded. |

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Illustrated | `.shot__tile` + `role="img"` + `.shot__bars` | No picture yet: a named placeholder. |
| Image | `.shot__tile` containing `img.shot__img` | A real screenshot. |

| Tone | Modifier | Use for |
|---|---|---|
| Sage, clay, fjord, oat | `.tile--sage`, `.tile--clay`, `.tile--fjord`, `.tile--oat` | The project's tone, the same as its mark |

One size: the figure fills its gallery cell; the tile's height follows from the 4:3 ratio.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default (illustrated) | `src` null | Tone fill, three bars in `--color-tile-fg` at reduced opacity | `role="img"` named "Screenshot placeholder: …" |
| Default (image) | `src` set | Image covers the tile inside the hairline frame | `img` with `alt` |
| Image loading | before the image decodes | Tone fill shows; size is reserved by the ratio | — |
| Image failed | `error` event on the `img` | Falls back to the illustrated placeholder with `placeholderLabel` (D-4) | Placeholder name |
| Long caption | caption wraps | Caption wraps under the tile | Full caption read |

There is no hover, focus, active or disabled state: the tile is not interactive.

## Markup

```html
<!-- rendered: illustrated -->
<figure class="shot">
  <div class="shot__tile tile--clay" role="img" aria-label="Screenshot placeholder: Today's review queue">
    <span class="shot__bars" aria-hidden="true"><span></span><span></span><span></span></span>
  </div>
  <figcaption>Today's review queue</figcaption>
</figure>
```

```html
<!-- rendered: image -->
<figure class="shot">
  <div class="shot__tile tile--clay"><img class="shot__img" src="/media/psalter/review-queue.webp" alt="Today's review queue" width="640" height="480" loading="lazy"></div>
  <figcaption>Today's review queue</figcaption>
</figure>
```

```html
<!-- consumer -->
<div class="shots">
  @for (s of screens(); track s.id) {
    <figure bn-screenshot-tile [caption]="s.caption" [tone]="project().tone" [src]="s.url"
            [placeholderLabel]="'project.screens.placeholder' | t: { caption: s.caption }"></figure>
  }
</div>
```

## Design

- Figure gap `--space-2`. Tile: `aspect-ratio: 4 / 3`, padding `--space-4`, radius
  `--radius-md`, hairline `--border-width-hairline` in `--color-border-default`.
- Bars: 70 % wide grid, gap `--space-2`, each `--space-2` tall, `--radius-full`, `currentColor`
  (`--color-tile-fg`) at 0.35 opacity; first bar 55 % wide at 0.7; last bar
  `--size-progress-indeterminate` wide.
- Image: fills the tile's content box, `object-fit: cover`, radius `--radius-sm`.
- Caption `--text-caption` in `--color-fg-subtle`.

Component tokens: none.

| Token | Aliases | Overridden by |
|---|---|---|
| — | — | Tones are modifier classes. |

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Tile frame | `--color-border-default` | `--palette-oat-300` | `--palette-night-700` |
| Tile sage / clay / fjord / oat | `--color-tile-sage` … `--color-tile-oat` | `--palette-sage-100` … `--palette-oat-200` | `--palette-sage-900` … `--palette-night-800` |
| Bars | `--color-tile-fg` | `--palette-ink-900` | `--palette-night-50` |
| Caption | `--color-fg-subtle` | `--palette-stone-600` | `--palette-night-300` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-subtle` | `--color-bg-canvas` | 4.5:1 | Caption on the page |
| `--color-tile-fg` | `--color-tile-clay` | 3:1 | Bars at full strength (decorative, `aria-hidden`) |

## Responsive behaviour

- The tile is fluid; the gallery shows two per row below 768 px and three from 768 px.
- At 320 px each tile is about 136 px wide; captions wrap onto as many lines as they need.
- No horizontal scroll at 320 px; nothing is lost at 200 % zoom. The tile has no target.

## Accessibility

### Role and pattern

Native `figure` with `figcaption`. The illustrated tile is `role="img"` with an `aria-label` that
says it is a placeholder; the bars are `aria-hidden`. The image variant uses a native `img` with
`alt`.

### Keyboard

| Key | Action |
|---|---|
| — | None; the tile takes no focus. |

### Focus

The tile is never focusable (design system: passive images do not take focus).

### Labelling

Placeholder name "Screenshot placeholder: Today's review queue"; image `alt` defaults to the
caption. The caption names the screen, as the design system's content rule asks ("Daily practice
screen").

### Announcements

None.

### Motion

None. The tile does not animate.

## Content and internationalisation

- Captions describe the screen in sentence case: "Today's review queue", "A verse card".
- The placeholder prefix "Screenshot placeholder: {caption}" comes from the `en-CA` catalogue.
- Captions are owner-supplied text and output-encoded.
- Translatable inputs: `placeholderLabel`. Data values: `caption`, `alt`, `src`.

## Performance

- Change detection: `OnPush`, signal inputs; the variant is a `computed` of `src`.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/ScreenshotTile.ts` renders the
  clay placeholder "Today's review queue" from Psalter.
- Composite scenarios: `ScreenshotGallery.ts` renders Psalter's three tiles in `div.shots`;
  `ScreenshotGalleryDark.ts` renders them inside `data-theme="dark"`. Iterations tuned in
  `e2e/perf-test/config/scenario-iterations.mjs` to roughly 100–300 ms.
- Regression rule: template, input, style or change-detection changes run the perf test against
  the base branch with `--fail-on-regression` before they are pushed.
- Layout stability: the 4:3 ratio reserves the tile's height before any image arrives.
- Weight: no dependencies beyond Angular core.

## Acceptance criteria

### Rendering

- **AC-1** Given Psalter's project page, when the Screens section renders, then three `figure.shot` elements show clay tiles with the captions "Today's review queue", "A verse card" and "Deck for Psalm 121". (L2-050)
- **AC-2** Given a placeholder tile, when a screen reader reaches it, then it announces an image named "Screenshot placeholder: Today's review queue", and the bars are not announced. (L2-050)
- **AC-3** Given a screenshot with `src`, when it renders, then `img.shot__img` has `width`, `height`, `loading="lazy"` and an `alt` equal to the caption when no `alt` is given. (L2-048)
- **AC-4** Given a caption `<i>Queue</i>`, when the tile renders, then the caption shows those literal characters and contains no `<i>` element. (L2-045)
- **AC-5** Given the placeholder prefix, when the app runs in `en-CA`, then the label text comes from the catalogue key and no string is hard-coded in the component. (L2-052)

### States

- **AC-6** Given a screenshot whose image fails to load, when the `error` event fires, then the tile switches to the illustrated placeholder with `role="img"` and the placeholder label. (L2-050)
- **AC-7** Given an image that has not loaded yet, when the gallery renders, then each tile already has its 4:3 height and the caption does not move when the image arrives. (L2-048)

### Keyboard and focus

- **AC-8** Given the Screens section, when the member presses Tab through the page, then no tile or caption receives focus. (L2-050)

### Theming

- **AC-9** Given the dark theme, when Harvest's sage tiles render, then fill, frame, bars and caption resolve from `--color-tile-sage`, `--color-border-default`, `--color-tile-fg` and `--color-fg-subtle` with no per-component colour code. (L2-051)
- **AC-10** Given either theme, when the caption is measured, then it reaches at least 4.5:1 against the canvas. (L2-050)

### Responsive

- **AC-11** Given the project page at 320 px, when the Screens section renders, then two tiles share a row, captions wrap without clipping and the page has no horizontal scroll; at 768 px three tiles share a row. (L2-049)

### Performance

- **AC-12** Given a change to the tile, when the perf test runs `ScreenshotTile`, `ScreenshotGallery` and `ScreenshotGalleryDark` against the base branch with `--fail-on-regression`, then no scenario is flagged as a possible regression. (L2-048)

## Implementation notes

- Folder `frontend/projects/components/src/lib/screenshot-tile/`: `screenshot-tile.ts` (class
  `ScreenshotTile`), `screenshot-tile.css` with the `.shot*` and `.tile--*` rules plus the new
  `.shot__img` rule (D-2).
- Selector `figure[bn-screenshot-tile]`; host class `shot`.
- A `signal` tracks image failure; the `error` listener sets it, and the template falls back to
  the placeholder.
- Perf scenarios `ScreenshotTile.ts`, `ScreenshotGallery.ts`, `ScreenshotGalleryDark.ts`, exported
  from `src/scenarios/index.ts`.

## Decisions

- **D-1** *No L2 requirement covers project screenshots (L2-012 lists no screenshot field and
  L2-013 does not list a Screens section), yet both project-detail mocks show one.* The
  component is specified from the design system and the mocks; its criteria trace to the
  cross-cutting requirements only. Raised with the lead so product can add the requirement.
- **D-2** *The design system's "Image" variant shows the same placeholder markup as
  "Illustrated".* A real screenshot renders `img.shot__img` inside the tile, covering the content
  box with `--radius-sm`; the tile's padding and tone stay as a mat. The class is new; the design
  system should add it.
- **D-3** *Open a larger view?* No. No mock shows it; the design system requires a named control
  if one is added, which would be a new input then, not a change to these.
- **D-4** *What shows when an image fails?* The illustrated placeholder, named with
  `placeholderLabel`, so the gallery never shows a broken image icon.
- **D-5** *L2-049 says content is a single column below 576 px; the gallery shows two tiles per
  row at 360 px.* The mock wins: thumbnails in a two-up grid inside a single-column page. Raised
  with the lead.
