# 31 · Gradient Mesh

Banaro with the polish of a top product company's marketing site: a living mesh of blurred colour
behind a slanted hero, crisp white product vignettes built in real HTML, precise copy, slanted
section edges, a navy "Matching" band with an API-style snippet, and a directory that feels like a
well-made SaaS app.

## The idea

- **Hero.** A skewed band (−8°) filled with five blurred radial gradients (coral, amber, violet,
  cyan, pink over a lavender base) that drift slowly. Over it: a pill note ("Every Monday · Three
  co-founder suggestions, nearby"), the promise in tight Sora, sub-copy, a navy **Join Banaro**
  pill and a **Browse builders** text button, both with the hover arrow (a chevron that grows a
  stem). To the right, three product vignettes in a 3D-tilted stage: a builder card (Daniel Reyes,
  94% match bar), a match notification (Noah Fischer and Amara Osei matched, 12 min ago) and an
  event ticket (Fall Demo Night, 16 spots left) with punched notches.
- **Stats strip** with accent tick marks, **four areas** as a feature row with gradient icon
  tiles, a **directory split** with a browser-frame vignette of the real directory, a **slanted
  navy band** for matching with a JSON snippet of a Monday suggestion, **project cards** with a
  gradient top edge, **events as tickets**, a quote with the verse, a mesh **CTA band** with a
  slanted top, and a four-column footer.
- **Directory** is a SaaS app: sticky sidebar filters (distance slider with live value, open to,
  role, neighbourhood with counts, skill chips), a search field with a `/` keyboard hint, sort
  select, grid/list toggle, removable filter chips, and builder cards with a gradient online ring
  around the avatar, a conic **match ring**, location, skill tags, a Building / Open to well, live
  presence and **Profile** / **Connect** actions. Pagination with page count.

## What varies

| Axis | Choice |
|---|---|
| Whitespace | Generous, product-site rhythm (80 px sections), tight cards |
| Line height | 1.04 display, 1.6 body |
| Density | Low on Home; medium on Directory (12 cards, two columns beside the sidebar) |
| Palette | Navy ink `#0a2540`, slate body, indigo accent `#544ce8`, a five-colour mesh |
| Imagery | Portraits inside product vignettes; no photography sections |
| Texture | Blur only: the mesh, frosted top bar, long soft shadows |
| Motion | Drifting mesh blobs, floating match card, hover arrows, card lift |
| Browser features | `clip-path` slants, CSS `mask` ticket notches, `conic-gradient` rings, `color-mix()`, `backdrop-filter`, 3D transforms |

## Type

**Sora** 600/700 for display and headings (−0.035em tracking), **Inter** for UI and body with
`ss01`/`cv11` alternates, **JetBrains Mono** for the code snippet and keyboard hints.

## Palette and theming

Light uses white and `#f6f9fc` surfaces with navy text. Dark moves to `#050f1f`/`#0d1d36`, swaps
the mesh for deeper versions of the same hues (`--mesh-*` tokens are redefined per theme) and turns
text on the mesh white; the dark pill buttons invert to white. All text and UI pairs pass WCAG AA
in both themes (`check_contrast.py`: 82 pairs, 0 failures), including text on every mesh colour.

## Motion

| Element | Duration | Easing | Notes |
|---|---|---|---|
| Mesh blobs | `--duration-mesh` 22 s (×0.9–1.4 per blob) | `--ease-mesh`, alternate | translate, scale, rotate |
| Match vignette float | 22 s | `--ease-mesh` | desktop only |
| Hover arrow | `--duration-fast` 150 ms | standard | stem fades in, tip moves 3 px |
| Cards | `--duration-base` 240 ms | standard | lift 2–3 px with a deeper shadow |

Every keyframe animation sits in `@media (prefers-reduced-motion: no-preference)`; with reduced
motion the mesh is a still gradient and transitions collapse to 0.01 ms.

## Browser features and fallbacks

- `clip-path` and `skewY` slants degrade to straight edges where unsupported.
- The ticket notches use `mask`; without it the ticket is a plain rounded card.
- `backdrop-filter` on the top bar falls back to the translucent fill.
- The CSS mesh needs no canvas or WebGL; a canvas version could replace it later.
- Directory filters render open in HTML; a five-line script folds them on narrow screens.

## Responsive behaviour

- 360 px: menu button, vignettes stack under the copy without tilt, stats in a 2×2 grid, features
  and projects single column, directory filters folded behind a "Filters · 1 active" button.
- 768 px: two-column features, projects, tickets and builder cards.
- 1024 px+: tilted vignette stage, full nav, sticky sidebar.

## Accessibility

- Vignettes are labelled previews; their buttons are not interactive (`aria-hidden` spans).
- Match rings have `role="img"` with "94% match"; the bell says "Notifications, 3 unread"; view
  toggle buttons use `aria-pressed`; the snippet tabs use `role="tab"` with `aria-selected`.
- Presence is a dot plus words ("Online now", "Active 1 h ago").

## What to take from it

- The hover arrow, match ring and ticket are small, reusable signatures.
- Product vignettes on the marketing page double as honest previews of the real components.
- The SaaS directory card (identity, match, where, skills, well, presence, actions) is a clean
  information order for any concept.

## Open questions

- Is the API snippet too "developer" for designers and PMs, or does it signal craft?
- Does a three-dimensional hero hold up on low-end Android devices? Test the blur cost.

<!-- coverage:start -->

Legend: ✅ mock exists · ➖ not applicable (reason in manifest) · ❌ missing

### Pages

| Screen | default | loading | empty | error | Requirements |
|---|---|---|---|---|---|
| Home (`home`) | [✅](pages/home/default.html) | ➖ | ➖ | ➖ |  |
| Builder directory (`directory`) | [✅](pages/directory/default.html) | ➖ | ➖ | ➖ |  |

<!-- coverage:end -->
