# Banaro mocks

Open [index.html](index.html) from disk to browse every page, dialog and notification of the member app.
The selected design uses oat and birch neutrals, a sage accent, small square photos,
generous spacing and quiet motion.

The mock bar links to the gallery and between pages, toggles light/dark (or press
`t`), and hides itself with `×` or `?chrome=0`. Use `?theme=dark` to open a dark mock.

## Files and coverage

```text
docs/mocks/
  index.html                      gallery of every screen and state (generated)
  README.md                       cast, design notes, coverage matrix (generated section)
  manifest.json                   the list of screens, states and not-applicable reasons
  assets/                         tokens, component kit, mock chrome, fonts and photos
  pages/<id>/<state>.html         31 pages
  dialogs/<id>/<state>.html       13 dialogs, shown over the page they open from
  notifications/<id>/<state>.html 5 notification types, shown over the page that raises them
```

49 screens and 196 state files cover the member app: sign in and join, onboarding, the dashboard,
the builder directory and profiles, the project showcase, events, co-founder matching, messages,
notifications, settings, legal and contact pages, and the error pages. Every required state is
either a file or has a reason in the manifest. Dialogs sit over a copy of their page's markup, made
`inert`; banners are inserted above the header.

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

## Cast additions

- **Messages:** Daniel Reyes has replied to Amara's note (one unread); Grace Liu and Hannah Kowalski are
  the other two conversations.
- **Hearth:** an invented design-stage project by Esther Nguyen with no feedback yet, used for the empty
  project page and the project-new states.
- **Directory edge state:** five placeholder builders with very long names, 4-digit figures and an RTL name.
- **Events:** four past events from September 2026 on the "Last season" tab.

## Open questions

- No `/admin` area is mocked. Hosts and administrators who create events, moderate reports and manage
  members need their own slice and an ADR for the separate admin application.
- There is no cookie-consent banner: Banaro sets only essential cookies. Revisit if analytics are added.
- Global search and the e-mail templates (weekly matches, event reminders) are not mocked.
- The header counts (2 matches, 1 message, 3 notifications) are static in every mock, so the
  notifications `read` state still shows "3 unread" on the bell.

- Is the light display weight legible enough on low-quality screens for older members?
- Should the wood grain appear anywhere else, or stay a one-off for matching?

<!-- coverage:start -->

Legend: ✅ mock exists · ➖ not applicable (reason in manifest) · ❌ missing

### Pages

| Screen | default | loading | empty | error | partial | invalid | submitting | signed-out | success | skills | goals | no-results | filtered | edge | own | sparse | not-found | past | going | waitlist | ended | cancelled | reviewed | paused | send-failed | read | privacy | email | Requirements |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Home (`home`) | [✅](pages/home/default.html) | [✅](pages/home/loading.html) | ➖ | [✅](pages/home/error.html) | [✅](pages/home/partial.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-039` |
| Sign in (`sign-in`) | [✅](pages/sign-in/default.html) | ➖ | ➖ | [✅](pages/sign-in/error.html) |  | [✅](pages/sign-in/invalid.html) | [✅](pages/sign-in/submitting.html) | [✅](pages/sign-in/signed-out.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-003` |
| Join Banaro (`join`) | [✅](pages/join/default.html) | ➖ | ➖ | ➖ |  | [✅](pages/join/invalid.html) | [✅](pages/join/submitting.html) |  | [✅](pages/join/success.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-001` |
| Forgot password (`forgot-password`) | [✅](pages/forgot-password/default.html) | ➖ | ➖ | ➖ |  | [✅](pages/forgot-password/invalid.html) | [✅](pages/forgot-password/submitting.html) |  | [✅](pages/forgot-password/success.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-004` |
| Reset password (`reset-password`) | [✅](pages/reset-password/default.html) | ➖ | ➖ | [✅](pages/reset-password/error.html) |  | [✅](pages/reset-password/invalid.html) | [✅](pages/reset-password/submitting.html) |  | [✅](pages/reset-password/success.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-004` |
| Verify e-mail (`verify-email`) | [✅](pages/verify-email/default.html) | ➖ | ➖ | [✅](pages/verify-email/error.html) |  |  |  |  | [✅](pages/verify-email/success.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-002` |
| Welcome (`onboarding`) | [✅](pages/onboarding/default.html) | ➖ | ➖ | ➖ |  | [✅](pages/onboarding/invalid.html) | [✅](pages/onboarding/submitting.html) |  | [✅](pages/onboarding/success.html) | [✅](pages/onboarding/skills.html) | [✅](pages/onboarding/goals.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-006` |
| Dashboard (`dashboard`) | [✅](pages/dashboard/default.html) | [✅](pages/dashboard/loading.html) | [✅](pages/dashboard/empty.html) | [✅](pages/dashboard/error.html) | [✅](pages/dashboard/partial.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-030` |
| Builder directory (`directory`) | [✅](pages/directory/default.html) | [✅](pages/directory/loading.html) | ➖ | [✅](pages/directory/error.html) |  |  |  |  |  |  |  | [✅](pages/directory/no-results.html) | [✅](pages/directory/filtered.html) | [✅](pages/directory/edge.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-009`, `L2-010` |
| Builder profile (`builder-profile`) | [✅](pages/builder-profile/default.html) | [✅](pages/builder-profile/loading.html) | ➖ | [✅](pages/builder-profile/error.html) |  |  |  |  |  |  |  |  |  |  | [✅](pages/builder-profile/own.html) | [✅](pages/builder-profile/sparse.html) | [✅](pages/builder-profile/not-found.html) |  |  |  |  |  |  |  |  |  |  |  | `L2-011`, `L2-036` |
| Edit profile (`profile-edit`) | [✅](pages/profile-edit/default.html) | [✅](pages/profile-edit/loading.html) | ➖ | [✅](pages/profile-edit/error.html) |  | [✅](pages/profile-edit/invalid.html) | [✅](pages/profile-edit/submitting.html) |  | [✅](pages/profile-edit/success.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-007` |
| Projects (`projects`) | [✅](pages/projects/default.html) | [✅](pages/projects/loading.html) | ➖ | [✅](pages/projects/error.html) |  |  |  |  |  |  |  | [✅](pages/projects/no-results.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-015` |
| Project (`project-detail`) | [✅](pages/project-detail/default.html) | [✅](pages/project-detail/loading.html) | [✅](pages/project-detail/empty.html) | [✅](pages/project-detail/error.html) |  |  |  |  |  |  |  |  |  |  | [✅](pages/project-detail/own.html) |  | [✅](pages/project-detail/not-found.html) |  |  |  |  |  |  |  |  |  |  |  | `L2-013`, `L2-016`, `L2-017` |
| Share a project (`project-new`) | [✅](pages/project-new/default.html) | ➖ | ➖ | ➖ |  | [✅](pages/project-new/invalid.html) | [✅](pages/project-new/submitting.html) |  | [✅](pages/project-new/success.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-012` |
| Edit project (`project-edit`) | [✅](pages/project-edit/default.html) | [✅](pages/project-edit/loading.html) | ➖ | [✅](pages/project-edit/error.html) |  | [✅](pages/project-edit/invalid.html) | [✅](pages/project-edit/submitting.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-014` |
| Events (`events`) | [✅](pages/events/default.html) | [✅](pages/events/loading.html) | [✅](pages/events/empty.html) | [✅](pages/events/error.html) |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](pages/events/past.html) |  |  |  |  |  |  |  |  |  |  | `L2-018` |
| Event (`event-detail`) | [✅](pages/event-detail/default.html) | [✅](pages/event-detail/loading.html) | ➖ | [✅](pages/event-detail/error.html) |  |  |  |  |  |  |  |  |  |  |  |  | [✅](pages/event-detail/not-found.html) |  | [✅](pages/event-detail/going.html) | [✅](pages/event-detail/waitlist.html) | [✅](pages/event-detail/ended.html) | [✅](pages/event-detail/cancelled.html) |  |  |  |  |  |  | `L2-019`, `L2-020` |
| Matching (`matching`) | [✅](pages/matching/default.html) | [✅](pages/matching/loading.html) | [✅](pages/matching/empty.html) | [✅](pages/matching/error.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](pages/matching/reviewed.html) | [✅](pages/matching/paused.html) |  |  |  |  | `L2-022`, `L2-023`, `L2-024`, `L2-025` |
| Matching setup (`matching-setup`) | [✅](pages/matching-setup/default.html) | ➖ | ➖ | ➖ |  | [✅](pages/matching-setup/invalid.html) | [✅](pages/matching-setup/submitting.html) |  | [✅](pages/matching-setup/success.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-021` |
| Messages (`messages`) | [✅](pages/messages/default.html) | [✅](pages/messages/loading.html) | [✅](pages/messages/empty.html) | [✅](pages/messages/error.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](pages/messages/send-failed.html) |  |  |  | `L2-026` |
| Notifications (`notifications`) | [✅](pages/notifications/default.html) | [✅](pages/notifications/loading.html) | [✅](pages/notifications/empty.html) | [✅](pages/notifications/error.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](pages/notifications/read.html) |  |  | `L2-027` |
| Settings (`settings`) | [✅](pages/settings/default.html) | [✅](pages/settings/loading.html) | ➖ | [✅](pages/settings/error.html) |  | [✅](pages/settings/invalid.html) | [✅](pages/settings/submitting.html) |  | [✅](pages/settings/success.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](pages/settings/privacy.html) | [✅](pages/settings/email.html) | `L2-035`, `L2-036`, `L2-037`, `L2-038` |
| Contact (`contact`) | [✅](pages/contact/default.html) | ➖ | ➖ | ➖ |  | [✅](pages/contact/invalid.html) | [✅](pages/contact/submitting.html) |  | [✅](pages/contact/success.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-040` |
| About Banaro (`about`) | [✅](pages/about/default.html) | ➖ | ➖ | ➖ |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-040` |
| Code of conduct (`code-of-conduct`) | [✅](pages/code-of-conduct/default.html) | ➖ | ➖ | ➖ |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-034` |
| Privacy (`privacy`) | [✅](pages/privacy/default.html) | ➖ | ➖ | ➖ |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-041` |
| Page not found (`not-found`) | [✅](pages/not-found/default.html) | ➖ | ➖ | ➖ |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-042` |
| No access (`forbidden`) | [✅](pages/forbidden/default.html) | ➖ | ➖ | ➖ |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-042` |
| Something went wrong (`server-error`) | [✅](pages/server-error/default.html) | ➖ | ➖ | ➖ |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-042` |
| You're offline (`offline`) | [✅](pages/offline/default.html) | ➖ | ➖ | ➖ |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-043` |
| Down for maintenance (`maintenance`) | [✅](pages/maintenance/default.html) | ➖ | ➖ | ➖ |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-043` |

### Dialogs

| Screen | default | busy | invalid | failed | success | Requirements |
|---|---|---|---|---|---|---|
| Say hello (`say-hello`) | [✅](dialogs/say-hello/default.html) | [✅](dialogs/say-hello/busy.html) | [✅](dialogs/say-hello/invalid.html) | [✅](dialogs/say-hello/failed.html) |  | `L2-026` |
| Pass on this suggestion (`pass-suggestion`) | [✅](dialogs/pass-suggestion/default.html) | [✅](dialogs/pass-suggestion/busy.html) | ➖ | [✅](dialogs/pass-suggestion/failed.html) |  | `L2-024` |
| Give feedback (`give-feedback`) | [✅](dialogs/give-feedback/default.html) | [✅](dialogs/give-feedback/busy.html) | [✅](dialogs/give-feedback/invalid.html) | [✅](dialogs/give-feedback/failed.html) |  | `L2-016` |
| Offer to help (`offer-to-help`) | [✅](dialogs/offer-to-help/default.html) | [✅](dialogs/offer-to-help/busy.html) | [✅](dialogs/offer-to-help/invalid.html) | [✅](dialogs/offer-to-help/failed.html) |  | `L2-017` |
| Delete project (`delete-project`) | [✅](dialogs/delete-project/default.html) | [✅](dialogs/delete-project/busy.html) | [✅](dialogs/delete-project/invalid.html) | [✅](dialogs/delete-project/failed.html) |  | `L2-014` |
| Cancel RSVP (`cancel-rsvp`) | [✅](dialogs/cancel-rsvp/default.html) | [✅](dialogs/cancel-rsvp/busy.html) | ➖ | [✅](dialogs/cancel-rsvp/failed.html) |  | `L2-020` |
| Pause matching (`pause-matching`) | [✅](dialogs/pause-matching/default.html) | [✅](dialogs/pause-matching/busy.html) | ➖ | [✅](dialogs/pause-matching/failed.html) |  | `L2-025` |
| Report a builder (`report`) | [✅](dialogs/report/default.html) | [✅](dialogs/report/busy.html) | [✅](dialogs/report/invalid.html) | [✅](dialogs/report/failed.html) | [✅](dialogs/report/success.html) | `L2-031` |
| Block builder (`block-builder`) | [✅](dialogs/block-builder/default.html) | [✅](dialogs/block-builder/busy.html) | ➖ | [✅](dialogs/block-builder/failed.html) |  | `L2-032` |
| Change photo (`change-photo`) | [✅](dialogs/change-photo/default.html) | [✅](dialogs/change-photo/busy.html) | [✅](dialogs/change-photo/invalid.html) | [✅](dialogs/change-photo/failed.html) |  | `L2-008` |
| Delete account (`delete-account`) | [✅](dialogs/delete-account/default.html) | [✅](dialogs/delete-account/busy.html) | [✅](dialogs/delete-account/invalid.html) | [✅](dialogs/delete-account/failed.html) |  | `L2-038` |
| Session expired (`session-expired`) | [✅](dialogs/session-expired/default.html) | [✅](dialogs/session-expired/busy.html) | [✅](dialogs/session-expired/invalid.html) | [✅](dialogs/session-expired/failed.html) |  | `L2-005` |
| Account menu (`account-menu`) | [✅](dialogs/account-menu/default.html) | ➖ | ➖ |  |  | `L2-003` |

### Notifications

| Screen | info | success | warning | danger | with-action | stacked | persistent | Requirements |
|---|---|---|---|---|---|---|---|---|
| Toast (`toast`) | [✅](notifications/toast/info.html) | [✅](notifications/toast/success.html) | [✅](notifications/toast/warning.html) | [✅](notifications/toast/danger.html) | [✅](notifications/toast/with-action.html) | [✅](notifications/toast/stacked.html) |  | `L2-028` |
| RSVP toast (`rsvp-toast`) | [✅](notifications/rsvp-toast/info.html) | [✅](notifications/rsvp-toast/success.html) | [✅](notifications/rsvp-toast/warning.html) | [✅](notifications/rsvp-toast/danger.html) |  |  |  | `L2-020`, `L2-028` |
| Account banner (`account-banner`) | [✅](notifications/account-banner/info.html) | [✅](notifications/account-banner/success.html) | [✅](notifications/account-banner/warning.html) | [✅](notifications/account-banner/danger.html) |  |  | [✅](notifications/account-banner/persistent.html) | `L2-028` |
| Site banner (`site-banner`) | [✅](notifications/site-banner/info.html) | [✅](notifications/site-banner/success.html) | [✅](notifications/site-banner/warning.html) | [✅](notifications/site-banner/danger.html) |  |  | [✅](notifications/site-banner/persistent.html) | `L2-028` |
| Connection banner (`connection-banner`) | [✅](notifications/connection-banner/info.html) | [✅](notifications/connection-banner/success.html) | [✅](notifications/connection-banner/warning.html) | [✅](notifications/connection-banner/danger.html) |  |  |  | `L2-028`, `L2-043` |

<!-- coverage:end -->

## Shared design system

The mocks now consume [the design-system tokens](../design-system/tokens/tokens.css)
and [component stylesheet](../design-system/assets/components.css) directly.
The local `assets/tokens.css` and `assets/ui.css` files remain compatibility imports.
Open [the design system](../design-system/index.html) for foundations, component states,
patterns and the documented extraction corrections. Edit shared styles there so the
mocks and future implementation keep one visual vocabulary.
