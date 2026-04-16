import type { MiddlewareHandler } from "hono"
import type { Env } from "@env"
import type { ApiVariables } from "@/types/variables"
import { auth } from "@workspace/auth"
import { resolveTeamContext } from "@/services/auth-context"
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

    let team = null
    if (user && session) {
      const requestedTeamId = c.req.header("x-team-id")
      team = await resolveTeamContext({ user, requestedTeamId })
    }

    c.set("user", user)
    c.set("session", session)
    c.set("team", team)
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
    c.set("team", null)
  }

  return next()
}
