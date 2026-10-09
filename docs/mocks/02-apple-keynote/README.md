# 02 · Keynote

<!--
Cast and catalog: see docs/mocks/README.md (Amara Osei as viewer; builders 1–23; projects;
events; filter counts). "Today" is Friday 9 October 2026. Distances are from Leslieville.
-->

**Axes:** Apple-inspired · large photos · scroll animations

Banaro presented the way a product launch is: one idea per screen, a giant centred headline,
a sentence of sub-copy, a blue pill and a "Learn more ›" link, then a big photograph. Sections
alternate white, silver (`#f5f5f7`) and black, so scrolling feels like moving through a keynote.
A thin frosted global nav scrolls away; a frosted sub-nav with the page title and a "Join
Banaro" pill stays pinned. Content rises gently into place as it scrolls in. The directory is a
store "shop and compare" grid: category pills, quiet refine menus, and centred cards whose spec
rows line up from card to card, so builders compare like models.

This is an original stylesheet in the spirit of apple.com; it uses no Apple marks, fonts or
assets. The brand mark is two overlapping circles ("Two are better than one").

## What varies in this concept

| Axis | Choice |
|---|---|
| Whitespace | Very generous vertical rhythm (`--space-20` mobile, `--space-32` desktop per section); content width 980 px, tiles and galleries up to 1280 px. |
| Line height | Display 1.05, headings 1.17, body 1.47 at 17 px. Display tracking -0.035em. |
| Density | Low on Home (one statement per section); medium in the directory (3-up compare cards). |
| Palette | Near-black ink, white, silver, black showcase sections; one action blue; orange eyebrows; a blue-violet-pink gradient only on statistics. |
| Imagery | Large photography: full-width hero, photo tiles, portrait gallery, event "session" cards; round portraits in the directory. |
| Texture | None; depth comes from frosted glass and soft shadows. |
| Motion | Scroll-driven reveals and a hero image that settles as you scroll; smooth decelerating easing. |
| Browser features | `animation-timeline: view()` (guarded), `backdrop-filter`, `position: sticky`, scroll-snap galleries, `background-clip: text`. |

## Type

- **Inter** (variable) stands in for a display/text grotesque: 600 for headlines with tight
  negative tracking, 400 for text. Body is 17 px, the house size. Two-tone headlines ("Meet the
  builders. *A streetcar ride away.*") use the muted grey for the second sentence.
- Fluid scale: hero 44–96 px, section headlines 36–56 px, tile headlines 28–40 px,
  statistics 56–120 px.

## Palette

| Role | Light | Dark |
|---|---|---|
| Canvas | `#ffffff` | `#000000` |
| Alternate section | silver `#f5f5f7` | graphite `#161617` |
| Showcase sections and tiles | black / `#1d1d1f` | same |
| Text / muted | `#1d1d1f` / `#6e6e73` | `#f5f5f7` / `#a1a1a6` |
| Action blue (buttons) | `#0071e3`, white text 4.7:1 | same |
| Link blue | `#0066cc` | `#2997ff` |
| Eyebrow | orange `#b64400` | `#ff9f45` |

All text pairs meet WCAG AA, including muted text on silver and links on silver.

## Motion

| What | Duration / range | Easing |
|---|---|---|
| Sections, tiles, project cards rise and fade in | scroll range `entry 5%` → `entry 70%` | linear on the scroll timeline |
| Hero photograph scales 1.12 → 1 | scroll range `cover 0%` → `cover 55%` | linear |
| Tiles and cards lift on hover | `--duration-base` 320 ms | `--ease-standard` `cubic-bezier(.28,.11,.32,1)` |
| "›" in links nudges right | 160 ms | `--ease-standard` |
| Menu bars morph into a cross | 320 ms | `--ease-standard` |

Scroll-driven rules live inside `@media (prefers-reduced-motion: no-preference)` and
`@supports (animation-timeline: view())`, with no backwards fill: anything not yet scrolled to
renders in its final, fully visible state, and browsers without scroll timelines show a static
page. Reduced motion sets every duration token to 0.01 ms.

## Browser features and fallbacks

- **Scroll-driven animations** (Chromium 115+, Safari 26): progressive enhancement only.
- **`backdrop-filter`** on both navs; where unsupported the bars fall back to their 72–80% opaque
  token colours, which stay readable.
- **Scroll-snap galleries** for builders and events: horizontal overflow is contained in the
  gallery; it remains a swipeable, keyboard-scrollable list everywhere.
- **`<details>`** for the mobile menu and the four refine menus (Open to, Neighbourhood, Skills,
  Distance), so they work without script.
- A small inline script promotes `loading="lazy"` photos to eager after the page is idle so long
  scrolls never show empty frames; without JavaScript, native lazy loading applies.

## Responsive behaviour

- **360:** global nav shows mark, search (and bell and avatar when signed in) and a menu
  disclosure; sub-nav keeps title and pill; everything single column; galleries swipe; spec rows
  pack into two columns.
- **768:** global nav links appear; tiles go 2-up; directory cards 2-up.
- **1280:** directory cards 3-up; project showcase 3-up under the featured Psalter card; galleries
  align with the 980 px content edge and bleed to the right.

## Accessibility

- One `h1` per page; every section is labelled by its `h2`.
- Builders is `aria-current="page"` in the primary nav; sub-nav current items use
  `aria-current="true"`.
- Role pills are real radios (All roles is `checked`); refine menus contain labelled checkboxes and
  radios ("Within 40 km" `checked`); search and sort are labelled.
- Online is a green dot on the portrait **and** "Online now" in the Last seen row.
- The statistic gradient text falls back to `CanvasText` under forced colours.

## What to take from it

- The two-tone headline and one-idea-per-section rhythm make Banaro feel premium and calm.
- Compare-style cards make choosing a co-founder feel like choosing between well-documented
  options: the eye moves across a row and compares Neighbourhood, Skills, Open to.
- Risk: the long page and tall cards trade density for drama; the directory may need a list view
  for power users.

## Coverage

<!-- coverage:start -->

Legend: ✅ mock exists · ➖ not applicable (reason in manifest) · ❌ missing

### Pages

| Screen | default | loading | empty | error | Requirements |
|---|---|---|---|---|---|
| Home (`home`) | [✅](pages/home/default.html) | ➖ | ➖ | ➖ |  |
| Builder directory (`directory`) | [✅](pages/directory/default.html) | ➖ | ➖ | ➖ |  |

<!-- coverage:end -->
