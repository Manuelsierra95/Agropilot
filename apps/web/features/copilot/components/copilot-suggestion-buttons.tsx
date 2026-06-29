"use client"

import { useCopilotChat } from "@workspace/web/features/copilot/copilot-chat-provider"

export function CopilotSuggestionButtons({
  suggestions,
}: {
  suggestions: string[]
}) {
  const { selectSuggestion } = useCopilotChat()

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          type="button"
          onClick={() => selectSuggestion(suggestion)}
          className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {suggestion}
        </button>
      ))}
    </div>
  )
}
