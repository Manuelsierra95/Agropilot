import { Hono } from "hono"
import type { Env } from "@env"
import type { ApiVariables } from "@/types/variables"
import { optionalAuth } from "@/middlewares/optional-auth"
import { requireAuth } from "@/middlewares/require-auth"
import { requireRole } from "@/middlewares/require-role"
import { eq, db, parcels } from "@workspace/db"

/**
 * Guia de referencia para futuras implantaciones de rutas en la API.
 *
 * Este archivo muestra patrones base de autenticacion/autorizacion multiorganization:
 *
 * 1) GET /public
 *    - Uso: endpoint totalmente publico.
 *    - Middleware: ninguno.
 *    - Cuando aplicarlo: health checks, informacion publica o contenido sin sesion.
 *
 * 2) GET /feed (con optionalAuth)
 *    - Uso: endpoint que funciona con y sin sesion.
 *    - Middleware: optionalAuth.
 *    - Multi-organization: cuando hay sesion, `organizationId` se resuelve desde
 *      `activeOrganizationId` .
 *    - Cuando aplicarlo: experiencias mixtas (anonimo + logueado), personalizacion opcional.
 *
 * 3) GET /profile (con requireAuth)
 *    - Uso: endpoint privado para usuario autenticado.
 *    - Middleware: requireAuth.
 *    - Multi-organization: valida contexto de organization y membership activo.
 *    - Cuando aplicarlo: perfil, configuracion, datos privados del usuario.
 *
 * 4) GET /admin (con requireAuth + requireRole)
 *    - Uso: control de acceso por rol (RBAC).
 *    - Middleware: requireAuth, requireRole("admin").
 *    - Cuando aplicarlo: paneles administrativos, operaciones sensibles.
 *
 * 5) GET /organization
 *    - Uso: obtener el contexto de la organizacion activa del usuario.
 *    - Middleware: requireAuth.
 *    - Multi-organization: organizationId resuelto desde activeOrganizationId o header.
 *    - Cuando aplicarlo: validar seleccion de org, debug de contexto.
 *
 * 6) POST /organization/active
 *    - Uso: referencia al endpoint de Better Auth para cambiar la org activa.
 *    - Middleware: requireAuth.
 *    - Nota: el cambio real se hace en /auth/organization/set-active.
 *
 * 7) GET /parcels
 *    - Uso: obtener las parcelas de la organizacion activa del usuario.
 *    - Middleware: requireAuth.
 *    - Multi-organization: filtra SIEMPRE por organizationId, nunca por userId.
 *    - Cuando aplicarlo: cualquier recurso compartido dentro de una org.
 *
 * Plantilla recomendada para nuevas rutas:
 * - Publica: .get("/ruta", handler)
 * - Opcional auth: .use("/ruta", optionalAuth).get("/ruta", handler)
 * - Protegida: .use("/ruta", requireAuth).get("/ruta", handler)
 * - RBAC: .use("/ruta", requireAuth, requireRole("admin"))
 * - Organization persistente: usar endpoint Better Auth `/auth/organization/set-active`.
 *
 * Regla de seguridad multi-organization:
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

  // Contexto de la organizacion activa del usuario.
  .use("/organization", requireAuth)
  .get("/organization", (c) => {
    return c.json({
      organizationId: c.get("organizationId"),
      member: c.get("member"),
    })
  })

  // El cambio persistente de organizacion activa vive en Better Auth:
  // POST /api/v1/auth/organization/set-active
  .use("/organization/active", requireAuth)
  .post("/organization/active", (c) => {
    return c.json({
      ok: true,
      message:
        "Usa POST /api/v1/auth/organization/set-active del plugin organization para cambiar la organizacion activa",
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

  // Parcelas de la organizacion activa.
  // - requireAuth garantiza sesion valida y membership en la org.
  // - organizationId viene resuelto por el middleware.
  // - Nunca se filtra por userId: las parcelas son de la org, no del usuario.
  .use("/parcels", requireAuth)
  .get("/parcels", async (c) => {
    const organizationId = c.get("organizationId")

    if (!organizationId) {
      return c.json(
        {
          error: "No hay organizacion activa.",
        },
        400
      )
    }

    const result = await db
      .select()
      .from(parcels)
      .where(eq(parcels.organizationId, organizationId))

    return c.json({ parcels: result })
  })
