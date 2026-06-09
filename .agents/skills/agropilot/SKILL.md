---
name: agropilot
description: >
  Convenciones del monorepo Agropilot: tests obligatorios para endpoints de la API
  (apps/api → packages/tests) y seeds obligatorios para schemas de DB
  (packages/db/src/schemas → packages/seeds). Usar al crear rutas, servicios API,
  tablas Drizzle, migraciones o datos de desarrollo.
---

# Agropilot — Convenciones de backend

Reglas obligatorias del proyecto. Detalle completo en **`AGENTS.md`**.

## Resumen

| Cambio | Acción obligatoria |
|--------|-------------------|
| Nuevo o modificado endpoint en `apps/api` | Test unitario en `packages/tests` |
| Nuevo o modificado schema en `packages/db/src/schemas` | Seed en `packages/seeds` |

## Referencias

- Tests: [`packages/tests/README.md`](../../../packages/tests/README.md)
- Seeds: [`packages/seeds/README.md`](../../../packages/seeds/README.md)
- API importable para tests: `apps/api/src/app.ts` (`api/app`)

Para el listado completo de reglas, excepciones y ejemplos: `AGENTS.md`.
