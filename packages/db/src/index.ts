import * as schemaNs from "./schemas"
import { createDatabaseClient } from "./client/node"
import type { Redis } from "ioredis"
import { createRedisClient } from "./client/redis"

type DatabaseInstance = ReturnType<typeof createDatabaseClient>

let dbInstance: DatabaseInstance | null = null

export const resolveDatabase = () => {
  if (dbInstance) {
    return dbInstance
  }
  dbInstance = createDatabaseClient()
  return dbInstance
}

export const db = new Proxy({} as DatabaseInstance, {
  get(target, prop, receiver) {
    return Reflect.get(resolveDatabase() as object, prop, receiver)
  },
})

let redisInstance: Redis | null = null

export const resolveRedis = () => {
  if (redisInstance) {
    return redisInstance
  }

  redisInstance = createRedisClient()
  return redisInstance
}

export const redis = new Proxy({} as Redis, {
  get(target, prop, receiver) {
    return Reflect.get(resolveRedis() as object, prop, receiver)
  },
})

export const schema = schemaNs

export type Schema = typeof schema
export type Database = typeof db
export type RedisClient = typeof redis

export const getDb = resolveDatabase
export const getRedis = resolveRedis

// Explicit re-exports so Node ESM consumers (e.g. tsx in @workspace/jobs) can
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
