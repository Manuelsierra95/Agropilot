export type Env = {
  NODE_ENV: "development" | "production" | "test"
  CACHE_MAX_AGE: number
  CACHE_STALE_WHILE_REVALIDATE: number
  ORIGINS: string
  CORS_MAX_AGE: number
  FRONTEND_URI: string
  RESEND_API_KEY?: string
  EMAIL_FROM?: string
  WEB_APP_URL?: string
  BETTER_AUTH_SECRET: string
  BETTER_AUTH_URL: string
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  DATABASE_URL: string
  AI_PROVIDER?: string
  OLLAMA_MODEL?: string
  OLLAMA_BASE_URL?: string
  OPENAI_API_KEY?: string
  OPENAI_MODEL?: string
  GROQ_API_KEY?: string
  GROQ_MODEL?: string
  GOOGLE_GENERATIVE_AI_API_KEY?: string
  GOOGLE_MODEL?: string
}
