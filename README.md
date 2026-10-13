# Banaro

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Status: design phase](https://img.shields.io/badge/status-design%20phase-lightgrey.svg)](#project-status)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)

**Banaro connects Christian product builders in Toronto and the Greater Toronto
Area.**

Founders, engineers, designers and product managers find other believers who build
products near them. They show what they are working on, meet in person at local
events, and find a co-founder or collaborator for a faith-aligned venture. Banaro is
deliberately small and local, built for the Toronto community of Christian builders.

- [Project status](#project-status)
- [Features](#features)
- [Architecture](#architecture)
- [Repository layout](#repository-layout)
- [Getting started](#getting-started)
- [How we build](#how-we-build)
- [Contributing](#contributing)
- [Code of conduct](#code-of-conduct)
- [Security](#security)
- [Support](#support)
- [License](#license)

## Project status

Banaro is **in development**. The requirements, detailed designs, mocks and design
system are written, and features land one thin vertical slice at a time. The backend
is being moved from Laravel to Next.js on Node (ADR-0007).

| Artifact | Location | Status |
|---|---|---|
| High-level requirements (L1) | `docs/specs/L1.md` | Written |
| Detailed requirements with acceptance criteria (L2) | `docs/specs/L2.md` | Written |
| Detailed designs (C4, class and sequence diagrams) | `docs/detailed-designs/` | Written |
| HTML mocks for every page, dialog and state | `docs/mocks/` | Written |
| Design system (tokens, components, patterns) | `docs/design-system/` | Written |
| Next.js API, worker and scheduler | `backend/` | In progress: port from Laravel |
| Angular web app | [`frontend/`](frontend/README.md) | In progress |
| Playwright end-to-end suite | `e2e/` | In progress |

APIs, folder names and behaviour can change without notice until the first release.

## Features

The requirements will set the scope. This is the intent they start from.

**For builders**

- **Builder directory.** Create a profile with your role, skills, experience, church
  and neighbourhood, and find other builders across Toronto and the GTA.
- **Project showcase.** Share a product you are building, ask for feedback, and say
  what kind of help you need.
- **Co-founder and collaborator matching.** Find a co-founder, an advisor or a
  contributor whose skills and calling fit your venture.

**For event hosts**

- **Meetups and events.** Post local gatherings, such as demo nights, prayer
  breakfasts and build sessions, and let builders RSVP.

**For the Banaro team**

- Moderate profiles, projects and events, keep the community local and safe, and
  audit what happened.

**Across the platform**

- Light and dark themes that both conform to WCAG 2.2 Level AA.
- Responsive layouts from small phones to large desktops.
- Dates, times and distances formatted for Ontario.
- Handling of personal information in line with Canadian privacy and anti-spam law,
  with data hosted in Canada.

## Architecture

| Container | Technology | Responsibility |
|---|---|---|
| Banaro Web | Angular with server-side rendering | The builder, event host and admin user interface |
| Banaro API | Next.js 16 on Node 22, TypeScript, Drizzle ORM | REST API; owns persistence, matching, events and authentication |
| Banaro Worker | BullMQ worker and scheduler on Node 22 | Email, event reminders, match suggestions and other background jobs |
| Database | PostgreSQL 16 | System of record |
| Cache | Redis | Sessions, cached profiles and search results, rate limits |
| Object storage | Object storage behind a CDN | Builder avatars and project images |

All containers will be hosted in Canadian regions. Each feature's design in
`docs/detailed-designs/` will have C4 context, container and component diagrams for
its slice of this system.

## Repository layout

```text
.
├── docs/
│   ├── specs/              # L1 high-level and L2 detailed requirements
│   ├── detailed-designs/   # One design per vertical feature, with PlantUML diagrams
│   ├── mocks/              # Static HTML design reference, light and dark
│   ├── design-system/      # Tokens, foundations, components and patterns
│   └── adr/                # Architecture decision records
├── backend/                # Next.js API, worker and scheduler (Banaro API and Worker)
├── frontend/               # Angular workspace (Banaro Web)
├── e2e/                    # Playwright end-to-end, accessibility and visual tests
├── .claude/skills/         # Agent skills used to build this repository
├── .agents/skills/         # The same skills for other coding agents
├── AGENTS.md               # Conventions for humans and coding agents
├── CONTRIBUTING.md         # How to propose and make changes
└── README.md
```

## Getting started

### Prerequisites

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) `^22.22.3`, `^24.15.0` or `>=26`, as required by Angular 22
- [Docker](https://www.docker.com/) with Docker Compose, for the backend, PostgreSQL,
  Redis and Mailpit
- A modern browser

### Run the API

```sh
docker compose up -d --wait api worker
docker compose run --rm api npm run banaro -- migrate --seed   # migrations never run on start
docker compose run --rm api npm test                           # backend integration tests
```

The API listens on http://localhost:8100 and Mailpit on http://localhost:8025.

### Run the web app

```sh
git clone https://github.com/QuinntyneBrown/banaro.git
cd banaro/frontend

npm install   # also installs the husky pre-commit hook at the repository root
npm start     # serves the banaro application at http://localhost:4200/
```

See [`frontend/README.md`](frontend/README.md) for the other commands.

## How we build

Every change to production behaviour follows the same path:

1. **Requirement.** Add or update L1 and L2 requirements in `docs/specs/`.
2. **Detailed design.** Add or update the feature's design in `docs/detailed-designs/`.
3. **Mock.** Add or update every affected page and state in `docs/mocks/`.
4. **Acceptance tests first.** Write Given-When-Then criteria and a failing acceptance
   test: an API integration test for the backend, or a Playwright test using the Page
   Object Model for the frontend.
5. **Implement in thin slices.** Write only the code that makes that slice's test pass,
   refactor with the tests green, then move to the next slice.

[`AGENTS.md`](AGENTS.md) holds the backend, frontend and end-to-end conventions.
[`CONTRIBUTING.md`](CONTRIBUTING.md) explains how to propose and submit a change.

## Contributing

Contributions are welcome. Read the [contributing guide](CONTRIBUTING.md) before you
open an issue or a pull request. It covers the development workflow, commit message
format and review process.

Good places to start:

- Help shape the requirements: open a **Feature request** describing a need you have
  as a builder or event host in the GTA.
- Pick up an issue labelled `good first issue`.

## Code of conduct

This project has adopted the [Contributor Covenant](CODE_OF_CONDUCT.md). By taking part
you agree to uphold it.

## Security

Do not report security vulnerabilities through public GitHub issues. Follow the
process in [SECURITY.md](SECURITY.md).

## Support

See [SUPPORT.md](SUPPORT.md) for how to ask questions and get help.

## License

Copyright (c) 2026 Quinntyne Brown.

Licensed under the [MIT License](LICENSE).
