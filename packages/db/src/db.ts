import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "../../db2/src/schemas"

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

// Create PostgreSQL client
const client = postgres(DATABASE_URL)

// Initialize Drizzle ORM
export const db = drizzle(client, { schema })

export default db
