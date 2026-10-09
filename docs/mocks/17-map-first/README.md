# 17 · Map First

<!--
Cast and catalog: see docs/mocks/README.md (Amara Osei as viewer; builders 1–23; projects;
events; filter counts). "Today" is Friday 9 October 2026. Distances are from Leslieville.
-->

**Axes:** map illustration · neighbourhoods · real-time pins

The GTA is the interface. Both pages are built around a stylised inline-SVG map of Toronto and
the lakeshore: Lake Ontario, the Toronto Islands and Leslie Spit, the Humber, Don, Rouge, Credit
and Etobicoke Creek, the 401, QEW, DVP/404, 400, 427 and 407 with highway shields, a dashed
City of Toronto boundary, a city-block texture tilted to Toronto's grid, Pearson, parks and a
compass. The geography is plausible stylisation at about 12 px per km, not survey-accurate.
Builders appear as clusters by neighbourhood (the ten counts add up to 1,284), events as
teal calendar flags, and the viewer as a pulsing GPS dot, "You · Leslieville", inside a dashed
40 km ring (Oakville at 36 km sits just inside it, as it should).

Home leads with the map: a side panel (promise, actions, stats, map key) next to a full-height
map with a floating search pill, zoom controls, a scale bar and an attribution. Then the four
areas as "map layers", the nearest builders with distance and bearing ("4.6 km · W of you"),
projects as cards with a mini map tile, events as stations on a transit line, a radius-ring
matching call to action, an inset quote and verse, and a dark footer with coordinates and the
land acknowledgement. The directory is a split: filter sidebar, best-match list with numbered
pin markers, and a sticky map with matching numbered pins, an info-window popup for the
selected builder (Daniel Reyes) and "Search as I move the map". On phones the map becomes a
band and the list slides over it as a bottom sheet with a List/Map toggle.

## What varies in this concept

| Axis | Choice |
|---|---|
| Whitespace | Medium. Map UI floats with `--space-4` insets; sections breathe at `--space-16`. |
| Line height | Display 1.02 (expanded Archivo), body 1.5, lead 1.62. |
| Density | Medium: 6 nearby builders on Home, 12 rows in the directory list beside the map. |
| Palette | Day map: warm paper land, lake blue, park green, amber highways, pin red, GPS blue, transit teal. Dark is the night map. |
| Imagery | The map itself; small round portraits with a distance badge; mini map tiles for projects. |
| Texture | Rotated city-block grid, contour rings behind the "layers" section. |
| Motion | GPS halo ping and live-pin ping (2.4 s), pin bubble spring on hover, card lift. |
| Browser features | Container query units (`cqw`/`cqh`) keep HTML pins aligned with a cover-cropped SVG; `aspect-ratio`; SVG `paint-order` halos; sticky map column. |

## Type

- **Archivo** (variable width and weight): `expanded` 800 for the display, headings and stats;
  `semi-condensed` for spaced uppercase map labels; normal width for UI and body.
- **Instrument Serif** italic for water labels ("Lake Ontario", river names), the hero's
  "down the street." and the quote/verse insets — the cartographer's hydrography convention.
- Scale: 12 / 14 / 16 / 19 / 22 / 28 / 36, fluid h1 36–60 and display 44–76.

## Palette

| Role | Light (day map) | Dark (night map) |
|---|---|---|
| Land / canvas | `#f7f3ea` | `#13202b` |
| Lake | `#bcdcea` | `#0b2b40` |
| Highways | `#f6c768` on `#e9ab3f` | `#d39a3a` |
| Builder pins / accent | `#c8402a` (4.9:1 on paper) | `#ff8a6b` |
| Events | `#146b74` | `#5fd0d9` |
| You / radius ring | `#2a6df4` / `#1f58d0` | `#78adff` |
| Text | `#17222b`, muted `#4a5660` | `#e4ecf2`, muted `#a8b8c6` |

All body text pairs pass 4.5:1; map labels sit on a halo (`paint-order: stroke`) in the land
colour so they stay legible over roads and water.

## Motion

- `--duration-fast` 140 ms hover; `--duration-base` 220 ms card lift; `--duration-pulse` 2.4 s GPS
  and live pings with `--ease-enter`; `--ease-spring` on pin hover.
- Every animation sits inside `prefers-reduced-motion: no-preference`; with reduced motion the
  GPS dot and online dots are static and nothing is lost. There is no load animation.

## Browser features and fallbacks

- `container-type: size` on `.map` plus `max(100cqw, 100cqh * ratio)` makes the map canvas
  cover its box like `object-fit: cover` while HTML pins keep percentage positions. Supported in
  all current engines; without it the map would letterbox.
- The scale bar width is computed from the same container units so 10 km stays 10 km.
- Pins are real links in lists with labels ("Downtown Toronto: 512 builders"); the map is a
  `<figure>` with a caption saying the same content is listed below. The list is the accessible
  primary; the SVG art is `aria-hidden`.

## Responsive behaviour

- 360: header with brand and actions, nav as a scrolling chip row; map band (25 rem) first, the
  hero panel slides over it as a sheet; event pins hide on the small map (events are listed
  below). Directory: 14 rem map band, list as a bottom sheet, filters as a chip scroller.
- 768: two-column directory (list + sticky map); filters stay chips.
- 1280: Home is panel + map side by side; the directory adds the filter sidebar (three columns).

## Accessibility notes

- Skip link, one `h1`, `aria-current="page"` on Builders, pressed filter chips use
  `aria-pressed`, the distance radius is a labelled range, sort is a labelled select.
- Numbered pins and numbered list items match, so sighted users can cross-reference; the
  list carries all information without the map.
- Focus ring: 3 px GPS blue with offset; on the dark footer it switches to the inverse colour.

## What to take from it

The neighbourhood is Banaro's real differentiator; this concept makes distance and place the
first thing you see. Worth keeping even in another direction: distance + bearing on builder
cards, events as transit stops, and the radius ring as the visual for matching.

## Open questions

- A production map needs real tiles (or a licensed vector style) and clustering at zoom levels;
  the stylised SVG is a design reference only.
- Exposing a neighbourhood-level location for every builder needs a privacy review.

<!-- coverage:start -->

Legend: ✅ mock exists · ➖ not applicable (reason in manifest) · ❌ missing

### Pages

| Screen | default | loading | empty | error | Requirements |
|---|---|---|---|---|---|
| Home (`home`) | [✅](pages/home/default.html) | ➖ | ➖ | ➖ |  |
| Builder directory (`directory`) | [✅](pages/directory/default.html) | ➖ | ➖ | ➖ |  |

<!-- coverage:end -->
