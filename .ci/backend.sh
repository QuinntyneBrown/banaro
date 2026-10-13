#!/usr/bin/env bash
# Format, lint, types, dependency audit and integration tests for the Banaro API.
set -euo pipefail
cd "$(dirname "$0")/.."
run() { docker compose run --rm api "$@"; }
run npm run format:check
run npm run lint
run npm run typecheck
run npm audit --audit-level=high
run npm run banaro -- i18n:check --frontend=/frontend
run npm test
