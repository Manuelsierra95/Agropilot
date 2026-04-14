import * as schema from "../schemas"
import { neon } from "@neondatabase/serverless"
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http"

export const createNeonDatabase = () => {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set")
  }

  return drizzleNeon({
    client: neon(databaseUrl),
    schema,
  })
}
