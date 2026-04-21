#!/bin/bash
# sync-test-db.sh
# Applies all migration files from supabase/migrations/ to the test Supabase project
# using the Supabase Management API.
#
# Usage:
#   ./scripts/sync-test-db.sh
#
# Prerequisites:
#   - SUPABASE_ACCESS_TOKEN env var (get from https://supabase.com/dashboard/account/tokens)
#   - curl and jq installed

set -euo pipefail

TEST_PROJECT_ID="jzrbggszdoskeuzoyuyk"
PROD_PROJECT_ID="ktuzzygtknginlzgksrj"
MIGRATIONS_DIR="supabase/migrations"

# Check for access token
if [ -z "${SUPABASE_ACCESS_TOKEN:-}" ]; then
  echo "Error: SUPABASE_ACCESS_TOKEN env var is required."
  echo "Get one from: https://supabase.com/dashboard/account/tokens"
  exit 1
fi

# Check migrations directory
if [ ! -d "$MIGRATIONS_DIR" ]; then
  echo "Error: $MIGRATIONS_DIR directory not found. Run from project root."
  exit 1
fi

# Get list of already-applied migrations on test DB
echo "Checking applied migrations on test project..."
APPLIED=$(curl -s \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  "https://api.supabase.com/v1/projects/$TEST_PROJECT_ID/database/migrations" \
  | jq -r '.[].version // empty' 2>/dev/null || echo "")

# Apply each migration file
APPLIED_COUNT=0
SKIPPED_COUNT=0

for file in $(ls "$MIGRATIONS_DIR"/*.sql 2>/dev/null | sort); do
  filename=$(basename "$file")
  # Extract version from filename (e.g., 20260416000001 from 20260416000001_description.sql)
  version=$(echo "$filename" | grep -oP '^\d+')

  if echo "$APPLIED" | grep -q "^${version}$"; then
    echo "  SKIP: $filename (already applied)"
    SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
    continue
  fi

  echo "  APPLYING: $filename..."

  SQL_CONTENT=$(cat "$file")

  # Use the SQL execution endpoint
  RESPONSE=$(curl -s -w "\n%{http_code}" \
    -X POST \
    -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    "https://api.supabase.com/v1/projects/$TEST_PROJECT_ID/database/query" \
    -d "$(jq -n --arg sql "$SQL_CONTENT" '{query: $sql}')")

  HTTP_CODE=$(echo "$RESPONSE" | tail -1)
  BODY=$(echo "$RESPONSE" | sed '$d')

  if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
    echo "    OK"
    APPLIED_COUNT=$((APPLIED_COUNT + 1))
  else
    echo "    FAILED (HTTP $HTTP_CODE): $BODY"
    echo ""
    echo "You can also apply migrations via Claude Code using:"
    echo "  mcp__supabase__apply_migration with project_id=$TEST_PROJECT_ID"
    exit 1
  fi
done

echo ""
echo "Done! Applied: $APPLIED_COUNT, Skipped: $SKIPPED_COUNT"
echo ""
echo "Tip: You can also apply migrations interactively via Claude Code:"
echo "  Just ask: 'apply migration X to the test DB'"
