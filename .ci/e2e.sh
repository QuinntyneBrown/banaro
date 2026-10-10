#!/usr/bin/env bash
# Playwright acceptance tests in Chromium against the API in Docker Compose.
set -euo pipefail
cd "$(dirname "$0")/.."
docker compose up -d --wait api
docker compose run --rm api php artisan migrate --force --seed
(cd frontend && npm ci)
cd e2e
npm ci
npx playwright install --with-deps chromium
npx playwright test
