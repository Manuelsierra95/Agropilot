import { defineConfig } from "drizzle-kit"
import dotenv from "dotenv"

dotenv.config()

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error("Missing database URL. Set DATABASE_URL.")
}

export default defineConfig({
  dialect: "postgresql",
  schema: "src/schemas/index.ts",
  out: "src/migrations",
  dbCredentials: {
    url: databaseUrl,
  },
})
