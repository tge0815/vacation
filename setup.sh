#!/usr/bin/env bash
# Ferien-Lerncoach — One-Shot-Setup.
#
# Die KI laeuft ueber die Anthropic-API mit einem API-Key (Pay-per-Token).
#
# Macht alles:
#   - prueft Docker
#   - legt .env an (API-Key, Session-Secret, Einladungscode)
#   - baut & startet den Container
#   - prueft, ob die KI erreichbar ist
#
# Idempotent: zweiter Aufruf = git pull + Rebuild.
#
set -euo pipefail
cd "$(dirname "$(readlink -f "$0")")"

# ──── Helfer ───────────────────────────────────────────────────────────
G='\033[0;32m'; Y='\033[1;33m'; R='\033[0;31m'; B='\033[1;34m'; N='\033[0m'
log()  { printf "${G}→${N} %s\n" "$*"; }
warn() { printf "${Y}!${N} %s\n" "$*"; }
err()  { printf "${R}✗${N} %s\n" "$*" >&2; }
step() { printf "\n${B}■${N} ${B}%s${N}\n" "$*"; }

# ──── 1. Prereq-Check ─────────────────────────────────────────────────
step "Voraussetzungen prüfen"
if ! command -v docker &>/dev/null; then
  err "Docker fehlt. Install: https://docs.docker.com/engine/install/"
  exit 1
fi
if ! docker compose version &>/dev/null 2>&1; then
  err "docker-compose-Plugin fehlt (Docker v2+)."
  exit 1
fi
if ! docker info &>/dev/null; then
  err "Kein Docker-Zugriff. Bist du in der docker-Gruppe? (sudo usermod -aG docker \$USER && neu einloggen)"
  exit 1
fi
log "Docker $(docker --version | awk '{print $3}' | tr -d ',') ok"

# ──── 2. Git pull (falls Repo) ────────────────────────────────────────
if [ -d .git ] && git remote -v | grep -q .; then
  step "Repo aktualisieren"
  if git diff --quiet && git diff --cached --quiet; then
    git pull --ff-only 2>/dev/null && log "Auf neuestem Stand" || warn "git pull fehlgeschlagen (lokale Commits?), fahre fort"
  else
    warn "Uncommittete Änderungen — überspringe git pull"
  fi
fi

# ──── 3. Dev-Server stoppen ───────────────────────────────────────────
if pgrep -f "next dev\|next-server" >/dev/null 2>&1; then
  step "Laufenden Dev-Server stoppen"
  pkill -f "next dev"    2>/dev/null || true
  pkill -f "next-server" 2>/dev/null || true
  sleep 1
fi

# ──── 4. Konfiguration (.env) ─────────────────────────────────────────
# docker compose liest .env im Projektordner automatisch für ${VAR}.
step "Konfiguration prüfen (.env)"
touch .env
gen_secret() { head -c 32 /dev/urandom | od -An -tx1 | tr -d ' \n'; }
ensure_env() { # key, value
  if ! grep -q "^$1=" .env 2>/dev/null; then
    printf '%s=%s\n' "$1" "$2" >> .env
    return 0
  fi
  return 1
}
if ensure_env LEARN_SESSION_SECRET "$(gen_secret)"; then
  log "Session-Secret erzeugt (.env)"
fi
if ensure_env LEARN_INVITE_CODE "$(gen_secret | cut -c1-8)"; then
  warn "Einladungscode erzeugt. Familien brauchen ihn zur Registrierung:"
  printf "   ${B}%s${N}\n" "$(grep '^LEARN_INVITE_CODE=' .env | cut -d= -f2)"
fi
INVITE_NOW="$(grep '^LEARN_INVITE_CODE=' .env | cut -d= -f2-)"

# API-Key: aus .env, sonst aus der Umgebung, sonst interaktiv abfragen.
API_KEY_VAL="$(grep '^ANTHROPIC_API_KEY=' .env 2>/dev/null | cut -d= -f2- || true)"
if [ -z "$API_KEY_VAL" ] || [ "$API_KEY_VAL" = "sk-ant-..." ]; then
  if [ -n "${ANTHROPIC_API_KEY:-}" ]; then
    API_KEY_VAL="$ANTHROPIC_API_KEY"
    grep -v '^ANTHROPIC_API_KEY=' .env > .env.tmp 2>/dev/null || true; mv -f .env.tmp .env 2>/dev/null || true
    printf 'ANTHROPIC_API_KEY=%s\n' "$API_KEY_VAL" >> .env
    log "API-Key aus Umgebung übernommen (.env)"
  else
    echo
    echo "  Es wird ein Anthropic-API-Key gebraucht."
    echo "  Console → https://console.anthropic.com/settings/keys"
    printf "  API-Key (sk-ant-…): "
    read -r API_KEY_VAL
    if [ -z "$API_KEY_VAL" ]; then
      err "Kein API-Key eingegeben. Trage ANTHROPIC_API_KEY in .env ein und starte erneut."
      exit 1
    fi
    grep -v '^ANTHROPIC_API_KEY=' .env > .env.tmp 2>/dev/null || true; mv -f .env.tmp .env 2>/dev/null || true
    printf 'ANTHROPIC_API_KEY=%s\n' "$API_KEY_VAL" >> .env
    log "API-Key gespeichert (.env)"
  fi
else
  log "API-Key vorhanden (.env)"
fi

PORT_HOST="$(grep '^LEARN_PORT=' .env 2>/dev/null | cut -d= -f2- || true)"; PORT_HOST="${PORT_HOST:-3001}"

# ──── 5. Build + Start ────────────────────────────────────────────────
step "Container bauen + starten"
docker compose up -d --build

# ──── 6. Warten ───────────────────────────────────────────────────────
step "Warte bis App antwortet (max. 60 s)"
READY=0
for i in $(seq 1 60); do
  if curl -fs http://localhost:${PORT_HOST}/login >/dev/null 2>&1; then
    log "App erreichbar nach ${i} s"
    READY=1
    break
  fi
  printf "."
  sleep 1
done
echo
if [ "$READY" != "1" ]; then
  warn "App antwortet noch nicht. Logs:"
  docker compose logs --tail=40 lernferien
  exit 1
fi

# ──── 6b. KI-Check ────────────────────────────────────────────────────
step "KI-Erreichbarkeit prüfen (Anthropic-API)"
AI_OK=0
for i in 1 2 3; do
  RESP=$(curl -fs --max-time 50 http://localhost:${PORT_HOST}/api/health 2>/dev/null || echo "")
  if echo "$RESP" | grep -q '"ok":true'; then
    AI_OK=1
    break
  fi
  sleep 2
done
if [ "$AI_OK" = "1" ]; then
  log "KI erreichbar (API-Key gültig)"
else
  warn "KI antwortet nicht. Meldung:"
  echo "   $RESP"
  echo
  warn "Prüfe den ANTHROPIC_API_KEY in .env (gültig? Guthaben vorhanden?) und starte neu:"
  echo "   docker compose up -d --build"
fi

# ──── 7. Status ───────────────────────────────────────────────────────
echo
docker compose ps
echo
HOST_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "")
printf "${G}✓ Fertig.${N}\n\n"
echo "Ferien-Lerncoach:"
echo "   http://localhost:${PORT_HOST}"
[ -n "$HOST_IP" ] && echo "   http://${HOST_IP}:${PORT_HOST} (nur wenn LEARN_BIND=0.0.0.0)"
echo
echo "Backend: Anthropic-API (API-Key, Pay-per-Token)"
echo
echo "Login: Beim ersten Öffnen 'Familie registrieren' mit dem Einladungscode:"
printf "   Einladungscode: ${B}%s${N}\n" "${INVITE_NOW:-siehe .env}"
echo "   (Bestehende lokale Kinder: Login ${LEARN_DEFAULT_FAMILY_EMAIL:-eltern@local} / ${LEARN_DEFAULT_FAMILY_PASSWORD:-lernen})"
echo
echo "Hinweis öffentlicher Server: Unbedingt HTTPS davor (Reverse-Proxy) und"
echo "LEARN_COOKIE_SECURE=1 setzen, sonst sind Login-Cookies und Mikrofon unsicher/blockiert."
echo
echo "Logs live:    docker compose logs -f lernferien"
echo "Update:       ./setup.sh"
echo "Stoppen:      docker compose down"
