# syntax=docker/dockerfile:1
# Multi-stage build for the apps/web Next.js app in the pnpm monorepo.

FROM node:24.17.0-slim AS base
ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    NEXT_TELEMETRY_DISABLED=1
RUN corepack enable
WORKDIR /app

# ── install deps + build ──────────────────────────────────────────────────────
FROM base AS build
# Manifests first for better layer caching.
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/domain/package.json packages/domain/package.json
# --ignore-scripts: skip postinstalls (lefthook needs git, esbuild/sharp aren't
# used by the build or runtime — tests use esbuild, images are unoptimized).
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY . .
# Placeholder env so any eager env validation passes at build time.
ENV DATABASE_URL=postgres://build:build@localhost:5432/build \
    REDIS_URL=redis://localhost:6379
# GA4 measurement ID, inlined into the client bundle (NEXT_PUBLIC_*).
ARG NEXT_PUBLIC_GA_TRACKING_ID=""
ENV NEXT_PUBLIC_GA_TRACKING_ID=$NEXT_PUBLIC_GA_TRACKING_ID
RUN pnpm --filter @scythe/web build

# ── db migrator ───────────────────────────────────────────────────────────────
# A dependency-isolated migration runner. The Next
# standalone trace deliberately excludes drizzle-kit (a dev tool) and the
# migration SQL, so we assemble a tiny bundle here: postgres + drizzle-orm (the
# runtime migrator), the migration SQL/meta, and packages/db/migrate.mjs.
FROM base AS migrate
WORKDIR /migrate
# Pinned to the workspace-resolved versions (see packages/db/package.json).
RUN npm init -y >/dev/null 2>&1 && \
    npm install --no-audit --no-fund drizzle-orm@0.45.2 postgres@3.4.9
COPY packages/db/drizzle ./drizzle
COPY packages/db/migrate.mjs ./migrate.mjs

# ── runtime ───────────────────────────────────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN useradd -m -u 1001 nextjs
# Standalone output already contains the traced node_modules + workspace deps,
# laid out from the monorepo root (server.js lives under apps/web/).
COPY --from=build --chown=nextjs:nextjs /app/apps/web/.next/standalone ./
COPY --from=build --chown=nextjs:nextjs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=nextjs:nextjs /app/apps/web/public ./apps/web/public
# Migrator bundle for `release_command = "node /app/migrate/migrate.mjs"`.
COPY --from=migrate --chown=nextjs:nextjs /migrate ./migrate
USER nextjs
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
