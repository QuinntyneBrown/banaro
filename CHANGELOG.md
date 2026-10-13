# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and
this project will adhere to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
from its first release.

## [Unreleased]

### Changed

- The backend is a Next.js API and BullMQ worker on Node 22 with Drizzle on PostgreSQL,
  replacing Laravel. The HTTP contract, the database schema and the Redis layout are
  unchanged, so Banaro Web and the e2e fixtures work as before (ADR-0007 to ADR-0011).
- Backend commands run as `npm run banaro -- <command>` in the `api` container:
  `migrate`, `seed`, `i18n:check`, `queue:work`, `maintenance:on`, `maintenance:off` and
  `bcrypt`.

### Added

- Agent guidance in `AGENTS.md` and the skills in `.claude/skills/` and
  `.agents/skills/`.
- Empty `docs/` folders for requirements, detailed designs, mocks, the design system
  and architecture decision records.
- Empty Angular 22 workspace in `frontend/` with the `banaro` (SSR), `admin` and
  `perf-test` applications and the `components` and `api` libraries, angular-eslint,
  Prettier, and a husky pre-commit hook that fixes staged frontend files.
- README, MIT license, contributing guide, code of conduct, security policy, support
  guide, changelog and GitHub issue and pull request templates.

[Unreleased]: https://github.com/QuinntyneBrown/banaro/commits/main
