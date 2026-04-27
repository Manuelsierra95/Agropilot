import type { MiddlewareHandler } from "hono"
import type { Env } from "@env"
import type { ApiVariables } from "@/types/variables"
import { auth } from "@workspace/auth"
import { parseAuthSession, parseAuthUser } from "@workspace/schemas"
import { eq, and, db, schema } from "@workspace/db"
import { HTTPException } from "hono/http-exception"

export const requireAuth: MiddlewareHandler<{
  Bindings: Env
  Variables: ApiVariables
}> = async (c, next) => {
  const authSession = await auth.api.getSession({
    headers: c.req.raw.headers,
  })

  const user = parseAuthUser(authSession?.user)
  const session = parseAuthSession(authSession?.session)

  if (!user || !session) {
    throw new HTTPException(401, { message: "Unauthorized" })
  }

  if (!session.activeOrganizationId) {
    throw new HTTPException(403, {
      message: "Organization context not available",
    })
  }

  const member = await db.query.members.findFirst({
    where: and(
      eq(schema.members.userId, user.id),
      eq(schema.members.organizationId, session.activeOrganizationId)
    ),
  })

  if (!member) {
    throw new HTTPException(403, {
      message: "Organization context not available",
    })
  }

  c.set("user", user)
  c.set("session", session)
  c.set("organizationId", session.activeOrganizationId)
  c.set("member", member)

  await next()
}
