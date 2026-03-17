#!/bin/sh
set -e
mkdir -p "$(dirname "${DB_URL:-sqlite.db}")"
echo "--- Running migrations ---"
bun scripts/migrate.ts
echo "--- Starting app ---"
exec bun run src/main.ts
