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
