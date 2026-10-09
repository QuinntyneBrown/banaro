# 19 · Web 95

<!--
Cast and catalog: see docs/mocks/README.md (Amara Osei as viewer; builders 1–23; projects;
events; filter counts). "Today" is Friday 9 October 2026. Distances are from Leslieville.
-->

**Axes:** retro nostalgia · tiled textures · pixel art

Banaro as a mid-90s desktop. A teal dotted desktop, grey windows with four-colour bevels, navy
gradient title bars with fake minimise, maximise and close buttons, underlined menu-bar
accelerators, status bars, group boxes, and 16×16 pixel icons drawn as inline SVG. The taskbar
is docked to the top edge (a real Windows 95 option, and it keeps clear of the mock bar): a
Start button that is the brand, the four nav areas as task buttons (the current one pressed in
with the classic dither), and a tray with Sign in / Join Banaro or, signed in, matches,
notifications, Amara and a live clock.

Home is a desktop of windows: "Welcome to Banaro" (the promise in Press Start 2P, the sub-copy,
Join Banaro as the default button, a status bar with the four stats), "Counter.exe" with an LCD
hit counter that ticks up and 88×31 badges, the four areas as a large-icon folder window, a
"Tip of the Day" dialog that carries the verse, an Address Book of featured builders,
"Projects.txt" in Notepad, a Date/Time Properties window for events (October calendar with the
event days selected), the Co-founder Matching Wizard (Start matching >), and a Guestbook with
Hannah's testimonial and a sign form. A news marquee runs "Fall Demo Night — 16 spots left!".
The directory is a maximised Explorer window: toolbar (Back, Up, Say hello, Connect, View
profile), a Find bar, a filter pane of group boxes with counts, and a details-view table with
sortable column headers, a pixel match meter, the selected row in navy and a status bar.

## What varies in this concept

| Axis | Choice |
|---|---|
| Whitespace | Windows sit on the desktop with 20 px gutters; insides are compact like real dialogs. |
| Line height | Body 1.5 for readability; pixel display 1.45; LCD 1.0. |
| Density | Medium-high: many small windows; 12 rows in the details view. |
| Palette | Windows Standard: teal `#008080`, silver `#c0c0c0`, navy `#000080 → #1084d0`, link blue. Dark is "Hi-contrast night". |
| Imagery | Pixel icons (SVG `rect` runs, `crispEdges`); small bevel-framed portraits. |
| Texture | Dotted tiled desktop via two radial gradients; checker dither on pressed tasks. |
| Motion | Marquee (22 s linear loop, pauses on hover), blinking NEW badge, ticking hit counter. |
| Browser features | `appearance: none` checkboxes drawn as sunken boxes, `<details>` for the mobile filter tree, `steps()` easings. |

## Type

- **Atkinson Hyperlegible** for all body and UI text — readable at 14–18 px, with the plain
  sans voice of MS Sans Serif.
- **Press Start 2P** for the promise only; **Silkscreen** bold for window titles and small caps
  labels; **VT323** for the marquee, the LCD counter, the Notepad file and event dates.

## Palette

| Role | Light (Windows Standard) | Dark (Hi-contrast night) |
|---|---|---|
| Desktop | `#008080` with `#007070` dots | `#001a1a` with `#006262` dots |
| Window face | `#c0c0c0` | `#0a0a0a` |
| Bevels | `#ffffff` / `#dfdfdf` / `#808080` / `#0a0a0a` | white / grey / grey / white |
| Title bar | `#000080 → #1084d0`, white text | `#800080 → #b400b4`, white text |
| Selection | navy with white text | cyan `#00e5ff` with black text |
| Links | `#0000ee` | `#ffff00` |

White on teal is 4.8:1 (desktop icon labels); all window text is 5.7:1 or better.

## Motion

- Marquee: `--duration-marquee` 22 s linear, only under `prefers-reduced-motion:
  no-preference`; otherwise the full news line shows statically (ellipsised where it does not fit).
- NEW badge blinks with `steps(1)` over `--duration-blink` 1.2 s; disabled with reduced motion.
- Hit counter: a small inline script adds 1–2 every 2.6 s and updates the `aria-label`; it does
  not run with reduced motion, and the counter reads 0048213 with JS off. The visitor count is
  decorative, not a Banaro statistic.

## Browser features and fallbacks

- Custom checkboxes and radios use `appearance: none` with a drawn tick; they stay native inputs.
- The tray clock is set by script; the static fallback reads the mock's "today" evening.

## Responsive behaviour

- 360: taskbar keeps Start, a scrolling strip of task buttons and the clock; Sign in and Join
  Banaro move into the Welcome window; desktop icons become a horizontal row; windows stack.
- 768: windows still stack; the details table scrolls inside its pane.
- 1280: a 12-column desktop with icons in a column on the left and windows at varied spans; the
  Explorer splits into filter tree and table.

## Accessibility notes

- Every window has a real heading as its title (the Explorer title is the page `h1`); fake
  window controls are buttons with labels; menu bars are decorative (`aria-hidden`).
- The table has a caption, column headers are buttons with `aria-sort` on Match, and the table
  region is focusable so keyboard users can scroll it.
- Focus is the classic dotted rectangle, yellow in the dark theme.

## What to take from it

Nostalgia and warmth for a community that remembers building its first web page. Even outside
this direction, the guestbook and the "Tip of the Day" verse are lovable, low-cost features.

<!-- coverage:start -->

Legend: ✅ mock exists · ➖ not applicable (reason in manifest) · ❌ missing

### Pages

| Screen | default | loading | empty | error | Requirements |
|---|---|---|---|---|---|
| Home (`home`) | [✅](pages/home/default.html) | ➖ | ➖ | ➖ |  |
| Builder directory (`directory`) | [✅](pages/directory/default.html) | ➖ | ➖ | ➖ |  |

<!-- coverage:end -->
