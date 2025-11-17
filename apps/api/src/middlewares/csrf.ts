import { csrf } from 'hono/csrf'
import type { MiddlewareHandler } from 'hono'
import type { Env } from '@env'
import { DEVORIGINS, ORIGINS } from '@/config/constants'

export const csrfMiddleware: MiddlewareHandler<{ Bindings: Env }> = async (
  c,
  next
) => {
  const origin = c.env.NODE_ENV === 'production' ? ORIGINS : DEVORIGINS

  return csrf({
    origin: origin,
  })(c, next)
}
