# 27 · Y2K Chrome

Millennium optimism for Banaro: liquid-chrome headlines, holographic foil that slowly sweeps
around every panel border, aqua gel capsule buttons with a glossy top shine, a spinning
holographic disc in the hero with stats floating around it in glass bubbles, sparkle stars and a
starfield. Builders are holo-foil trading cards ("collect them all") that tilt toward the pointer;
projects open as little `.exe` windows with striped loading bars; events are LCD tickets.

<!--
Cast and catalog: docs/mocks/README.md. Today is Friday 9 October 2026; viewer Amara Osei.
Directory shows builders 1–12 in Best match order.
-->

## What varies

| Axis | Choice |
|---|---|
| Whitespace | Medium-generous, capsule shapes, 24–36px radii |
| Line height | 1.6 body, ~1 display |
| Density | Medium: three trading cards per row with stats rows |
| Palette | Pearl white + holographic pastels (light); deep space + neon holo (dark); aqua gel accent |
| Imagery | Portraits inside foil cards, CSS holographic disc, SVG sparkles |
| Texture | Conic-gradient foil, glass (`backdrop-filter`), CSS starfield, gel gloss |
| Motion | Foil sweep, disc spin, bubble float, sparkle twinkle, card tilt |
| Browser features | `@property` animated conic gradients, `backdrop-filter`, `background-clip: text`, container query units, `:has()` |

## Type

- **Unbounded** 600–800 — display and headings (the chrome type).
- **Michroma** — wide uppercase labels, nav, card numbers.
- **Righteous** — numerals (match %, stats, LCD dates, counts).
- **Sora** — readable body at 16px.

## Palette and tokens

Light (pearl): text `--palette-steel-900` on pearl 15.9:1, muted 9.1:1, link aqua-700 5.9:1,
gel buttons carry navy text on aqua (8.5:1). Dark (space): star-white text 18:1 on
`--palette-space-950`, aqua link 12.9:1, yellow focus ring. `--chrome-gradient` is dark-dominant
on pearl and bright-dominant in space so chrome type stays legible; `--holo-1…6` swap from
pastel foil to neon; `--glass` and `--glass-line` drive translucent panels.

## Motion

| What | Duration / easing | Reduced motion |
|---|---|---|
| Foil border sweep (`--foil-angle`) | `--duration-foil` 6s linear loop | Off |
| Holographic disc spin | `--duration-spin` 14s linear loop | Off |
| Stat bubbles float | 4s loop | Off |
| Sparkle twinkle | `--duration-twinkle` 2.4s | Off |
| Loading-bar stripes | 1.2s linear | Off |
| Card tilt + sheen follow pointer | inline script, `--duration-base` transition | Script exits early |
| Gel press / hover | `--duration-base` with `--ease-spring` | Instant |

## Browser features

- `@property --foil-angle` animates the conic foil (Chromium, Safari 16.4+, Firefox 128+);
  elsewhere the foil is static.
- `backdrop-filter` glass; without it panels fall back to the translucent token colour.
- `background-clip: text` chrome with a solid fallback colour from the gradient's dark stops.
- The rotating disc is clipped by a round wrapper so its rotation never widens the page.

## Responsive

360: menu button, hero text then disc, cards in one column, filters as a chip scroller plus an
"All filters" panel. 768: two cards per row. 1280: hero side by side, sticky holographic filter
panel and three cards per row.

## Accessibility

Decorative sparkles, disc and bubbles are `aria-hidden`; the same stats are repeated in a
visually hidden sentence. Labelled search/sort/range/selects, real checkboxes (gel orbs),
`aria-pressed` chips, `aria-current` nav. Focus ring violet (light) / yellow (dark), 3px.

## What to take from it

The trading-card builder profile (number, match, portrait, stats rows) is a memorable, scannable
format. Gel buttons give an unmistakable primary action.

<!-- coverage:start -->

Legend: ✅ mock exists · ➖ not applicable (reason in manifest) · ❌ missing

### Pages

| Screen | default | loading | empty | error | Requirements |
|---|---|---|---|---|---|
| Home (`home`) | [✅](pages/home/default.html) | ➖ | ➖ | ➖ |  |
| Builder directory (`directory`) | [✅](pages/directory/default.html) | ➖ | ➖ | ➖ |  |

<!-- coverage:end -->
