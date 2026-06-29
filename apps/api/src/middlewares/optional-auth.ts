import type { MiddlewareHandler } from "hono"
import type { Env } from "@env"
import type { ApiVariables } from "@workspace/api/types/variables"
import { auth } from "@workspace/auth"
import { parseAuthSession, parseAuthUser } from "@workspace/schemas"

export const optionalAuth: MiddlewareHandler<{
  Bindings: Env
  Variables: ApiVariables
}> = async (c, next) => {
  try {
    const authSession = await auth.api.getSession({
      headers: c.req.raw.headers,
    })

    const user = parseAuthUser(authSession?.user)
    const session = parseAuthSession(authSession?.session)

    c.set("user", user)
    c.set("session", session)
    c.set("organizationId", session?.activeOrganizationId ?? null)
  } catch (error) {
    console.error("[optionalAuth] unexpected error", {
      method: c.req.method,
      path: c.req.path,
      error,
    })

    c.set("user", null)
    c.set("session", null)
    c.set("organizationId", null)
  }

  return next()
}
