import type { MiddlewareHandler } from "hono"
import type { Env } from "@env"
import type { ApiVariables } from "@/types/variables"
import { auth } from "@workspace/auth"
import {
  buildAuthContext,
  parseAuthSession,
  parseAuthUser,
} from "@workspace/schemas"

export const optionalAuth: MiddlewareHandler<{
  Bindings: Env
  Variables: ApiVariables
}> = async (c, next) => {
  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    })

    const user = parseAuthUser(session?.user)
    const rawSession = parseAuthSession(session?.session)
    const authContext =
      user && rawSession ? buildAuthContext(user, rawSession) : null

    c.set("auth", authContext)
  } catch {
    c.set("auth", null)
  }

  return next()
}
