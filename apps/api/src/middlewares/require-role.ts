import type { MiddlewareHandler } from "hono"
import type { ApiVariables } from "@/types/variables"
import { TEAM_ROLE_HIERARCHY, type TeamRole } from "@workspace/schemas"

const hasRequiredRole = (currentRole: TeamRole, requiredRole: TeamRole) =>
  TEAM_ROLE_HIERARCHY[currentRole] >= TEAM_ROLE_HIERARCHY[requiredRole]

export const requireRole = (
  roles: TeamRole | TeamRole[]
): MiddlewareHandler<{
  Variables: ApiVariables
}> => {
  return async (c, next) => {
    const team = c.get("team")

    if (!team) {
      return c.json({ error: "Unauthorized" }, 401)
    }

    if (Array.isArray(roles)) {
      if (!roles.includes(team.role)) {
        return c.json({ error: "Forbidden" }, 403)
      }

      return next()
    }

    if (!hasRequiredRole(team.role, roles)) {
      return c.json({ error: "Forbidden" }, 403)
    }

    return next()
  }
}
