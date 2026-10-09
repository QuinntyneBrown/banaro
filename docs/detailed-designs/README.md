# Banaro detailed designs

## Overview

This tree holds one detailed design per feature of Banaro. Banaro connects Christian product builders
in Toronto and the Greater Toronto Area (GTA). Each design refines level-2 (L2) requirements from
[`docs/specs/L2.md`](../specs/L2.md). Each L2 requirement in turn refines a level-1 (L1) requirement
from [`docs/specs/L1.md`](../specs/L1.md).

The tree has a fixed shape:

```text
docs/detailed-designs/
└── {subsystem}/
    └── {feature}/
        ├── README.md          detailed design
        └── diagrams/          PlantUML sources (*.puml) and rendered images (*.png)
```

Each `README.md` has four sections: Overview, Description, Requirements and Diagrams. The Requirements
section lists L2 requirements only, each with the L1 requirement it refines. The specification
statements use "must"; the designs restate them with "shall" without changing their meaning.

## Architecture baseline

Every feature design shares the architecture below. A feature diagram shows only the parts that the
feature touches.

### People

- **visitor** — person using Banaro without signing in
- **member** — signed-in builder whose e-mail address is verified
- **administrator** — member who holds the administrator role and moderates the community

### Containers

| Container | Technology | Responsibility |
|-----------|------------|----------------|
| Banaro Web | Angular workspace, server-side rendering (SSR), `banaro-web` image | Serves the `banaro` application (public site and member areas) and the `admin` application under `/admin`. |
| Banaro API | Laravel 11 on PHP 8.3, `banaro-api` image | Exposes `/api/v1`. It owns authentication, validation, persistence, matching and events. |
| Banaro Worker | Laravel Horizon and the Laravel scheduler, `banaro-api` image | Runs queued jobs (e-mail, media scanning, waitlist promotion) and scheduled commands (Monday matching, event reminders, weekly digests). |
| Banaro database | Relational database; engine `<TO SUPPLY>` | Holds accounts, profiles, projects, events, matches, messages, notifications, reports and audit entries. |
| Redis | Redis | Holds sessions, cache entries, rate-limit counters and the Horizon queues. |
| Media storage | Private file storage outside the web root; provider `<TO SUPPLY>` | Holds profile photos under random names. |

### External systems

- **Mail provider** — transactional e-mail service behind the `Mailer` contract; vendor `<TO SUPPLY>`
- **Media scanner** — malware-scanning service behind the `MediaScanner` contract; vendor `<TO SUPPLY>`
- **Map service** — public map site that the event page links to; Banaro sends it no data

### Authentication

The browser holds one Laravel session cookie (`HttpOnly`, `Secure`, `SameSite=Lax`) and a CSRF token.
Laravel Sanctum authenticates the Banaro Web applications as first-party, stateful clients. Every route
in `routes/api.php` requires an authenticated session. Routes in `routes/api_public.php` are the
deliberate anonymous exceptions.

### Naming

Subsystem folders in this tree map to code folders by name: `trust-and-safety` becomes
`TrustAndSafety` in PHP namespaces.

| Layer | Location | Naming |
|-------|----------|--------|
| Page | `frontend/projects/banaro/src/app/pages/{mock-page}/` | Class `{Name}Page`, selector `bn-{name}-page` |
| Dialog | `frontend/projects/banaro/src/app/dialogs/{mock-dialog}/` | Class `{Name}Dialog`, opened through CDK `Dialog` |
| Shared component | `frontend/projects/components/src/lib/{component}/` | Class `{Name}`, selector `bn-{name}` |
| API contract | `frontend/projects/api/src/lib/services/` | Interface `{Subsystem}Api`, token `{SUBSYSTEM}_API`, class `Http{Subsystem}Api` |
| API fake | `frontend/projects/api/src/lib/testing/` | Class `InMemory{Subsystem}Api` |
| Controller | `backend/app/Http/Controllers/Api/V1/{Subsystem}/` | `{Noun}Controller`; validates, calls one action, returns a resource |
| Form request | `backend/app/Http/Requests/{Subsystem}/` | `{Verb}{Noun}Request` |
| Action | `backend/app/Actions/{Subsystem}/` | `{Verb}{Noun}`, single public `handle()` method |
| Domain service | `backend/app/Services/{Subsystem}/` | `{Noun}Service` |
| Job | `backend/app/Jobs/{Subsystem}/` | `{Verb}{Noun}` |
| Resource | `backend/app/Http/Resources/{Subsystem}/` | `{Noun}Resource` |
| Policy | `backend/app/Policies/` | `{Model}Policy` |
| Model | `backend/app/Models/` | Singular noun; `User` holds credentials, `Builder` holds the public profile |

PHP 8 reserves the word `match`. The matching model is therefore `MatchSuggestion`, not `Match`.

### Diagram conventions

Each feature folder holds the same diagram set:

- `c4-context.puml` — people and systems around Banaro for the feature
- `c4-container.puml` — Banaro containers the feature uses
- `c4-component.puml` — components inside the container that carries the feature logic
- `class-structure.puml` — types, fields, methods and relationships
- `sequence-{behaviour}.puml` — one sequence per behaviour, with Frontend and Backend boxes

Each `.puml` has a rendered `.png` sibling. Render the tree with the
`writing-software-design-documents` skill script `scripts/render_puml.py`.

## Subsystems and features

| Subsystem | Feature | L2 requirements |
|-----------|---------|-----------------|
| `identity` | [`join-banaro`](identity/join-banaro/README.md) | `L2-001` |
| `identity` | [`verify-email`](identity/verify-email/README.md) | `L2-002` |
| `identity` | [`sign-in-and-sign-out`](identity/sign-in-and-sign-out/README.md) | `L2-003` |
| `identity` | [`recover-password`](identity/recover-password/README.md) | `L2-004` |
| `identity` | [`recover-expired-session`](identity/recover-expired-session/README.md) | `L2-005` |
| `profiles` | [`complete-onboarding`](profiles/complete-onboarding/README.md) | `L2-006` |
| `profiles` | [`edit-own-profile`](profiles/edit-own-profile/README.md) | `L2-007` |
| `profiles` | [`change-profile-photo`](profiles/change-profile-photo/README.md) | `L2-008` |
| `directory` | [`browse-directory`](directory/browse-directory/README.md) | `L2-009` |
| `directory` | [`filter-directory`](directory/filter-directory/README.md) | `L2-010` |
| `directory` | [`view-builder-profile`](directory/view-builder-profile/README.md) | `L2-011` |
| `projects` | [`share-project`](projects/share-project/README.md) | `L2-012` |
| `projects` | [`view-project`](projects/view-project/README.md) | `L2-013` |
| `projects` | [`edit-and-delete-project`](projects/edit-and-delete-project/README.md) | `L2-014` |
| `projects` | [`browse-projects`](projects/browse-projects/README.md) | `L2-015` |
| `projects` | [`give-feedback`](projects/give-feedback/README.md) | `L2-016` |
| `projects` | [`offer-to-help`](projects/offer-to-help/README.md) | `L2-017` |
| `events` | [`browse-events`](events/browse-events/README.md) | `L2-018` |
| `events` | [`view-event`](events/view-event/README.md) | `L2-019` |
| `events` | [`rsvp-to-event`](events/rsvp-to-event/README.md) | `L2-020` |
| `matching` | [`set-up-matching`](matching/set-up-matching/README.md) | `L2-021` |
| `matching` | [`generate-weekly-suggestions`](matching/generate-weekly-suggestions/README.md) | `L2-022` |
| `matching` | [`review-matches`](matching/review-matches/README.md) | `L2-023` |
| `matching` | [`pass-on-suggestion`](matching/pass-on-suggestion/README.md) | `L2-024` |
| `matching` | [`pause-and-resume-matching`](matching/pause-and-resume-matching/README.md) | `L2-025` |
| `messaging` | [`say-hello`](messaging/say-hello/README.md) | `L2-026` |
| `messaging` | [`hold-conversations`](messaging/hold-conversations/README.md) | `L2-026` |
| `notifications` | [`in-app-notifications`](notifications/in-app-notifications/README.md) | `L2-027` |
| `notifications` | [`system-notifications`](notifications/system-notifications/README.md) | `L2-028` |
| `notifications` | [`email-notifications`](notifications/email-notifications/README.md) | `L2-029` |
| `dashboard` | [`view-dashboard`](dashboard/view-dashboard/README.md) | `L2-030` |
| `trust-and-safety` | [`report-content`](trust-and-safety/report-content/README.md) | `L2-031` |
| `trust-and-safety` | [`block-builder`](trust-and-safety/block-builder/README.md) | `L2-032` |
| `trust-and-safety` | [`moderate-reports`](trust-and-safety/moderate-reports/README.md) | `L2-033` |
| `trust-and-safety` | [`accept-code-of-conduct`](trust-and-safety/accept-code-of-conduct/README.md) | `L2-034` |
| `settings` | [`manage-account-settings`](settings/manage-account-settings/README.md) | `L2-035` |
| `settings` | [`control-privacy`](settings/control-privacy/README.md) | `L2-036` |
| `settings` | [`manage-email-preferences`](settings/manage-email-preferences/README.md) | `L2-037` |
| `settings` | [`delete-account`](settings/delete-account/README.md) | `L2-038` |
| `public-site` | [`view-home-page`](public-site/view-home-page/README.md) | `L2-039` |
| `public-site` | [`about-and-contact`](public-site/about-and-contact/README.md) | `L2-040` |
| `public-site` | [`view-privacy-policy`](public-site/view-privacy-policy/README.md) | `L2-041` |
| `resilience` | [`show-error-pages`](resilience/show-error-pages/README.md) | `L2-042` |
| `resilience` | [`handle-offline-and-maintenance`](resilience/handle-offline-and-maintenance/README.md) | `L2-043` |
| `security` | [`scope-data-access`](security/scope-data-access/README.md) | `L2-044` |
| `security` | [`validate-input-and-harden-transport`](security/validate-input-and-harden-transport/README.md) | `L2-045` |
| `security` | [`limit-request-rates`](security/limit-request-rates/README.md) | `L2-046` |
| `performance` | [`meet-response-time-budgets`](performance/meet-response-time-budgets/README.md) | `L2-047` |
| `performance` | [`meet-page-performance-budgets`](performance/meet-page-performance-budgets/README.md) | `L2-048` |
| `user-experience` | [`adapt-responsive-layout`](user-experience/adapt-responsive-layout/README.md) | `L2-049` |
| `user-experience` | [`meet-accessibility-standards`](user-experience/meet-accessibility-standards/README.md) | `L2-050` |
| `user-experience` | [`switch-theme`](user-experience/switch-theme/README.md) | `L2-051` |
| `user-experience` | [`localize-and-format`](user-experience/localize-and-format/README.md) | `L2-052` |
| `operations` | [`observe-health`](operations/observe-health/README.md) | `L2-053` |
| `operations` | [`deploy-and-operate-data`](operations/deploy-and-operate-data/README.md) | `L2-054` |
