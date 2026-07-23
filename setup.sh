#!/usr/bin/env bash
# Ferien-Lerncoach — One-Shot-Setup.
#
# Die KI laeuft AUSSCHLIESSLICH ueber Claude Code mit Max-Plan-Auth.
# Es gibt KEINE API-Key-Variante.
#
# Macht alles:
#   - prueft Docker
#   - installiert Claude Code auf dem Host (falls fehlt)
#   - leitet durch claude login (falls noch nicht authentifiziert)
#   - kopiert Host-Auth ins Docker-Volume
#   - baut & startet den Container
#
# Idempotent: zweiter Aufruf = git pull + Rebuild + Auth-Sync.
#
set -euo pipefail
cd "$(dirname "$(readlink -f "$0")")"

# ──── Helfer ───────────────────────────────────────────────────────────
G='\033[0;32m'; Y='\033[1;33m'; R='\033[0;31m'; B='\033[1;34m'; N='\033[0m'
log()  { printf "${G}→${N} %s\n" "$*"; }
warn() { printf "${Y}!${N} %s\n" "$*"; }
err()  { printf "${R}✗${N} %s\n" "$*" >&2; }
step() { printf "\n${B}■${N} ${B}%s${N}\n" "$*"; }

# Compose-Projektname = Verzeichnisname (klein), so wie docker compose es macht.
PROJECT="$(basename "$PWD" | tr '[:upper:]' '[:lower:]')"
CLAUDE_VOL="${PROJECT}_lernferien-claude"

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

# ──── 4. Claude Code Auth (Pflicht) ───────────────────────────────────
step "Claude Code Auth"
if ! command -v claude &>/dev/null; then
  warn "Claude Code nicht installiert. Installiere global via npm..."
  if ! command -v npm &>/dev/null; then
    err "npm fehlt auf dem Host. Installiere Node.js v22+ (z.B. via nvm)."
    exit 1
  fi
  npm install -g @anthropic-ai/claude-code
  log "Claude Code installiert"
fi

AUTH_DIR="$HOME/.claude"
HAS_AUTH=0
for f in "$AUTH_DIR/credentials.json" "$AUTH_DIR/.credentials.json" "$AUTH_DIR/auth.json"; do
  [ -f "$f" ] && HAS_AUTH=1 && break
done

if [ "$HAS_AUTH" = "0" ]; then
  warn "Keine Claude-Code-Auth gefunden in $AUTH_DIR"
  echo
  echo "  Du wirst jetzt durch den Login-Flow geleitet."
  echo "  Öffne den Link im Browser, autorisiere mit deinem Max-Plan-Account,"
  echo "  und folge den Anweisungen im Terminal."
  echo
  printf "  Drücke ${B}Enter${N} um Claude Code zu starten…"
  read -r _
  claude || true
  echo
  HAS_AUTH=0
  for f in "$AUTH_DIR/credentials.json" "$AUTH_DIR/.credentials.json" "$AUTH_DIR/auth.json"; do
    [ -f "$f" ] && HAS_AUTH=1 && break
  done
  if [ "$HAS_AUTH" = "0" ]; then
    err "Auth fehlgeschlagen oder abgebrochen. Re-Run ./setup.sh nach dem Login."
    exit 1
  fi
  log "Auth-Dateien gefunden"
else
  log "Claude-Code-Auth vorhanden ($AUTH_DIR)"
fi

# Auth ins Volume kopieren (immer — refresht eventuell Tokens)
step "Sync Auth ins Docker-Volume"
docker volume create "$CLAUDE_VOL" >/dev/null
docker run --rm \
  -v "$CLAUDE_VOL":/dest \
  -v "$AUTH_DIR":/src:ro \
  alpine sh -c 'rm -rf /dest/* /dest/.[!.]* 2>/dev/null; cp -a /src/. /dest/ && chown -R 1001:1001 /dest' >/dev/null
log "Auth ins Volume kopiert (UID 1001)"

# ──── 5. Build + Start ────────────────────────────────────────────────
step "Container bauen + starten"
docker compose up -d --build

# ──── 6. Warten ───────────────────────────────────────────────────────
step "Warte bis App antwortet (max. 60 s)"
READY=0
for i in $(seq 1 60); do
  if curl -fs http://localhost:3001/ >/dev/null 2>&1; then
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

# ──── 7. Status ───────────────────────────────────────────────────────
echo
docker compose ps
echo
HOST_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "")
printf "${G}✓ Fertig.${N}\n\n"
echo "Ferien-Lerncoach:"
echo "   http://localhost:3001"
[ -n "$HOST_IP" ] && echo "   http://${HOST_IP}:3001"
echo
echo "Backend: Claude Agent SDK (Max-Plan-Subscription, kein API-Key)"
echo
echo "Hinweis Vorlesen: Mikrofon braucht localhost oder HTTPS."
echo
echo "Logs live:    docker compose logs -f lernferien"
echo "Update:       ./setup.sh"
echo "Stoppen:      docker compose down"
