FROM node:22-bookworm

WORKDIR /app

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@11.5.1 --activate

# Instalar Bun
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

# Copiar el monorepo completo
COPY . .

# Instalar dependencias con Node + pnpm
RUN pnpm install --frozen-lockfile

# API
EXPOSE 3001

# Arrancar API con Bun
CMD ["bun", "run", "apps/api/src/index.ts"]