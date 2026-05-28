# ═══════════════════════════════════════════════════════════════
#  Tiny Gate — Frontend  (multi-stage)
#  Stage 1 : build the React/Vite app
#  Stage 2 : serve the static bundle with production Nginx
# ═══════════════════════════════════════════════════════════════

# ── Stage 1: builder ──────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy manifests first to exploit Docker layer caching
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .

# VITE_API_URL is injected at build time via --build-arg
ARG VITE_API_URL=http://localhost:5000
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build
# Output: /app/dist

# ── Stage 2: production Nginx server ──────────────────────────
FROM nginx:1.27-alpine AS runner

# Remove default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx config for SPA routing
COPY nginx-spa.conf /etc/nginx/conf.d/default.conf

# Copy Vite build output
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx runs as root by default; drop to nginx user
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

EXPOSE 80

# Health check so docker-compose knows when we're ready
HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:80/health.txt || exit 1

CMD ["nginx", "-g", "daemon off;"]
