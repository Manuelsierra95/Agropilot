# @workspace/seeds

Script para poblar la base de datos con datos de demostración. Crea automáticamente el usuario demo y su organización; no requiere login previo con Google.

## Variables de entorno

En `packages/db/.env`:

```env
DEMO_USER_PASSWORD=tu-password-segura-demo
DEMO_ENABLED=true
```

`DEMO_USER_PASSWORD` se usa para:
- Sembrar la cuenta credential del usuario demo (`pnpm seed`)
- Auto-login en la ruta `/demo` del frontend

## Uso

1. Levanta la base de datos y aplica migraciones:

```bash
pnpm --filter @workspace/db db:setup
```

2. Ejecuta los seeds:

```bash
pnpm seed
```

También:

```bash
pnpm --filter @workspace/seeds seed
```

3. En el landing, pulsa **Ver demo** (`/demo`) para entrar al dashboard con datos completos.

## Usuario demo

| Campo | Valor |
|-------|-------|
| Email | `demo@agropilot.dev` |
| Organización | Olivares Sierra Mágina |
| Plan | pro |
| Onboarding | completado |

Los visitantes **no necesitan credenciales**: `/demo` inicia sesión automáticamente en el servidor.

## Modo solo lectura

Con `DEMO_ENABLED=true`, el usuario demo solo puede hacer peticiones **GET** en la API. Cualquier POST, PUT, PATCH o DELETE devuelve `403`.

## Re-ejecución

`pnpm seed` limpia los datos de la organización demo y los vuelve a crear. Es idempotente para el usuario demo.

## Red externa

Durante el seed, las parcelas intentan obtener geometría real del Catastro (`searchByCoords`) y estaciones meteorológicas (`getStations` vía WeatherCloud). Si falla la red, se usan datos sintéticos de respaldo.

## Retirar el demo

1. `DEMO_ENABLED=false` en producción
2. Eliminar ruta `apps/web/app/demo/route.ts`, middleware `block-demo-mutations`, y módulo `seedDemoAuth`
3. Borrar filas del usuario demo en la base de datos

## Errores controlados

| Código | Causa |
|--------|--------|
| `USER_NOT_FOUND` | No existe el usuario demo tras `seedDemoAuth` |
| `ORGANIZATION_NOT_FOUND` | No existe la organización demo |
| `MEMBERSHIP_NOT_FOUND` | El usuario demo no es miembro de la org demo |
| `DEMO_PASSWORD_MISSING` | Falta `DEMO_USER_PASSWORD` en el entorno |

## Qué se siembra

Catálogo global (`plan_limits`, `modules`, `campaigns`, `market_prices`) y datos de dominio bajo la org demo: 6 parcelas olivar en Jaén, clima, finanzas, producción, tareas, recomendaciones y billing.

**No se siembran** sesiones OAuth de usuarios reales. Las sesiones del demo se crean al visitar `/demo`.
