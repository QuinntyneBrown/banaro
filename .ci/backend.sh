#!/usr/bin/env bash
# Translation check and integration tests for the Banaro API.
set -euo pipefail
cd "$(dirname "$0")/.."
run() { docker compose run --rm api "$@"; }
run npm run banaro -- i18n:check --frontend=/frontend
run npm test
