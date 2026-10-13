#!/usr/bin/env bash
# Builds the banaro-api dev image and installs the backend's dependencies in it (ADR-0002).
set -euo pipefail
cd "$(dirname "$0")/.."
[ -f backend/.env ] || cp backend/.env.example backend/.env
docker compose build api
docker compose run --rm --no-deps api npm ci
