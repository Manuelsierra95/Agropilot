import * as schema from "../schemas"
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

export function createDatabaseClient() {
  const databaseURL = process.env.DATABASE_URL

  if (!databaseURL) {
    throw new Error("DATABASE_URL environment variable is not set")
  }

  const pool = new Pool({
    connectionString: databaseURL,
  })

  return drizzle(pool, { schema })
}
