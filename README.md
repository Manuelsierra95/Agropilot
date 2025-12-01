# Agropilot

Proyecto realizado para el Grado Superior de Desarrollo de Aplicaciones Web (DAW) en Medac.

## Descripción

Agropilot es una plataforma web orientada a la gestión inteligente de parcelas agrícolas. Permite al usuario subir datos sobre su terreno y obtener métricas de rendimiento, condiciones climáticas, previsiones meteorológicas y precios actualizados de productos agrícolas (como el de la oliva).

## Requisitos

- Node.js >= 18
- pnpm >= 8

## Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/Manuelsierra95/Agropilot.git
   cd Agropilot
   ```
2. Instala las dependencias:
   ```bash
   pnpm install
   ```

## Ejecución en desarrollo

Para iniciar el entorno de desarrollo, ejecuta:

```bash
pnpm run dev
```

Esto iniciará tanto la API como la aplicación web en modo desarrollo. Consulta la documentación interna de cada paquete en `apps/` y `packages/` para más detalles.

## Despliegue en producción

1. Configura las variables de entorno necesarias en cada paquete (`apps/api`, `apps/web-app`, etc.).
2. Compila los paquetes:
   ```bash
   pnpm run build
   ```
3. Despliega el contenido generado en tu proveedor de hosting (Vercel, Cloudflare, etc.).

## Scripts principales

- `pnpm run dev` — Ejecuta el entorno de desarrollo.
- `pnpm run build` — Compila la aplicación para producción.
- `pnpm run lint` — Ejecuta el linter para comprobar la calidad del código.

## Licencia

Este proyecto se distribuye bajo la licencia MIT.
