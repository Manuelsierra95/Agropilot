import Redis from "ioredis"

export function createRedisClient(): Redis {
  const redisURL = process.env.REDIS_URL

  if (!redisURL) {
    throw new Error("REDIS_URL environment variable is not set")
  }

  const client = new Redis(redisURL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    // lazyConnect: true,
  })

  return client
}
