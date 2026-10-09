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
docs/mocks/assets/thumbs/         gallery previews (1440×900 captures, light and dark)
```

Re-check a concept and regenerate its gallery:

```sh
python .claude/skills/writing-html-mocks/scripts/check_mocks.py docs/mocks/<NN-slug> --write
```

## Concepts

<!-- concepts:start -->
| # | Concept | What varies | Pages |
|---|---|---|---|
| 01 | **Swiss Grid** — International Typographic Style: a strict 12-column grid, flush-left grotesque type, hairline rules, huge section numerals and a single signal-red accent. No photos, no illustrations — the grid is the decoration. | Minimalism · whitespace · no photos | [Home](01-swiss-grid/pages/home/default.html) · [Directory](01-swiss-grid/pages/directory/default.html) · [Notes](01-swiss-grid/README.md) |
| 02 | **Keynote** — Apple.com-style product storytelling: giant tight-tracked headlines, centred heroes, alternating light-grey/white/black sections, frosted sticky sub-nav, pill buttons, ‘Learn more ›’ links and scroll-driven reveals (animation-timeline: view()). | Apple-inspired · large photos · scroll animations | [Home](02-apple-keynote/pages/home/default.html) · [Directory](02-apple-keynote/pages/directory/default.html) · [Notes](02-apple-keynote/README.md) |
| 03 | **Just Build** — Nike.com energy: enormous condensed uppercase headlines with line-height under 1, black/white with one volt accent, full-bleed photography, shop-style filter sidebar and product-grid builder cards. | Nike-inspired · large photography · tight line height | [Home](03-just-build/pages/home/default.html) · [Directory](03-just-build/pages/directory/default.html) · [Notes](03-just-build/README.md) |
| 04 | **Material You** — Google Material 3: tonal palettes from one seed colour, navigation rail, pill search bar, filter chips, FAB, large rounded shapes, state layers and ripple micro-interactions. | Google-inspired · tonal colour · micro-animations | [Home](04-material-you/pages/home/default.html) · [Directory](04-material-you/pages/directory/default.html) · [Notes](04-material-you/README.md) |
| 05 | **Beaver Crew** — Cut-paper cartoon world starring Bram, a hard-hatted beaver mascot, and his crew. Layered paper shapes, grain texture, wobbly hand-cut edges, characters reacting to empty space and hover. | Cartoon characters · paper textures · playful | [Home](05-beaver-crew/pages/home/default.html) · [Directory](05-beaver-crew/pages/directory/default.html) · [Notes](05-beaver-crew/README.md) |
| 06 | **Raw** — Brutalist web: default-looking serif, blue underlined links, thick black borders, visible table structure, monospace metadata, harsh yellow highlight, zero radius, zero shadows, everything on one long page. | Brutalism · density · no textures | [Home](06-raw-brutalist/pages/home/default.html) · [Directory](06-raw-brutalist/pages/directory/default.html) · [Notes](06-raw-brutalist/README.md) |
| 07 | **The Builder Quarterly** — Print-magazine editorial: an issue cover, drop caps, multi-column long-form feature, pull quotes, bylines and an alphabetical ‘Index of builders’ directory. Medium photography with captions. | Editorial · serif · high text density | [Home](07-editorial/pages/home/default.html) · [Directory](07-editorial/pages/directory/default.html) · [Notes](07-editorial/README.md) |
| 08 | **Quiet** — A single narrow column of small, airy text on warm paper. No photos, no colour except ink and one tiny accent dot, gentle fades. Everything a reader needs and nothing more. | Extreme whitespace · line-height 1.9 · minimal | [Home](08-quiet/pages/home/default.html) · [Directory](08-quiet/pages/directory/default.html) · [Notes](08-quiet/README.md) |
| 09 | **Live Pulse** — A living community: online-now presence, streaming activity feed, live RSVP counters, countdown to the next event, typing indicators and connection status, simulated with a small script. | Real-time features · dashboard · dark-first | [Home](09-live-pulse/pages/home/default.html) · [Directory](09-live-pulse/pages/directory/default.html) · [Notes](09-live-pulse/README.md) |
| 10 | **Aurora** — A WebGPU shader aurora hero (canvas fallback), cross-document View Transitions between the two pages, Popover API filters, CSS anchor positioning, @starting-style entry animations, scroll-driven animation and :has() selectors. | Bleeding edge · WebGPU · view transitions | [Home](10-aurora-gpu/pages/home/default.html) · [Directory](10-aurora-gpu/pages/directory/default.html) · [Notes](10-aurora-gpu/README.md) |
| 11 | **Stained Glass** — Cathedral glass reimagined: a rose-window hero built from SVG facets, cards as leaded panes, light-through-glass glows, jewel-tone palette on deep lead-grey. | Jewel-tone palette · leaded textures · illustration | [Home](11-stained-glass/pages/home/default.html) · [Directory](11-stained-glass/pages/directory/default.html) · [Notes](11-stained-glass/README.md) |
| 12 | **Riso Zine** — A photocopied community zine: fluorescent pink and teal overprints with misregistration, halftone photos, paper grain, rotated stickers and hand-cut headline type. | Risograph grain · two-colour · halftone photos | [Home](12-riso-zine/pages/home/default.html) · [Directory](12-riso-zine/pages/directory/default.html) · [Notes](12-riso-zine/README.md) |
| 13 | **Nordic** — Scandinavian calm: oat and birch neutrals, sage accent, soft rounded corners, small square photos, generous breathing room and slow, quiet micro-animations. | Warm whitespace · small photos · muted palette | [Home](13-nordic/pages/home/default.html) · [Directory](13-nordic/pages/directory/default.html) · [Notes](13-nordic/README.md) |
| 14 | **Neo Brutal** — Gumroad-style neo-brutalism: chunky black outlines, offset hard shadows, saturated pastel blocks, sticker badges and springy press animations. | Thick outlines · hard shadows · pastel · bounce | [Home](14-neo-brutal/pages/home/default.html) · [Directory](14-neo-brutal/pages/directory/default.html) · [Notes](14-neo-brutal/README.md) |
| 15 | **Glass Night** — Frosted-glass panels floating over slowly drifting colour blobs, backdrop blur, luminous borders and soft parallax. | Glassmorphism · gradient blobs · depth | [Home](15-glass-night/pages/home/default.html) · [Directory](15-glass-night/pages/directory/default.html) · [Notes](15-glass-night/README.md) |
| 16 | **Blueprint** — An architect's drawing set: cyan grid paper, white line drawings with dimension lines, monospace annotations and a title block — builders shown as a drawing schedule. | Grid-paper texture · line drawings · technical | [Home](16-blueprint/pages/home/default.html) · [Directory](16-blueprint/pages/directory/default.html) · [Notes](16-blueprint/README.md) |
| 17 | **Map First** — The GTA is the interface: a stylised map of Toronto and the lakeshore with clustered builder and event pins, and a split map/list directory. | Map illustration · neighbourhoods · real-time pins | [Home](17-map-first/pages/home/default.html) · [Directory](17-map-first/pages/directory/default.html) · [Notes](17-map-first/README.md) |
| 18 | **Bento** — Linear/Apple-style bento boxes: a modular grid of differently sized tiles, each telling one fact, with subtle gradients and hover lifts. | Bento tiles · hover micro-interactions · small photos | [Home](18-bento/pages/home/default.html) · [Directory](18-bento/pages/directory/default.html) · [Notes](18-bento/README.md) |
| 19 | **Web 95** — Mid-90s desktop web: bevelled windows, title bars, tiled backgrounds, pixel icons, a marquee, a guestbook and a hit counter that ticks up live. | Retro nostalgia · tiled textures · pixel art | [Home](19-web-95/pages/home/default.html) · [Directory](19-web-95/pages/directory/default.html) · [Notes](19-web-95/README.md) |
| 20 | **Console** — A power-user console: small type, tight leading, a command palette, keyboard shortcuts everywhere and a sortable 24-row table directory. No photos. | Maximum density · line-height 1.3 · keyboard-first | [Home](20-dense-console/pages/home/default.html) · [Directory](20-dense-console/pages/directory/default.html) · [Notes](20-dense-console/README.md) |
| 21 | **Warm Community** — People first: big warm candid photographs of real gatherings, earthy terracotta and cream, rounded photo cards like a home-sharing marketplace. | Large people photography · earthy palette · rounded | [Home](21-warm-community/pages/home/default.html) · [Directory](21-warm-community/pages/directory/default.html) · [Notes](21-warm-community/README.md) |
| 22 | **Kinetic** — Type that moves: scrolling marquees, letter-by-letter reveals, variable-weight hover, scroll-scaled headlines. Black, white and highlighter yellow. | Kinetic typography · marquees · variable fonts | [Home](22-kinetic-type/pages/home/default.html) · [Directory](22-kinetic-type/pages/directory/default.html) · [Notes](22-kinetic-type/README.md) |
| 23 | **Noir & Gold** — Black, ivory and gold leaf, high-contrast didone serif, sparse copy, large duotone photographs and long, slow fades. | Dark luxury · duotone photos · slow motion | [Home](23-noir-gold/pages/home/default.html) · [Directory](23-noir-gold/pages/directory/default.html) · [Notes](23-noir-gold/README.md) |
| 24 | **Sketchbook** — A founder's notebook: dot-grid paper, handwritten headings, marker highlights, doodled arrows and wobbly hand-drawn borders. | Hand-drawn · dot-grid paper · marker highlights | [Home](24-sketchbook/pages/home/default.html) · [Directory](24-sketchbook/pages/directory/default.html) · [Notes](24-sketchbook/README.md) |
| 25 | **Clay** — Puffy clay-like UI: inflated cards and buttons, layered soft shadows, pastel palette and squishy CSS-3D blob characters that bounce. | Claymorphism · soft 3D · pastel characters | [Home](25-clay/pages/home/default.html) · [Directory](25-clay/pages/directory/default.html) · [Notes](25-clay/README.md) |
| 26 | **The Banaro Courier** — A Toronto & GTA broadsheet: blackletter masthead, six-column dense text, rules, grayscale halftone photos and a classifieds-style builder directory. | Newspaper · very high text density · halftone | [Home](26-broadsheet/pages/home/default.html) · [Directory](26-broadsheet/pages/directory/default.html) · [Notes](26-broadsheet/README.md) |
| 27 | **Y2K Chrome** — Millennium optimism: liquid chrome type, iridescent holographic panels, bubble buttons, sparkles and a starfield. | Y2K · chrome gradients · holographic | [Home](27-y2k-chrome/pages/home/default.html) · [Directory](27-y2k-chrome/pages/directory/default.html) · [Notes](27-y2k-chrome/README.md) |
| 28 | **Monochrome Essay** — A photo essay: full-bleed black-and-white photographs, scroll-snap chapters, minimal serif captions and lots of darkness. | Black-and-white full-bleed photography · scroll-snap | [Home](28-mono-essay/pages/home/default.html) · [Directory](28-mono-essay/pages/directory/default.html) · [Notes](28-mono-essay/README.md) |
| 29 | **Isometric City** — An illustrated isometric Toronto where every building holds builders: tiny characters at windows, a streetcar, a CN Tower, and a directory of ‘addresses’. | Isometric illustration · saturated palette | [Home](29-isometric-city/pages/home/default.html) · [Directory](29-isometric-city/pages/directory/default.html) · [Notes](29-isometric-city/README.md) |
| 30 | **Plain & Clear** — GOV.UK-inspired clarity: 19px base, very high contrast, line-height 1.6, plain language, thick focus states, single column, zero decoration. | Accessibility-first · large type · no decoration | [Home](30-plain-clear/pages/home/default.html) · [Directory](30-plain-clear/pages/directory/default.html) · [Notes](30-plain-clear/README.md) |
| 31 | **Gradient Mesh** — Stripe-style polish: an animated mesh-gradient hero, slanted section edges, crisp product UI vignettes built in HTML and precise micro-copy. | Stripe-inspired · animated mesh · polished SaaS | [Home](31-gradient-mesh/pages/home/default.html) · [Directory](31-gradient-mesh/pages/directory/default.html) · [Notes](31-gradient-mesh/README.md) |
| 32 | **Chat Native** — Banaro as a conversation: the home page is a chat with the Banaro guide, the directory arrives as rich message cards with quick replies and a live typing indicator. | Conversational UI · real-time typing | [Home](32-chat-native/pages/home/default.html) · [Directory](32-chat-native/pages/directory/default.html) · [Notes](32-chat-native/README.md) |
| 33 | **Swipe Match** — Mobile-app matching: a photo card stack you swipe (or arrow-key) through for co-founders, with tilt, spring and stamp animations, and a grid toggle. | Card stack · gesture micro-animations · photos | [Home](33-swipe-match/pages/home/default.html) · [Directory](33-swipe-match/pages/directory/default.html) · [Notes](33-swipe-match/README.md) |
| 34 | **Kraft & Letterpress** — Crafted print: kraft and linen textures, debossed letterpress type, terracotta and olive inks, small taped polaroids and rubber stamps. | Kraft-paper texture · letterpress · polaroids | [Home](34-kraft-letterpress/pages/home/default.html) · [Directory](34-kraft-letterpress/pages/directory/default.html) · [Notes](34-kraft-letterpress/README.md) |
| 35 | **Scrollytelling** — A story told by scrolling: sticky scenes, parallax layers and illustrations that assemble as you scroll, driven by CSS scroll timelines. | Scroll-driven story · sticky scenes · parallax | [Home](35-scrollytelling/pages/home/default.html) · [Directory](35-scrollytelling/pages/directory/default.html) · [Notes](35-scrollytelling/README.md) |
| 36 | **Synthwave** — Retro-future neon: a perspective grid horizon, sunset gradient sun, glowing magenta/cyan type and scanlines; light theme is pastel daytime vaporwave. | Neon · perspective grid · glow | [Home](36-synthwave/pages/home/default.html) · [Directory](36-synthwave/pages/directory/default.html) · [Notes](36-synthwave/README.md) |
| 37 | **Bauhaus** — Bauhaus composition: red, yellow, blue and black circles, squares and triangles, bold geometric sans, asymmetric layouts; avatars are generated shapes. | Primary geometry · asymmetry · no photos | [Home](37-bauhaus/pages/home/default.html) · [Directory](37-bauhaus/pages/directory/default.html) · [Notes](37-bauhaus/README.md) |
| 38 | **Spatial** — Apple Vision Pro-style spatial UI: floating glass windows with depth over a blurred environment photo, ornaments, and pointer-tracked 3D tilt. | visionOS-inspired · depth · pointer parallax | [Home](38-spatial/pages/home/default.html) · [Directory](38-spatial/pages/directory/default.html) · [Notes](38-spatial/README.md) |
| 39 | **Scrapbook** — A community scrapbook: cut-out photos with white borders, washi tape, rotated stickers, doodles and handwritten notes on a cork-and-paper texture. | Collage · cut-out photos · stickers · tape | [Home](39-sticker-collage/pages/home/default.html) · [Directory](39-sticker-collage/pages/directory/default.html) · [Notes](39-sticker-collage/README.md) |
| 40 | **Soft Illustrated** — Headspace-like warmth: round, friendly flat characters (coding, praying, sharing coffee), pastel orange and sky, and gentle looping micro-animations. | Flat illustrated characters · pastel · gentle loops | [Home](40-soft-illustrated/pages/home/default.html) · [Directory](40-soft-illustrated/pages/directory/default.html) · [Notes](40-soft-illustrated/README.md) |
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
