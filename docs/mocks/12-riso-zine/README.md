# 12 · Riso Zine

<!--
Cast and catalog: docs/mocks/README.md. Today is Friday 9 October 2026 ("No. 10" of the zine);
the directory viewer is Amara Osei (Leslieville), 3 unread notifications, 2 new matches.
Directory shows builders 1–12 in Best match order; distance defaults to 40 km.
-->

**Idea.** Banaro as a photocopied community zine, printed on a risograph in two inks —
**fluorescent pink and teal**. Headlines are cut out of scraps of ink and paper and glued at angles;
section titles overprint pink and teal slightly off register; photos are coarse halftones in one ink;
stickers, tape and staples hold it together. The directory is the zine's contributors page. In dark
it is the same zine printed on **black paper** with brighter inks.

## What varies in this concept

| Axis | Choice |
|---|---|
| Whitespace | Zine pages: thick rules between “pages”, folios (“In this issue · p. 02”), generous gutters. |
| Line height | Headlines at 0.86 (tight, stacked); body 1.5. |
| Density | Medium. Directory: 12 contributor cards, three per row at 1280 px. |
| Palette | Two inks only (pink, teal) plus paper and ink-black. Pink is the primary action. |
| Imagery | Real photos turned into one-ink halftones (CSS filter + blend + dot screen); portraits likewise; initials cards for builders without photos print on a teal dot pattern. |
| Texture | Paper grain (`feTurbulence` noise blended with the paper), dot screens, tape, staples, dashed cut lines. |
| Motion | Almost none — a sticker wobbles on hover (stepped easing, like a jittery photocopy), buttons press like a stamp. |
| Browser features | `mix-blend-mode` overprint (`multiply` on paper, `screen` on black), `attr()` for the misregistered second pressing, `:has()` tick boxes, `color-mix()`. |

## Type

- **Darker Grotesque 900** — the cut-out headline face: condensed, heavy, uppercase, stacked tight.
- **Space Grotesk** — body and UI; slightly quirky, reads like a typed zine.
- **Permanent Marker** — handwritten scrawls, stickers and the cut-here coupon.
- **Space Mono** — folios, counts, distances and skill tags.

## Palette (tokens)

| Role | Light (newsprint) | Dark (black paper) |
|---|---|---|
| Paper / card | `#f3eee3` / `#fbf8f1` | `#121212` / `#1a1a19` |
| Text | teal-black `#10302f` | `#f4efe6` |
| Pink ink: fill / text | `#ff48b0` / `#b8006a` (5.6:1) | `#ff5fbf` / `#ff8fd0` (9.0:1) |
| Teal ink: fill / text | `#00a2a6` / `#00666b` (5.8:1) | `#19d3c5` / `#4fe3d6` (11.9:1) |
| Text on ink blocks | `#10302f` on pink 4.6:1, on teal 4.5:1 | `#121212` on pink 6.8:1, on teal 10:1 |
| Blend tokens | `--riso-blend: multiply`, `--riso-photo-blend: lighten` | `screen`, `darken` |

Fluorescent ink is used only as fills and large display; text uses the deeper “pressing” tokens.

## How the print effects work

- **Overprint:** `.overprint` prints the heading in pink; `::after { content: attr(data-print) }`
  prints the same words in teal, offset by `--misregister-x/y` and blended with `--riso-blend`.
- **Halftone:** the photo is filtered to high-contrast grayscale (`--riso-photo-filter`), an ink
  layer blends over it (`lighten` makes the darks pink on paper; `darken` makes the lights glow on
  black), and a radial-gradient dot screen in paper colour breaks it into dots.
- **Cut-out headline:** every word is a `.cutout` scrap (pink, teal, paper, ink) rotated by
  `:nth-child`.
- **Grain:** an alpha-only SVG noise layer over the page, blended with the paper.

## Motion spec

| Element | Duration / easing | Reduced motion |
|---|---|---|
| Sticker hover wobble | 0.4 s × 2, `--ease-steps` | None |
| Button press | `--duration-fast` 100 ms translate + shadow | Instant |
| Area card lift | `--duration-base` 180 ms, `--ease-spring` | Instant |

## Responsive behaviour

- **360 px:** masthead with brand and actions; the four numbered nav links become a horizontal
  scroller under it (44 px targets); headline words stack; filters become a horizontal pile of taped
  notes you swipe through; one card per row.
- **768 px:** issue line appears in the masthead; two cards per row.
- **1024 px+:** masthead becomes a single row (brand · issue · nav · actions); filters stack in a
  sidebar; hero photo beside the headline.

## Accessibility notes

- The duplicated overprint text is generated content on `::after`, so screen readers read each
  heading once; cut-out words are plain text in one `<h1>`.
- Halftone photos are decorative (`alt=""`); names sit beside every portrait.
- Online state is a filled teal dot **and** “Online now”; match stickers carry an `aria-label`.
- Tick boxes are real checkboxes; focus draws a dashed ring around the box.
- Photos are not lazy-loaded in this mock so full-page screenshots are complete; production should
  lazy-load everything below the fold.

## What to take from it

A grassroots, made-by-the-community voice; overprint and halftone as a cheap, recognisable brand
system that needs only two colours; stickers as the place for live, human notes (“16 spots left!”).

## Open questions

- The fluorescent pink fails contrast as text by design; keep it to fills and display sizes.
- `mix-blend-mode` overprint differs slightly between browsers; check Safari before choosing it.

<!-- coverage:start -->

Legend: ✅ mock exists · ➖ not applicable (reason in manifest) · ❌ missing

### Pages

| Screen | default | loading | empty | error | Requirements |
|---|---|---|---|---|---|
| Home (`home`) | [✅](pages/home/default.html) | ➖ | ➖ | ➖ |  |
| Builder directory (`directory`) | [✅](pages/directory/default.html) | ➖ | ➖ | ➖ |  |

<!-- coverage:end -->
