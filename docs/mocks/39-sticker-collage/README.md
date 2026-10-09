# Banaro · Scrapbook

<!--
Cast and catalog: docs/mocks/README.md (Friday 9 October 2026, viewer Amara Osei in Leslieville).
-->

## The idea

Banaro as the community's shared scrapbook, pinned to a cork board in a church hall. Everything is
a physical object: the promise is written in marker on a sheet of grid paper taped to the board;
photos of real gatherings are cut-outs with thick white borders and handwritten captions; the four
areas are index cards; projects are notebook pages held by paper clips; events are ticket stubs
with a perforated edge; the testimonial is a sticky note and the matching call to action is a
letter next to an envelope stamped "Every Monday". In the directory, every builder is **pinned to the
board**: a cut-out photo (or an initials card) held by washi tape or a push pin, with a typed note
card underneath, a round match sticker and label-maker skill tags. Filters sit on a clipboard.

## What varies

| Axis | Choice |
|---|---|
| Whitespace | Generous but irregular: objects overlap and tilt (`--tilt-1…4`, −2.2° to 2.4°) |
| Line height | Body 1.55; marker headings 1.08; handwritten notes 1.1–1.2 |
| Density | Medium: 12 pinned builders, every fact kept |
| Palette | Cork, off-white paper, tomato marker, Bic-pen blue, pastel sticky notes and washi tape |
| Imagery | Real photographs as cut-outs; inline-SVG doodles (arrow, heart, paper clip, icons) |
| Texture | Cork flecks + `feTurbulence` noise, paper grain, ruled and grid paper, kraft fibres, washi stripes |
| Motion | The "1,284 builders!" sticker sways; the arrow doodle redraws itself; pinned items straighten on hover |

## Type

- **Permanent Marker** — headlines, section labels, project names, stickers.
- **Caveat** (bold) — handwritten captions, notes, nav links, asides.
- **Bricolage Grotesque** — all reading text, so the page stays readable under the craft.
- **Space Mono** — label-maker tape, stamps and the verse (typed on a slip).

## Palette and themes

- **Light:** daytime cork `#d6ae80`, paper `#fbf7ee`, ink `#2b2622`, tomato `#b8372a` for the primary action (white text), pen blue `#1f4fa8` for links.
- **Dark:** a dark felt board under a lamp (`#2a2522`); paper becomes charcoal (`#36302c`) with cream ink; photo borders turn cream; sticky notes stay pastel with dark ink (`--on-sticky`), so they read the same in both themes. Kraft deepens to `#5c4a33` with cream text.
- Readable text always sits on paper, sticky notes or kraft, never directly on cork (cork is texture only).

## Motion

| What | Duration | Easing | Reduced motion |
|---|---|---|---|
| Sticker sways on the hero | 3 s alternate, infinite | ease-in-out | Not animated |
| Arrow doodle redraws | `--duration-loop` 6 s | `--ease-standard` | Not animated, fully drawn |
| Photos and pinned builders straighten and lift on hover/focus | `--duration-base` 220 ms | `--ease-enter` (tiny overshoot) | Instant |
| Buttons lift with a hard shadow on hover, press down on click | 120 ms | `--ease-standard` | Instant |

## Browser features

- **Popover API** for the mobile menu and the clipboard filter sheet (no JavaScript); on desktop the same elements are shown in place.
- **CSS masks** for the ticket perforations and the perforated stamp edge; **clip-path** for torn paper edges, washi tape ends and label-maker tape. Without masks, tickets are plain rectangles.
- **SVG `feTurbulence`** noise as data-URI backgrounds for cork and paper grain.
- No JavaScript beyond `mock.js`.

## Responsive

- 360: the hero sheet stacks above a two-column photo collage; stats stickers wrap; index cards, pages and tickets stack; pinned builders in one column with a smaller photo; the menu is a paper popover; filters open from a "Filters" button as a clipboard sheet.
- 768: two columns of cards, pages and pins.
- 1280+: the collage becomes an overlapping arrangement beside the hero sheet; six polaroids in a row; three columns of pinned builders beside a sticky clipboard.

## Accessibility

- Skip link, one `<h1>`, landmarks, `aria-current="page"` on Builders, labelled search, sort and distance.
- Handwriting is used only for short, non-essential text (captions, asides); every builder fact is in the readable sans.
- Decorative photos in polaroid links have `alt=""` and the link carries the name; the collage photos describe the scene.
- Focus ring is a 3 px dashed ink (yellow in dark) outline, like a pen circling the item.

## What to take from it

The emotional register: Banaro as something the community makes together, with real photographs
of real gatherings. The pinned-builder card (photo + typed note + match sticker) keeps every fact
while feeling personal.

## Open questions

- Rotation and texture add visual noise for people with low vision; a "tidy board" preference could straighten everything.
- Real photography of Banaro events, with consent, is essential for this direction.

<!-- coverage:start -->

Legend: ✅ mock exists · ➖ not applicable (reason in manifest) · ❌ missing

### Pages

| Screen | default | loading | empty | error | Requirements |
|---|---|---|---|---|---|
| Home (`home`) | [✅](pages/home/default.html) | ➖ | ➖ | ➖ |  |
| Builder directory (`directory`) | [✅](pages/directory/default.html) | ➖ | ➖ | ➖ |  |

<!-- coverage:end -->
