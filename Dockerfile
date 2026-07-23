# syntax=docker/dockerfile:1.7

FROM node:22-slim AS deps
WORKDIR /app
# build-essential + python3 fuer better-sqlite3 native build (fallback wenn prebuilt fehlt)
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ \
 && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:22-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV LEARN_DATA_DIR=/data

# ca-certificates (fuer HTTPS) + git (das Agent SDK nutzt git intern) + tini
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates git tini \
 && rm -rf /var/lib/apt/lists/*

# Claude Code CLI global installieren — wird vom Agent SDK als Subprocess aufgerufen
RUN npm install -g @anthropic-ai/claude-code

RUN groupadd --system --gid 1001 nodejs \
 && useradd  --system --uid 1001 --gid nodejs --home /home/nextjs --create-home --shell /bin/bash nextjs \
 && mkdir -p /data /home/nextjs/.claude \
 && chown -R nextjs:nodejs /data /home/nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
# better-sqlite3 native module + Agent SDK explizit kopieren
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@anthropic-ai ./node_modules/@anthropic-ai

USER nextjs
ENV HOME=/home/nextjs
EXPOSE 3000
VOLUME ["/data", "/home/nextjs/.claude"]
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "server.js"]
