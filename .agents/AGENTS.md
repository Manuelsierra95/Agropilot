# Agropilot — Guía para agentes

Convenciones globales del monorepo. Detalle en [`.agents/skills/agropilot/AGENTS.md`](skills/agropilot/AGENTS.md).

## Reglas obligatorias

1. **API (`apps/api`)** — Todo endpoint nuevo o modificado requiere tests unitarios en `packages/tests`. Ejecutar `pnpm test`.
2. **DB (`packages/db/src/schemas`)** — Todo schema nuevo o modificado requiere seeds en `packages/seeds`. Ejecutar `pnpm seed` (tras configurar `config.ts`).

## Skills relacionadas

| Skill | Cuándo |
|-------|--------|
| [`agropilot`](skills/agropilot/SKILL.md) | Rutas API, tests, schemas, seeds |
| [`hono`](skills/hono/SKILL.md) | Handlers, middlewares, `app.request` |
| Drizzle (`packages/db`) | Migraciones y tablas |
