import { cors } from "hono/cors"
import type { Env } from "@env"
import type { MiddlewareHandler } from "hono"
import { DEVORIGINS, ORIGINS } from "@/config/constants"

export const corsMiddleware: MiddlewareHandler<{ Bindings: Env }> = (
  c,
  next
) => {
  const env = c.env

  const maxAge = env.CORS_MAX_AGE ?? 86400 // Default to 24 hours if not set

  return cors({
    origin: env.NODE_ENV === "production" ? ORIGINS : DEVORIGINS,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Cookie",
      "Set-Cookie",
    ],
    exposeHeaders: ["Set-Cookie", "X-CSRF-Token"],
    credentials: true,
    maxAge,
  })(c, next)
}
