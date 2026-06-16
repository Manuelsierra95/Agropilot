import * as schema from "./schemas"
import { createDatabaseClient } from "./client/node"
import type { Redis } from "ioredis"
import { createRedisClient } from "./client/redis"

type DatabaseInstance = ReturnType<typeof createDatabaseClient>

let dbInstance: DatabaseInstance | null = null

const resolveDatabase = () => {
  if (dbInstance) {
    return dbInstance
  }
  dbInstance = createDatabaseClient()
  return dbInstance
}

const db = new Proxy({} as DatabaseInstance, {
  get(target, prop, receiver) {
    return Reflect.get(resolveDatabase() as object, prop, receiver)
  },
})

let redisInstance: Redis | null = null

const resolveRedis = () => {
  if (redisInstance) {
    return redisInstance
  }

  redisInstance = createRedisClient()
  return redisInstance
}

const redis = new Proxy({} as Redis, {
  get(target, prop, receiver) {
    return Reflect.get(resolveRedis() as object, prop, receiver)
  },
})

export type Schema = typeof schema
export type Database = typeof db
export type RedisClient = typeof redis

// Explicit re-exports so Node ESM consumers (e.g. tsx in @workspace/seeds) can
// use named imports; `export *` alone does not surface these at runtime.
export {
  and,
  asc,
  desc,
  eq,
  gte,
  isNotNull,
  isNull,
  lte,
  ne,
  or,
  sql,
} from "drizzle-orm"

export * from "drizzle-orm"

export * from "./schemas"
export { db, schema, resolveDatabase as getDb, redis, resolveRedis as getRedis }
