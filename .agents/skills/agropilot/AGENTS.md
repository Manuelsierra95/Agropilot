# Agropilot — Convenciones de backend

**Version 1.0.0**  
Agropilot  
2026

> **Note:**  
> Reglas obligatorias del monorepo Agropilot para agentes y LLMs al crear o modificar
> la API (`apps/api`), esquemas de base de datos (`packages/db`) y datos de desarrollo.

---

## Reglas obligatorias

### 1. Nuevos endpoints en la API → tests unitarios

**Impact: CRITICAL**

Siempre que se **cree o modifique** un endpoint HTTP en `apps/api` (rutas en `src/routes/`, handlers montados en `src/app.ts`), se debe **añadir o actualizar** tests en `@workspace/tests` (`packages/tests`).

**Qué incluir en el test:**

- Caso feliz (status esperado y forma básica del JSON).
- Al menos un caso de error relevante (401 sin auth, 403 por rol, 400 por validación Zod, etc.).
- Mock de `@/services/*` y, si aplica, `@workspace/copilot` — **sin Postgres ni servicios externos**.

**Dónde:**

- Rutas: `packages/tests/src/routes/<recurso>.test.ts`
- Middlewares nuevos: `packages/tests/src/middlewares/<nombre>.test.ts`

**Cómo ejecutar:**

```bash
pnpm test
# o
pnpm --filter @workspace/tests test
```

**Patrón:** usar `apiRequest(app, path, init)` desde `packages/tests/src/helpers/request.ts`, `mockAuthenticatedSession()` para rutas protegidas, y `vi.mock` del servicio antes de importar `api/app`. Ver [`packages/tests/README.md`](../../../packages/tests/README.md).

**Incorrecto:** añadir `GET /finance/export` en `apps/api` sin test en `packages/tests`.

**Correcto:** endpoint + casos en `packages/tests/src/routes/finance.test.ts` (o archivo de ruta correspondiente).

---

### 2. Nuevos schemas en la DB → seeds de desarrollo

**Impact: CRITICAL**

Siempre que se **añada o modifique** una tabla o schema en `packages/db/src/schemas/` (y se exporte en `schemas/index.ts`), se debe **añadir o actualizar** datos de seed en `@workspace/seeds` (`packages/seeds`).

**Qué incluir en el seed:**

- Filas de ejemplo coherentes con el dominio (olivar, finanzas, parcelas, etc.).
- Respeto de FKs y `organizationId` / `SEED_USER_ID` desde [`packages/seeds/src/config.ts`](../../../packages/seeds/src/config.ts).
- Inserción en el orden correcto dentro del orquestador [`packages/seeds/src/index.ts`](../../../packages/seeds/src/index.ts).

**Excepciones (no sembrar, solo validar si aplica):**

- `users`, `organizations`, `members` — creados por Better Auth (Google).
- `sessions`, `accounts`, `verifications` — gestionados por OAuth.

**Cómo ejecutar:**

```bash
pnpm seed
# o
pnpm --filter @workspace/seeds seed
```

Ver [`packages/seeds/README.md`](../../../packages/seeds/README.md).

**Incorrecto:** nueva tabla `harvest_batches` en `packages/db/src/schemas/` sin módulo en `packages/seeds/src/seeds/`.

**Correcto:** schema + migración + `seedHarvestBatches()` invocado desde `packages/seeds/src/index.ts` tras validar contexto de auth.

---

## Checklist antes de cerrar un PR o tarea

- [ ] ¿Hay endpoints nuevos o cambiados en `apps/api`? → tests en `packages/tests` y `pnpm test` en verde.
- [ ] ¿Hay tablas nuevas o cambiadas en `packages/db/src/schemas`? → seeds en `packages/seeds` documentados en el orquestador.
