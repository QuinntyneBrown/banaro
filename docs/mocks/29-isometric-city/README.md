# 29 · Isometric City

Banaro drawn as a toy-bright illustrated Toronto in true 2:1 isometric. Every builder lives at an
address, every project is a building site, every event is a stop on the streetcar line. The
illustration is the brand, and the UI copies its geometry: cards and buttons are extruded blocks
with a solid side face, sections sit on an isometric planning grid, and stats are green street
signs.

## The idea

- **Home** opens on a floating diorama of the city: Victorian gables in The Annex, sawtooth brick
  lofts in Liberty Village, downtown towers beside the CN Tower and the stadium, row houses in
  Leslieville, a park in Markham, the boardwalk, the islands and a sailboat on Lake Ontario. A red
  streetcar runs along Queen Street, people wave from lit windows and from the waterfront. HTML
  labels pin the neighbourhoods, so the names stay crisp at any size.
- **The four areas** are four city lots, each with its own isometric scene (a row of houses, a
  building under a crane, a hall with a flag, two towers joined by a skybridge).
- **Featured builders** are address cards: a house-number plaque, the portrait beside a tiny
  building that is "theirs", a lit-window status light, then skills and what they are building.
- **Projects** are construction sites: hazard tape on top and an isometric building whose number
  of finished storeys follows the stage (design → prototype → pilot → beta).
- **Events** are stop signs: a red band with the date plate, then time, place and who is going.
- **Directory** keeps the address cards (12, Best match order) with a green match street sign,
  and a **mini isometric district map** heads the filters: one raised tile per GTA district,
  Lake Ontario along the south shore, a pin on Leslieville and a dashed 40 km ring. Checking or
  hovering a neighbourhood checkbox lights its tile on the map (CSS `:has()`).

## What varies

| Axis | Choice |
|---|---|
| Whitespace | Generous sections (`--space-16`), compact cards |
| Line height | Display 1.02, body 1.55 |
| Density | Medium: 3 cards per row at 1280 px, 12 results per page |
| Palette | Saturated toy palette: streetcar red, sun yellow, teal, violet, mint, sky on an ink-navy text colour |
| Imagery | Inline SVG isometric illustration everywhere; portraits for builders 1–11, initials for 12–23 |
| Texture | Isometric planning grid (two `repeating-linear-gradient`s at ±26.565°) |
| Motion | Streetcar, clouds, waving characters, CN Tower beacon, bobbing sailboat; spring lift on cards |
| Browser features | `color-mix()` for the night tint, `:has()` for map highlights, native `<details>` for menu and filters |

## Type

- **Bricolage Grotesque** 800 for display and headings, tight tracking (−0.035em): chunky and
  characterful like hand-painted shop signs.
- **Rubik** for body and UI: rounded corners that match the soft illustration.
- **Space Mono** for plaques, overlines and counts: the house-number and transit-sign voice.

## Palette and theming

Each building hue has three face tokens (`--iso-<hue>-t/-l/-r` for top, left and right faces),
which is what makes the shapes read as solids. The **night city** (dark theme) does not repaint
the illustration: it raises `--iso-dim` to 58 % so every face is mixed toward `--iso-night`
with `color-mix(in oklab, …)`, swaps the sun for a moon and stars, turns windows dark navy and
lights the `.w--lit` windows in warm yellow with a glow. Text tokens pass WCAG AA in both themes
(checked with `check_contrast.py`: 65 pairs, 0 failures). Plaques flip from navy-on-white to
yellow-on-navy at night.

## Motion

| Element | Duration | Easing | Notes |
|---|---|---|---|
| Streetcar on Queen St | `--duration-tram` 22 s | linear | Fades in and out at the slab edges |
| Clouds | `--duration-cloud` 60 s | linear, alternate | |
| Waving arms | `--duration-wave` 1.6 s | standard, alternate | |
| CN Tower beacon | `--duration-beacon` 2.4 s | standard | |
| Sailboat | `--duration-bob` 4 s | standard, alternate | |
| Card lift on hover | `--duration-base` 220 ms | `--ease-spring` | Side face grows as the card rises |
| Button press | `--duration-fast` 120 ms | standard | Button sinks into its side face |

All keyframe animation lives inside `@media (prefers-reduced-motion: no-preference)`; with reduced
motion the city is a still illustration and transitions collapse to 0.01 ms through the tokens.

## Browser features and fallbacks

- `color-mix()` (all evergreen browsers) drives the night tint; without it faces fall back to no
  fill change only in very old browsers.
- `:has()` lights map tiles; without it the map is still a correct static picture.
- Filters are a `<details open>` element so they work without JavaScript; a five-line inline script
  folds them on screens under 64 rem.
- The mobile menu is a native `<details>` disclosure, no script.

## Responsive behaviour

- 360 px: menu button, hero art below the copy (neighbourhood labels reduced to three), single
  column cards, filters collapsed under a "Filters · 1 active" disclosure.
- 768 px: two-column cards, match pill appears in the signed-in header.
- 1024 px+: full nav, hero copy and city side by side, filters as a left column.
- 1280 px+: three address cards per row.

## Accessibility

- The illustration is `aria-hidden`; the hero figure carries a visually hidden caption describing
  the scene. Neighbourhood labels are decorative duplicates.
- The match sign has an `aria-label` ("94% match"), the notification bell says "Notifications, 3
  unread", every checkbox has a visible label and count, the sort select and search are labelled.
- Focus ring: 3 px violet (yellow at night) with offset. Status never relies on colour alone
  ("Online now" / "Seen 1 h ago" text beside the window light).

## What to take from it

- Extruded "block" cards and press-in buttons are a cheap, memorable signature that survives
  without the illustration.
- The three-face colour tokens and a single `--iso-dim` night mix make a whole illustrated city
  theme-aware with one variable.
- The address metaphor (plaque, plot, street sign) gives the directory a local, neighbourly voice
  that fits the "believers down the street" promise.

## Open questions

- Illustration cost: the scenes are generated from a small script in this exploration; production
  would need an illustrator and a maintained sprite set for profiles.
- The district map is decorative; a real interactive map would need keyboard support beyond the
  checkbox list.

<!-- coverage:start -->

Legend: ✅ mock exists · ➖ not applicable (reason in manifest) · ❌ missing

### Pages

| Screen | default | loading | empty | error | Requirements |
|---|---|---|---|---|---|
| Home (`home`) | [✅](pages/home/default.html) | ➖ | ➖ | ➖ |  |
| Builder directory (`directory`) | [✅](pages/directory/default.html) | ➖ | ➖ | ➖ |  |

<!-- coverage:end -->
