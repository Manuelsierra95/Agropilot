import { Hono } from "hono"
import type { Env } from "@env"
import type { ApiVariables } from "@/types/variables"
import { optionalAuth } from "@/middlewares/optional-auth"
import { requireAuth } from "@/middlewares/require-auth"
import { requireRole } from "@/middlewares/require-role"

/**
 * Guia de referencia para futuras implantaciones de rutas en la API.
 *
 * Este archivo muestra 4 patrones base de autenticacion/autorizacion:
 *
 * 1) GET /public
 *    - Uso: endpoint totalmente publico.
 *    - Middleware: ninguno.
 *    - Cuando aplicarlo: health checks, informacion publica o contenido sin sesion.
 *
 * 2) GET /feed (con optionalAuth)
 *    - Uso: endpoint que funciona con y sin sesion.
 *    - Middleware: optionalAuth.
 *    - Multi-tenant: cuando hay sesion, `auth.team.id` queda disponible en contexto.
 *    - Cuando aplicarlo: experiencias mixtas (anonimo + logueado), personalizacion opcional.
 *
 * 3) GET /profile (con requireAuth)
 *    - Uso: endpoint privado para usuario autenticado.
 *    - Middleware: requireAuth.
 *    - Multi-tenant: valida `auth.team.id` para evitar acceso sin tenant.
 *    - Cuando aplicarlo: perfil, configuracion, datos privados del usuario.
 *
 * 4) GET /admin (con requireAuth + requireRole)
 *    - Uso: control de acceso por rol (RBAC).
 *    - Middleware: requireAuth, requireRole("admin").
 *    - Cuando aplicarlo: paneles administrativos, operaciones sensibles.
 *
 * Plantilla recomendada para nuevas rutas:
 * - Publica: .get("/ruta", handler)
 * - Opcional auth: .use("/ruta", optionalAuth).get("/ruta", handler)
 * - Protegida: .use("/ruta", requireAuth).get("/ruta", handler)
 * - RBAC: .use("/ruta", requireAuth, requireRole("admin"))
 *
 * Regla de seguridad multi-tenant:
 * - Nunca filtrar por `userId` en recursos compartidos.
 * - Siempre filtrar por `auth.team.id`.
 */

export const exampleRoutes = new Hono<{
  Bindings: Env
  Variables: ApiVariables
}>()
  // Ruta publica: no ejecuta auth, cero latencia extra.
  .get("/public", (c) => {
    return c.json({ ok: true })
  })

  // Ruta opcional: setea user/session si existe sesion.
  .use("/feed", optionalAuth)
  .get("/feed", (c) => {
    return c.json({
      auth: c.get("auth"),
    })
  })

  // Ruta protegida: exige sesion valida.
  .use("/profile", requireAuth)
  .get("/profile", (c) => {
    return c.json({
      auth: c.get("auth"),
    })
  })

  // Ruta RBAC: requiere auth y rol admin.
  .use("/admin", requireAuth, requireRole("admin"))
  .get("/admin", (c) => {
    return c.json({ secret: true })
  })
