# syntax=docker/dockerfile:1.7
FROM node:22-bookworm AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@11.5.1 --activate
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc ./
COPY apps ./apps
COPY packages ./packages
RUN pnpm install --frozen-lockfile

RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

FROM oven/bun:1 AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app /app

EXPOSE 3001
CMD ["bun", "run", "apps/api/src/index.ts"]
