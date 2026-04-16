import { Hono } from "hono"
import type { Env } from "@env"
import type { ApiVariables } from "@/types/variables"
import { optionalAuth } from "@/middlewares/optional-auth"
import { requireAuth } from "@/middlewares/require-auth"
import { requireRole } from "@/middlewares/require-role"
import { switchActiveTeam } from "@/services/team-membership"

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
 *    - Multi-tenant: cuando hay sesion, `team` puede resolverse por `x-team-id`
 *      o por `activeTeamId` del usuario.
 *    - Cuando aplicarlo: experiencias mixtas (anonimo + logueado), personalizacion opcional.
 *
 * 3) GET /profile (con requireAuth)
 *    - Uso: endpoint privado para usuario autenticado.
 *    - Middleware: requireAuth.
 *    - Multi-tenant: valida contexto de tenant para evitar acceso sin equipo valido.
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
 * - Team switching request-scoped: enviar header `x-team-id`.
 * - Team switching persistente: POST /tenant/active con body `{ teamId }`.
 *
 * Regla de seguridad multi-tenant:
 * - Nunca filtrar por `userId` en recursos compartidos.
 * - Siempre filtrar por `team.id` del contexto resuelto.
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
      team: c.get("team"),
      requestedTeamId: c.req.header("x-team-id") ?? null,
    })
  })

  // Ruta protegida: exige sesion valida.
  .use("/profile", requireAuth)
  .get("/profile", (c) => {
    return c.json({
      user: c.get("user"),
      session: c.get("session"),
      team: c.get("team"),
    })
  })

  // Ruta de tenant activo: util para validar seleccion de equipo.
  .use("/tenant", requireAuth)
  .get("/tenant", (c) => {
    return c.json({
      team: c.get("team"),
      note: "Puedes enviar x-team-id para resolver otro tenant por request",
    })
  })

  // Switch persistente de activeTeamId para siguientes requests.
  .use("/tenant/active", requireAuth)
  .post("/tenant/active", async (c) => {
    const user = c.get("user")

    if (!user) {
      return c.json({ error: "Unauthorized" }, 401)
    }

    const body = await c.req.json<{ teamId?: unknown }>().catch(() => null)
    const teamId = typeof body?.teamId === "string" ? body.teamId.trim() : ""

    if (!teamId) {
      return c.json({ error: "teamId is required" }, 400)
    }

    try {
      const result = await switchActiveTeam(user.id, teamId)

      return c.json({
        ok: true,
        activeTeamId: result.activeTeamId,
        role: result.role,
        note: "Para reflejarlo en esta request, envia tambien x-team-id",
      })
    } catch (error) {
      if (error instanceof Error && error.message === "FORBIDDEN_TEAM") {
        return c.json({ error: "Forbidden for target team" }, 403)
      }

      throw error
    }
  })

  // Ruta RBAC jerarquico: owner/admin/editor pueden acceder.
  .use("/editor-tools", requireAuth, requireRole("editor"))
  .get("/editor-tools", (c) => {
    return c.json({
      ok: true,
      role: c.get("team")?.role ?? null,
    })
  })

  // Ruta RBAC: requiere auth y rol admin.
  .use("/admin", requireAuth, requireRole("admin"))
  .get("/admin", (c) => {
    return c.json({
      secret: true,
      role: c.get("team")?.role ?? null,
    })
  })
