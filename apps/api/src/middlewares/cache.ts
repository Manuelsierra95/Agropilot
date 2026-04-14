import type { Env } from "@env"
import type { MiddlewareHandler } from "hono"

/**
 * Middleware para manejar la caché de respuestas
 * Almacena en caché las respuestas de las peticiones GET
 * Soporta la invalidación de caché a través de un parámetro de consulta
 */

// TODO: Falta tests

export const cacheMiddleware: MiddlewareHandler<{ Bindings: Env }> = async (
  c,
  next
) => {
  const env = c.env
  const maxAge = env.CACHE_MAX_AGE || 604800 // Default 7 días
  const staleWhileRevalidate = env.CACHE_STALE_WHILE_REVALIDATE || 259200 // Default 3 días
  const cacheKey = c.req.url

  if (c.req.method !== "GET") {
    return await next()
  }

  const force = c.req.query("force") === "true"
  const cache = (globalThis as any).caches?.default

  const cacheKeyRequest = new Request(cacheKey)

  try {
    if (!force && cache) {
      const cachedResponse = await cache.match(cacheKeyRequest)
      if (cachedResponse) {
        const res = new Response(cachedResponse.body, cachedResponse)
        res.headers.set("X-Cache", "HIT")
        return res
      }
    }

    await next()

    if (c.res && c.res.status === 200 && cache) {
      const response = c.res.clone()

      response.headers.set(
        "Cache-Control",
        `public, max-age=${maxAge}${
          staleWhileRevalidate
            ? `, stale-while-revalidate=${staleWhileRevalidate}`
            : ""
        }`
      )
      response.headers.set(
        "Expires",
        new Date(Date.now() + maxAge * 1000).toUTCString()
      )
      response.headers.set("X-Cache", "MISS")

      c.executionCtx?.waitUntil(cache.put(cacheKeyRequest, response))
    }
  } catch {
    if (!c.res) {
      await next()
    }
  }

  return c.res
}
