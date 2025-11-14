import type { D1Database, RateLimit } from '@cloudflare/workers-types'

export type Env = {
  DB: D1Database
  NODE_ENV: 'development' | 'production' | 'test'
  RATE_LIMITER: RateLimit
  CACHE_MAX_AGE: number
  CACHE_STALE_WHILE_REVALIDATE: number
  ORIGINS: string
  CORS_MAX_AGE: number
  FRONTEND_URI: string
  BETTER_AUTH_SECRET: string
  BETTER_AUTH_URL: string
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
}
