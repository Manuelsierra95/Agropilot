import type { Env } from "@env"
import type { app } from "api/app"

export const testEnv: Env = {
  NODE_ENV: "test",
  CACHE_MAX_AGE: 60,
  CACHE_STALE_WHILE_REVALIDATE: 120,
  ORIGINS: "http://localhost:3000",
  CORS_MAX_AGE: 86400,
  FRONTEND_URI: "http://localhost:3000",
  BETTER_AUTH_SECRET: "test-secret",
  BETTER_AUTH_URL: "http://localhost:3001",
  GOOGLE_CLIENT_ID: "test-google-client",
  GOOGLE_CLIENT_SECRET: "test-google-secret",
  DATABASE_URL: "postgres://test:test@localhost:5432/test",
}

type App = typeof app

export function apiRequest(
  appInstance: App,
  path: string,
  init?: RequestInit
) {
  return appInstance.request(path, init, testEnv)
}
