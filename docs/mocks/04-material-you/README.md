# 04 · Material You

<!--
Cast and catalog: see docs/mocks/README.md (Amara Osei as viewer; builders 1–23; projects;
events; filter counts). "Today" is Friday 9 October 2026. Distances are from Leslieville.
-->

**Axes:** Google-inspired · tonal colour · micro-animations

Banaro as a Material 3 product. Every colour comes from one seed, Banaro teal `#1b7f6b`: seven
tonal palettes are computed from it and mapped to the M3 colour roles for light and dark, so the
whole interface feels tinted, soft and coherent. Navigation is a rail on expanded windows and a
bottom navigation bar on phones (one element, restyled). Large rounded shapes do the decorating:
portraits clipped into M3 expressive shapes (a nine-scallop cookie, a soft burst, an arch), a
clover logo, cookie avatars for builders without photos, and two slowly turning shapes in the
matching card. Every control has a state layer and a CSS ripple; buttons and the FAB morph their
corners when pressed.

This is an original stylesheet in the spirit of Material Design 3; it uses no Google logos or
product assets.

## What varies in this concept

| Axis | Choice |
|---|---|
| Whitespace | Medium: 4dp grid, 12–24 px gaps between cards, generous 48–64 px inside hero and CTA. |
| Line height | M3 type scale ratios: display 1.1, headline 1.25–1.33, body 1.43–1.5. |
| Density | Medium: 12 elevated cards (2-up on medium windows), side sheet with every filter. |
| Palette | Tonal: primary teal, secondary grey-green, tertiary lake blue (+60° hue), tinted neutrals. |
| Imagery | Portraits in expressive shapes and a multi-browse carousel; no landscape photography. |
| Texture | None; containers and tone separate surfaces. |
| Motion | State layers, ripple, corner morph on press, indicator pill grow, progress grow, shapes breathe and turn. |
| Browser features | SVG `clipPath` (objectBoundingBox) shapes, `:has`-free chips, `color-mix()`, `<details>` side sheet, range slider with `<output>`. |

## Type

- **Google Sans Flex** for display, headline and title roles (weight 400–500).
- **Roboto** for body and label roles.
- M3 scale: display 45–72 px, headline 24–32 px, title 16–22 px, body 12–16 px, label 12–14 px
  (label-small raised to 12 px to keep the 12 px floor).

## Palette (seed `#1b7f6b`)

Tonal palettes are generated in CIE LCh at fixed hue, with chroma tapered above tone 70 so
containers stay soft. Roles follow the M3 tone mapping:

| Role | Light (tone) | Dark (tone) |
|---|---|---|
| primary / on-primary | P40 `#036b59` / white | P80 / P20 |
| primary-container | P90 `#9af3dc` | P30 |
| secondary-container | S90 `#cde8e0` | S30 |
| tertiary-container | T90 `#baeaff` | T30 |
| surface | N98 `#f1fcf8` | N6 `#0c1513` |
| surface containers | N100 → N90 | N4 → N22 |
| on-surface / variant | N10 / NV30 | N90 / NV80 |
| outline / variant | NV50 / NV80 | NV60 / NV30 |

Success and warning palettes are generated the same way. All text pairs meet WCAG AA,
including every on-container pair.

## Motion

| What | Duration | Easing |
|---|---|---|
| State layer (8% hover, 10% focus and press) | `--duration-fast` 150 ms | linear |
| Ripple: circle grows from the centre and fades | `--duration-ripple` 550 ms | `--ease-standard` (emphasized) |
| Button and FAB corners morph on press | 300 ms | emphasized / expressive spring |
| Active nav indicator grows in | `--duration-slow` 400 ms | emphasized decelerate |
| Match progress grows on load | `--duration-deliberate` 500 ms | emphasized decelerate |
| Area cards round further on hover (28 → 48 px) | 400 ms | emphasized |
| Hero portraits breathe, matching shapes turn | 9 s / 24–30 s loops | standard / linear |

The ripple, indicator, progress and shape loops only run inside
`prefers-reduced-motion: no-preference`; reduced motion leaves the state layer (an instant
opacity change) and static shapes. All duration tokens drop to 0.01 ms.

## Browser features and fallbacks

- **SVG `clipPath` with `clipPathUnits="objectBoundingBox"`** gives true M3 shapes on any element
  size; where unsupported the images show as rectangles inside rounded containers.
- **`color-mix()`** for the checkbox row state layer; older browsers simply skip the hover tint.
- **`<details>`** side sheet ("All filters"): open in the markup, folded below 1200 px by a short
  inline script, so with JavaScript off it stays open. The same script keeps the distance
  `<output>` in sync with the slider and promotes lazy photos once idle.

## Responsive behaviour

- **Compact (< 600):** top app bar (logo, search bar with avatar, notifications); bottom
  navigation bar with five destinations; FAB above the bar (icon only, labelled); filter chips
  scroll horizontally; "All filters" sheet folded above the results; cards single column.
- **Medium (600–839):** cards 2-up; area cards 2-up.
- **Expanded (≥ 840):** navigation rail with the clover logo; extended FAB bottom-right.
- **Large (≥ 1200):** standard side sheet beside the results, sticky; hero splits text and shapes.

## Accessibility

- One `h1` per page; sections labelled by their `h2`.
- Current destination is `aria-current="page"` in the rail/bar; the Matching item announces
  "2 new matches"; notifications announce "3 unread".
- Filter chips are real checkboxes ("Within 40 km" `checked`); role and neighbourhood are
  labelled checkbox lists; distance is a labelled range with `aria-valuetext`; sort is a labelled
  select with a notched outline label.
- Save buttons are toggle buttons with `aria-pressed`. Online status uses a dot **and** "Online now".
- Focus indicator: 3 px secondary-colour ring with 2 px offset, as in M3.

## What to take from it

- A whole theme from one seed: brand colour changes become a one-token change, and dark mode is
  derived, not designed twice.
- The rail/bar split gives the directory an app-like feel on every device.
- Risk: close to a familiar platform look; Banaro's own identity comes mostly from the seed and
  the shapes, so push those if chosen.

## Coverage

<!-- coverage:start -->

Legend: ✅ mock exists · ➖ not applicable (reason in manifest) · ❌ missing

### Pages

| Screen | default | loading | empty | error | Requirements |
|---|---|---|---|---|---|
| Home (`home`) | [✅](pages/home/default.html) | ➖ | ➖ | ➖ |  |
| Builder directory (`directory`) | [✅](pages/directory/default.html) | ➖ | ➖ | ➖ |  |

<!-- coverage:end -->
