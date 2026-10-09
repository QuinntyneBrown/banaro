# 34 · Kraft & Letterpress

Banaro as **crafted print**. The page is a kraft board you can almost feel. On it sit cream card
stock with deckled edges, type pressed into the paper, running stitches, polaroids held down with
tape, and rubber stamps saying who is "OPEN TO CO-FOUNDING". It is slow, warm and human, like a
community noticeboard in a church hall, but laid out with a printer's discipline.

- **Home:** a debossed headline on kraft, three taped polaroids (Daniel, Grace, Noah) with a
  rubber stamp and a handwritten note, and a "Tally for 2026" receipt with dotted leaders. Then
  four stitched cards in a darker kraft band, "calling cards" for six featured builders, projects
  as **shipping tags**, events as perforated **tickets**, the matching call to action as an
  **envelope** with a wax seal and a postmark, the verse on linen, and Hannah's quote typed on a
  ruled index card.
- **Directory:** "The builder register". Results are **library index cards** with a red header
  rule, faint ruled lines, a taped polaroid (or a monogram for builders without a photo), mono
  fields (Where, Skills, Building, Seen) and an open-to stamp. Search is a typewriter line. Roles
  are typewriter keys (`aria-pressed`). The remaining filters are an order form on linen. Results
  page with letterpress page numbers.

## What varies

| Axis | Choice |
|---|---|
| Whitespace | Generous, uneven, like objects laid on a table; small rotations (±0.4–6°) |
| Line height | Body 1.55 in EB Garamond; ruled cards lock to a 1.625–1.75rem baseline |
| Density | Medium: 12 index cards per page, each with every field |
| Palette | Kraft `#dcc29b`, cream stock `#f6efdf`, ink `#2b1d12`, terracotta ink `#9c4024`, olive ink `#56611f`. Dark: walnut `#261a12` and leather `#3a2a1d` with cream ink `#f3e6c8` |
| Imagery | Portraits as small taped polaroids with a slight sepia; the demo night photo as a polaroid on its ticket |
| Texture | SVG `feTurbulence` grain and specks, crossed fibre gradients, linen weave, deckled `clip-path` edges, stitched dashed outlines, an SVG ink filter that roughens stamps |
| Motion | Minimal and tactile: cards straighten and lift on hover, tags swing, stamps thump on hover, keys press down |
| Browser features | SVG filters on HTML (`filter: url(#ink)`), `clip-path` polygons, CSS masks for ticket perforations, `mix-blend-mode`, `font-variation-settings` |

## Type

- **Fraunces** (black, soft and wonky axes) for display and names. Its ink traps read as
  letterpress, and the deboss is two text-shadows (`--color-press-highlight`, `--color-press-shade`).
- **EB Garamond** for reading text and italic ledes.
- **Space Mono** for labels, fields, buttons and stamps, the typewriter voice.
- **Caveat** only for handwritten polaroid captions and notes.

## Palette and themes

Light is kraft board, cream stock and two inks. Dark is a walnut desk with leather surfaces and
cream ink. Terracotta and olive lighten to `#eda17e` and `#c3cc86`, and polaroids stay
parchment-white. Textures stay the same, and grain uses `multiply` in both themes. All text pairs
pass AA (checked by script). Stamps are decorative repeats of real text and still pass 3:1.

## Motion spec

| Interaction | Duration | Easing |
|---|---|---|
| Card hover: straighten (rotate to 0) and lift 3 px | `--duration-base` 240 ms | `--ease-spring` |
| Shipping tag hover: swing to the opposite tilt | 240 ms | `--ease-spring` |
| Stamp hover: thump (scale 1.25 to 1) | `--duration-deliberate` 520 ms | `--ease-stamp` |
| Key press | `--duration-fast` 140 ms | `--ease-standard` |

There is no load animation. Everything is inside `prefers-reduced-motion: no-preference`, so with
reduced motion the objects keep their resting tilt and nothing moves.

## Browser features and fallbacks

- `filter: url(#ink)` (an inline SVG filter) roughens stamps. Where SVG filters on HTML are not
  supported, stamps are clean double-ruled boxes.
- `clip-path` deckles and CSS-mask ticket perforations degrade to straight edges.
- The grain is a colourless data-URI SVG, so it has no network cost and works offline.
- No JavaScript beyond `mock.js` on the home page. The directory has a tiny script for the
  single-choice role keys and to close the order form on phones. Without it, the form is open.

## Responsive behaviour

- **360:** the letterhead drops the monogram and the nav goes into a menu. Polaroids stack into a
  smaller board, cards go single column, role keys scroll sideways, and the order form is a
  collapsed `details`.
- **768:** two-column calling cards, tags, tickets and index cards.
- **1280:** split hero, four stitched area cards, three-column calling cards and index cards,
  four tags in a row, the order form as a sidebar, and the feature ticket with its polaroid.

## Accessibility

- Every rotation is cosmetic: reading order and focus order follow the DOM. Focus rings are dashed
  terracotta, 2 px, with offset.
- Stamps repeat information that is also in text. Inked checkboxes are real checkboxes with a
  visible ✕ when checked. Role keys use `aria-pressed`. The current page uses `aria-current`, and
  badge counts carry their meaning in `aria-label`.
- Mono labels are 12 px bold uppercase with tracking. Body text stays at 18 px Garamond.

## What to take from it

Warmth without cuteness. Banaro is about neighbours, and paper, ink and handwriting say "made by
people near you". The index card is a strong, reusable pattern for builder results because each
field has a fixed place. Use the stamp sparingly, for one status per card.

<!-- coverage:start -->

Legend: ✅ mock exists · ➖ not applicable (reason in manifest) · ❌ missing

### Pages

| Screen | default | loading | empty | error | Requirements |
|---|---|---|---|---|---|
| Home (`home`) | [✅](pages/home/default.html) | ➖ | ➖ | ➖ |  |
| Builder directory (`directory`) | [✅](pages/directory/default.html) | ➖ | ➖ | ➖ |  |

<!-- coverage:end -->
