import * as schema from "./schemas"
// import { createNeonDatabase as createDatabase } from "./client/neon"
import { createLocalDatabase as createDatabase } from "./client/node"

type DatabaseInstance = ReturnType<typeof createDatabase>

let dbInstance: DatabaseInstance | null = null

const resolveDatabase = () => {
  if (dbInstance) {
    return dbInstance
  }

  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL environment variable is not set. Database client initialization is deferred until first use."
    )
  }

  dbInstance = createDatabase()

  return dbInstance
}

const db = new Proxy({} as DatabaseInstance, {
  get(target, prop, receiver) {
    return Reflect.get(resolveDatabase() as object, prop, receiver)
  },
})

export type Schema = typeof schema
export type Database = typeof db

// Export drizzle-orm utilities
export * from "drizzle-orm"

export * from "./schemas"
export { db, schema, resolveDatabase as getDb }
