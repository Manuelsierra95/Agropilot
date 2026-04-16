import type { MiddlewareHandler } from "hono"
import type { ApiVariables } from "@/types/variables"
import {
  ROLE_HIERARCHY,
  type OrganizationRole,
} from "@workspace/auth/permissions"

const hasRequiredRole = (
  currentRole: OrganizationRole,
  requiredRole: OrganizationRole
) => ROLE_HIERARCHY[currentRole] >= ROLE_HIERARCHY[requiredRole]

export const requireRole = (
  roles: OrganizationRole | OrganizationRole[]
): MiddlewareHandler<{
  Variables: ApiVariables
}> => {
  return async (c, next) => {
    const member = c.get("member")

    if (!member) {
      return c.json({ error: "Unauthorized" }, 401)
    }

    const role = member.role as OrganizationRole

    if (!(role in ROLE_HIERARCHY)) {
      return c.json({ error: "Forbidden" }, 403)
    }

    if (Array.isArray(roles)) {
      if (!roles.includes(role)) {
        return c.json({ error: "Forbidden" }, 403)
      }

      return next()
    }

    if (!hasRequiredRole(role, roles)) {
      return c.json({ error: "Forbidden" }, 403)
    }

    return next()
  }
}
