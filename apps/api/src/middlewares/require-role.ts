import type { MiddlewareHandler } from "hono"
import type { ApiVariables } from "@/types/variables"
import {
  ROLE_HIERARCHY,
  type OrganizationRole,
} from "@workspace/auth/permissions"
import { HTTPException } from "hono/http-exception"

export const requireRole = (
  requiredRole: OrganizationRole
): MiddlewareHandler<{ Variables: ApiVariables }> => {
  return async (c, next) => {
    const member = c.get("member")
    const role = member?.role as OrganizationRole

    if (!member || !(role in ROLE_HIERARCHY)) {
      throw new HTTPException(401, { message: "Unauthorized" })
    }

    if (ROLE_HIERARCHY[role] < ROLE_HIERARCHY[requiredRole]) {
      throw new HTTPException(403, { message: "Forbidden" })
    }

    await next()
  }
}
