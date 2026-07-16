import type { Env } from "@env"

export function getRuntimeBindings(): Env {
  return {
    NODE_ENV: (process.env.NODE_ENV as Env["NODE_ENV"]) ?? "development",
    CACHE_MAX_AGE: Number(process.env.CACHE_MAX_AGE ?? 60),
    CACHE_STALE_WHILE_REVALIDATE: Number(
      process.env.CACHE_STALE_WHILE_REVALIDATE ?? 120
    ),
    ORIGINS: process.env.ORIGINS ?? "",
    CORS_MAX_AGE: Number(process.env.CORS_MAX_AGE ?? 86400),
    FRONTEND_URI: process.env.FRONTEND_URI ?? "",
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    WEB_APP_URL: process.env.WEB_APP_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET!,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL!,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
    DATABASE_URL: process.env.DATABASE_URL!,
    AI_PROVIDER: process.env.AI_PROVIDER,
    OLLAMA_MODEL: process.env.OLLAMA_MODEL,
    OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_MODEL: process.env.OPENAI_MODEL,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    GROQ_MODEL: process.env.GROQ_MODEL,
    GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    GOOGLE_MODEL: process.env.GOOGLE_MODEL,
  }
}
