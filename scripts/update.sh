#!/usr/bin/env bash
# ── Zero-downtime rolling update ──────────────────────────────────────────────
# Run this after pushing new code to the server: sudo ./scripts/update.sh

set -euo pipefail

echo "📦 Pulling latest code…"
git pull origin main

echo "🔨 Rebuilding images…"
docker compose -f docker-compose.prod.yml build --no-cache backend frontend

echo "♻️  Rolling restart (no downtime)…"
docker compose -f docker-compose.prod.yml up -d --no-deps backend frontend

echo "🧹 Removing dangling images…"
docker image prune -f

echo "✅  Update complete."
docker compose -f docker-compose.prod.yml ps
