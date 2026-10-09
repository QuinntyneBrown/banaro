# 08 · Quiet

<!--
Cast and catalog: docs/mocks/README.md. Today is Friday 9 October 2026; the directory viewer is
Amara Osei (Leslieville). Minimal concept: the home page shows four builders and the four events;
the directory shows the first 12 builders in best-match order.
-->

## The idea

Banaro with the volume turned down. One narrow column (33rem) of small type (15px) on a tall line
(1.9), warm paper, one ink, and a single small terracotta dot. No photos, no illustrations, no
cards, no icons. Sections are separated by silence rather than rules. The dot is the only colour
and it always means the same thing: *here* (the brand's full stop, the page you are on, someone
who is online now). Everything a reader needs, nothing more.

## What varies

| Axis | Choice |
|---|---|
| Whitespace | Extreme: 7rem between parts, 5rem above the page, a 33rem column at every width |
| Line height | 1.9 for body, 1.25 for the one serif headline |
| Density | Minimal: home shows the hero, four areas, four builders, four events, matching, the verse and the testimonial |
| Palette | Paper `#f4f0e8` and ink `#2a2723`; one terracotta dot. Dark is lamplight: `#191714` with `#dcd5c8` ink |
| Imagery | None |
| Texture | None |
| Motion | One gentle settle-in as the page loads (opacity and a 6px rise, staggered 80ms) |
| Browser features | Popover API for the mobile menu, `<details>` for Refine, `text-wrap: balance/pretty` |

## Type

- **Instrument Serif** for the single headline on each page (h1) and the verse, at 34–40px.
  It is the only "display" moment.
- **IBM Plex Sans** for everything else at 15px (`--font-size-md: 0.9375rem`), weight 400 with 500
  for names. Headings inside the column are the same size as body, set apart by weight only.
- Section titles are lowercase, 12px, muted, lightly tracked.

## Palette

| Role | Light | Dark |
|---|---|---|
| Canvas | `#f4f0e8` | `#191714` |
| Ink | `#2a2723` (13.1:1) | `#dcd5c8` (12.3:1) |
| Muted | `#6b655c` (5.1:1) | `#9c958a` (6.0:1) |
| Dot | `#b4532a` (4.4:1, a non-text mark) | `#d9774b` (5.7:1) |
| Hairlines | `#e2dbcd` (decorative) | `#34302a` |

## Motion

| What | Duration | Easing |
|---|---|---|
| Page settles in (each part fades up 6px, 80ms stagger, last start at 320ms) | `--duration-slow` 700ms | `--ease-enter` |
| Underlines darken on hover | `--duration-fast` 200ms | `--ease-standard` |
| Join Banaro / Show more fill with ink on hover | `--duration-base` 400ms | `--ease-standard` |
| Refine's "+" turns into "×" | `--duration-base` | `--ease-standard` |

The settle animation lives inside `prefers-reduced-motion: no-preference`; reduced motion shows
everything immediately. Nothing is hidden without animation.

## Browser features and fallbacks

- **Popover API** (Chrome 114+, Safari 17+, Firefox 125+) for the "Menu" sheet under 768px; above
  that the nav is an inline row of links.
- **`<details>`** folds the directory's filters behind "Refine" at every width, so the list stays
  calm; it works everywhere without script.

## Responsive behaviour

- **360px:** the same column with 24px margins; "Menu" opens a right-hand sheet; the matching
  score sits beside the name; actions wrap under the status.
- **768px and up:** the nav appears inline; the column never widens past 33rem. Large screens get
  more paper, not more content.

## Accessibility

- One `h1`; section titles are real `h2` elements even though they are small.
- Online is the dot *and* the words "Online now". The dot is never the only signal.
- All links are underlined; the focus ring is a 1px ink outline offset 4px, quiet but visible.
- Filters are native checkboxes, a range with `aria-valuetext`, and skills with `aria-pressed`.
- 15px body is below the usual 16px; the 1.9 line height, 33rem measure and high contrast keep it
  comfortable, but this is the concept's main accessibility risk (see open questions).

## What to take from it

Restraint as a feature: a directory entry reads like a sentence ("Laravel, Angular, PostgreSQL.
Building Psalter. Open to co-founding.") and still carries every fact. The single-meaning accent
dot is a reusable rule for any direction. Open question: whether 15px body text is acceptable for
the audience, or whether the concept should keep its spacing at 16–17px.

## Coverage

<!-- coverage:start -->

Legend: ✅ mock exists · ➖ not applicable (reason in manifest) · ❌ missing

### Pages

| Screen | default | loading | empty | error | Requirements |
|---|---|---|---|---|---|
| Home (`home`) | [✅](pages/home/default.html) | ➖ | ➖ | ➖ |  |
| Builder directory (`directory`) | [✅](pages/directory/default.html) | ➖ | ➖ | ➖ |  |

<!-- coverage:end -->
