import type { MiddlewareHandler } from "hono"
import type { Env } from "@env"
import type { ApiVariables } from "@workspace/api/types/variables"
import { auth } from "@workspace/auth"
import { isDemoEnabled, isDemoUser } from "@workspace/auth/demo"
import { HTTPException } from "hono/http-exception"

const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"])

export const blockDemoMutations: MiddlewareHandler<{
  Bindings: Env
  Variables: ApiVariables
}> = async (c, next) => {
  if (!isDemoEnabled() || !MUTATION_METHODS.has(c.req.method)) {
    await next()
    return
  }

  const path = c.req.path
  if (path.includes("/auth/")) {
    await next()
    return
  }

  const authSession = await auth.api.getSession({
    headers: c.req.raw.headers,
  })

  const userId = authSession?.user?.id
  if (userId && isDemoUser(userId)) {
    throw new HTTPException(403, {
      message: "Modo demostración: solo lectura",
    })
  }

  await next()
}
