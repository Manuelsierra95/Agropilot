# @workspace/tests

Tests unitarios de la API Hono (`apps/api`). Usan **Vitest** y **no requieren Postgres** ni servicios externos: auth, base de datos y capa de servicios se mockean.

## Uso de tests

Desde la raíz del monorepo:

```bash
pnpm test
```

Desde el package:

```bash
pnpm --filter @workspace/tests test
```

Modo watch (útil en desarrollo):

```bash
pnpm --filter @workspace/tests test:watch
```

Typecheck del package:

```bash
pnpm --filter @workspace/tests typecheck
```

## Qué se prueba

| Área | Archivos |
|------|----------|
| Middlewares de auth | `require-auth`, `require-role`, `optional-auth` |
| Rutas HTTP | `healthz`, `finance`, `parcel`, `user`, `organization`, `billing`, `search`, `copilot` |
| Servicios | `query-executor` (copilot) |

Las peticiones a rutas usan `app.request()` de [`apps/api/src/app.ts`](../../apps/api/src/app.ts), sin levantar el servidor Bun.

## Cómo funciona

- **`src/setup.ts`**: mocks globales de `@workspace/auth` y `@workspace/db` (sesión y membership).
- **`src/helpers/mock-session.ts`**: helpers para simular usuario autenticado, sin sesión, sin org, etc.
- **`src/helpers/request.ts`**: wrapper de `app.request` con variables de entorno de test (CORS, auth, etc.).
- **Tests de rutas**: mockean `@/services/*` y `@workspace/copilot` para aislar la capa HTTP.

## Añadir un test nuevo

1. Crea `src/routes/<nombre>.test.ts` o `src/middlewares/<nombre>.test.ts`.
2. Si la ruta llama a un servicio, mockea el módulo con `vi.hoisted` + `vi.mock` antes de importar `api/app`.
3. Usa `mockAuthenticatedSession()` para rutas protegidas y `apiRequest(app, path, init)` en lugar de `app.request` directo.

Ejemplo mínimo:

```ts
import { describe, expect, it } from "vitest"
import { app } from "api/app"
import { apiRequest } from "../helpers/request"
import { mockAuthenticatedSession } from "../helpers/mock-session"

describe("GET /mi-ruta", () => {
  it("responde 200", async () => {
    mockAuthenticatedSession()
    const res = await apiRequest(app, "/api/v1/mi-ruta")
    expect(res.status).toBe(200)
  })
})
```
