# 32 · Chat Native

Banaro as a conversation. Instead of a landing page and a search grid, the person talks to the
**Banaro guide** — a friendly coral "B" avatar — and the product answers in message bubbles, rich
cards and quick replies. Everything a page would show still arrives, just in the order a
conversation would bring it up.

## The idea

- **Home** is a chat thread dated "Today · Friday 9 October". The guide introduces itself, the
  promise arrives as a large hero bubble (the page's `h1`), then the sub-copy, and quick-reply
  chips offer **Join Banaro**, **Browse builders** and "What can I do here?". The visitor's
  questions appear as deep-teal bubbles with read ticks; the guide answers with:
  - a rich card listing **the four areas** with icons,
  - a **builder carousel** inside the message (six portraits, scroll-snap, online dots) and a
    "Browse all 1,284 builders" button,
  - an **event link preview** with a photo for Fall Demo Night (16 spots left, Save me a spot)
    and the three other events as compact rows,
  - a **project preview** for Psalter plus the projects asking for help as small tags,
  - the **matching** card with Start matching, a **forwarded** testimonial from Hannah and the
    verse as a message.
  - A **live typing indicator** (three bouncing dots) appears, then the guide's last message lands
    with a small arrive animation. A labelled **composer** ("Message the Banaro guide") closes the
    thread. On desktop a side panel offers "Jump to" links with the numbers and a join card.
- **Directory**: Amara (with her photo) asks "Find me a technical co-founder near Leslieville".
  The guide replies with what it searched (1,284 builders, within 40 km, ranked for Harvest) and a
  **sort select inside the bubble**, then the **top three** result cards, then "And nine more worth a
  coffee" as a two-column grid of result messages (12 in Best match order). Refinements are
  **quick-reply chips** (Only co-founding 173, Engineers only 486, Within 10 km, Online now 38,
  Knows Laravel 96, Sort by nearest), **Show 12 more** is the pagination, and the guide types a tip
  about Esther Nguyen 1.4 km away. The composer is the **search** field. On desktop a side panel
  holds the **active filters** (match goal, distance slider, open to, role, neighbourhood and skill
  pills); on phones it folds into an "Active filters · 2" sheet at the top of the thread.

## What varies

| Axis | Choice |
|---|---|
| Whitespace | Tight inside bubbles, generous between turns of the conversation |
| Line height | 1.12 for the hero bubble, 1.5 body |
| Density | Medium; information grouped per message |
| Palette | Warm sand wallpaper with a dot pattern, white guide bubbles, deep-teal bubbles for the person, a coral guide avatar |
| Imagery | Portraits in carousels and result cards, one event photo as a link preview |
| Texture | Dotted chat wallpaper (CSS radial gradients) |
| Motion | Typing dots, message arrival, chip lift; all motion-safe |
| Browser features | Scroll-snap carousel, `color-mix()` frosted thread header, native `<details>` for menu and filter sheet |

## Type

**Nunito** throughout — rounded terminals read as friendly and conversational at every weight;
900 for the hero bubble and names, 600–800 for UI, 400 for message text.

## Palette and theming

Light: sand `#f3efe6` wallpaper, white bubbles, teal `#075e4c` for the person's bubbles and
`#0b7a63` for actions, coral `#e5603c` for the guide. Dark: near-black green `#0b1210`
wallpaper, `#1c2a27` guide bubbles, bright teal `#3fbf9f` bubbles with dark text, a softer coral
avatar. All text pairs pass WCAG AA in both themes (`check_contrast.py`: 72 pairs, 0 failures),
including timestamps inside the person's bubbles.

## Motion

| Element | Duration | Easing | Notes |
|---|---|---|---|
| Typing dots | `--duration-typing` 1.2 s loop, staggered by a sixth | standard | bounce and fade |
| Typing hold | `--duration-typing-hold` 2.4 s | — | read by the script from the token |
| Message arrival | `--duration-slow` 360 ms | `--ease-enter` | rises 12 px and fades in |
| Quick-reply hover | `--duration-fast` 120 ms | `--ease-spring` | lifts 1 px |

The script runs only when `prefers-reduced-motion` is not `reduce`. Without JavaScript or with
reduced motion, the last message is simply present and no indicator shows; the dots never animate
outside `prefers-reduced-motion: no-preference`.

## Browser features and fallbacks

- The builder carousel is a CSS grid with `scroll-snap`; without snap it is a plain horizontal
  scroller inside its card (no page overflow).
- The typing indicator uses `role="status"` so the arrival is announced; the thread is a
  `role="log"`.
- The filter sheet and mobile menu are `<details>` elements.

## Responsive behaviour

- 360 px: one column thread, quick replies wrap (refinements scroll sideways in their own row),
  result cards stack, filters in the "Active filters" sheet, menu button.
- 768 px: results in two columns inside the guide's message, thread header floats as a card.
- 1024 px+: side panel beside the thread (Jump to on Home, Active filters on Directory), full nav.

## Accessibility

- The `h1` lives in the first hero bubble (Home) and the thread header (Directory); rich cards
  carry `h2` titles and visually hidden `h2`s separate result groups and refinements.
- Composer and search fields are labelled; the send buttons have names; quick-reply refinements
  are `aria-pressed` toggles; match badges carry "94% match".
- Online status is a dot and words; timestamps are text.

## What to take from it

- The guide voice ("And nine more worth a coffee") makes a directory feel personal; the same copy
  could live in empty states and onboarding of any concept.
- Quick-reply refinements are a good mobile pattern for the most common filters, with the full
  panel one tap away.
- Showing the search interpretation ("within 40 km of Leslieville, ranked for Harvest") builds
  trust in the ranking.

## Open questions

- Is the guide a real assistant (free text) or a scripted chooser? The mock implies understanding
  of free text in the composer; that needs a product decision and an honest fallback.
- Long conversations need a "start over" and history; not shown in this round.

<!-- coverage:start -->

Legend: ✅ mock exists · ➖ not applicable (reason in manifest) · ❌ missing

### Pages

| Screen | default | loading | empty | error | Requirements |
|---|---|---|---|---|---|
| Home (`home`) | [✅](pages/home/default.html) | ➖ | ➖ | ➖ |  |
| Builder directory (`directory`) | [✅](pages/directory/default.html) | ➖ | ➖ | ➖ |  |

<!-- coverage:end -->
