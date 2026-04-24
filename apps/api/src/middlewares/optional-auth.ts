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

    let organizationId: string | null = null
    let member = null

    if (user && session) {
      const requestedOrganizationId = c.req.header("x-organization-id")
      const context = await resolveOrganizationContext({
        user,
        session,
        requestedOrganizationId,
      })
      organizationId = context.organizationId
      member = parseAuthMember(context.member)
    }

    c.set("user", user)
    c.set("session", session)
    c.set("organizationId", organizationId)
    c.set("member", member)
  } catch (error) {
    const traceId = c.req.header("x-request-id") ?? crypto.randomUUID()
    console.error("[optionalAuth] unexpected error", {
      traceId,
      method: c.req.method,
      path: c.req.path,
      error,
    })

    c.set("user", null)
    c.set("session", null)
    c.set("organizationId", null)
    c.set("member", null)
  }

  return next()
}
