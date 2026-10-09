# 05 · Beaver Crew

<!--
Cast and catalog: docs/mocks/README.md (shared by every concept). Today is Friday 9 October 2026;
the directory viewer is Amara Osei (Leslieville). Characters: Bram the beaver (mascot, hard hat),
Rhea the raccoon (laptop), Gus the Canada goose (red scarf).
-->

## The idea

Banaro as a cut-paper picture book. Bram, a friendly hard-hatted beaver, is the host: he waves from a
paper Toronto skyline in the hero, peers through a magnifying glass at the top of the directory, and
points at the month's events. Rhea the raccoon and Gus the Canada goose make up the crew. Every
surface is a piece of paper with a hand-cut edge, fibre grain and a stacked paper shadow. Builders
are never photographs: each one is a cartoon avatar badge built from the same parts (skin, hair,
shirt, glasses, beard, hard hat), so the community feels like one illustrated cast.

## What varies (compared with the other concepts)

| Axis | Choice |
|---|---|
| Whitespace | Generous; sections breathe at `--space-16`, cards tilt slightly so the grid feels hand-placed |
| Line height | Body 1.55, display 1.02 |
| Density | Low on home (6 featured builders), medium in the directory (12 cards) |
| Palette | Cream and kraft paper, beaver brown, hard-hat yellow, river blue, leaf green; a moonlit pond at night |
| Imagery | Inline SVG characters and scenes only; no photos |
| Texture | `feTurbulence` grain (page overlay and inside every illustration layer), paper fibres, displacement-map cut edges |
| Motion | Characters react on hover: Bram waves, the crew turn their heads, avatars wink, the magnifier bobs |
| Browser features | SVG filters on HTML via `filter: url(#cut)`, Popover API menu and filter sheet, `color-mix()`, individual transform properties |

## Type

- **Fredoka** (600–700) for display, headings, buttons: round, chunky, friendly, like cut letters.
- **Nunito** (500–700) for body: rounded terminals that match Fredoka and stay readable at 15–17px.
- **Gochi Hand** for Bram's speech bubble, eyebrows and the verse: a handwritten caption voice.
- Body is 17px (`--font-size-md: 1.0625rem`); the display size clamps from 44px to 80px.

## Palette

Light: canvas `--palette-cream-200`, cards `--palette-cream-100`, ink `--palette-bark-900`
(12.3:1 on canvas), muted `--palette-bark-600` (6.7:1), links `--palette-river-700` (5.9:1), accent
fill `--palette-hat-400` with bark ink on top (7.3:1). Coloured papers: river, leaf, hat, berry, plum.

Dark ("night at the pond"): canvas `--palette-pond-900`, cards `--palette-pond-850`, cream ink
`--palette-moon-100` (13.8:1), muted 7.8:1, links `--palette-river-300` (8.1:1). The sun becomes a
moon, the city windows light up yellow, the footer flips to cream paper.

All character and scene colours are tokens (`--char-*`, `--scene-*`, `--skin-*`, `--hair-*`,
`--shirt-*`), so the illustrations re-ink with the theme. No colour literal appears outside
`tokens.css`; the grain textures are SVG data URIs with numeric colour matrices only.

## Motion

| What | Duration | Easing | Trigger |
|---|---|---|---|
| Bram waves | `--duration-deliberate` (900ms), loops while hovered | `--ease-standard` | Hover or focus inside the hero |
| Crew heads turn | `--duration-base` (240ms) | `--ease-spring` | Hover over the scene |
| Bram blinks | 5s loop | linear keyframes | Always (no-preference only) |
| Avatar tilt and wink | `--duration-base` | `--ease-spring` | Hover a builder card |
| Magnifier bob | `--duration-deliberate` | `--ease-standard` | Hover the directory heading |
| Bram's pointing arm jiggles | `--duration-deliberate` | `--ease-standard` | Hover the events section |
| Buttons lift and press | `--duration-fast` (140ms) | `--ease-spring` | Hover, active |

Every animation lives inside `@media (prefers-reduced-motion: no-preference)`; with reduced motion
the characters stand still and nothing is hidden.

## Browser features and fallbacks

- **SVG filters on HTML** (`filter: url(#cut) drop-shadow(…)` on `::before` layers): Chromium,
  Firefox and Safari support fragment filters; if a browser ignores them the papers keep a rounded
  edge and a CSS drop shadow. The filters are defined once per page in a hidden `.sprite` SVG.
- **Popover API** for the mobile menu and the directory's filter sheet (Chrome 114+, Safari 17+,
  Firefox 125+). It needs no script; on desktop the same elements are restyled as an inline nav and
  a sticky sidebar.
- `color-mix()` for the online halo and tape; falls back to no halo.

## Responsive behaviour

- **360px:** header shows the mark, an icon-only Menu button (Popover) and Join Banaro; the hero scene
  stacks under the copy; stats go 2 × 2; areas, builders, projects and tickets are single column.
  The directory shows a Filters button that opens a bottom sheet.
- **768px:** areas and builders go two-up, stats one row of four.
- **1280px:** hero is two columns; areas four-up with a staggered rhythm; builders three-up; the
  directory has a sticky paper sidebar of filters and two-up cards (three-up at 1440px+).

## Accessibility

- One `h1` per page; the illustrations are `aria-hidden`, and every fact they hint at is in the text.
- Status uses a dot and a word ("Online now", "Seen 3 h ago"); match is a word ("94% match").
- Badge counts carry their meaning in `aria-label` ("Notifications, 3 unread").
- Filters are real checkboxes with visible labels and counts; skill chips use `aria-pressed`; the
  distance slider has `aria-valuetext`.
- Focus ring is a 3px river-blue outline with offset, visible on every paper.

## What to take from it

Mascot-led warmth without childishness: the copy and structure stay grown-up while the characters
carry the personality. The avatar badge system is the reusable idea; it gives every builder a face
without photography or consent issues, and it scales to 1,284 people. Open question: whether Bram
should appear in transactional screens (empty states, errors), where a character reacting to empty
space would earn its keep.

## Coverage

<!-- coverage:start -->

Legend: ✅ mock exists · ➖ not applicable (reason in manifest) · ❌ missing

### Pages

| Screen | default | loading | empty | error | Requirements |
|---|---|---|---|---|---|
| Home (`home`) | [✅](pages/home/default.html) | ➖ | ➖ | ➖ |  |
| Builder directory (`directory`) | [✅](pages/directory/default.html) | ➖ | ➖ | ➖ |  |

<!-- coverage:end -->
