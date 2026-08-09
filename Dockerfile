# syntax=docker/dockerfile:1
# Production image for ONE storefront site. Multi-stage build: the build stage
# compiles the React/Vite frontend for a chosen client; the run stage ships only
# the backend + the built frontend + production dependencies. One container
# serves BOTH the API and the storefront, so a site = 1 container + 1 Postgres
# + 1 domain (no separate frontend host, no CORS).

# ---- Build stage: full deps (incl. Vite), build the frontend ----
FROM node:20-slim AS build
WORKDIR /app

# Which client config to bake in: clients/<CLIENT>/config.js (brand, theme,
# product fallback). Override per site:  --build-arg CLIENT=acme
ARG CLIENT=demo
ENV CLIENT=${CLIENT}

# Install deps from the lockfile first for better layer caching.
COPY package.json package-lock.json ./
RUN npm ci

# Build the frontend. Vite reads CLIENT (see vite.config.js) → frontend/dist.
COPY . .
RUN npm run build

# ---- Run stage: backend + built frontend, production deps only ----
FROM node:20-slim AS run
WORKDIR /app
ENV NODE_ENV=production

# Production dependencies only (no Vite / concurrently).
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Runtime code: backend, client configs (the seed script reads them), and the
# compiled frontend from the build stage.
COPY backend ./backend
COPY clients ./clients
COPY --from=build /app/frontend/dist ./frontend/dist

# Uploaded images land here; mount a persistent volume at this path so they
# survive redeploys (see deploy/docker-compose.yml / Coolify storage config).
RUN mkdir -p backend/uploads

EXPOSE 3001

# Container health = the existing /api/health endpoint (returns 200 even in
# degraded no-DB mode). Coolify reads this to mark the container healthy.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||3001)+'/api/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

# Apply pending SQL migrations (idempotent; a harmless no-op without DATABASE_URL)
# then start the API. A fresh empty .env still boots in degraded mode.
CMD ["sh", "-c", "node backend/scripts/migrate.js || true; node backend/index.js"]
