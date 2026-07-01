#!/usr/bin/env bash
# Full Supabase setup: migrations + edge functions + secrets
#
# Required in .env:
#   SUPABASE_ACCESS_TOKEN=sbp_...     (Dashboard → Account → Access Tokens)
#   SUPABASE_DB_PASSWORD=...          (Dashboard → Settings → Database)
# Optional:
#   GEMINI_API_KEY=AIzaSy...          (server-side embeddings; falls back to EXPO_PUBLIC_GEMINI_API_KEY if AIza*)
#
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

PROJECT_REF="${SUPABASE_PROJECT_REF:-hsdfxbgwrmpszmrjqzel}"

if [ -z "${SUPABASE_ACCESS_TOKEN:-}" ]; then
  echo "❌ Falta SUPABASE_ACCESS_TOKEN en .env"
  echo "   Obtener en: https://supabase.com/dashboard/account/tokens"
  exit 1
fi

if [ -z "${SUPABASE_DB_PASSWORD:-}" ] && { [ -z "${SUPABASE_DB_URL:-}" ] || [[ "${SUPABASE_DB_URL:-}" == *YOUR_PASSWORD* ]]; }; then
  echo "❌ Falta SUPABASE_DB_PASSWORD en .env"
  echo "   Obtener en: Dashboard → Settings → Database → Database password"
  exit 1
fi

echo "══════════════════════════════════════════"
echo "  MineTrack — Supabase setup ($PROJECT_REF)"
echo "══════════════════════════════════════════"

echo ""
echo "→ Aplicando migraciones SQL..."
npm run db:migrate

echo ""
echo "→ Desplegando Edge Functions..."
node ./scripts/deploy-supabase-functions.js

echo ""
echo "✅ Setup completo."
echo "   Verifica: Dashboard → Edge Functions → process-embeddings, rag-query, on-event-created"
echo "   Tabla nueva: embedding_jobs (migración 008)"
