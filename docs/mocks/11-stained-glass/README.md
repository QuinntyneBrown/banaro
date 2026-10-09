# 11 · Stained Glass

<!--
Cast and catalog: docs/mocks/README.md. Today is Friday 9 October 2026; the directory viewer is
Amara Osei (Leslieville), 3 unread notifications, 2 new matches. Directory shows builders 1–12 in
Best match order; distance defaults to 40 km.
-->

**Idea.** Cathedral glass reimagined for a modern product. The home page opens on a **rose window**
built from SVG facets — ruby, sapphire, emerald, amber and amethyst held in dark lead came — with a
clear-glass cross at its heart and coloured light shafts falling across the page. The four areas are
**lancet windows**; builders stand in **arched niches** like figures in a window; every card is a
**leaded pane** with light glowing through it. Luminous parchment in light; a deep lead-grey nave
in dark, where the glass glows brighter.

## What varies in this concept

| Axis | Choice |
|---|---|
| Whitespace | Calm and symmetrical: centred section heads, `--space-16`–`--space-20` between sections. |
| Line height | 1.12 for Cinzel capitals, 1.55 body, 1.7 for long italic copy. |
| Density | Low–medium; the directory shows 12 builders in a three-column grid of window figures. |
| Palette | Five jewels + lead + parchment. Primary action is ruby (light) or amber light-through-glass (dark). |
| Imagery | SVG rose window and lancet glyphs (people, lamp, candle, rings), all filled from tokens. Small portraits in round-arched niches with jewel and lead borders; initials niches for builders without photos sit on quarry glass. |
| Texture | `feTurbulence` glass mottling on the rose window and on every pane (`soft-light` blend), quarry (diamond lattice) glass from two repeating gradients, faint paper noise on the canvas. |
| Motion | The rose window breathes (glow and brightness, 9 s); light shafts drift across the page (24 s). Nothing else moves. |
| Browser features | `color-mix()` jewel tints, `:has()` for filter state, `::details-content` to keep the filter disclosure open on desktop, SVG filters, `mix-blend-mode`. |

## Type

- **Cinzel** — inscriptional Roman capitals for the brand, headings, buttons and labels (tracked
  out, uppercase), like lettering cut in stone around a window.
- **EB Garamond** — the body, roles and quotes, with italic for the human voice (“*with believers
  down the street.*”) and old-style numerals; lining numerals where figures must align.

## Palette (tokens)

| Role | Light | Dark |
|---|---|---|
| Canvas / surface | parchment `#f6eedc` / `#fff9ec` | lead `#17181c` / `#1d1f24` |
| Text | ink `#231c14`, muted `#55473a` | `#f3ead8`, muted `#cfc4ae` |
| Primary action | ruby-700 (parchment text) | amber-400 (dark text, 9.3:1) |
| Gilt labels | amber-700 (5.2:1 on parchment) | amber-300 |
| Glass (`--glass-*`) | ruby-500, sapphire-500, emerald-500, amber-400, amethyst-500 | one step lighter — the glass glows |
| Lead came (`--color-lead`) | `#2b2721` | `#050506` |

All text pairs pass 4.5:1 (checked while building the tokens). Text never sits on bare glass except
dark ink on amber (9:1) and parchment on ruby/sapphire/emerald/amethyst medallions.

## Motion spec

| Element | Duration / easing | Reduced motion |
|---|---|---|
| Rose window glow | 9 s, `--ease-standard`, infinite | Static glow |
| Light shafts | `--duration-sun` 24 s, alternate | Static |
| Lancet hover | `--duration-base` 260 ms lift + halo | Instant |
| Buttons | `--duration-fast` 160 ms | Instant |

## Responsive behaviour

- **360 px:** brand, Sign in and a native `<details>` menu (Join moves into it below 480 px); rose
  window below the headline; lancets one per row (capped at 15 rem wide); figures one per row;
  filters collapse into “Refine the list”.
- **768 px:** two-column events; figures two-up.
- **1024 px+:** hero side by side; filters become a sticky leaded sidebar that is always open
  (`::details-content` in Chromium 131+, guarded by `@supports`; elsewhere it stays a disclosure).
- **1280 px:** four lancets, three figures per row in the directory.

## Accessibility notes

- The rose window is `role="img"` with a description; lancet glyphs and quarry glass are
  decorative.
- Online state is an emerald lozenge **and** “Online now”; match seals carry an `aria-label`.
- Filter options are real checkboxes; the lozenge fills with ruby glass when checked and shows a
  focus ring around the lozenge.
- Badge counts are described in the button label (“Notifications, 3 unread”).

## What to take from it

A brand with a sacred, crafted warmth that never becomes kitsch: jewel accents used as signals
(online, selected, primary), lead lines as the structural grid, and one hero illustration made
entirely from tokens so it themes itself.

## Open questions

- The rose window is ~140 SVG paths; fine for one hero, but the production version should ship it
  as an optimised inline symbol.
- Cinzel capitals are wide; long builder names wrap to two lines on narrow cards.

<!-- coverage:start -->
<!-- coverage:end -->
