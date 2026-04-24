import type { MiddlewareHandler } from "hono"
import type { Env } from "@env"
import type { ApiVariables } from "@/types/variables"
import { auth } from "@workspace/auth"
import {
  parseAuthMember,
  parseAuthSession,
  parseAuthUser,
} from "@workspace/schemas"
import { resolveOrganizationContext } from "@/utils/organization-context"

export const requireAuth: MiddlewareHandler<{
  Bindings: Env
  Variables: ApiVariables
}> = async (c, next) => {
  try {
    const authSession = await auth.api.getSession({
      headers: c.req.raw.headers,
    })

    const user = parseAuthUser(authSession?.user)
    const session = parseAuthSession(authSession?.session)

    if (!user || !session) {
      return c.json({ error: "Unauthorized" }, 401)
    }

    const requestedOrganizationId = c.req.header("x-organization-id")
    const context = await resolveOrganizationContext({
      user,
      session,
      requestedOrganizationId,
    })

    if (!context.organizationId || !context.member) {
      return c.json({ error: "Organization context not available" }, 403)
    }

    c.set("user", user)
    c.set("session", session)
    c.set("organizationId", context.organizationId)
    c.set("member", parseAuthMember(context.member))

    return next()
  } catch (error) {
    const traceId = c.req.header("x-request-id") ?? crypto.randomUUID()
    console.error("[requireAuth] unexpected error", {
      traceId,
      method: c.req.method,
      path: c.req.path,
      error,
    })

    return c.json({ error: "Auth error" }, 500)
  }
}
