# Banaro · Spatial

<!--
Cast and catalog: docs/mocks/README.md (Friday 9 October 2026, viewer Amara Osei in Leslieville).
-->

## The idea

Banaro as a visionOS app. The page is a room: a blurred photograph of Toronto fills the
background (the aerial sunset at night, the lakeshore skyline by day) and every piece of content is
a **glass window** floating in front of it — translucent, blurred, with a specular rim lit from the
top-left and a deep soft shadow. Navigation is a **vertical tab bar** floating at the left edge that
expands to show labels when you look at (hover or focus) it; smaller controls live in **ornaments**,
pill-shaped toolbars that hang below or beside a window (the stats under the hero, the pagination
under the directory window, the "Monday" ornament on the matching photo). Windows and cards tilt
slightly toward the pointer and a soft light follows it across the glass.

## What varies

| Axis | Choice |
|---|---|
| Whitespace | Large: windows sit `--space-16` apart, with `--space-10` padding |
| Line height | Display 1.05, body 1.5 |
| Density | Low on home, medium in the directory window (12 platters) |
| Palette | Neutral glass over a photo; one accent (blue by day, white by night) |
| Imagery | Environment photo (blurred), project covers, builder portraits; monogram gradients for builders without photos |
| Texture | Frosted glass: `backdrop-filter: blur(36px) saturate(1.6)` and a gradient rim |
| Depth | Shadows up to 120 px, pointer-tracked 3D tilt (`perspective(1600px)`) |
| Motion | Tilt, pointer glow, tab bar expansion, spring hover on buttons and app icons |

## Type

**Google Sans Flex** throughout — bold and tightly tracked (−0.025em) for titles, regular for body,
the closest offline match to the SF Pro voice of visionOS.

## Palette and themes

- **Dark (night):** the aerial sunset photograph, dimmed; graphite glass `rgb(36 34 42 / 0.58)`; white text; prominent buttons are white pills with graphite text.
- **Light (day):** the daytime skyline photograph; milky glass `rgb(250 250 252 / 0.58)`; graphite text; prominent buttons are blue (`#0058d0`) with white text.
- Glass tokens: `--glass-bg`, `--glass-bg-strong`, `--glass-fill` (platters inside windows), `--glass-edge` (rim), `--glow`. Body text on glass stays above 4.5:1 because the environment is dimmed under the glass (`--env-dim`).

## Motion

| What | Duration | Easing | Reduced motion |
|---|---|---|---|
| Window and card tilt toward pointer (max 6°, scaled per element with `data-tilt`) | 140 ms tracking, 420 ms settle | `--ease-enter` (0.16,1,0.3,1) | Script does not run; windows stay flat |
| Pointer glow on windows and tiles | 260 ms fade | `--ease-standard` | Kept (not motion) |
| Tab bar expands to show labels | 260 ms | `--ease-enter` | Instant |
| Buttons and app icons spring on hover | 260 ms | `--ease-spring` | Instant |
| Environment drifts slightly | 54 s alternate | `--ease-standard` | Not animated |

## Browser features

- **`backdrop-filter`** for glass (Safari needs the `-webkit-` prefix, included). Without it the glass tokens are still tinted enough to read.
- **CSS masks** with `mask-composite: exclude` for the 1 px gradient rim; falls back to no rim.
- **Popover API** for the mobile filter sheet; on desktop the same form is the window's sidebar.
- **`:has()`** highlights a filter row when its checkbox is checked.
- **Pointer events** in a small inline script for tilt and glow; skipped for coarse pointers and reduced motion; the page is complete without it.
- Images are loaded eagerly in the mock so full-page captures show them; production should lazy-load below the fold.

## Responsive

- 360: windows go nearly full width; the tab bar becomes a bottom ornament with icon + label; the hero photo stacks under the copy; the builder shelf scrolls horizontally with snap; filters open as a glass bottom sheet.
- 768: two-column projects and results.
- 1280+: vertical tab bar at the left edge, hero split in two, three-column shelf and projects, the directory window gains its sidebar.

## Accessibility

- Skip link, one `<h1>`, `aria-current="page"` on the Builders tab, labels on search, sort and range.
- Tab bar labels are always in the DOM (visually collapsed on desktop until hover or focus, so keyboard users see them).
- Presence is a green dot **and** the words "Online now"; the match ring is labelled ("94% match").
- `prefers-contrast: more` turns the default borders strong.

## What to take from it

Depth as hierarchy: the window that matters most is closest and largest; ornaments keep secondary
controls out of the content. The vertical tab bar that expands on focus is a strong pattern for
a four-area product.

## Open questions

- Glass over arbitrary photography is a contrast risk; production would need a contrast guard (dimming) per environment image.
- Tilt on large windows can soften text while moving; it is kept subtle (`data-tilt="0.35"`).

<!-- coverage:start -->

Legend: ✅ mock exists · ➖ not applicable (reason in manifest) · ❌ missing

### Pages

| Screen | default | loading | empty | error | Requirements |
|---|---|---|---|---|---|
| Home (`home`) | [✅](pages/home/default.html) | ➖ | ➖ | ➖ |  |
| Builder directory (`directory`) | [✅](pages/directory/default.html) | ➖ | ➖ | ➖ |  |

<!-- coverage:end -->
