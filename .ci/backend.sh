#!/usr/bin/env bash
# Lint, audit, translation check and integration tests for the Banaro API.
set -euo pipefail
cd "$(dirname "$0")/.."
run() { docker compose run --rm api "$@"; }
run ./vendor/bin/pint --test
# Accepted advisories are listed in composer.json audit.ignore (ADR-0005); any other fails.
run composer audit
run php artisan i18n:check --frontend=/frontend
run php artisan test
