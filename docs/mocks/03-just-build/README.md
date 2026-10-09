# 03 · Just Build

<!--
Cast and catalog: see docs/mocks/README.md (Amara Osei as viewer; builders 1–23; projects;
events; filter counts). "Today" is Friday 9 October 2026. Distances are from Leslieville.
-->

**Axes:** sports-retail-inspired · large photography · tight line height

Banaro with the energy of a sportswear flagship store. Full-bleed photographs carry enormous
condensed uppercase slogans ("BUILD TOGETHER.", "DEMO NIGHT. 15.10", "FIND YOUR CO-FOUNDER.")
set at line-height 0.82–0.92, so the lines nearly touch. The palette is black and white with one
volt accent that is only ever a fill: match tags, the marquee, the RSVP button, the matching
promo tile and the footer slogan. Builders are merchandised like products: square portraits on
grey, an orange-red status flag, a bold name, grey details and the match percentage where a
price would sit. The directory is a shop page with a filter rail and a product grid.

This is an original stylesheet in the spirit of a sportswear retailer; it uses no third-party
trademarks, slogans or logos. The mark is two forward-leaning bars.

## What varies in this concept

| Axis | Choice |
|---|---|
| Whitespace | Tight inside components (8–12 px grid gaps, square images edge to edge), generous between sections. |
| Line height | Display 0.82–0.92 (Anton); body 1.5. |
| Density | Medium-high: 12 product cards plus a promo tile, 2-up even on phones. |
| Palette | Black `#111111`, white, grey `#f5f5f5` image ground, volt `#d6ff1f` fill, orange-red `#c43a10` flags. |
| Imagery | Full-bleed and square photography everywhere; generated avatar (initials over a volt slash) for builders without photos. |
| Texture | None; contrast and scale do the work. Photos get a bottom scrim for legible overlays. |
| Motion | A volt marquee, image zoom on hover, pill press scale, nav underline. |
| Browser features | `position: sticky` header and shop bar, scroll-snap rail, `<details>` filter groups and mobile menu. |

## Type

- **Anton** for display: always uppercase, 56–176 px on the hero and slogans, 40–80 px for
  section and statistic numerals.
- **Archivo** (variable, normal width) for everything else at weight 400–500, 16 px body, 12 px
  utility bar. Names are 16 px medium, just like product names.

## Palette

| Role | Light | Dark |
|---|---|---|
| Canvas | white | pitch `#000000` |
| Image ground | `#f5f5f5` | `#161617` |
| Text / muted | `#111111` / `#707072` (4.9:1) | white / `#9e9ea0` |
| Primary pill (`--color-accent`) | black with white text | white with black text |
| Volt (`--color-bg-volt`) | `#d6ff1f` with `#111` text | same |
| Flag (`--color-fg-flag`) | `#c43a10` (5.3:1) | `#ff8a5c` |
| Footer | black in both themes, grey `#9e9ea0` links | same |

All text pairs meet WCAG AA. Volt is never used for text on white.

## Motion

| What | Duration | Easing |
|---|---|---|
| Volt marquee scrolls ("BUILD TOGETHER. PRAY TOGETHER. SHIP TOGETHER. SHOW UP.") | `--duration-marquee` 28 s loop, pauses on hover | linear |
| Photo zoom on card and tile hover (1.03–1.04) | `--duration-slow` 400 ms | `--ease-standard` |
| Pill press scale 0.97 | `--duration-fast` 150 ms | `--ease-standard` |
| Nav underline grows | 150 ms | `--ease-standard` |
| Filter group chevrons rotate | 150 ms | `--ease-standard` |

The marquee only animates inside `prefers-reduced-motion: no-preference`; reduced motion shows
the static band. Other durations drop to 0.01 ms through the tokens.

## Browser features and fallbacks

- **Sticky header and shop bar**: the title, search and sort stay in reach while browsing.
- **`<details>`** for the mobile menu, the filter rail ("Hide filters" / "Show filters") and each
  filter group. The rail is open in the markup; a short inline script folds it below 1024 px,
  and with JavaScript off it simply stays open.
- **Scroll-snap rail** for "Trending builders"; overflow stays inside the rail.
- The same inline script promotes `loading="lazy"` photos to eager once the page is idle so long
  pages never show empty frames.

## Responsive behaviour

- **360:** utility bar, logo, search icon, bell, avatar and menu; hero photo 4:5 with the
  slogan; tiles stack; directory cards 2-up (like a phone shop grid); filters behind "Show filters".
- **768:** tiles 2-up; photo overlays switch to 16:9.
- **1280:** centred nav and search pill; filter rail 260 px plus a 3-up grid; the Psalter
  feature sits sticky next to a 2-up project grid.

## Accessibility

- One `h1` per page; sections are labelled; the decorative slogans on photos are `aria-hidden`
  where the same message exists as text.
- Builders is `aria-current="page"`; the Matching nav item announces "2 new matches".
- Role, Open to, Distance, Neighbourhood and Skills are real checkboxes and radios in labelled
  fieldsets ("Within 40 km" `checked`); both searches and the sort have labels.
- Status is a word ("Online now", "Seen 3 h ago"), not just colour. Match is in the volt tag and
  repeated in text.
- Focus ring is black on light and volt on dark.

## What to take from it

- The merchandising grammar (flag, name, details, "price") makes scanning builders fast and
  makes Banaro feel active and confident.
- Volt-as-fill is a strong, accessible accent rule.
- Risk: the retail metaphor can read as "shopping for people"; soften the copy ("Say hello", not
  "Add") if this direction is chosen.

## Coverage

<!-- coverage:start -->
<!-- coverage:end -->
