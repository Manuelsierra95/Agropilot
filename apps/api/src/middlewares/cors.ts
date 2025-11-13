import { cors } from 'hono/cors'
import type { MiddlewareHandler } from 'hono'
import type { Env } from '@env'
import { ORIGINS } from '@/config/constants'

export const corsMiddleware: MiddlewareHandler<{ Bindings: Env }> = async (
  c,
  next
) => {
  const maxAge = c.env.CORS_MAX_AGE || 86400 // Default 1 día

  return cors({
    origin: ORIGINS,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Cookie',
      'Set-Cookie',
    ],
    exposeHeaders: ['Set-Cookie'],
    credentials: true,
    maxAge,
  })(c, next)
}
