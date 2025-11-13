import type { MiddlewareHandler } from 'hono'
import type { Env } from '@env'
import type { CustomContext } from 'globals'
import { isAuthenticated } from '@/middlewares/auth'

/**
 * Middleware para manejar la caché de respuestas
 * Almacena en caché las respuestas de las peticiones GET
 * Soporta la invalidación de caché a través de un parámetro de consulta
 * El parámetro 'force' solo funciona con peticiones autenticadas
 */

// TODO: Falta implementacion de auth y tests

export const cacheMiddleware: MiddlewareHandler<
  { Bindings: Env } & CustomContext
> = async (c, next) => {
  const maxAge = c.env.CACHE_MAX_AGE || 604800 // Default 7 días
  const staleWhileRevalidate = c.env.CACHE_STALE_WHILE_REVALIDATE || 259200 // Default 3 días
  const cacheKey = c.req.url

  if (c.req.method !== 'GET') {
    return await next()
  }

  const forceParam = c.req.query('force') === 'true'
  const authenticated = isAuthenticated(c)
  const force = forceParam && authenticated
  const cache = (globalThis as any).caches?.default

  const cacheKeyRequest = new Request(cacheKey)

  try {
    if (!force && cache) {
      const cachedResponse = await cache.match(cacheKeyRequest)
      if (cachedResponse) {
        const res = new Response(cachedResponse.body, cachedResponse)
        res.headers.set('X-Cache', 'HIT')
        return res
      }
    }

    await next()

    if (c.res && c.res.status === 200 && cache) {
      const response = c.res.clone()

      response.headers.set(
        'Cache-Control',
        `public, max-age=${maxAge}${
          staleWhileRevalidate
            ? `, stale-while-revalidate=${staleWhileRevalidate}`
            : ''
        }`
      )
      response.headers.set(
        'Expires',
        new Date(Date.now() + maxAge * 1000).toUTCString()
      )
      response.headers.set('X-Cache', 'MISS')

      c.executionCtx?.waitUntil(cache.put(cacheKeyRequest, response))
    }
  } catch (error) {
    if (!c.res) {
      await next()
    }
  }

  return c.res
}
