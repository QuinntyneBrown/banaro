# Iteration 1 — Traceability and route consistency

## Method

Wrote a throw-away script that parsed `docs/specs/L1.md`, `L2.md`, every `docs/detailed-designs/*/*/README.md`,
`docs/mocks/manifest.json`, the mock HTML and the design system CSS, and cross-checked identifiers, routes,
states, CSS classes, and custom properties. Re-ran `check_mocks.py` and `check_design_system.py`.

## Findings

| # | Gap | Artifacts | Resolution |
|---|-----|-----------|------------|
| 1.1 | No mock traced to a requirement: `manifest.json` carried no `requirements`, no mock had `mock:requirements`, and the coverage matrix "Requirements" column was empty. | mocks ↔ specs | Added `requirements` (L2 IDs) to all 49 screens and a `mock:requirements` meta to all 196 mock files; regenerated the README coverage matrix and `index.html`. |
| 1.2 | Dashboard route: manifest `/home`, L2-030 and the design `/dashboard`. | mocks ↔ specs ↔ DD | Manifest now `/dashboard`; design open point closed. |
| 1.3 | Profile edit route: manifest `/me/edit`, L2-007 `/profile/edit`. | mocks ↔ specs ↔ DD | Manifest now `/profile/edit`; design open point closed. |
| 1.4 | Manifest routes were sample data (`/builders/daniel-reyes`, `/projects/psalter`, `/projects/harvest/edit`, `/events/fall-demo-night`) while the spec uses patterns. | mocks ↔ specs | Manifest uses `/builders/{id}`, `/projects/{id}`, `/projects/{id}/edit`, `/events/{id}`. |
| 1.5 | Routes of `verify-email`, `reset-password`, `not-found`, `forbidden`, `server-error`, `offline`, `maintenance` were only in the manifest, not in L2. | specs ↔ mocks | L2-002, L2-004, L2-042 and L2-043 now name `/verify-email`, `/reset-password`, `/404`, `/403`, `/500`, `/offline`, `/maintenance`. |
| 1.6 | The `/admin` area (L2-033 moderation) has no mock. | specs ↔ mocks ↔ DD | Logged for iteration 9. |
| 1.7 | 426 `<TO SUPPLY>` open points across 55 detailed designs. Each marks a place where the spec, design and mock disagree or the spec is silent. | all | Triaged by subsystem into iterations 2–9. |

## Verification

- `check_mocks.py docs/mocks --write`: 49 screens, 196 mocks, 0 errors, 0 warnings.
- Cross-check: every L1 has an L2; every L2 has a design; every design cites existing L2 IDs; every
  manifest route is a pattern named in L2.
