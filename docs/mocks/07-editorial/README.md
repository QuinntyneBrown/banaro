# 07 · The Builder Quarterly

<!--
Cast and catalog: docs/mocks/README.md. Today is Friday 9 October 2026; the directory viewer is
Amara Osei (Leslieville). The feature story uses only cast facts: Amara and Harvest, Esther Nguyen
(Riverdale, 1.4 km), Naomi Fraser (the Danforth, 2.1 km), Daniel Reyes (94% match, Psalter), the
Builders' Prayer Breakfast and Fall Demo Night, and Hannah Kowalski's testimonial as the pull quote.
-->

## The idea

Banaro as a print magazine about its own community. The home page is an issue: a nameplate, a
cover photograph of the waterfront with the promise set as the cover headline and three cover
lines, an "In this issue" contents of the four areas, a long-form feature ("The builders of
Leslieville") with a drop cap, three columns, a column-spanning pull quote and captioned photos,
then profiles, briefs (projects), the calendar (events), an epigraph (the verse) and a full-width
"advertisement" for co-founder matching. The directory is **The Index**: builders listed like a
back-of-book index, with small round portraits, dotted leaders running to the match score, the
refinements in the left margin and an alphabetical "A–Z of this page" in the right margin.

## What varies

| Axis | Choice |
|---|---|
| Whitespace | Print margins: generous outer space, tight internal leading in display, hairline column rules |
| Line height | Reading text 1.6; display 0.98–1.05 |
| Density | High text density: three-column feature, 23 index entries, contents, briefs |
| Palette | Uncoated paper, black ink, one oxblood spot colour; dark is the "evening edition" with a coral spot |
| Imagery | Medium photography with captions and credits; small round portraits in the Index |
| Texture | None beyond the paper tone; rules do the structuring |
| Motion | Quiet: slow photo zoom on hover, arrow nudge on "more" links, underline colour transitions |
| Browser features | CSS multi-column with `column-span`, `::first-letter` drop caps, Popover API for sections and refinements, `text-wrap: balance/pretty` |

## Type

- **Fraunces** (variable, 300–700, italic) for the nameplate, headlines, cover lines, pull quotes,
  numerals and names. Italic carries emphasis ("*down the street.*", "*ranked for you*").
- **Newsreader** for reading text at 17px / 1.6, with old-style figures and auto hyphenation.
- **Libre Franklin** for kickers, bylines, captions, labels and buttons: uppercase, tracked 0.14em.

## Palette

| Role | Light | Dark |
|---|---|---|
| Canvas | paper `#f4efe6` | warm black `#15130f` |
| Ink | `#1b1a17` (15.2:1) | cream `#ece5d8` (14.8:1) |
| Muted | `#5b554c` (6.4:1) | `#b9af9f` (7.9:1) |
| Spot colour | oxblood `#8c1c13` (8.0:1 as text; paper on oxblood 8.7:1) | coral `#e8806f` (6.9:1) |
| Online | green `#2d5a3a` | green `#8fc79d` |

Photos sit under a dark scrim (`--color-scrim`) so the white cover type holds contrast over the
sunset sky.

## Motion

| What | Duration | Easing |
|---|---|---|
| Cover photo zoom on hover (1.03) | `--duration-deliberate` 1100ms | `--ease-enter` |
| Profile photo zoom (1.04) and colour restore | `--duration-slow` 600ms | `--ease-enter` |
| Link colour and underline | `--duration-fast` 160ms | `--ease-standard` |
| "More →" arrow nudge | `--duration-fast` | `--ease-standard` |

`prefers-reduced-motion: reduce` collapses every duration token to 0.01ms.

## Browser features and fallbacks

- **Multi-column layout** with `column-span: all` for the pull quote (all evergreen browsers).
  Narrow screens fall back to a single column.
- **Popover API** for the "Sections" menu under 768px and the "Refine the Index" sheet under
  1024px; on larger screens they render inline. No script.
- **`:target`** highlights an Index entry when it is reached from the A–Z list.

## Responsive behaviour

- **360px:** utility bar keeps Join Banaro; the nameplate scales down; sections collapse into a
  popover. The cover becomes a tall card with the headline at the top and cover lines at the
  bottom. Feature text is one column. The Index shows a "Refine the Index" button; entries keep
  the leader and the score ("94%").
- **768px:** feature in two columns; profiles two-up; the masthead shows its side notes.
- **1280px:** cover photo beside the editors' note, stats strap and contents; the feature runs three
  columns; the Index uses three columns (refine | entries | A–Z). Above 1440px the entries split
  into two index columns.

## Accessibility

- One `h1` per page (the cover headline; the Index headline). Section heads use `h2`, entries are
  list items with the name in text, not in an image.
- Portrait images have descriptive `alt` on the home page; the Index portraits are decorative
  (`alt=""`) because the name sits next to them.
- Online status is a dot and the words "Online now"; the match score is a number with a visually
  hidden "match" on phones.
- Filters are native checkboxes and a range with `aria-valuetext`; skills use `aria-pressed`.

## What to take from it

Editorial framing turns a directory into a publication people return to: the feature shows how
the product works through a real-feeling story, and the Index's dotted leader is a compact,
elegant way to show a score. The A–Z margin is a cheap secondary navigation for a ranked list.
Open questions: who writes the features each season, and whether the photography can be real.

## Coverage

<!-- coverage:start -->

Legend: ✅ mock exists · ➖ not applicable (reason in manifest) · ❌ missing

### Pages

| Screen | default | loading | empty | error | Requirements |
|---|---|---|---|---|---|
| Home (`home`) | [✅](pages/home/default.html) | ➖ | ➖ | ➖ |  |
| Builder directory (`directory`) | [✅](pages/directory/default.html) | ➖ | ➖ | ➖ |  |

<!-- coverage:end -->
