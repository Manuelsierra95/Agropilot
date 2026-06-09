# @workspace/seeds

Script para poblar la base de datos con datos de desarrollo. **No crea** usuarios ni organizaciones: asume que ya existen tras autenticarte con Google.

## Uso de seeds

1. **Login con Google** en la app de desarrollo.
2. Copia los UUIDs reales de tu usuario y organización en [`src/config.ts`](src/config.ts):
   - `SEED_USER_ID` → `users.id`
   - `SEED_ORGANIZATION_ID` → `organizations.id`

   Puedes consultarlos en Drizzle Studio (`pnpm --filter @workspace/db studio`) o directamente en Postgres.

3. Levanta la base de datos y aplica migraciones:

```bash
pnpm --filter @workspace/db db:setup
```

4. Ejecuta los seeds:

```bash
pnpm seed
```

También puedes lanzarlo desde el package:

```bash
pnpm --filter @workspace/seeds seed
```

## Errores controlados

Si los IDs en `config.ts` no coinciden con tu sesión, el script termina con un mensaje claro:

| Código | Causa |
|--------|--------|
| `USER_NOT_FOUND` | No existe el usuario con `SEED_USER_ID` |
| `ORGANIZATION_NOT_FOUND` | No existe la organización con `SEED_ORGANIZATION_ID` |
| `MEMBERSHIP_NOT_FOUND` | El usuario no es miembro de esa organización |

## Qué se siembra

Catálogo global (`plan_limits`, `modules`, `campaigns`, `market_prices`, `weather_station`) y datos de dominio scoped a tu organización: parcels, transacciones, tareas, billing, invitaciones, etc.

**No se siembran** `sessions`, `accounts` ni `verifications` (los gestiona Better Auth).
