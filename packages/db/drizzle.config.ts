import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./src/tables",
  out: "./src/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "",
  },
})
