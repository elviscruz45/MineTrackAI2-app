#!/usr/bin/env bash
# Deploy MineTrack Edge Functions to Supabase project hsdfxbgwrmpszmrjqzel
#
# Prerequisites:
#   npx supabase login
#   OR: export SUPABASE_ACCESS_TOKEN=sbp_...
#
set -euo pipefail
PROJECT_REF="${SUPABASE_PROJECT_REF:-hsdfxbgwrmpszmrjqzel}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

cd "$ROOT"

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

if [ -n "${SUPABASE_ACCESS_TOKEN:-}" ]; then
  npx supabase login --token "$SUPABASE_ACCESS_TOKEN"
fi

echo "→ Linking project $PROJECT_REF..."
npx supabase link --project-ref "$PROJECT_REF" 2>/dev/null || true

echo "→ Deploying on-event-created..."
npx supabase functions deploy on-event-created --project-ref "$PROJECT_REF"

echo "→ Deploying rag-query..."
npx supabase functions deploy rag-query --project-ref "$PROJECT_REF"

echo "→ Deploying process-embeddings..."
npx supabase functions deploy process-embeddings --project-ref "$PROJECT_REF"

echo "Done. Check Dashboard → Edge Functions"
