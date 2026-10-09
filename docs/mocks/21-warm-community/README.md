# 21 · Warm Community

People first. Banaro as a home-sharing marketplace for collaborators: big, warm, candid
photographs of real gatherings, cream and terracotta like a clay pot on a kitchen table, and
rounded photo cards with a heart to save a builder and a match score where a rating would be.
The interface steps back so faces and tables full of food do the persuading.

<!--
Cast and catalog: docs/mocks/README.md ("Cast and catalog"). Today is Friday 9 October 2026,
viewer on the directory is Amara Osei (Leslieville). Builders 1–11 have portraits; 12 (Esther
Nguyen) uses a generated monogram.
-->

## The idea

- **Photographs carry the page.** The hero is a three-photo collage (community dinner, coffee
  toast, café conversation); the four areas are full-bleed photo tiles; projects, the story and the
  matching call to action each lead with a photograph.
- **Marketplace grammar.** A segmented pill search ("Who · Where · Open to"), photo cards with a
  save heart and carousel dots, a sticky category bar with icons (role) above pill filters, a
  floating "Show map" button and a "Show more" pager with a progress line.
- **Warm, not cute.** Earthy terracotta, cream and olive, generous radii (20–36 px), soft brown
  shadows, a friendly humanist pair of typefaces.

## What varies (compared with the other concepts)

| Axis | Choice |
|---|---|
| Whitespace | Generous: sections breathe at 80 px on desktop, 48 px on phones |
| Line height | 1.55 body, 1.05 display |
| Density | Low to medium: 4 builder cards per row on desktop, 1 per row under 480 px |
| Palette | Cream `--palette-cream-*`, terracotta `--palette-terracotta-*`, olive, cocoa ink; dark theme is a cocoa-brown evening |
| Imagery | Large candid photography, square portraits with rounded corners, a generated monogram for builders without photos |
| Texture | None; depth comes from warm shadows and photo scrims |
| Motion | Gentle: photo zoom on hover, heart spring, a slowly bobbing "96 matches" sticker |
| Browser features | `:has()` focus rings on composite controls, `backdrop-filter` header, `color-mix()`, `<details>` filter menus, CSS scroll-snap carousel |

## Type

- **Display:** Bricolage Grotesque 800 (headlines, card titles, numbers), tight tracking (−0.025em).
- **Body and UI:** Nunito 400–800, rounded terminals that read as friendly at small sizes.
- Scale: 12 · 14 · 16 · 19 · 22 · 26 · 32 · 44 · fluid 40→76 px display.

## Palette

| Role | Light | Dark |
|---|---|---|
| Canvas | cream 100 | cocoa 950 |
| Surface | cream 50 | cocoa 900 |
| Text | cocoa ink (15.7:1) | cream 100 (14.3:1) |
| Muted text | cocoa 700 (6.4:1) | cocoa 300 (9.0:1) |
| Accent fill | terracotta 600, white text (5.4:1) | terracotta 400, cocoa text (7.5:1) |
| Accent text | terracotta 700 (6.1:1) | terracotta 300 (8.0:1) |
| Success / open to | olive 600 | olive 300 |
| Highlight | honey 300 (sticker, "spots left") | honey 300 |

## Motion

| Interaction | Duration | Easing |
|---|---|---|
| Hover colour, button press (scale 0.97) | `--duration-fast` 150 ms | `--ease-standard` |
| Heart save (scale 1.12) | 150 ms | `--ease-spring` |
| Photo zoom on card hover (1.04–1.05) | `--duration-deliberate` 560 ms | `--ease-enter` |
| Filter chevron, skip link | `--duration-base` 240 ms | `--ease-standard` |
| Hero sticker bob | 6 s alternate | `--ease-standard` |

Under `prefers-reduced-motion: reduce` the durations collapse to 0.01 ms and the sticker
animation is never declared (it lives inside `prefers-reduced-motion: no-preference`). Photo
zooms are disabled on touch (`hover: none`).

## Browser features and fallbacks

- `:has()` draws the focus ring around the whole pill search field and on the card photo when
  its name link is focused. Without it, the native focus ring on the control still shows.
- `backdrop-filter` frosts the sticky header; without it the header is a 92% cream fill.
- `color-mix()` for the translucent header; older browsers see an opaque canvas fill.
- Filter menus are `<details>`; they open and close without JavaScript.
- A short inline script toggles the save hearts and the role chips (`aria-pressed`). Without
  JavaScript the page renders the same, only the toggles do not change.

## Responsive behaviour

- **360 px:** primary navigation becomes an app-style bottom tab bar (icons + labels); the hero
  stacks text above the collage; the pill search stacks into a card; area tiles are 16:11; the
  featured builders become a horizontal snap carousel; the directory category bar and pill
  filters scroll sideways inside their own rows; cards run one per row.
- **768 px:** two-column card grids, the pill search becomes a single rounded bar.
- **1280 px:** a centred pill navigation in the header, hero split 5:6, four areas in a row, six
  featured builders in a row, four builder cards per row in the directory.

## Accessibility

- One `h1` per page; card names are `h2` on the directory and `h3` on the home page.
- Save hearts are toggle buttons with `aria-pressed` and a name ("Save Grace Liu"); role chips
  are toggle buttons in a labelled group; all filters are real checkboxes and a labelled range.
- Match scores read as "94% match"; online status is a dot plus the words "Online now".
- Text on photographs always sits on a scrim (`--color-photo-scrim`) or a solid chip.
- Focus ring: 3 px terracotta with a 2 px cream offset, on every interactive element.

## What to take from it

The photo-first card and the marketplace search pill are the most transferable ideas: they make
Banaro feel like a place full of people, not a database. The save heart doubles as a
lightweight "shortlist" for co-founder matching. The weakness is dependence on photography:
builders without a portrait (12–23) need a strong monogram treatment, and production needs
consented photographs of real Banaro gatherings.

## Open questions

- Should the "Show map" toggle open a split map/list view (borrowing from 17 · Map First)?
- Do saved builders become a visible list ("Your shortlist") in the navigation?

<!-- coverage:start -->

Legend: ✅ mock exists · ➖ not applicable (reason in manifest) · ❌ missing

### Pages

| Screen | default | loading | empty | error | Requirements |
|---|---|---|---|---|---|
| Home (`home`) | [✅](pages/home/default.html) | ➖ | ➖ | ➖ |  |
| Builder directory (`directory`) | [✅](pages/directory/default.html) | ➖ | ➖ | ➖ |  |

<!-- coverage:end -->
