import { normalizeAiProvider } from "./get-model"

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message)
  }
}

assert(normalizeAiProvider(undefined) === "ollama", "default provider is ollama")
assert(normalizeAiProvider("openai") === "openai", "openai alias")
assert(normalizeAiProvider("groq") === "groq", "groq alias")
assert(normalizeAiProvider("google") === "google", "google alias")
assert(normalizeAiProvider("gemini") === "google", "gemini maps to google")
assert(normalizeAiProvider("GEMINI") === "google", "gemini is case-insensitive")

let threw = false
try {
  normalizeAiProvider("anthropic")
} catch {
  threw = true
}
assert(threw, "unknown provider throws")

console.log("get-model.test.ts: all assertions passed")
