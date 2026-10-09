# 36 · Synthwave

Banaro as a **retro-future arcade**. A striped sunset sinks behind wireframe mountains and a neon
grid runs toward you. Type glows with magenta and cyan chromatic fringes, and fine scanlines sit
over everything. The metaphors come from the cabinet: a high-score table for the stats, "Select
mode" for the four areas, "Player select" for builders, VHS tapes for projects, tour dates for
events, and "Player 2 wanted" for co-founder matching. The light theme is not a washed-out dark
mode. It is **daytime vaporwave**: lilac sky, peach-to-pink sun, mint grid floor and plum ink.

- **Home:** the hero has a "38 builders online now" HUD pill, the promise in Orbitron with
  chromatic aberration, both actions, and the sunset scene (CSS sun with mask stripes, SVG
  wireframe mountains, CSS 3D perspective grid that scrolls forward). Then high scores (1,284 ·
  312 · 96 · 48 in VT323), four neon mode cabinets, six duotone player portraits with PWR (match)
  tags, four VHS cassettes with spinning reels on hover, tour dates for the four events, a
  co-op "Player 1 + Player 2" matching panel, the verse as a neon sign, and Hannah's quote in a
  CRT terminal.
- **Directory:** "Choose your builders", a **neon player-select grid**. A Player 1 panel spotlights
  the best match (Daniel) with stat bars (MATCH meter, skills, quest, mode). The roster of 12
  tiles each show a duotone portrait or neon initials, PWR, zone (neighbourhood and distance),
  skills, quest (building), mode (open to), status and an action. Role selection is a row of
  arcade buttons (`aria-pressed`). The rest of the filters sit in an "Options" panel: a sidebar
  on desktop and a collapsible sheet on phones. Pagination reads "Page 01 / 107".

## What varies

| Axis | Choice |
|---|---|
| Whitespace | Generous section rhythm (5rem), tight HUD clusters |
| Line height | Display 1.05 in Orbitron caps; body 1.6 in Space Grotesk |
| Density | Medium: a 3-column roster with every field on each tile |
| Palette | Night: void `#0d0221`, magenta `#ff2a6d`, cyan `#05d9e8`, sun yellow → orange → pink. Day: lilac `#efe4ff`, mint `#c9f7e6`, peach `#ffd9c2`, plum ink `#2a0f4f`, deep magenta `#9c0f6a` |
| Imagery | Portraits in magenta-to-cyan duotone with scanlines. Everything else is CSS or SVG |
| Texture | Global scanlines, starfield gradients, glow shadows, sun mask stripes |
| Motion | Grid runs forward (1.6 s loop), wordmark flicker, blinking online LED and cursor, reels spin on hover, cards lift |
| Browser features | CSS 3D `perspective` with `rotateX`, CSS masks, `mix-blend-mode: color` duotone, `repeating-conic-gradient` reels, `display: contents` stat rows |

## Type

- **Monoton** only for the BANARO wordmark (a neon-tube logotype).
- **Orbitron** (700/900) for headings, labels and buttons, set in caps with wide tracking.
- **Space Grotesk** for readable body copy.
- **VT323** for numbers, scores, HUD values and the CRT terminal.

## Palette and themes

Glows exist only in dark mode. `--text-glow-*` and `--shadow-neon-*` resolve to coloured halos.
In light mode they become flat outlines and soft colour shadows, so pastel text stays crisp. The
chromatic fringe (`--text-chroma`) is in both themes and reads as a 3D vaporwave offset in light.
Every text pair passes AA, including magenta on void (5.5:1) and the dark text on magenta buttons.

## Motion spec

| Effect | Duration | Easing | Reduced motion |
|---|---|---|---|
| Grid floor scrolls one cell | `--duration-grid` 1.6 s, infinite | linear | static grid |
| Wordmark flicker (2 dips per cycle) | `--duration-flicker` 4 s | steps | steady |
| Online LED, CRT cursor | 1–1.2 s | steps(2) | steady |
| Player 2 "?" pulse | 1 s | steps(2) | steady |
| Card hover lift, button press | 120–220 ms | `--ease-spring` / standard | instant |
| VHS reels on hover | 1.4 s per turn | linear | still |

All keyframes are inside `prefers-reduced-motion: no-preference`, and nothing animates on load
apart from these ambient loops.

## Browser features and fallbacks

- The grid is a CSS 3D plane (`perspective` with `perspective-origin: top` on the floor and
  `rotateX(80deg)` on a 300%-tall grid). Without 3D transforms it falls back to a flat grid, still
  in theme.
- The sun's stripe cutouts use `mask`. Without masks the sun is a solid gradient disc.
- Duotone uses `mix-blend-mode: color` over a greyscale photo. Without blend modes the photo is
  greyscale under a tint.
- No JavaScript beyond `mock.js` on the home page. The directory has a tiny script for the
  single-choice role buttons and to close the Options sheet on phones.

## Responsive behaviour

- **360:** the wordmark, Join Banaro and a menu button sit in the bar. The hero copy stacks above a
  20rem scene, players are 2 columns, cabinets and tapes go single column, and the Options panel
  collapses. The Player 1 panel stacks and keeps only the match value column.
- **768:** two-column cabinets and tapes, three-column players, and tour dates move to a 3-column
  row.
- **1280:** four cabinets in a row, the Options sidebar, a 3-column roster and a split co-op
  panel.

## Accessibility

- Glow and scanlines are decoration. Every glowing word is real text with AA contrast without its
  glow. Scanlines are a `pointer-events: none` overlay at 3.5% (light) or 22% (dark) opacity
  between lines.
- Neon focus rings: 2 px cyan (dark) or magenta (light) with a glow. Role buttons use
  `aria-pressed`. The Player 1 match bar is a `meter` with values. Counts carry their meaning in
  `aria-label`.
- The hero scene is `aria-hidden`. Dates in tour rows have the full date in visually hidden text.

## What to take from it

Synthwave makes "find a co-founder" feel like inviting a Player 2: playful, memorable and
nostalgic for the generation building now. The Player 1 spotlight with stat bars is a strong way
to explain *why* someone is a top match. Keep glows for dark mode and give light mode its own
pastel identity.

<!-- coverage:start -->

Legend: ✅ mock exists · ➖ not applicable (reason in manifest) · ❌ missing

### Pages

| Screen | default | loading | empty | error | Requirements |
|---|---|---|---|---|---|
| Home (`home`) | [✅](pages/home/default.html) | ➖ | ➖ | ➖ |  |
| Builder directory (`directory`) | [✅](pages/directory/default.html) | ➖ | ➖ | ➖ |  |

<!-- coverage:end -->
