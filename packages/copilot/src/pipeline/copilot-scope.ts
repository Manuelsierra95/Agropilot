import type { CopilotIntentResult } from "../schemas/copilot-intent-schema"

const INFORMATIVE_PROSE_MIN_LENGTH = 120

export function looksLikeInformativeProse(text: string): boolean {
  const trimmed = text.trim()
  if (trimmed.length > INFORMATIVE_PROSE_MIN_LENGTH) return true

  const sentenceBoundaries = trimmed.match(/[.!?]\s+/g) ?? []
  if (sentenceBoundaries.length >= 2) return true

  return false
}

export function recoverIntentFromProse(text: string): CopilotIntentResult {
  const message = text.trim()
  if (!message) {
    return { ok: false, reason: "invalid_intent" }
  }

  if (looksLikeInformativeProse(message)) {
    return { ok: true, intent: { intent: "out_of_scope" } }
  }

  return { ok: true, intent: { intent: "chat", message } }
}
