# 13 · Nordic

<!--
Cast and catalog: see docs/mocks/README.md (shared by all 40 concepts). Today is Friday 9 October 2026;
the directory viewer is Amara Osei (Leslieville), looking for a technical co-founder.
-->

## Idea

Scandinavian calm for a community that meets over coffee. Banaro feels like a well-kept room in a
wooden house: oat and birch neutrals, a single sage accent, soft rounded corners, small square
photographs and a great deal of air. Nothing shouts; the page assumes you have time. The only
texture is a whisper of wood grain behind the co-founder matching invitation.

## What varies (compared with the other concepts)

| Axis | Choice |
|---|---|
| Whitespace | Very generous: 128 px between sections on desktop, 96 px on mobile; content capped at 74 rem |
| Line height | Relaxed body (1.65, lead 1.85); display set tight (1.08) in a light weight |
| Density | Low. Home shows six builders, four projects, four events; the directory shows 12 in two columns |
| Palette | Oat canvas, birch surfaces, linen wells, ink text, sage accent; clay and fjord only as quiet tiles |
| Imagery | Small square photos only: one modest scene photo (coffee) and 64 px portraits with 14 px corners. Builders without photos get initials on a soft tile |
| Texture | `feTurbulence` wood grain used as a CSS mask on the matching panel (9 % in light, 6 % in dark) |
| Motion | Slow and quiet: 420 ms hover lifts, a breathing online dot, gentle scroll drift |
| Browser features | Popover API for the mobile menu and filter sheet, CSS masks, scroll-driven animation, `color-mix()` |

## Type

**Manrope** throughout (OFL). Display and section titles at weight 300 with −0.03 em tracking give
the airy, architectural Scandinavian feel; labels are 600 uppercase with 0.14 em tracking. One family
keeps the page calm. JetBrains Mono is declared for code only and never appears on these pages.

## Palette

| Role | Light | Dark (a winter evening by lamplight) |
|---|---|---|
| Canvas | oat `#f5f0e7` | night `#171815` |
| Surface | birch `#fcfaf6` | `#1f211d` |
| Text | ink `#2a2b26` | `#eee8dc` |
| Muted / subtle | `#524f47` / `#686358` | `#c3bcae` / `#a8a193` |
| Accent (fills) | sage `#55715a` with birch text (5.1:1) | sage `#a9bfa5` with deep sage text (8.3:1) |
| Tiles | sage, clay, fjord, oat tints | the same hues, deep |

Every text pair is AA or better in both themes (checked with `check_contrast.py`: 46 of 46 pass).

## Motion spec

| What | Duration | Easing |
|---|---|---|
| Colour, border, underline | 240–420 ms (`--duration-fast`/`--duration-base`) | `cubic-bezier(0.22, 0.61, 0.36, 1)` |
| Card and area hover lift (−3 px plus deeper shadow) | 420 ms, shadow 640 ms | same |
| Photo hover scale 1.03 | 900 ms (`--duration-deliberate`) | same |
| Arrow nudge on hover | 420 ms | same |
| Online dot breathing ring | 3.6 s loop (`--duration-breath`) | `cubic-bezier(0.45, 0, 0.55, 1)` |
| Menu and filter sheet settle in | 640 ms | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Sections drift up 24 px as they enter | scroll-linked | linear over the entry range |

All of it lives inside `@media (prefers-reduced-motion: no-preference)`; reduced motion also zeroes
the duration tokens and `--lift`. The scroll drift only moves elements (no opacity), so the resting
state is always fully visible.

## Browser features and fallbacks

- **Popover API** (`popover`, `popovertarget`) opens the mobile menu and the filter sheet with no
  JavaScript. On desktop the same elements are styled as static navigation and a sticky sidebar.
  Browsers without popover support show the nav and filters inline, which still works.
- **Scroll-driven animation** is wrapped in `@supports (animation-timeline: view())`.
- **CSS masks** carry the wood grain; without them the panel is a plain birch tint.
- `color-mix()` for the breathing ring only.

## Responsive behaviour

- 360: single column; the nav collapses behind an icon-only menu button; filters open as a bottom
  sheet from the "Filters" button; stats sit two by two.
- 768: areas and featured builders in two columns; directory cards in two columns.
- 1280: hero splits into headline and a small photo plus testimonial; four areas in a row; builders
  in three columns; filters become a sticky sidebar beside a two-column result grid.

## Accessibility notes

- One `h1` per page, sections labelled by their `h2`, cards labelled by the builder's name.
- The search has a visually hidden label; the sort select is wrapped in its visible "Sort by" label.
- Filter groups are `fieldset`/`legend`; skills are toggle buttons with `aria-pressed`.
- Online status is a word plus a dot, never colour alone. Notification count has an `aria-label`.
- Focus ring is a 2 px sage outline with 3 px offset on every interactive element.

## What to take from it

The restraint: one accent, one family, small photos and hairlines instead of boxes. The quiet
calendar list for events and the two-fact card footer ("Building · Open to") are strong patterns to
keep whichever direction wins.

## Open questions

- Is the light display weight legible enough on low-quality screens for older members?
- Should the wood grain appear anywhere else, or stay a one-off for matching?

<!-- coverage:start -->

Legend: ✅ mock exists · ➖ not applicable (reason in manifest) · ❌ missing

### Pages

| Screen | default | loading | empty | error | Requirements |
|---|---|---|---|---|---|
| Home (`home`) | [✅](pages/home/default.html) | ➖ | ➖ | ➖ |  |
| Builder directory (`directory`) | [✅](pages/directory/default.html) | ➖ | ➖ | ➖ |  |

<!-- coverage:end -->
