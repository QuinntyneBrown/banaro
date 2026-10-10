#!/usr/bin/env bash
# Creates backend/.env for CI from the example and generates an application key.
set -euo pipefail
cd "$(dirname "$0")/.."
[ -f backend/.env ] || cp backend/.env.example backend/.env
docker compose build api
docker compose run --rm --no-deps api composer install --no-interaction --prefer-dist
docker compose run --rm --no-deps api php artisan key:generate --force
