# Banaro mocks

Open [index.html](index.html) from disk to browse the Home and Builder directory mocks.
The selected design uses oat and birch neutrals, a sage accent, small square photos,
generous spacing and quiet motion.

The mock bar links to the gallery and between pages, toggles light/dark (or press
`t`), and hides itself with `×` or `?chrome=0`. Use `?theme=dark` to open a dark mock.

## Files and coverage

```text
docs/mocks/
  index.html
  README.md
  manifest.json
  assets/                         tokens, component styles, mock chrome, fonts and photos
  pages/home/default.html         /
  pages/directory/default.html    /builders
```

This retained set contains two screens, each in its default state. Loading, empty
and error variants have not been authored; the manifest records that limitation.
Dialogs and notifications have not been authored.

To check links and regenerate the gallery and coverage matrix:

```sh
python .agents/skills/writing-html-mocks/scripts/check_mocks.py docs/mocks --write
python .agents/skills/writing-html-mocks/scripts/screenshot_mocks.py docs/mocks
```

Today is Friday 9 October 2026. The directory viewer is Amara Osei (Leslieville),
looking for a technical co-founder.

## Cast and catalog

The mocks share this cast and copy. "Today" is
**Friday 9 October 2026**. Distances are from the viewer's neighbourhood, Leslieville.

### Product copy

- **Name:** Banaro. **Promise (headline):** "Build what matters, with believers down the street."
  Short copy variants: "Build together." / "Faith. Craft. Neighbours."
- **Sub-copy:** "Banaro connects Christian founders, engineers, designers and product managers
  across Toronto and the GTA — so you can find collaborators, share what you're making, and meet
  in person."
- **Primary action:** "Join Banaro" · **Secondary:** "Browse builders" · Signed-out header: "Sign in".
- **Primary navigation:** Builders · Projects · Events · Matching.
- **The four areas:**
  1. **Builder directory** — "Find local builders by skill, role and neighbourhood."
  2. **Project showcase** — "Share what you're building, ask for feedback, find collaborators."
  3. **Meetups and events** — "Demo nights, prayer breakfasts and workshops across the GTA."
  4. **Co-founder matching** — "Meet a co-founder, an advisor or a contributor who shares your faith."
- **Stats:** 1,284 builders · 312 projects · 96 co-founder matches · 48 events in 2026.
- **Verse:** "Two are better than one, because they have a good return for their labour." —
  Ecclesiastes 4:9
- **Testimonial:** "Within a week I was advising two founders, both a streetcar ride from my
  house." — Hannah Kowalski, UX researcher, Roncesvalles
- **Matching call to action:** "Looking for a co-founder? Tell us what you're building and who
  you need. We'll suggest three builders nearby every Monday." Button: "Start matching".
- **Footer:** About · Code of conduct · Privacy · Contact · "Made in Toronto. © 2026 Banaro."
  Land acknowledgement (optional): "Banaro gathers on the traditional territory of many nations,
  including the Mississaugas of the Credit, the Anishnabeg, the Chippewa, the Haudenosaunee and the
  Wendat peoples."

### Builders

Photos live in `docs/mocks/assets/photos/<first-last>.jpg` (square, 480 px). Builders 12–23 have no
photo; show initials or a generated avatar. Match is for the viewer, Amara, who is looking for a
technical co-founder. The directory's default sort is **Best match**, in this order.

| # | Builder | Role | Neighbourhood | Dist. | Match | Skills | Building | Open to | Seen |
|---|---|---|---|---|---|---|---|---|---|
| — | **Amara Osei** (viewer) | Founder · Product | Leslieville | — | — | Product strategy, User research, Figma | Harvest | Co-founding | Online |
| 1 | Daniel Reyes | Full-stack engineer | Mississauga | 26.9 km | 94% | Laravel, Angular, PostgreSQL | Psalter | Co-founding | Online now |
| 2 | Grace Liu | Product designer | Markham | 24.3 km | 91% | Figma, Design systems, Prototyping | Gather | Contributing | Online now |
| 3 | Noah Fischer | Backend & data engineer | The Annex | 5.8 km | 88% | Python, PostgreSQL, Data pipelines | Ledgerline | Co-founding | 1 h ago |
| 4 | Caleb Morgan | Frontend engineer | Etobicoke | 17.8 km | 85% | Angular, TypeScript, Accessibility | — | Contributing | Online now |
| 5 | Sofia Marquez | Growth & marketing | Liberty Village | 6.1 km | 82% | Lifecycle marketing, SEO, Community | Kindred | Contributing | 3 h ago |
| 6 | Hannah Kowalski | UX researcher | Roncesvalles | 7.2 km | 80% | User interviews, Usability testing, Synthesis | — | Advising | Yesterday |
| 7 | Marcus Bennett | Engineering leader (ex-CTO) | North York | 14.2 km | 78% | Architecture, Hiring, Laravel | — | Advising | 2 h ago |
| 8 | Ruth Alvarez | Product manager, health tech | Scarborough | 13.5 km | 76% | Roadmapping, Healthcare, Analytics | Sabbath | Co-founding | Online now |
| 9 | Leah Thompson | Brand & illustration designer | Kensington Market | 4.6 km | 73% | Illustration, Branding, Motion | — | Contributing | 5 h ago |
| 10 | Elijah Brooks | Hardware founder | Oakville | 36.4 km | 70% | Embedded C, IoT, Manufacturing | Wellspring | Co-founding | Yesterday |
| 11 | Peter Walsh | Angel investor & advisor | Richmond Hill | 27.6 km | 68% | Fundraising, Go-to-market, SaaS | — | Advising | 2 days ago |
| 12 | Esther Nguyen | Product designer | Riverdale | 1.4 km | 66% | Figma, Service design, Workshops | — | Co-founding | 4 h ago |
| 13 | Isaac Mensah | Backend engineer | Pickering | 31.2 km | 64% | Go, Kubernetes, gRPC | — | Co-founding | Online now |
| 14 | Naomi Fraser | Community lead | The Danforth | 2.1 km | 62% | Events, Partnerships, Facilitation | — | Contributing | 1 h ago |
| 15 | Joshua Kim | iOS engineer | Willowdale | 17.0 km | 61% | Swift, SwiftUI, Core Data | — | Contributing | 6 h ago |
| 16 | Priya Sharma | Data scientist | Brampton | 33.8 km | 59% | Python, Machine learning, dbt | — | Advising | Yesterday |
| 17 | Jonathan Clarke | Fintech founder | Oakville | 36.9 km | 57% | Payments, Compliance, Sales | Tally | Co-founding | 3 days ago |
| 18 | Abigail Turner | Content strategist | The Junction | 9.4 km | 55% | UX writing, Content design, Editing | — | Contributing | 2 h ago |
| 19 | Matthew Okoro | DevOps engineer | Ajax | 34.5 km | 53% | AWS, Terraform, CI/CD | — | Contributing | Yesterday |
| 20 | Chloe Martin | Product manager, edtech | Vaughan | 28.7 km | 51% | Discovery, Edtech, Experimentation | — | Advising | 4 days ago |
| 21 | Benjamin Ho | Machine-learning engineer | Markham | 23.9 km | 49% | PyTorch, NLP, MLOps | — | Contributing | 1 h ago |
| 22 | David Petrov | Security engineer | Etobicoke | 18.5 km | 47% | AppSec, Pen testing, OWASP | — | Advising | Yesterday |
| 23 | Miriam Haddad | Nonprofit tech founder | Mississauga | 25.6 km | 45% | Fundraising, Operations, No-code | Open Table GTA | Co-founding | 5 h ago |

Short bios (one sentence each): Daniel — "Ten years shipping Laravel
apps; now building Psalter after hours and looking for a founder to go full time with." Grace —
"Designs calm interfaces for churches and charities; happiest in a Figma file with a coffee."
Noah — "Turns messy spreadsheets into honest dashboards for charities." Caleb — "Two years into
frontend and looking for a real product to learn on." Sofia — "Helped three newcomer programmes
grow past 1,000 members." Hannah — "Listens for a living; advises early teams on what to build
first."

### Projects

| Project | Owner | One line | Stage | Looking for | Feedback |
|---|---|---|---|---|---|
| Harvest | Amara Osei | Volunteer scheduling for GTA food banks | Beta · 6 food banks | Technical co-founder | 23 comments |
| Psalter | Daniel Reyes | Scripture memory with spaced repetition | 1,900 beta users | Contributors (open source) | 41 comments |
| Gather | Grace Liu | Check-in and RSVP for small church events | Prototype | Frontend engineer | 12 comments |
| Ledgerline | Noah Fischer | Plain-language giving reports for charities | Pilot · 4 charities | Advisor (CRA compliance) | 9 comments |
| Kindred | Sofia Marquez | Mentor matching for newcomers to Canada | Pilot · 3 churches | Contributors | 17 comments |
| Wellspring | Elijah Brooks | Low-cost water-quality sensors for rural partners | Hardware prototype | Co-founder | 6 comments |
| Sabbath | Ruth Alvarez | A gentle rest and screen-time coach | Design | iOS engineer | 14 comments |

### Events

| Event | When | Where | Going |
|---|---|---|---|
| Fall Demo Night | Thu 15 Oct 2026, 7:00–9:30 pm | Centre for Social Innovation, 192 Spadina Ave | 64 going · 16 spots left · 6 demos |
| Builders' Prayer Breakfast | Sat 17 Oct, 8:00–9:30 am | St. Matthew's Hall, Leslieville | 22 going |
| Design Critique Circle | Tue 20 Oct, 6:30–8:30 pm | Markham Village Library, community room | 15 going |
| Co-founder Mixer | Thu 29 Oct, 7:00–9:00 pm | The Assembly Hall, Liberty Village | 41 going |

### Directory filters and counts

- **Results:** "1,284 builders in Toronto and the GTA" · showing 1–12 · sort options: Best match (default), Nearest, Recently active, Newest.
- **Role:** Founders 214 · Engineers 486 · Designers 231 · Product managers 198 · Other 155.
- **Open to:** Co-founding 173 · Advising 248 · Contributing 611.
- **Neighbourhood / city:** Downtown Toronto 512 · North York 141 · Scarborough 96 · Etobicoke 88 ·
  Mississauga 147 · Brampton 74 · Markham 92 · Vaughan 51 · Richmond Hill 38 · Oakville 45.
- **Distance:** Within 40 km of Leslieville (default).
- **Popular skills:** React 203 · Figma 187 · Python 174 · Product strategy 156 · User research
  112 · Laravel 96 · Data/ML 89 · Marketing 77 · Angular 74 · Swift 61 · Kotlin 48 · Fundraising 41.
- **Signed-in chrome:** avatar "AO" (photo `amara-osei.jpg`), 3 unread notifications, 2 new
  matches.


## Idea

Scandinavian calm for a community that meets over coffee. Banaro feels like a well-kept room in a
wooden house: oat and birch neutrals, a single sage accent, soft rounded corners, small square
photographs and a great deal of air. Nothing shouts; the page assumes you have time. The only
texture is a whisper of wood grain behind the co-founder matching invitation.

## Design choices

| Axis | Choice |
|---|---|
| Whitespace | Very generous: 128 px between sections on desktop, 96 px on mobile; content capped at 74 rem |
| Line height | Relaxed body (1.65, lead 1.85); display set tight (1.08) in a light weight |
| Density | Low. Home shows six builders, four projects, four events; the directory shows 12 in two columns |
| Palette | Oat canvas, birch surfaces, linen wells, ink text, sage accent; clay and fjord only as quiet tiles |
| Imagery | Small square photos only: one modest scene photo (coffee) and 64 px portraits with 14 px corners. Builders without photos get initials on a soft tile |
| Texture | `feTurbulence` wood grain used as a CSS mask on the matching panel (9 % in light, 6 % in dark) |
| Motion | Slow and quiet: 420 ms hover lifts, a breathing online dot, gentle scroll drift |
| Browser features | Popover API for the mobile menu and filter sheet, CSS masks, scroll-driven animation, `color-mix()` |

## Type

**Manrope** throughout (OFL). Display and section titles at weight 300 with −0.03 em tracking give
the airy, architectural Scandinavian feel; labels are 600 uppercase with 0.14 em tracking. One family
keeps the page calm. JetBrains Mono is declared for code only and never appears on these pages.

## Palette

| Role | Light | Dark (a winter evening by lamplight) |
|---|---|---|
| Canvas | oat `#f5f0e7` | night `#171815` |
| Surface | birch `#fcfaf6` | `#1f211d` |
| Text | ink `#2a2b26` | `#eee8dc` |
| Muted / subtle | `#524f47` / `#686358` | `#c3bcae` / `#a8a193` |
| Accent (fills) | sage `#55715a` with birch text (5.1:1) | sage `#a9bfa5` with deep sage text (8.3:1) |
| Tiles | sage, clay, fjord, oat tints | the same hues, deep |

Every text pair is AA or better in both themes (checked with `check_contrast.py`: 46 of 46 pass).

## Motion spec

| What | Duration | Easing |
|---|---|---|
| Colour, border, underline | 240–420 ms (`--duration-fast`/`--duration-base`) | `cubic-bezier(0.22, 0.61, 0.36, 1)` |
| Card and area hover lift (−3 px plus deeper shadow) | 420 ms, shadow 640 ms | same |
| Photo hover scale 1.03 | 900 ms (`--duration-deliberate`) | same |
| Arrow nudge on hover | 420 ms | same |
| Online dot breathing ring | 3.6 s loop (`--duration-breath`) | `cubic-bezier(0.45, 0, 0.55, 1)` |
| Menu and filter sheet settle in | 640 ms | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Sections drift up 24 px as they enter | scroll-linked | linear over the entry range |

All of it lives inside `@media (prefers-reduced-motion: no-preference)`; reduced motion also zeroes
the duration tokens and `--lift`. The scroll drift only moves elements (no opacity), so the resting
state is always fully visible.

## Browser features and fallbacks

- **Popover API** (`popover`, `popovertarget`) opens the mobile menu and the filter sheet with no
  JavaScript. On desktop the same elements are styled as static navigation and a sticky sidebar.
  Browsers without popover support show the nav and filters inline, which still works.
- **Scroll-driven animation** is wrapped in `@supports (animation-timeline: view())`.
- **CSS masks** carry the wood grain; without them the panel is a plain birch tint.
- `color-mix()` for the breathing ring only.

## Responsive behaviour

- 360: single column; the nav collapses behind an icon-only menu button; filters open as a bottom
  sheet from the "Filters" button; stats sit two by two.
- 768: areas and featured builders in two columns; directory cards in two columns.
- 1280: hero splits into headline and a small photo plus testimonial; four areas in a row; builders
  in three columns; filters become a sticky sidebar beside a two-column result grid.

## Accessibility notes

- One `h1` per page, sections labelled by their `h2`, cards labelled by the builder's name.
- The search has a visually hidden label; the sort select is wrapped in its visible "Sort by" label.
- Filter groups are `fieldset`/`legend`; skills are toggle buttons with `aria-pressed`.
- Online status is a word plus a dot, never colour alone. Notification count has an `aria-label`.
- Focus ring is a 2 px sage outline with 3 px offset on every interactive element.

## Design patterns

The restraint: one accent, one family, small photos and hairlines instead of boxes. The quiet
calendar list for events and the two-fact card footer ("Building · Open to") are strong patterns to
keep as the mock set grows.

## Open questions

- Is the light display weight legible enough on low-quality screens for older members?
- Should the wood grain appear anywhere else, or stay a one-off for matching?

<!-- coverage:start -->

Legend: ✅ mock exists · ➖ not applicable (reason in manifest) · ❌ missing

### Pages

| Screen | default | loading | empty | error | Requirements |
|---|---|---|---|---|---|
| Home (`home`) | [✅](pages/home/default.html) | ➖ | ➖ | ➖ |  |
| Builder directory (`directory`) | [✅](pages/directory/default.html) | ➖ | ➖ | ➖ |  |

<!-- coverage:end -->
