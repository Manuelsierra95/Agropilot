import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'sqlite',
  schema: 'src/db/**.sql.ts',
  out: 'drizzle/migrations',
  driver: 'd1-http',
})
