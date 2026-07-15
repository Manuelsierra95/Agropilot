# @workspace/jobs

Scripts batch para tareas programadas (cron). Cada job es un entry point independiente que escribe en la tabla `logs` y termina con `process.exit`.

La API y la web **no tienen que estar levantadas**: los jobs acceden directamente a la base de datos y a los scrapers.

## Variables de entorno

En `packages/db/.env`:

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/agropilot
```

## Jobs disponibles

| Script | Qué hace | Dependencias externas |
|--------|----------|----------------------|
| `job:weather-stations` | Asigna/actualiza estaciones meteorológicas por parcela (`getStations`) | WeatherCloud |
| `job:parcel-recommendations` | Calcula riesgos y recomendaciones por parcela (`generateParcelRisks`) | WeatherCloud |
| `job:oil-prices` | Scrapea precios del aceite de oleista.com | Playwright + oleista.com |

**Orden de dependencia:** `weather-stations` debe ejecutarse **antes** de `parcel-recommendations`. Sin estación asignada, el job de recomendaciones falla para esa parcela.

## Ejecución manual

```bash
pnpm --filter @workspace/jobs job:weather-stations
pnpm --filter @workspace/jobs job:parcel-recommendations
pnpm --filter @workspace/jobs job:oil-prices
```

Desde la raíz del monorepo también puedes usar:

```bash
pnpm jobs:weather
pnpm jobs:recommendations
pnpm jobs:oil
```

## Prerrequisitos (VPS)

- Node.js >= 20
- **Bun** (runtime para ejecutar los jobs; `tsx` no resuelve bien los exports de `@workspace/db` en entry points)
- pnpm
- PostgreSQL accesible vía `DATABASE_URL`
- Migraciones aplicadas: `pnpm --filter @workspace/db migrate`
- Playwright Chromium (solo para `oil-prices`):

```bash
pnpm --filter @workspace/scrapers exec playwright install chromium --with-deps
```

## Crontab (Europe/Madrid)

Crear directorio de logs:

```bash
sudo mkdir -p /var/log/agropilot
sudo chown $USER /var/log/agropilot
```

Editar crontab (`crontab -e`):

```cron
TZ=Europe/Madrid
SHELL=/bin/bash
PATH=/usr/local/bin:/usr/bin:/bin

# Oil prices — 10:00 diario
0 10 * * * cd /opt/agropilot && flock -n /tmp/agropilot-oil.lock pnpm --filter @workspace/jobs job:oil-prices >> /var/log/agropilot/oil-prices.log 2>&1

# Weather stations — 06:00 y 18:00
0 6,18 * * * cd /opt/agropilot && flock -n /tmp/agropilot-weather.lock pnpm --filter @workspace/jobs job:weather-stations >> /var/log/agropilot/weather-stations.log 2>&1

# Parcel recommendations — 30 min después (06:30 y 18:30)
30 6,18 * * * cd /opt/agropilot && flock -n /tmp/agropilot-recs.lock pnpm --filter @workspace/jobs job:parcel-recommendations >> /var/log/agropilot/parcel-recommendations.log 2>&1
```

Ajusta `/opt/agropilot` a la ruta real del proyecto en el servidor.

| Job | Frecuencia | Hora (Madrid) |
|-----|------------|---------------|
| `weather-stations` | 2x/día | 06:00, 18:00 |
| `parcel-recommendations` | 2x/día | 06:30, 18:30 |
| `oil-prices` | 1x/día | 10:00 |

`flock -n` evita solapamientos si un job anterior sigue en ejecución.

## Monitorización

1. **Logs de fichero:** `/var/log/agropilot/*.log`
2. **Logs en DB:** tabla `logs` filtrando por `source` y `action`:
   - `cron` / `weather-stations`
   - `cron` / `parcel-recommendations`
   - `scraper` / `oil`
3. **Exit codes:** los jobs devuelven `1` si hubo errores (útil para alertas de cron vía `MAILTO=`)

## Troubleshooting

| Problema | Solución |
|----------|----------|
| `DATABASE_URL environment variable is not set` | Crear `packages/db/.env` con la URL de Postgres |
| Playwright no encuentra Chromium | `pnpm --filter @workspace/scrapers exec playwright install chromium --with-deps` |
| Recomendaciones fallan para todas las parcelas | Ejecutar primero `job:weather-stations` |
| Job muy lento | Normal con muchas parcelas; revisar logs por parcela fallida |

## Actualizaciones en producción

Tras cada `git pull`:

```bash
cd /opt/agropilot && pnpm install
```

Si cambió la versión de Playwright:

```bash
pnpm --filter @workspace/scrapers exec playwright install chromium --with-deps
```

No hace falta reiniciar servicios: cron invoca el código actual en cada ejecución.
