# syntax=docker/dockerfile:1.7
FROM node:22-bookworm AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@11.5.1 --activate
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc turbo.json tsconfig.json ./
COPY apps ./apps
COPY packages ./packages
RUN pnpm install --frozen-lockfile
RUN pnpm turbo build --filter=web

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
