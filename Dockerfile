FROM oven/bun:1.2.20

WORKDIR /app

# Instalar pnpm
RUN bun add --global pnpm@11.5.1

# Copiar todo el monorepo
COPY . .

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Construir el monorepo completo
RUN pnpm build

# API
EXPOSE 3001

# Arrancar API
CMD ["bun", "run", "apps/api/src/index.ts"]