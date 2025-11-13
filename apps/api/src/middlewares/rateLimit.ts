import { cloudflareRateLimiter } from '@hono-rate-limiter/cloudflare'
import type { Env } from '@env'
import type { Context, MiddlewareHandler } from 'hono'

/**
 * Rate limiter middleware para Cloudflare Workers
 * Límite: X peticiones cada X minutos por IP
 */

// TODO: Falta implementacion y tests

const rateLimiter = cloudflareRateLimiter<{ Bindings: Env }>({
  rateLimitBinding: (c: Context<{ Bindings: Env }>) => c.env.RATE_LIMITER,
  keyGenerator: (c: Context<{ Bindings: Env }>) =>
    c.req.header('cf-connecting-ip') ||
    c.req.header('x-forwarded-for') ||
    c.req.header('x-real-ip') ||
    'unknown',
})

export const rateLimitMiddleware: MiddlewareHandler<{ Bindings: Env }> = async (
  c,
  next
) => {
  if (c.env.NODE_ENV === 'production') return rateLimiter(c, next)

  return next()
}
