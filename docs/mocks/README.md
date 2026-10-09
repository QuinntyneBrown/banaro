# Banaro mocks — concept exploration

Forty deliberately different visual concepts for the **same two Banaro pages**, written with the
`writing-html-mocks` skill. Each concept is a self-contained mock set under `docs/mocks/<NN-slug>/`
with its own tokens, component kit, manifest, gallery and README. Pick a direction (or a blend),
then grow the chosen concept into the full mock set in `docs/mocks/pages/`, `dialogs/` and
`notifications/` and extract `docs/design-system/` from it.

Open `docs/mocks/index.html` from disk to compare every concept side by side. Inside any mock,
the mock bar jumps between the two pages, to the previous or next concept on the same page,
toggles light/dark (or press `t`), and hides itself (`×`, or `?chrome=0`). Add `?theme=dark` to
force the dark theme.

## The two pages

| Page | id | Route | Viewer | What it must show |
|---|---|---|---|---|
| Home | `home` | `/` | Signed out | Product promise, the four areas, featured builders, project showcase, upcoming events, matching call to action, sign-up |
| Builder directory | `directory` | `/builders` | Signed in as Amara Osei | Search, filters (role, skills, neighbourhood, open to), result count and sort, builder results, pagination |

Both pages are mocked in their `default` state only. Loading, empty and error states are marked
not applicable in each concept's manifest for this exploration round; they are written for the
chosen concept.

## Layout of a concept

```
docs/mocks/<NN-slug>/
  README.md                       the idea, what varies, tokens, motion, browser features, open questions
  manifest.json                   two screens: home, directory
  index.html                      generated gallery for the concept
  assets/tokens.css               the concept's tokens (semantic names kept from the skill, values changed)
  assets/ui.css                   the concept's component kit
  assets/mock.css, mock.js        mock chrome (shared copy from the skill)
  pages/home/default.html
  pages/directory/default.html
docs/mocks/assets/photos/         shared photography (Unsplash licence) used by photo-led concepts
docs/mocks/assets/fonts/          offline woff2 copies of open-licence fonts + fonts.css
```

Re-check a concept and regenerate its gallery:

```sh
python .claude/skills/writing-html-mocks/scripts/check_mocks.py docs/mocks/<NN-slug> --write
```

## Concepts

<!-- concepts:start -->
<!-- concepts:end -->

## Cast and catalog

Every concept uses this cast and copy so the comparison is about design, not content. "Today" is
**Friday 9 October 2026**. Distances are from the viewer's neighbourhood, Leslieville.

### Product copy

- **Name:** Banaro. **Promise (headline):** "Build what matters, with believers down the street."
  Short variants for minimal concepts: "Build together." / "Faith. Craft. Neighbours."
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

Short bios when a concept needs one (one sentence each): Daniel — "Ten years shipping Laravel
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

- **Results:** "1,284 builders in Toronto and the GTA" · showing 1–12 (dense concepts may show up
  to 23) · sort options: Best match (default), Nearest, Recently active, Newest.
- **Role:** Founders 214 · Engineers 486 · Designers 231 · Product managers 198 · Other 155.
- **Open to:** Co-founding 173 · Advising 248 · Contributing 611.
- **Neighbourhood / city:** Downtown Toronto 512 · North York 141 · Scarborough 96 · Etobicoke 88 ·
  Mississauga 147 · Brampton 74 · Markham 92 · Vaughan 51 · Richmond Hill 38 · Oakville 45.
- **Distance:** Within 40 km of Leslieville (default).
- **Popular skills:** React 203 · Figma 187 · Python 174 · Product strategy 156 · User research
  112 · Laravel 96 · Data/ML 89 · Marketing 77 · Angular 74 · Swift 61 · Kotlin 48 · Fundraising 41.
- **Signed-in chrome:** avatar "AO" (photo `amara-osei.jpg`), 3 unread notifications, 2 new
  matches.

### Live activity (for real-time concepts)

38 builders online now · "Grace Liu RSVP'd to Fall Demo Night · 2 min ago" · "Daniel Reyes posted
an update to Psalter · 5 min ago" · "Noah Fischer and Amara Osei matched · 12 min ago" · "Ruth
Alvarez asked for feedback on Sabbath · 18 min ago" · "Fall Demo Night: 16 spots left".

### Photography

`docs/mocks/assets/photos/` (Unsplash licence, recompressed): `toronto-skyline`,
`toronto-aerial-sunset`, `team-laptops`, `workshop-sticky-notes`, `pair-programming`,
`meetup-crowd`, `demo-night-audience`, `community-dinner`, `coworking-loft`, `studio-workspace`,
`coffee-together`, `laptop-desk`, `code-on-screen`, `friends-arm-in-arm`, `notebook-meeting`,
`high-five`, `conversation-cafe`, plus one portrait per builder 1–11 and Amara.

## Open questions

- Which concept (or blend) becomes Banaro's direction? The chosen one gets the full screen
  inventory, every state, and the design-system extraction.
- Photography: the shared photos are stock placeholders under the Unsplash licence. Production
  should use photographs of real Banaro gatherings, with consent.
- Concepts that rely on bleeding-edge features (WebGPU, cross-document view transitions, anchor
  positioning, scroll-driven animation) degrade to static equivalents; confirm the supported
  browser matrix before choosing one.
