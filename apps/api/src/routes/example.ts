import { Hono } from "hono"
import type { Env } from "@env"
import type { ApiVariables } from "@/types/variables"
import { optionalAuth } from "@/middlewares/optional-auth"
import { requireAuth } from "@/middlewares/require-auth"
import { requireRole } from "@/middlewares/require-role"

/**
 * Guia de referencia para futuras implantaciones de rutas en la API.
 *
 * Este archivo muestra patrones base de autenticacion/autorizacion multitenant:
 *
 * 1) GET /public
 *    - Uso: endpoint totalmente publico.
 *    - Middleware: ninguno.
 *    - Cuando aplicarlo: health checks, informacion publica o contenido sin sesion.
 *
 * 2) GET /feed (con optionalAuth)
 *    - Uso: endpoint que funciona con y sin sesion.
 *    - Middleware: optionalAuth.
 *    - Multi-tenant: cuando hay sesion, `organizationId` se resuelve desde
 *      `activeOrganizationId` o con header `x-organization-id`.
 *    - Cuando aplicarlo: experiencias mixtas (anonimo + logueado), personalizacion opcional.
 *
 * 3) GET /profile (con requireAuth)
 *    - Uso: endpoint privado para usuario autenticado.
 *    - Middleware: requireAuth.
 *    - Multi-tenant: valida contexto de organization y membership activo.
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
 * - Organization request-scoped: enviar header `x-organization-id`.
 * - Organization persistente: usar endpoint Better Auth `/auth/organization/set-active`.
 *
 * Regla de seguridad multi-tenant:
 * - Nunca filtrar por `userId` en recursos compartidos.
 * - Siempre filtrar por `organizationId` del contexto resuelto.
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
      user: c.get("user"),
      session: c.get("session"),
      organizationId: c.get("organizationId"),
      member: c.get("member"),
      requestedOrganizationId: c.req.header("x-organization-id") ?? null,
    })
  })

  // Ruta protegida: exige sesion valida.
  .use("/profile", requireAuth)
  .get("/profile", (c) => {
    return c.json({
      user: c.get("user"),
      session: c.get("session"),
      organizationId: c.get("organizationId"),
      member: c.get("member"),
    })
  })

  // Ruta de tenant activo: util para validar seleccion de organization.
  .use("/tenant", requireAuth)
  .get("/tenant", (c) => {
    return c.json({
      organizationId: c.get("organizationId"),
      member: c.get("member"),
      note: "Puedes enviar x-organization-id para resolver otro tenant por request",
    })
  })

  // El cambio persistente de organization activa vive en Better Auth:
  // POST /api/v1/auth/organization/set-active
  .use("/tenant/active", requireAuth)
  .post("/tenant/active", (c) => {
    return c.json({
      ok: true,
      message:
        "Usa POST /api/v1/auth/organization/set-active del plugin organization para cambiar el tenant activo",
    })
  })

  // Ruta RBAC jerarquico: owner/admin/editor pueden acceder.
  .use("/editor-tools", requireAuth, requireRole("editor"))
  .get("/editor-tools", (c) => {
    return c.json({
      ok: true,
      role: c.get("member")?.role ?? null,
    })
  })

  // Ruta RBAC: requiere auth y rol admin.
  .use("/admin", requireAuth, requireRole("admin"))
  .get("/admin", (c) => {
    return c.json({
      secret: true,
      role: c.get("member")?.role ?? null,
    })
  })
