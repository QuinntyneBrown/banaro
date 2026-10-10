#!/usr/bin/env bash
# Component perf test: builds this branch and the base branch with NG_BUILD_MANGLE=0 and fails
# on a possible regression unless a maintainer added the perf-regression-accepted label.
set -euo pipefail
BASE_REF="${1:?base branch ref}"
cd "$(dirname "$0")/.."
ROOT="$PWD"

(cd frontend && npm ci && NG_BUILD_MANGLE=0 npx ng build perf-test --output-path "$ROOT/.perf/current")

git worktree add --force "$ROOT/.perf/base-src" "$BASE_REF"
(cd .perf/base-src/frontend && npm ci && NG_BUILD_MANGLE=0 npx ng build perf-test --output-path "$ROOT/.perf/base")

FLAGS=(--current "$ROOT/.perf/current/browser" --baseline "$ROOT/.perf/base/browser")
if [ "${PERF_REGRESSION_ACCEPTED:-false}" != "true" ]; then FLAGS+=(--fail-on-regression); fi

cd e2e
npm ci
npx playwright install --with-deps chromium
npm run perf-test -- "${FLAGS[@]}"
