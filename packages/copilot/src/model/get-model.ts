import { openai } from "@ai-sdk/openai"
import type { LanguageModel } from "ai"
import { createOllama, ollama } from "ai-sdk-ollama"

export function getAiProvider(): string {
  return process.env.AI_PROVIDER ?? "ollama"
}

export function getChatModel(): LanguageModel {
  const provider = getAiProvider()
  const model = process.env.OLLAMA_MODEL ?? "llama3.1:8b-instruct-q4_K_M"

  if (provider === "openai") {
    return openai(process.env.OPENAI_MODEL ?? "gpt-4o-mini")
  }

  const baseURL = process.env.OLLAMA_BASE_URL
  if (baseURL) {
    return createOllama({ baseURL })(model)
  }

  return ollama(model)
}
