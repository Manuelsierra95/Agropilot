import { csrf } from "hono/csrf"
import type { Env } from "@env"
import type { MiddlewareHandler } from "hono"
import { DEVORIGINS, ORIGINS } from "@workspace/api/config/constants"

export const csrfMiddleware: MiddlewareHandler<{ Bindings: Env }> = (
  c,
  next
) => {
  const env = c.env
  const origin = env.NODE_ENV === "production" ? ORIGINS : DEVORIGINS

  return csrf({
    origin: origin,
  })(c, next)
}
