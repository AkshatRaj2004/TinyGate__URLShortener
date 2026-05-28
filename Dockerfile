# ═══════════════════════════════════════════════════════════════
#  Tiny Gate — Backend  (multi-stage)
#  Stage 1 : install production dependencies
#  Stage 2 : lean runtime image (non-root, no dev tools)
# ═══════════════════════════════════════════════════════════════

# ── Stage 1: dependency installer ────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./

# ci = clean install, omit=dev keeps node_modules lean
RUN npm ci --omit=dev --ignore-scripts

# ── Stage 2: production runner ────────────────────────────────
FROM node:20-alpine AS runner

# Install dumb-init for proper PID 1 signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy deps from previous stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source (excluding what's in .dockerignore)
COPY --chown=appuser:appgroup . .

USER appuser

EXPOSE 5000

ENV NODE_ENV=production

# dumb-init reaps zombie processes and forwards signals properly
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

CMD ["node", "server.js"]

# Docker HEALTHCHECK — hits the /health endpoint
HEALTHCHECK --interval=20s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:5000/health || exit 1
