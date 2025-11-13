import { csrf } from 'hono/csrf'
import type { MiddlewareHandler } from 'hono'
import type { Env } from '@env'
import { ORIGINS } from '@/config/constants'

export const csrfMiddleware: MiddlewareHandler<{ Bindings: Env }> = async (
  c,
  next
) => {
  const origin = ORIGINS

  return csrf({
    origin: origin,
  })(c, next)
}
