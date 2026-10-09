# Banaro · Soft Illustrated

<!--
Cast and catalog: docs/mocks/README.md (Friday 9 October 2026, viewer Amara Osei in Leslieville).
-->

## The idea

Headspace-like warmth for a faith community. No photographs: every person is a round, friendly,
flat character drawn in inline SVG — someone coding at a laptop in the hero, two builders with
heads bowed over coffee and bread at the prayer breakfast, a presenter waving under string lights
at demo night, two people clinking mugs for co-founder matching. The characters breathe, blink,
type, wave and their coffee steams, in slow loops that stop entirely when reduced motion is
requested. Every builder's avatar is an illustrated face (skin tone, hair style and colour, beard
or hijab, shirt and backdrop chosen per person), so the 12 builders without photos look exactly
like everyone else. Sections are soft pastel bands joined by gentle waves.

## What varies

| Axis | Choice |
|---|---|
| Whitespace | Generous: `--space-16` bands, centred section heads |
| Line height | Body 1.6, headings 1.12 |
| Density | Low on home; medium on the directory (12 cards) |
| Palette | Cream, pastel orange, sky blue, butter yellow, mint, lilac; warm cocoa ink |
| Imagery | Inline-SVG characters and spot illustrations only; illustrated avatars for all builders |
| Shape | Very round: 28–44 px panel radii, pill buttons and chips, wavy section edges |
| Texture | None — flat colour |
| Motion | Gentle loops: breathing, blinking, typing, steam, waving, twinkling lights, floating hearts |

## Type

- **Fredoka** (600) for headings and display — rounded and friendly.
- **Nunito** for body and UI — rounded terminals, very readable at 17 px.

## Palette and themes

- **Light:** cream canvas `#fff3e4`, white cards, cocoa ink `#3b2a24`, primary action orange `#c4501d` with white text, links sky `#245a80`.
- **Dark:** a gentle indigo night (`#1d1b3a`) with moonlight text `#fff4e8`; the primary button becomes pastel orange `#ffb27a` with cocoa text; pastel bands become deep dusk tones; illustration pastels are slightly muted.
- Illustration fills are tokens (`--ill-*`, `--skin-1…6`, `--hair-1…6`) bound through classes like `.f-sky`, so the drawings re-theme with the page.

## Motion

| What | Duration | Easing | Reduced motion |
|---|---|---|---|
| Breathing (characters rise 3 px) | `--duration-loop` 4.5 s, infinite | `--ease-breathe` | Static |
| Blinking | 5.4 s cycle, 3% closed | linear | Eyes open |
| Typing hands, code bars | 0.56 s / 2.25 s alternate | `--ease-standard` | Static |
| Coffee steam rising | 3.15 s | ease-out | Steam drawn, still |
| Presenter waving | 1.5 s alternate | `--ease-breathe` | Arm still, raised |
| Hearts float up, lights twinkle, sun pulses | 2.25–6.75 s | `--ease-enter` / ease-in-out | Static, fully visible |
| Cards lift, spot illustrations hop on hover | 260–400 ms | `--ease-spring` | Instant |

All loops are transforms or opacity on SVG groups (`transform-box: fill-box`), so they never move the layout.

## Browser features

- **Popover API** for the mobile menu and filter sheet (no JavaScript); on desktop the same form is a side panel.
- **`color-mix()`** and `backdrop-filter` for the translucent sticky header; falls back to a solid bar.
- Filter options are real checkboxes styled as chips (`input:checked + span`).
- No JavaScript beyond `mock.js`.

## Responsive

- 360: single column; the hero illustration sits under the copy; stats 2×2; area cards stack; friendly faces in two columns; menu button opens a popover; filters open as a bottom sheet.
- 768: two-column areas, projects and directory cards.
- 1280+: hero split in two, four area cards, six faces in a row, events list beside the demo-night and prayer-breakfast scenes; directory with a filter panel on the left.

## Accessibility

- Skip link, one `<h1>`, `aria-current="page"` on Builders, labelled search, sort and distance; filters are real checkboxes inside fieldsets with legends.
- All illustrations are decorative (`aria-hidden`), every fact is in text; online status is a dot **and** the words "Online now".
- Focus ring: 3 px sky (butter in dark) with 3 px offset.

## What to take from it

The illustrated avatar system: a consistent, inclusive way to show people who have not uploaded a
photo, in a style warm enough to carry prayer and community without feeling corporate.

## Open questions

- Illustrated avatars need a builder-facing editor (skin, hair, head covering, glasses) — and a way to switch to a real photo.
- Loops are gentle but continuous; consider pausing them after a few cycles or when off-screen.

<!-- coverage:start -->

Legend: ✅ mock exists · ➖ not applicable (reason in manifest) · ❌ missing

### Pages

| Screen | default | loading | empty | error | Requirements |
|---|---|---|---|---|---|
| Home (`home`) | [✅](pages/home/default.html) | ➖ | ➖ | ➖ |  |
| Builder directory (`directory`) | [✅](pages/directory/default.html) | ➖ | ➖ | ➖ |  |

<!-- coverage:end -->
