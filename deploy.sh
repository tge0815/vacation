#!/usr/bin/env bash
# Server-Deploy mit FERTIGEM Image aus der GitHub Container Registry (GHCR).
# Baut NICHTS selbst — zieht nur das in GitHub Actions gebaute Image.
#
#   git pull && ./deploy.sh
#
# Privates GHCR-Paket? Einmalig einloggen (PAT mit read:packages):
#   echo <PAT> | docker login ghcr.io -u <github-user> --password-stdin
# oder GHCR_USER + GHCR_TOKEN als Umgebungsvariablen setzen (dann loggt sich
# dieses Skript selbst ein).
set -euo pipefail
cd "$(dirname "$(readlink -f "$0")")"

G='\033[0;32m'; Y='\033[1;33m'; R='\033[0;31m'; B='\033[1;34m'; N='\033[0m'
log()  { printf "${G}→${N} %s\n" "$*"; }
warn() { printf "${Y}!${N} %s\n" "$*"; }
err()  { printf "${R}✗${N} %s\n" "$*" >&2; }
step() { printf "\n${B}■${N} ${B}%s${N}\n" "$*"; }

COMPOSE="docker compose -f docker-compose.prod.yml"
port_host() { local p; p="$(grep '^LEARN_PORT=' .env 2>/dev/null | cut -d= -f2- || true)"; echo "${p:-3001}"; }

# ──── Prereqs ─────────────────────────────────────────────────────────
command -v docker >/dev/null || { err "Docker fehlt."; exit 1; }
docker compose version >/dev/null 2>&1 || { err "docker-compose-Plugin fehlt."; exit 1; }

# ──── .env sicherstellen ──────────────────────────────────────────────
step "Konfiguration prüfen (.env)"
touch .env
gen_secret() { head -c 32 /dev/urandom | od -An -tx1 | tr -d ' \n'; }
ensure_env() { grep -q "^$1=" .env 2>/dev/null || { printf '%s=%s\n' "$1" "$2" >> .env; return 0; }; return 1; }

ensure_env LEARN_SESSION_SECRET "$(gen_secret)" && log "Session-Secret erzeugt (.env)" || true
if ensure_env LEARN_INVITE_CODE "$(gen_secret | cut -c1-8)"; then
  warn "Einladungscode erzeugt:"; printf "   ${B}%s${N}\n" "$(grep '^LEARN_INVITE_CODE=' .env | cut -d= -f2)"
fi
API_KEY_VAL="$(grep '^ANTHROPIC_API_KEY=' .env 2>/dev/null | cut -d= -f2- || true)"
if [ -z "$API_KEY_VAL" ] || [ "$API_KEY_VAL" = "sk-ant-..." ]; then
  if [ -n "${ANTHROPIC_API_KEY:-}" ]; then
    printf 'ANTHROPIC_API_KEY=%s\n' "$ANTHROPIC_API_KEY" >> .env; log "API-Key aus Umgebung übernommen"
  else
    printf "  Anthropic-API-Key (sk-ant-…): "; read -r K
    [ -n "$K" ] || { err "Kein API-Key. Trage ANTHROPIC_API_KEY in .env ein."; exit 1; }
    printf 'ANTHROPIC_API_KEY=%s\n' "$K" >> .env; log "API-Key gespeichert (.env)"
  fi
else
  log "API-Key vorhanden (.env)"
fi

PORT_HOST="$(port_host)"

# ──── Optionaler GHCR-Login (privates Paket) ──────────────────────────
if [ -n "${GHCR_USER:-}" ] && [ -n "${GHCR_TOKEN:-}" ]; then
  step "GHCR-Login"
  echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USER" --password-stdin && log "eingeloggt"
fi

# ──── Ziehen + Starten ────────────────────────────────────────────────
step "Image ziehen"
if ! $COMPOSE pull; then
  err "Pull fehlgeschlagen. Privates Paket? Dann einloggen:"
  echo "   echo <PAT> | docker login ghcr.io -u <github-user> --password-stdin"
  echo "   (PAT mit Scope read:packages) — oder das GHCR-Paket öffentlich schalten."
  exit 1
fi

step "Container starten"
$COMPOSE up -d
docker image prune -f >/dev/null 2>&1 || true

# ──── Warten + Status ─────────────────────────────────────────────────
step "Warte bis App antwortet (max. 60 s)"
for i in $(seq 1 60); do
  curl -fs http://localhost:${PORT_HOST}/login >/dev/null 2>&1 && { log "App erreichbar nach ${i} s"; break; }
  printf "."; sleep 1
done
echo
RESP=$(curl -fs --max-time 50 http://localhost:${PORT_HOST}/api/health 2>/dev/null || echo "")
echo "$RESP" | grep -q '"ok":true' && log "App läuft, API-Key konfiguriert" || warn "KI-Check: $RESP"

echo
$COMPOSE ps
printf "\n${G}✓ Deploy fertig.${N}  http://localhost:${PORT_HOST}\n"
