#!/usr/bin/env bash
# Format, lint and build every project in the Angular workspace.
set -euo pipefail
cd "$(dirname "$0")/../frontend"
npm ci
npm run format:check
npm run lint
npx ng build banaro
npx ng build admin
npx ng build perf-test
