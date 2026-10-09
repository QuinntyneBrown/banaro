# 15 · Glass Night

<!--
Cast and catalog: see docs/mocks/README.md (shared by all 40 concepts). Today is Friday 9 October 2026;
the directory viewer is Amara Osei (Leslieville), looking for a technical co-founder.
-->

## Idea

Banaro after dark: the city lights blur into colour and the product floats on top as frosted glass.
Every surface is a pane of glass (backdrop blur plus saturation, a luminous 1 px edge and an inner
top highlight) hovering over slowly drifting colour blobs. Depth is the organising idea: the next
event floats closest, builders and projects sit a layer back, the sky drifts behind everything. The
light theme is the same world in winter daylight: frosted ice over pastel blobs.

## What varies (compared with the other concepts)

| Axis | Choice |
|---|---|
| Whitespace | Generous, centred hero; sections at 96 px |
| Line height | Display 1.04 with −0.04 em tracking; body 1.55, leads 1.7 in Outfit Light |
| Density | Medium: six builders, four projects, four events on home; 12 cards in three columns on the directory |
| Palette | Night indigo with violet, magenta, teal and amber blobs; ice with periwinkle, pink, mint and peach |
| Imagery | Round portraits inside conic-gradient rings; on the directory the ring length *is* the match percentage |
| Texture | Fine `feTurbulence` grain over the sky (4–5 %), so the blur reads as glass rather than gradient |
| Motion | Ambient: blobs drift on 43–67 s loops, floating cards bob, the matching orbit turns, online dots glow |
| Browser features | `backdrop-filter`, scroll-driven parallax (`animation-timeline: scroll()`), Popover API, `prefers-reduced-transparency`, `background-clip: text` |

## Type

- **Sora** (600) for display and headings: geometric, slightly technical, tight-tracked.
- **Outfit** for body and UI: round and soft, Light 300 for leads so they glow rather than shout.

## Palette

| Role | Light (ice) | Dark (night) |
|---|---|---|
| Canvas | `#eef1fb` | `#07081a` |
| Glass fill | white at 52 % (72 % strong) | indigo `rgba(24, 22, 56, .46)` (70 % strong) |
| Glass edge | white at 90 % | white at 18 % |
| Text / muted / subtle | `#14152e` / `#33355a` / `#474a70` | `#f4f3ff` / `#cbc8e8` / `#a9a5cf` |
| Accent | violet `#5b3df5`, white text | lilac `#b6a4ff`, night text |
| Gradient text | violet → magenta → teal (deep shades) | lilac → pink → aqua (light shades) |
| Blobs | periwinkle, pink, mint, peach | violet, magenta, teal, amber at 55 % |

The opaque `--color-bg-surface*` tokens approximate each glass over the canvas and are what the
contrast check uses; all 46 pairs pass. Gradient text only uses shades that are AA against the
glass in each theme.

## Motion spec

| What | Duration | Easing |
|---|---|---|
| Blob drift (translate and scale) | 43–67 s, alternate | `cubic-bezier(0.45, 0, 0.55, 1)` |
| Scroll parallax: near blobs move 22 vh, far blobs 8 vh over the page | scroll-linked | linear |
| Floating hero cards bob 12 px | 6–9 s, alternate | same |
| Card hover: lift 4 px, glass thickens, shadow deepens | 420 ms | `cubic-bezier(0.2, 0.7, 0.2, 1)` |
| Button hover lift 2 px | 260 ms | spring `cubic-bezier(0.34, 1.4, 0.64, 1)` |
| Online dot glow pulse | 2.4 s loop | ease-in-out |
| Matching orbit (satellites counter-rotate to stay upright) | 36 s loop | linear |
| Menu and filter sheet rise in | 420 ms | `cubic-bezier(0.05, 0.7, 0.1, 1)` |

All motion sits in `prefers-reduced-motion: no-preference`; with reduced motion the sky is a still
image. Parallax is additionally wrapped in `@supports (animation-timeline: scroll())`.

## Browser features and fallbacks

- **backdrop-filter**: without it, `.glass` falls back to the opaque surface token (`@supports not`).
- **prefers-reduced-transparency**: glass becomes solid surfaces and the blur is removed.
- **prefers-contrast: more**: glass becomes solid and borders strengthen.
- **Popover API** for the menu and filter sheet; without it they render inline.
- **background-clip: text** for gradient words; forced-colours mode falls back to system text.
- The sky is a fixed layer plus document-anchored halos, so colour sits behind every section even
  in long full-page captures.

## Responsive behaviour

- 360: centred hero, the three floating cards stack; stats two by two; filters are a horizontal
  quick-chip scroller plus a glass sheet; one card per row.
- 768: two-column areas, builders, projects and results.
- 1280: hero cards float at three depths; four areas in a row; the featured event sits beside a
  glowing timeline; filters become a sticky glass panel with a segmented "Open to" control and the
  results run three across.

## Accessibility notes

- Glass is decorative; text contrast is checked against the opaque surface each pane approximates,
  and reduced-transparency or more-contrast preferences remove the translucency.
- The match ring is backed by the written "94% match"; online status has a word and a dot.
- Segmented control is a real radio group inside a `fieldset`; skills use `aria-pressed`.
- The countdown is labelled "Starts in 6 days" as a whole.

## What to take from it

Depth as hierarchy: the most time-sensitive thing floats nearest. The match ring around a portrait
is a compact, delightful way to show fit on the directory and works in any visual direction.

## Open questions

- Backdrop blur over large areas is costly on low-end Android; consider capping glass panes per
  screen or using solid surfaces below a performance threshold.
- Is a dark-first look right for a community that meets for breakfast as often as for demo nights?

<!-- coverage:start -->

Legend: ✅ mock exists · ➖ not applicable (reason in manifest) · ❌ missing

### Pages

| Screen | default | loading | empty | error | Requirements |
|---|---|---|---|---|---|
| Home (`home`) | [✅](pages/home/default.html) | ➖ | ➖ | ➖ |  |
| Builder directory (`directory`) | [✅](pages/directory/default.html) | ➖ | ➖ | ➖ |  |

<!-- coverage:end -->
