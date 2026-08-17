FROM oven/bun:1.2.20

WORKDIR /app

RUN bun add --global pnpm@11.5.1

COPY . .

RUN pnpm install --frozen-lockfile

EXPOSE 3001

CMD ["bun", "run", "apps/api/src/index.ts"]