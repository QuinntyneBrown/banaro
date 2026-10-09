# 33 · Swipe Match

Co-founder matching as a phone app. The signature object is a **stack of photo cards** you swipe
right to connect and left to pass. A small inline script adds pointer drag with tilt, spring-back,
fly-out and "CONNECT" / "PASS" stamps. Arrow keys and the visible Pass, Hello and Connect buttons
are the accessible way to do the same thing. Everything around the stack (four areas, featured
builders, projects, events) uses the same bold, rounded app language, with one sunset gradient.

- **Home:** the hero puts the live stack inside a phone frame on desktop, posed mid-swipe with the
  CONNECT stamp showing. On phones the frame drops away and the stack is the real, swipeable thing.
  Below it: the four areas (a snap-scrolling rail on phones), "Builders worth a swipe" photo cards,
  project cards, events led by Fall Demo Night with a seats meter, and an "It could be a match"
  gradient panel with Amara and Daniel's portraits for the matching call to action.
- **Directory:** the default view is **Stack**. The top three matches (Daniel, Grace, Noah) form the
  swipeable stack, and the other nine results on the page form an "Up next" grid beside it on
  desktop and below it on phones. **Grid** shows all 12 results as cards. Role filters are chips,
  and the rest (open to, neighbourhood, skills, distance) sit in a filter sheet. On desktop the
  sheet is a sidebar and the stack is sticky. On phones the primary nav becomes a bottom tab bar.

## What varies

| Axis | Choice |
|---|---|
| Whitespace | Generous outside cards; dense, information-rich card faces |
| Line height | Display 1.02 (tight, chunky); body 1.55 |
| Density | Medium; 12 results per page, 3 in the stack |
| Palette | Ink-violet neutrals plus one gradient: ember `#dc2743` → fuchsia `#d4145f` → violet `#6d28d9`. Decision colours: Connect mint, Pass rose, Hello gold |
| Imagery | Portraits are the whole interface: full-bleed card photos with a bottom scrim, generated initials art for builders without photos |
| Texture | None; soft violet-tinted shadows, a glass app bar and tab bar |
| Motion | Drag tilt, spring-back, fly-out, stamp fade/scale, floating chips, a heartbeat on the match spark, a typing indicator |
| Browser features | Pointer Events with pointer capture, `inert`, `:has()`, scroll-snap, `backdrop-filter`, `background-clip: text` |

## Type

- **Outfit** (800/900) for display, headings, buttons and stamps: geometric and app-like.
- **Rubik** for body and UI text: its rounded corners match the 2rem card radius.

## Palette and themes

Light is a lavender-white canvas (`--palette-ink-50`) with white cards. Dark is a near-black
violet (`--palette-ink-950`) with ink surfaces. The gradient is the same in both themes and always
carries white bold text (every stop ≥ 4.5:1 against white). Connect, Pass and Hello change to light
tints in dark mode so they keep at least 3:1 as UI colours. Text over photos sits on
`--color-photo-scrim`.

## Motion spec

| Interaction | Duration | Easing |
|---|---|---|
| Card follows the pointer | 0 (direct manipulation) | — |
| Spring back under the 110 px threshold | `--duration-slow` 360 ms | `--ease-spring` |
| Fly-out past the threshold | `--duration-deliberate` 480 ms | `--ease-fling` |
| Stamp opacity and scale | proportional to drag distance; 140 ms when released | `--ease-spring` |
| Next card moves up the stack | 360 ms | `--ease-spring` |
| Button press | 140 ms scale 0.92 to 1.08 | `--ease-spring` |
| Floating chips, match spark, typing dots | 1.2 to 5 s loops | `--ease-standard` |

Rotation is `dx / card width × 18°`. All transitions and keyframes are inside
`prefers-reduced-motion: no-preference`. With reduced motion, a decision swaps the card at once
and nothing loops.

## Browser features and fallbacks

- **Pointer Events and pointer capture** drive the drag (Chromium, Firefox and Safari all support
  them). `touch-action: pan-y` keeps vertical page scrolling on phones.
- **No JavaScript:** the stack shows the top card with the two behind it, and every builder is
  still in the "Up next" grid. Buttons do nothing but the page is complete. The filter sheet is
  open by default; the script closes it on phones.
- `inert` takes the covered cards out of the tab order. `:has()` draws the focus ring on photo
  cards whose link has focus.

## Responsive behaviour

- **360:** the app bar holds the brand, Join Banaro and a menu. The stack is full width, the areas
  are a snap rail, people are a 2-column grid, and directory results are compact rows. The
  signed-in nav is a fixed bottom tab bar.
- **768:** three-column people grid, two-column projects, and result cards become tiles.
- **1280:** the hero splits into copy and the phone frame. The directory is a three-zone app:
  filter sidebar, sticky stack, then the "Up next" grid.

## Accessibility

- The stack is a focusable region (`aria-roledescription="card stack"`) with hint text linked by
  `aria-describedby`. ← passes and → connects. Every decision is announced in a polite live region
  ("Connect request sent to Daniel Reyes. Next: Grace Liu.").
- Pass, Hello and Connect are real buttons with `aria-label`s and visible captions, sized 60 px.
  Stamps are `aria-hidden` because the live region already says what happened.
- Role chips use `aria-pressed`, and the Stack / Grid segmented control uses `aria-pressed` with
  `aria-controls`. The current tab uses `aria-current="page"`. Badge counts carry their meaning
  ("Notifications, 3 unread").

## What to take from it

The stack makes a single decision feel light and fun, which suits weekly match suggestions and
"Up next" queues. Keep the explicit buttons and arrow keys, because swiping alone is not
accessible. The grid toggle shows that browsing and deciding can be two views of the same results.

<!-- coverage:start -->

Legend: ✅ mock exists · ➖ not applicable (reason in manifest) · ❌ missing

### Pages

| Screen | default | loading | empty | error | Requirements |
|---|---|---|---|---|---|
| Home (`home`) | [✅](pages/home/default.html) | ➖ | ➖ | ➖ |  |
| Builder directory (`directory`) | [✅](pages/directory/default.html) | ➖ | ➖ | ➖ |  |

<!-- coverage:end -->
