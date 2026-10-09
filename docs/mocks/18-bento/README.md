# 18 · Bento

<!--
Cast and catalog: see docs/mocks/README.md (Amara Osei as viewer; builders 1–23; projects;
events; filter counts). "Today" is Friday 9 October 2026. Distances are from Leslieville.
-->

**Axes:** bento tiles · hover micro-interactions · small photos

Linear and Apple-keynote bento boxes. Everything is a rounded tile that tells one fact: the
promise, the 1,284 builders split by role, the live activity feed, the verse, the directory
(with a faux search for "Laravel near Leslieville" and three results), the next event with a
small photo and a capacity meter, 96 co-founder matches drawn as a little orbit of faces,
builders by neighbourhood as bars, the project showcase, and an October calendar with the four
event days lit. Tiles carry a faint hue glow in one corner (violet, teal, amber, rose, sky),
film grain, a 1 px highlight on the top edge, and on hover they lift 3 px, glow in their hue
and show a pointer-following spotlight. The near-black theme is the lead design; the light
theme is crisp porcelain.

The directory turns the same grid into a tool: filters are one tall sticky tile of toggle
pills with counts, search and sort are a wide tile, the two top matches (Daniel 94%, Grace
91%) are large photo tiles with match rings, the next ten are compact tiles with ring scores,
and pagination is a tile of its own.

## What varies in this concept

| Axis | Choice |
|---|---|
| Whitespace | Tight gaps (12–16 px) between tiles, generous padding inside them (24–48 px). |
| Line height | Display 1.04 with -0.035em tracking; body 1.55. |
| Density | Medium-high: many small facts at a glance, each in its own box. |
| Palette | Near-black `#060608` canvas, `#0f1013` tiles, violet accent `#8f82ff`; light: `#f5f5f7` / white / `#5b4cf0`. |
| Imagery | Small photos inside tiles (faces, one event photo); large photos only for top matches. |
| Texture | SVG `feTurbulence` grain on every tile, faint hue glows, a masked grid in the CTA. |
| Motion | Hover lift, hue glow, pointer spotlight, arrow nudge, live-dot ping. |
| Browser features | `:has()` for checked filter pills, `backdrop-filter` on the floating nav, `conic-gradient` match rings, `background-clip: text` stats, grid `dense` packing. |

## Type

- **Sora** (semibold, tight tracking) for the display, tile titles, stats and names — geometric
  and technical.
- **Inter** for body and UI at 15 px with `cv11`/`ss01`.
- **Newsreader** italic for the verse only, so scripture reads as a voice, not a feature.

## Palette

| Role | Dark (lead) | Light |
|---|---|---|
| Canvas / tile | `#060608` / `#0f1013` | `#f5f5f7` / `#ffffff` |
| Text / muted | `#f6f6f9` / `#a6a8b3` | `#0b0b0f` / `#53535d` |
| Accent | `#8f82ff` (text on it `#060608`, 6.6:1) | `#5b4cf0` (white text, 5.6:1) |
| Hues | violet `#a99eff`, teal `#5eead4`, amber `#fcd34d`, rose `#f9a8d4`, sky `#93c5fd` | the same hues at 700 for text |

Glows are 11–24% alpha of the hue; they never carry text contrast.

## Motion

- Lift: `translateY(var(--lift))` (-3 px) over `--duration-base` 240 ms with `--ease-enter`.
- Spotlight: radial gradient positioned by `--mx/--my`, set by a 10-line pointer script only on
  hover-capable devices; fades in over 240 ms.
- Reduced motion: durations go to 0.01 ms and `--lift` to 0, the live dot stops pinging.

## Browser features and fallbacks

- `:has(input:checked)` styles selected filter pills; without it the native checkbox state still
  works (the inputs are real) but the pill would not fill.
- `backdrop-filter` on the nav pill falls back to a 82% opaque surface.
- The spotlight script is progressive; with JS off tiles still lift and glow.

## Responsive behaviour

- 360: the bento collapses to one column; from 480 px small tiles pair up two by two; nav becomes a
  scrolling pill row under the bar; filters collapse to a chip scroller in their tile.
- 768: six-column bento with `md-*` spans.
- 1280: twelve-column bento; the directory filter tile is sticky in the first three columns.

## Accessibility notes

- One `h1` per page; each builder tile's name link covers the tile (stretched link) and the
  tile shows a focus ring via `:has(:focus-visible)`; buttons sit above the stretched link.
- Match rings have `aria-label` ("94% match"); the calendar is an `img` role with a text label.

## What to take from it

Bento makes the home page scannable in seconds and gives the directory "hero" slots for the
best matches without hiding the rest. The tile hues are a cheap, strong way to separate the
four areas.

<!-- coverage:start -->

Legend: ✅ mock exists · ➖ not applicable (reason in manifest) · ❌ missing

### Pages

| Screen | default | loading | empty | error | Requirements |
|---|---|---|---|---|---|
| Home (`home`) | [✅](pages/home/default.html) | ➖ | ➖ | ➖ |  |
| Builder directory (`directory`) | [✅](pages/directory/default.html) | ➖ | ➖ | ➖ |  |

<!-- coverage:end -->
