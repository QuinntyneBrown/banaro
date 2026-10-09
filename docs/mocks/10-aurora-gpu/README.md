# 10 · Aurora

<!--
Cast and catalog: docs/mocks/README.md. Today is Friday 9 October 2026; the directory viewer is
Amara Osei (Leslieville), 3 unread notifications, 2 new matches. Directory shows builders 1–12 in
Best match order; distance filter "40 km" is the default.
-->

**Idea.** The northern lights over Toronto. A living aurora fills the sky above a silhouette of the
skyline (CN Tower and the dome), and the whole site is built on the newest things the web platform
can do — each one used for a reason and each one with a fallback that still looks finished. Night
sky in dark, a pale “polar dawn” in light.

## What varies in this concept

| Axis | Choice |
|---|---|
| Whitespace | Generous: sections at `--space-16`/`--space-24`, hero up to 54 rem tall. |
| Line height | 1.04 display, 1.6 body. |
| Density | Low on home; medium on the directory (three-column card grid at 1280 px). |
| Palette | Night (`night-*`), borealis green, glacier cyan, iris violet, rose. Primary action: iris violet in light, borealis green in dark. |
| Imagery | Generative: the aurora (shader or gradients) and an SVG skyline. Small portraits in animated conic “aurora rings”. No stock photography. |
| Texture | Stars, frosted glass panels (`backdrop-filter`), gradient hairline borders. |
| Motion | Drifting aurora, rotating online rings, scroll-driven rise and progress, popover and tooltip entry. |
| Browser features | The whole list below. |

## Type

- **Unbounded** — wide, round display face for headings, numbers and overlines; reads as “sky”.
- **Instrument Serif italic** — the human counter-voice inside headlines (“*down the street.*”).
- **Google Sans Flex** — calm UI and body text.

## Browser features, support and fallbacks

| Feature | Where | Support (Oct 2026) | Fallback |
|---|---|---|---|
| **WebGPU** fragment shader (`navigator.gpu`, WGSL) | Hero and directory sky | Chromium; Safari 26; Firefox 141+ on Windows | `.aurora__css`: layered radial + conic gradients animated through `@property` (`--aurora-shift`, `--aurora-turn`), plus blurred curtain rays. The canvas only fades in after `getCompilationInfo()` reports no errors. |
| Colours read from CSS | Shader uniforms | — | The script reads `--aurora-sky`, `--aurora-1..4` with `getComputedStyle`, converts them to RGB through a 1×1 2D canvas (works for any CSS colour syntax), and re-reads them when `data-theme` changes. Dark uses additive blending with stars; light mixes the curtains over a pale sky. |
| `@property` | Fallback aurora, avatar rings | All evergreen | Static gradients. |
| Cross-document **View Transitions** (`@view-transition { navigation: auto; }`) | Home ↔ directory | Chromium 126+, Safari 18.2+ | Plain navigation. Shared names: `brand`, `search` (hero search → directory search) and `aurora` (hero sky → directory sky). Needs same-origin http(s); from `file://` it does not run. |
| **Popover API** | Mobile menu, account menu, filter sheet | All evergreen | Declarative (`popovertarget`), no JS. Filters are a bottom-sheet popover under 1024 px and the *same element* forced inline as a sticky rail above it. |
| **CSS anchor positioning** | Account menu, match tooltips | Chromium 125+ | `@supports (anchor-name: --a)` guarded; menus fall back to fixed top-right placement, tooltips to absolute placement above the trigger. Tooltips use `anchor-scope` so every card can reuse `--tip`. |
| **`@starting-style`** | Popover and tooltip entry, hero copy settling in | Chromium 117+, Safari 17.5+, Firefox 129+ | Elements simply appear. |
| **Scroll-driven animations** | Top progress bar (`scroll(root)`), cards rising (`view()`), sky dimming on exit | Chromium 115+, Safari 26 | `@supports (animation-timeline: view())` guarded; the un-animated state is the visible one, and the rise is transform-only so nothing below the fold is ever hidden. |
| **`:has()`** | Filter form: chip selected state, “Clear” appears and the heading switches from “Default view” to “Filtered” only when a non-default option is checked; search field focus ring | All evergreen | — |
| `text-wrap: balance` / `pretty` | Headings / paragraphs | All evergreen | Normal wrapping. |
| **CSS nesting** | All of `ui.css` | All evergreen | — |
| **Speculation Rules** | Home prefetches the directory; the directory prefetches home | Chromium | Ignored elsewhere and from `file://`. |

## Motion spec

| Element | Duration / easing |
|---|---|
| CSS aurora drift | `--duration-aurora` 28 s linear loop; curtains sway at a third of that |
| Shader | continuous `requestAnimationFrame`; slow (time × 0.04–0.18) |
| Online avatar ring | 6 s linear rotation of `--ring-turn` |
| Popovers | `--duration-base` 240 ms, `--ease-enter`, `@starting-style` + `allow-discrete` |
| Filter sheet | `--duration-slow` 420 ms slide up |
| View transition | `--duration-view` 380 ms, `--ease-standard` |
| Hover | `--duration-fast` 140 ms |

Reduced motion: every animation lives in `prefers-reduced-motion: no-preference`; the shader
renders a single still frame; view transitions are disabled.

## Responsive behaviour

- **360 px:** brand, Sign in and a Menu popover (Join moves into the menu below 480 px); hero
  stacks; stats in a 2×2 glass card; filters behind a “Filters · 1” button as a bottom sheet;
  one card per row.
- **768 px:** two card columns; events become three-column rows.
- **1024 px:** filter rail inline (the popover is overridden to `display: block; position: sticky`).
- **1280 px+:** three result columns; four featured builders in a row; sticky events heading.

## Accessibility notes

- Canvas, CSS aurora, stars and skyline are `aria-hidden`; a scrim behind the hero copy keeps text
  contrast over the brightest curtains in both themes.
- Popover triggers are real buttons; Escape and light-dismiss come from the platform.
- Tooltips are `role="tooltip"`, linked by `aria-describedby`, and shown on hover **and** keyboard
  focus. (A production version should also dismiss on Escape.)
- Online state is a ring **and** “Online now”; counts in badges carry `aria-label`s.

## What to take from it

Feature-detected enhancement as a design language: one sky shared by every page, a search box that
travels between them, and menus and filters that are pure HTML popovers.

## Open questions

- Supported browser matrix: WebGPU and cross-document view transitions are not universal; the
  fallbacks must stay first-class.
- Battery: pause the shader when the hero is off-screen or the tab is hidden.

<!-- coverage:start -->
<!-- coverage:end -->
