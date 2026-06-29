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

    let cached: string | null = null
    try {
      if (!force) {
        cached = await redis.get(cacheKey)
      }
    } catch (error) {
      console.error("Cache middleware read error:", error)
    }

    if (cached) {
      try {
        const data = JSON.parse(cached)
        const res = Response.json(data.body, { status: data.status })
        res.headers.set("X-Cache", "HIT")
        res.headers.set("Content-Type", "application/json")
        return res
      } catch {
        // Fall through to fresh request if cache is corrupted
      }
    }

    await next()

    if (c.res && c.res.status === 200) {
      try {
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
      } catch (error) {
        console.error("Cache middleware write error:", error)
      }
    }

    return c.res
  }
}
