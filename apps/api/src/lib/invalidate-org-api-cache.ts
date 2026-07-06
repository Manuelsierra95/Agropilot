import { redis } from "@workspace/db"

const DEFAULT_PATH_PREFIXES = [
  "/api/v1/dashboard",
  "/api/v1/finance",
] as const

export async function invalidateOrganizationApiCache(
  organizationId: string,
  pathPrefixes: readonly string[] = DEFAULT_PATH_PREFIXES
): Promise<void> {
  try {
    for (const pathPrefix of pathPrefixes) {
      const pattern = `cache:${organizationId}:${pathPrefix}*`
      let cursor = "0"

      do {
        const [nextCursor, keys] = await redis.scan(
          cursor,
          "MATCH",
          pattern,
          "COUNT",
          100
        )
        cursor = nextCursor

        if (keys.length > 0) {
          await redis.del(...keys)
        }
      } while (cursor !== "0")
    }
  } catch (error) {
    console.error("Failed to invalidate organization API cache:", error)
  }
}
