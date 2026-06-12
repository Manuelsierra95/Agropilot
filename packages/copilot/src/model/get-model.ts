import { google } from "@ai-sdk/google"
import { groq } from "@ai-sdk/groq"
import { openai } from "@ai-sdk/openai"
import type { LanguageModel } from "ai"
import { createOllama, ollama } from "ai-sdk-ollama"

export type AiProvider = "google" | "groq" | "ollama" | "openai"

const DEFAULT_MODELS = {
  openai: "gpt-4o-mini",
  groq: "llama-3.3-70b-versatile",
  google: "gemini-2.0-flash",
  ollama: "llama3.1:8b-instruct-q4_K_M",
} as const

/**
 * Env vars per provider (set in apps/api/.env):
 *
 * - ollama (default): OLLAMA_MODEL?, OLLAMA_BASE_URL?
 * - openai: OPENAI_API_KEY, OPENAI_MODEL?
 * - groq: GROQ_API_KEY, GROQ_MODEL?
 * - google / gemini: GOOGLE_GENERATIVE_AI_API_KEY, GOOGLE_MODEL?
 *
 * For reliable tool calling, prefer AI_PROVIDER=openai with gpt-4o-mini.
 * Local ollama models are suitable for offline experiments only.
 */
export function normalizeAiProvider(raw: string | undefined): AiProvider {
  const value = (raw ?? "ollama").toLowerCase()

  if (value === "gemini") return "google"

  if (
    value === "google" ||
    value === "groq" ||
    value === "ollama" ||
    value === "openai"
  ) {
    return value
  }

  throw new Error(
    `Unsupported AI_PROVIDER "${raw}". Use ollama, openai, groq, google, or gemini.`
  )
}

export function getAiProvider(): AiProvider {
  return normalizeAiProvider(process.env.AI_PROVIDER)
}

export function getChatModel(): LanguageModel {
  const provider = getAiProvider()

  switch (provider) {
    case "openai":
      return openai(process.env.OPENAI_MODEL ?? DEFAULT_MODELS.openai)

    case "groq":
      return groq(process.env.GROQ_MODEL ?? DEFAULT_MODELS.groq)

    case "google":
      return google(process.env.GOOGLE_MODEL ?? DEFAULT_MODELS.google)

    case "ollama": {
      const model = process.env.OLLAMA_MODEL ?? DEFAULT_MODELS.ollama
      const baseURL = process.env.OLLAMA_BASE_URL
      if (baseURL) {
        return createOllama({ baseURL })(model)
      }
      return ollama(model)
    }

    default: {
      const exhaustive: never = provider
      return exhaustive
    }
  }
}
