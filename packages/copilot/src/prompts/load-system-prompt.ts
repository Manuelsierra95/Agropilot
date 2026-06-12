import { agropilotAdditionalRules } from "./agropilot-additional-rules"
import { buildCopilotScopePrompt } from "./build-copilot-scope-prompt"
import { copilotSystemPrompt } from "./copilot-system-prompt"
import type { CopilotContext } from "../types/execute-query"

export function loadSystemPrompt(ctx: CopilotContext): string {
  return `${copilotSystemPrompt}\n\n${agropilotAdditionalRules}\n\n${buildCopilotScopePrompt(ctx)}`
}
