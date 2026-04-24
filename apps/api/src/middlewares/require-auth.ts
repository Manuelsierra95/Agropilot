import type { MiddlewareHandler } from "hono"
import type { Env } from "@env"
import type { ApiVariables } from "@/types/variables"
import { auth } from "@workspace/auth"
import { parseAuthSession, parseAuthUser } from "@workspace/schemas"
import { eq, and } from "drizzle-orm"
import { db, schema } from "@workspace/db"

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

    if (!session.activeOrganizationId) {
      return c.json({ error: "Organization context not available" }, 403)
    }

    const member = await db.query.members.findFirst({
      where: and(
        eq(schema.members.userId, user.id),
        eq(schema.members.organizationId, session.activeOrganizationId)
      ),
    })

    if (!member) {
      return c.json({ error: "Organization context not available" }, 403)
    }

    c.set("user", user)
    c.set("session", session)
    c.set("organizationId", session.activeOrganizationId)
    c.set("member", member)

    return next()
  } catch (error) {
    console.error("[requireAuth] unexpected error", {
      method: c.req.method,
      path: c.req.path,
      error,
    })

    return c.json({ error: "Auth error" }, 500)
  }
}
