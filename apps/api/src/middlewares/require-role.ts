import type { MiddlewareHandler } from "hono"
import type { ApiVariables } from "@/types/variables"
import type { TeamRole } from "@workspace/schemas"

export const requireRole = (
  roles: TeamRole | TeamRole[]
): MiddlewareHandler<{
  Variables: ApiVariables
}> => {
  return async (c, next) => {
    const authContext = c.get("auth")

    if (!authContext) {
      return c.json({ error: "Unauthorized" }, 401)
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles]

    if (!allowedRoles.includes(authContext.team.role)) {
      return c.json({ error: "Forbidden" }, 403)
    }

    return next()
  }
}
