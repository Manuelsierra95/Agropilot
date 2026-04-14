import type { MiddlewareHandler } from "hono"
import type { Env } from "@env"
import type { ApiVariables } from "@/types/variables"
import { auth } from "@workspace/auth"
import {
  buildAuthContext,
  parseAuthSession,
  parseAuthUser,
} from "@workspace/schemas"

export const requireAuth: MiddlewareHandler<{
  Bindings: Env
  Variables: ApiVariables
}> = async (c, next) => {
  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    })

    const user = parseAuthUser(session?.user)
    const rawSession = parseAuthSession(session?.session)

    if (!user || !rawSession) {
      return c.json({ error: "Unauthorized" }, 401)
    }

    c.set("auth", buildAuthContext(user, rawSession))

    return next()
  } catch {
    return c.json({ error: "Auth error" }, 500)
  }
}
