import * as schema from "../schemas"
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

export const createLocalDatabase = () => {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set")
  }

  const pool = new Pool({
    connectionString: databaseUrl,
  })

  return drizzle(pool, { schema })
}
