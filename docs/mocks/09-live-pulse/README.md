# 09 · Live Pulse

<!--
Cast and catalog: docs/mocks/README.md (shared by all forty concepts). Today is Friday 9 October 2026;
the viewer on the directory is Amara Osei, Leslieville. Live items: 38 builders online now, Grace Liu
RSVP'd to Fall Demo Night (2 min ago), Daniel Reyes posted an update to Psalter (5 min ago), Noah
Fischer and Amara Osei matched (12 min ago), Ruth Alvarez asked for feedback on Sabbath (18 min ago),
Fall Demo Night: 16 spots left.
-->

**Idea.** Banaro is a community that is happening right now. The pages read like a live operations
console for the GTA's Christian builders: who is online, what just happened, how many seats are left
at Fall Demo Night and how long until it starts. The signature surface is the **live console**, a
panel that stays dark in both themes and streams activity, a countdown and RSVP seats. Everything
else is a calm dashboard around it.

## What varies in this concept

| Axis | Choice |
|---|---|
| Whitespace | Dashboard-tight inside panels (`--space-3`/`--space-4`), generous between sections (`--space-12`–`--space-16`). |
| Line height | 1.55 body, 1.08 display; mono numerals set at 1. |
| Density | Medium-high. The directory is three columns at 1280 px: filter rail, 12 dense result rows, live rail. |
| Palette | Ink navy canvases; **signal mint** for presence and the primary action, **coral** for live state, **cyan** for data, **amber** for the countdown. |
| Imagery | Small portraits only (32–48 px) with presence dots; initials avatars in four tones for builders without photos. No large photography. |
| Texture | A faint dot grid on the canvas (CSS radial gradient) and soft glows behind the hero and the console. |
| Motion | Breathing presence rings, feed items that spring in, ticking counters, typing dots, a light sweep across the RSVP meter. |
| Browser features | `:has()` for chip state and the tab-bar padding, container queries for the result row, `aria-live` regions, `role="timer"` and `role="meter"`. |

## Type

- **Sora** (display: hero, section titles, names) — geometric and confident, reads like a product UI.
- **Manrope** (UI and body) — compact and legible at 12–14 px in dense panels.
- **JetBrains Mono** (every number and timestamp) — tabular figures, so counters tick without jitter.

## Palette (tokens)

| Role | Light | Dark |
|---|---|---|
| Canvas / surface | `ink-50` / white | `ink-950` / `ink-900` |
| Primary action, presence | `mint-700` (white text, 5.4:1) | `mint-400` (ink text, 9.3:1) |
| Live state | `coral-700` on `coral-50` (5.9:1) | `coral-400` on `coral-950` (6.0:1) |
| Data and links | `cyan-700` | `cyan-300` |
| Countdown | `amber-700` on `amber-50` | `amber-300` |
| Console (both themes) | `ink-900` with `--color-console-*` tokens | `ink-850` |

All body text pairs meet 4.5:1 and UI edges 3:1 in both themes (checked with the WCAG formula while
building the tokens).

## Motion spec

| Element | Duration / easing | Notes |
|---|---|---|
| Presence and live dots | `--duration-pulse` 2 s, `--ease-standard`, infinite | Box-shadow ring; paused with “Pause updates”. |
| New feed item | `--duration-deliberate` 480 ms, `--ease-spring` + 2.4 s highlight fade | Slides in from above. |
| Counter change | `--duration-slow` 320 ms, `--ease-spring` | Number drops into place. |
| Typing dots | `--duration-typing` 1.2 s, staggered 150 ms | |
| Meter sweep | 2.8 s loop | Decorative light sweep on the RSVP bar. |
| Hover lifts | `--duration-fast` 120 ms / `--duration-base` 200 ms | Area tiles, result rows. |

Every animation sits inside `@media (prefers-reduced-motion: no-preference)`. With reduced motion the
script also **starts paused** (the pill reads “Paused”, the feed and counters stop cycling); the
countdown still advances once a second because it is information, not decoration.

## Live behaviour (inline script)

One small progressive script at the end of each page simulates the real-time layer:

- cycles the README's live activity items into the feed every 4.5 s (`aria-live="polite"`,
  `aria-relevant="additions"`, five items kept);
- random-walks the online count between 36 and 41 every 6 s;
- counts down to Fall Demo Night from a fixed “now” (Fri 9 Oct, 7:48 pm → 5 d 23 h 12 m);
- takes a seat every 11 s (16 → 13 spots left, then resets) and updates the meter's `aria-valuenow`;
- “Pause updates” (`aria-pressed`) stops everything that moves or updates (WCAG 2.2.2);
- on the directory, “Show” dismisses the new-arrivals banner and moves focus to the results.

With JavaScript off the pages show the same content in the README's starting state.

## Responsive behaviour

- **360 px:** primary nav moves to a bottom tab bar (44 px targets); the connection pill shrinks to its
  dot (the word stays for screen readers); the console stacks under the hero copy; directory filters
  become a horizontal scroller of chip groups; result rows stack with the match % top-right.
- **768 px:** top nav returns; the result row becomes a four-column dashboard row (container query on
  the results list, `34rem`).
- **1024 px:** filter rail on the left; the live rail drops under the results as three panels.
- **1280 px+:** three columns — sticky filter rail, results, sticky live rail.

## Accessibility notes

- Connection pill is `role="status"`; the feed is a polite live region; the countdown is
  `role="timer"` with a label; seats are `role="meter"` with min, max and now.
- Status never relies on colour: online is a filled dot **and** “Online now”; away is a ring **and**
  “Seen 1 h ago”.
- Filter chips are real checkboxes styled with `:has(input:checked)`; focus is drawn on the chip.
- Badge counts carry the meaning in the button label (“Notifications, 3 unread”, “Matches, 2 new”).

## What to take from it

The live console as a product signature; presence on every person; mono numerals for anything that
changes; a pause control and reduced-motion default for every auto-updating region.

## Open questions

- Real presence needs a websocket channel and a privacy setting (“show me as online”).
- How noisy should the feed be? Production should batch events and never announce more than one
  item per few seconds to screen readers.

<!-- coverage:start -->
<!-- coverage:end -->
