# 14 · Neo Brutal

<!--
Cast and catalog: see docs/mocks/README.md (shared by all 40 concepts). Today is Friday 9 October 2026;
the directory viewer is Amara Osei (Leslieville), looking for a technical co-founder.
-->

## Idea

Gumroad-style neo-brutalism for builders who like to make things with their hands. Every element is
an object you could pick up: a 3 px ink outline, an offset hard shadow, a saturated pastel fill. Buttons
sink into their shadow when pressed and spring back; stickers are slapped on at an angle; portraits sit
in outlined Polaroid frames that straighten when you hover. It is loud, warm and a little funny,
which is how a demo night feels.

## What varies (compared with the other concepts)

| Axis | Choice |
|---|---|
| Whitespace | Medium; sections at 96 px, but blocks are big and full-bleed within the container |
| Line height | Display at 0.98 (stacked, chunky), body 1.5 |
| Density | Medium: six projects, four builders, four tickets on home; 12 cards in a three-column grid on the directory |
| Palette | Cream paper, ink, and six pastels (pink, lime, lilac, butter, sky, tangerine) with ink text on every one |
| Imagery | Portraits in outlined frames with hard shadows; a tilted collage in the hero; a trio of round portraits in the matching block |
| Texture | None: flat colour, outlines and shadows are the texture |
| Motion | Springy and physical: lift on hover, collapse on press, rotating seal, marquee ticker |
| Browser features | Popover API (menu and filter sheet), variable font width axis (`font-stretch: 125%`), `rotate`/`translate` individual transform properties |

## Type

- **Archivo** at weight 900 and width 125 % for display: an expanded black grotesque that reads as a
  poster headline. Weight 800 for card names.
- **Space Grotesk** for body and UI: quirky terminals that suit the stickers.
- **Space Mono** bold uppercase for sticker labels, ticker and filter legends.

## Palette

| Role | Light | Dark |
|---|---|---|
| Canvas / surface | cream `#fff6e9` / white | aubergine `#17141c` / `#221e29` |
| Text | ink `#111111` | cream `#fff6e9` |
| Outlines | ink | cream |
| Hard shadows | ink | hot pink `#ff6fc3` |
| Accent (primary buttons) | pink `#ff9ed8` with ink text (10:1) | same |
| Pastel blocks | pink, lime, lilac, butter, sky, tangerine; ink text 10–14.8:1 | unchanged, ink text kept |
| Footer | ink slab, cream text | lilac slab, ink text |

Pastel blocks re-scope `--color-fg-muted` and `--color-fg-subtle` to ink tones so secondary text stays
AA on them in both themes. Token pairs: 46 of 46 pass `check_contrast.py`.

## Motion spec

| What | Duration | Easing |
|---|---|---|
| Button and card hover: lift −2 to −4 px, shadow grows to 6–10 px | 180 ms | spring `cubic-bezier(0.34, 1.8, 0.5, 1)` |
| Press: element moves into its shadow, shadow collapses to 0 | 110 ms | same |
| Area card hover: tilt −0.6°, arrow badge rotates −45° | 300 ms | spring |
| Hero frames straighten and scale 1.04 on hover | 300 ms | spring |
| Pressed skill chip pops (scale 1.12) | 300 ms | spring |
| "1,284 builders" seal rotates | 22 s loop | linear |
| Ticker marquee (pauses on hover) | 38 s loop | linear |
| Menu and filter sheet bounce in | 500 ms | spring |

Everything is inside `prefers-reduced-motion: no-preference`; reduced motion leaves the static
tilts (they are layout, not motion) and zeroes durations.

## Browser features and fallbacks

- **Popover API** for the mobile menu and the filter sheet; without it the nav and the filter slab
  render inline.
- **Variable width axis** on Archivo; browsers without `font-stretch` support get normal-width
  Archivo Black, still on brand.
- Hard shadows are plain `box-shadow` (no blur), so they print and render everywhere.

## Responsive behaviour

- 360: one column; collage scales down; stats two by two; the directory adds a horizontal scroller of
  quick filter chips plus a "Filters" button that opens the butter sheet.
- 768: two-column areas, builders and projects.
- 1280: hero splits headline and collage; four stats with a staggered rhythm; filters become a
  sticky butter slab beside a three-column result grid; numbered pagination.

## Accessibility notes

- Outlines and shadows are never the only signal: current nav item is filled lime *and* outlined;
  online status is a word plus a dot; pressed chips use `aria-pressed`.
- Focus ring: 3 px lilac (light) or lime (dark) outline with 3 px offset, distinct from the ink outlines.
- The ticker is decorative repetition of facts shown elsewhere; its duplicate copy is `aria-hidden`.
- Every pastel keeps ink text; no white text on pastel anywhere.

## What to take from it

The press physics: a button that visibly sinks into its shadow is the clearest "you did it" feedback
of any concept. The ticket layout for events and the match sticker on builder cards are worth keeping.

## Open questions

- Does the playful tone fit prayer breakfasts as well as demo nights?
- The tilted stickers need care in translation; longer languages may need straight variants.

<!-- coverage:start -->

Legend: ✅ mock exists · ➖ not applicable (reason in manifest) · ❌ missing

### Pages

| Screen | default | loading | empty | error | Requirements |
|---|---|---|---|---|---|
| Home (`home`) | [✅](pages/home/default.html) | ➖ | ➖ | ➖ |  |
| Builder directory (`directory`) | [✅](pages/directory/default.html) | ➖ | ➖ | ➖ |  |

<!-- coverage:end -->
