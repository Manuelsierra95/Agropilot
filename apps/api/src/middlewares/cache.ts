import type { MiddlewareHandler } from "hono"
import { redis } from "@workspace/db"

interface CacheConfig {
  ttlSeconds?: number
}

export function createCacheMiddleware(
  config: CacheConfig = {}
): MiddlewareHandler {
  const { ttlSeconds = 300 } = config

  return async (c, next) => {
    if (c.req.method !== "GET") {
      return await next()
    }

    const session = c.get("session")
    const organizationId = session?.activeOrganizationId
    if (!organizationId) {
      return await next()
    }

    const force = c.req.query("force") === "true"

    const url = new URL(c.req.url)
    const path = url.pathname
    url.searchParams.delete("force")
    const cacheKey = `cache:${organizationId}:${path}:${url.searchParams.toString()}`

    try {
      if (!force) {
        const cached = await redis.get(cacheKey)
        if (cached) {
          const data = JSON.parse(cached)
          const res = Response.json(data.body, { status: data.status })
          res.headers.set("X-Cache", "HIT")
          res.headers.set("Content-Type", "application/json")
          return res
        }
      }

      await next()

      if (c.res && c.res.status === 200) {
        const responseClone = c.res.clone()
        const body = await responseClone.json()

        await redis.setex(
          cacheKey,
          ttlSeconds,
          JSON.stringify({
            body,
            status: c.res.status,
          })
        )

        c.res.headers.set("X-Cache", "MISS")
      }
    } catch (error) {
      console.error("Cache middleware error:", error)
    }

    return c.res
  }
}
