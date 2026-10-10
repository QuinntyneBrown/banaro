# Implementation decisions

The detailed designs leave some points as `<TO SUPPLY>`, and in places the spec, design and mock
disagree. While implementing, each such point is settled by one rule:

1. The L2 specification wins over the detailed design, and the design wins over the mock.
2. Where the specification is silent, the mock's copy and behaviour apply.
3. Where neither settles it, the safer option applies: less data collected or sent, tighter limits,
   no message to an address Banaro has not verified.

Each decision below names the open point, the decision and the rule that settled it. Review them;
a different answer becomes a requirement or design change and then a code change.

| # | Feature | Open point | Decision | Rule |
|---|---------|------------|----------|------|
| D-001 | localize-and-format | Home matching examples show "26.9 km" and "17.8 km" in the mock | Shown as "27 km" and "18 km": L2-052 criterion 3 drops the decimal from 10 km | 1 |
| D-002 | adapt-responsive-layout | Mock header "Join Banaro" (36 px) and brand link (32 px) are under 44 px | Below 576 px small buttons and the brand link are 44 px tall (L2-049 criterion 1) | 1 |
| D-003 | switch-theme | No mock for a visible theme switch | Only the `t` shortcut and the stored cookie ship; the switch waits for a mock | 1 |
| D-004 | about-and-contact | No faith-position section in the about mock | A "What we believe" section states the faith position in plain language; copy to review | 1 |
| D-005 | about-and-contact | Land acknowledgement only in the footer | Also shown on `/about` under "Where we are" | 1 |
| D-006 | view-privacy-policy | Mock lacks retention periods, processors, PIPEDA and a right of access | Added from L2: account data while open, erased within 30 days of deletion, sessions 30 days idle / 90 days absolute, logs 30 days; processors by category until vendors are chosen | 1, 3 |
| D-007 | view-privacy-policy | Privacy contact | `privacy@banaro.ca`, plus the contact page | 3 |
| D-008 | view-privacy-policy | "Stored on servers that we pay for and control" depends on unchosen vendors | Shortened to "Your data is stored in Canada." | 3 |
| D-009 | view-privacy-policy | Last updated date | 9 October 2026, the date this policy text was written | 2 |
| D-010 | about-and-contact | Contact topics differ between L2-040 and the mock | The L2 list: General, Partnership, Press, Report a problem, Propose an event | 1 |
| D-011 | about-and-contact | Mock success says "A copy is in your inbox" | No copy is sent: the form would otherwise e-mail unverified addresses | 3 |
| D-012 | about-and-contact | Is the name required, and how long | Required, at most 100 characters, as at join | 3 |
| D-013 | about-and-contact | Message length error copy | "Use at least 10 characters" and "Use 2,000 characters or fewer" | 2 |
| D-014 | about-and-contact | Team inbox | `BANARO_CONTACT_INBOX`, default `team@banaro.ca` | 3 |
| D-015 | about-and-contact | Store contact messages in the database | Not stored; they live only in the queued job and the team inbox | 3 |
| D-016 | handle-offline-and-maintenance | The maintenance page needs text, but the catalogue endpoint would answer 503 | `/api/v1/i18n/*` is exempt from maintenance mode, like `/health/*` | 3 |
| D-017 | handle-offline-and-maintenance | Laravel 11 does not record when maintenance began | `expectedBackAt` is the response time plus `--retry`, the moment `Retry-After` names | 3 |
| D-018 | verify-email | The design signs links with `token`, `expires` and `signature` | The link carries one 64-character random token; only its SHA-256 is stored, with the expiry and use beside it (ADR-0005). An altered token matches no row, which is the tampered-link case of L2-002 criterion 2 | 3 |
| D-019 | verify-email | L2-002 criterion 7 says `returnTo=/onboarding`; L2-006 and the mock manifest route onboarding at `/welcome` | "Set up your profile" returns to `/welcome`, the route L2-006 names | 1 |
| D-020 | verify-email | The success mock greets the member by first name, but the design's verify call answers 204 with no body | The success state reads "Thank you. Your account is ready…" without the name | 1 |
| D-021 | verify-email, recover-password | The pages verify a link and check a reset link during server-side rendering, which carries no CSRF token | `POST /api/v1/email/verify` and `POST /api/v1/reset-password/check` are exempt from CSRF checks: each authenticates by the link's secret token and reads or writes no session | 3 |
| D-022 | verify-email | L2-002 criterion 8 sends a link that names no account to sign-in, but the resend always answers 202 | The verify 422 carries `link_known`, which says only whether the link was ever issued; "Send a new link" resends with the token when it was, and goes to `/sign-in?returnTo=/verify-email` when it was not | 1 |
| D-023 | sign-in-and-sign-out | The new-sign-in e-mail should name the approximate city, which needs a geolocation service that has not been chosen | The e-mail names the time and the browser and no location; Banaro sends no address to a third party | 3 |
| D-024 | accept-code-of-conduct | L2-034 criterion 1 asks for a table of contents; the mock has none | An "On this page" list of the five sections sits above the text; each entry jumps to its section | 1 |
| D-025 | accept-code-of-conduct | The mock dates the code of conduct 1 September 2026; the configured version was `2026-10-01` | The version is `2026-09-01`, the date the page shows, so members accept the version they read | 2 |
| D-026 | complete-onboarding | The authoritative GTA neighbourhood list; the onboarding and profile-edit mocks differ, and onboarding offers "Other GTA" | 21 named places from the mocks and the cast, each with a centroid and one of the directory's filter areas (old City of Toronto neighbourhoods under "Downtown Toronto"). "Other GTA" is dropped: it has no centroid, so no distance could be shown | 1, 3 |
| D-027 | complete-onboarding | L2-006 allows 12 skills; the skills mock says "Choose up to ten". The catalogue's contents | 12, as L2-006 says. The catalogue is the twelve "Popular skills" of the directory mock; custom skills stay outside it | 1, 2 |
| D-028 | complete-onboarding | The about step offers "Skip for now", but L2-006 criterion 4 makes role and neighbourhood required | No "Skip for now" | 1 |
| D-029 | complete-onboarding | L2-006 criterion 5 lands the member on the dashboard; the success mock shows next steps with a dashboard action | The success state shows, with "Go to your dashboard" one action away, as the design reads the criterion | 2 |
| D-030 | complete-onboarding | Whether skills and goals need a selection; maximum lengths | Both steps may be left empty. Name 100 characters (as at join), a custom skill 40, "What are you building?" 280 | 3 |
| D-031 | complete-onboarding | Source of the personalised hints on the success state | Generic next steps (browse builders, share a project, see events) with no member data until the directory and events exist | 3 |
| D-032 | edit-own-profile | Maximum lengths and counts; the mock shows neither experience nor links | Headline 80 characters; up to 10 experience entries (role and organisation 100 each, a start date, an optional end date not before it); up to 5 links (name 60, an `http` or `https` address); "What I am looking for" 400. Experience and links sit in their own form sections after "Open to" | 3 |
| D-033 | edit-own-profile | Bio limit: L2-007 allows 500 characters, the mock counter says 400 | 500, with the mock's wording: "Your bio is N characters. Shorten it to 500 or fewer." | 1 |
| D-034 | edit-own-profile | Whether "Open to" needs a value; L2-007 is silent and the invalid mock asks for at least one | At least one, with the mock's message. Onboarding, whose mock asks for none, stays optional | 2 |
| D-035 | edit-own-profile | "Who can see my profile" in the mock; L2-036 names different options | Left to the privacy controls in settings (L2-036), where the requirement puts it | 1 |
| D-036 | edit-own-profile | The design links "the product they are building" to a project, but projects do not exist yet | "What are you building?" stays the text from onboarding until projects arrive | 3 |
