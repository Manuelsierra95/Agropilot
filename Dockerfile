FROM node:22-bookworm

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.5.1 --activate

COPY . .

RUN pnpm install --frozen-lockfile

RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

RUN pnpm build

EXPOSE 3001

CMD ["bun", "run", "apps/api/src/index.ts"]