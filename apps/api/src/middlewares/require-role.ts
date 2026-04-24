import type { MiddlewareHandler } from "hono"
import type { ApiVariables } from "@/types/variables"
import {
  ROLE_HIERARCHY,
  type OrganizationRole,
} from "@workspace/auth/permissions"
import { AuthMember } from "@workspace/schemas"

export const requireRole = (
  requiredRole: OrganizationRole
): MiddlewareHandler<{ Variables: ApiVariables }> => {
  return async (c, next) => {
    const member = c.get("member")
    const role = member?.role as OrganizationRole

    if (!member || !(role in ROLE_HIERARCHY)) {
      return c.json({ error: "Unauthorized" }, 401)
    }

    if (ROLE_HIERARCHY[role] < ROLE_HIERARCHY[requiredRole]) {
      return c.json({ error: "Forbidden" }, 403)
    }

    return next()
  }
}
