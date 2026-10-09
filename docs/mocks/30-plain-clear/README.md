# 30 · Plain & Clear

An accessibility-first Banaro in the spirit of GOV.UK: big readable type, very high contrast,
plain language, one column of text, real form controls, and nothing on the page that is not
doing a job. The design is the absence of decoration — the craft is in spacing, hierarchy and the
focus state.

## The idea

- **Home** reads like a service start page: a caption ("Toronto and the GTA"), the promise as the
  only heading on the screen, one sentence of explanation, a green **Join Banaro ›** start button
  and a plain "Browse builders" link. Below it, the four areas as a bordered list of headed links,
  featured builders and projects as **tables**, events as a plain list with the full date first,
  matching as a single panel with a secondary button, the testimonial as inset text, and a one-field
  **Join Banaro** form at the end. A one-third aside carries the numbers, the next event, the verse
  and help links.
- **Directory** is a search page: breadcrumbs, `h1` "Find a builder", a visible search label and
  hint, then a one-third filter column — selected filters with "Clear filters", **real 40 px
  checkboxes and radios in fieldsets with legends**, counts written out ("214 builders") and an
  **Apply filters** button. Results are an ordered list: the name as a heading link with a "94%
  match" tag, one plain sentence ("Full-stack engineer in Mississauga, 26.9 km from Leslieville."),
  then a summary list of skills, building, open to and last seen, with "Say hello" and "View
  Daniel's profile". Numbered pagination with "Next page".
- A Beta phase banner invites feedback; there are no photos, no illustration, no icons except the
  start-button arrow and the breadcrumb chevron.

## What varies

| Axis | Choice |
|---|---|
| Whitespace | Even 5 px-based rhythm; generous between sections, tight inside lists |
| Line height | 1.6 body, 1.1 headings |
| Density | Low on Home, medium on Directory (12 results, every fact written out) |
| Palette | Near-black `#0b0c0c` on white, link blue, action green, yellow focus |
| Imagery | None |
| Texture | None |
| Motion | None (durations are 0 ms by design) |
| Browser features | Native `<details>` for menu and filters; everything else is plain HTML |

## Type

**Atkinson Hyperlegible** throughout (400 and 700), chosen for distinguishable letterforms
(slashed zero, open shapes, distinct I/l/1). Body is **19 px** on small screens and **20 px** from
64 rem; headings scale from 32/27/21 px on phones to 48/36/24 px on wider screens. Text never runs
wider than 40 rem.

## Palette and theming

Light: `#0b0c0c` text on white, secondary text `#484949` (9:1), links `#1a65a6` with visited
purple, action green `#00703c` with a darker bottom edge, a 10 px blue rule under the black header.
Dark: the same structure on `#0f1011` with white text, light-blue links, green-400 buttons with
black text; the yellow focus state is identical in both themes. All text pairs pass AA (most pass
AAA). The yellow focus fill is deliberately paired with a black (white in dark) bar beneath it;
the bar, not the yellow, is the 3:1 indicator against the page.

## Focus and interaction

- Links: on focus they become black text on a yellow fill with a thick black underline bar
  (shown statically on "Browse builders" on Home).
- Inputs: 3 px yellow outline plus a 2 px inset black border (shown statically on the search
  field on Directory).
- Buttons: yellow fill, black text, black bottom edge. Checkboxes: the box border thickens to
  4 px and gains a yellow halo.
- Every control is at least 44 px tall; checkboxes and radios are 40 px squares with the whole
  label clickable.

## Motion

None. All duration tokens are 0 ms; the only state changes are colour and the 2 px button press.
`prefers-reduced-motion` therefore changes nothing.

## Browser features and fallbacks

- The mobile menu and the filter panel are `<details>` elements — no JavaScript needed.
- Filters render open in the HTML; a five-line script folds them under "Filters (1 selected)" on
  screens below 64 rem so results come first. Without JavaScript they stay open above results.
- Tables collapse into labelled rows under 40 rem using `data-label` and generated content.

## Responsive behaviour

- 360 px: header links wrap at 16 px, service navigation becomes a "Menu" disclosure, tables stack,
  the start button spans the width, filters are folded.
- 768 px: service navigation shows inline with a 5 px current-page underline.
- 1024 px+: two-thirds / one-third grid; on Directory filters take the first third.

## Accessibility

- One `h1` per page; headings in order; tables have captions and row headers.
- Every form control has a visible label; the search has a hint linked with `aria-describedby`;
  legends name each group; counts are written as words in the hint, not colour.
- The result count is a `role="status"` region so a screen reader hears the new total after
  filtering. "Say hello" buttons carry the builder's name in visually hidden text.
- Online status is a dot **and** the words "Online now".

## What to take from it

- The filter pattern (fieldsets, written-out counts, selected-filter tags, Apply button) and the
  result summary list are a reliable baseline any chosen concept should match for accessibility.
- The focus state is worth stealing outright.
- Plain sentences ("Full-stack engineer in Mississauga, 26.9 km from Leslieville") beat chips and
  icons for scanning.

## Open questions

- Does the community want this much restraint on the signed-out home, or only in the app?
- Should the directory apply filters instantly (with the live count) or keep the explicit Apply
  button for predictability?

<!-- coverage:start -->

Legend: ✅ mock exists · ➖ not applicable (reason in manifest) · ❌ missing

### Pages

| Screen | default | loading | empty | error | Requirements |
|---|---|---|---|---|---|
| Home (`home`) | [✅](pages/home/default.html) | ➖ | ➖ | ➖ |  |
| Builder directory (`directory`) | [✅](pages/directory/default.html) | ➖ | ➖ | ➖ |  |

<!-- coverage:end -->
