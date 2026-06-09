import { cn } from "@workspace/ui/lib/utils"

import { api } from "@/lib/api"

import { CopilotEmptyState } from "./copilot-empty-state"
import { CopilotRecommendationsHeader } from "./copilot-recommendations-header"
import { CopilotSuggestionButtons } from "./copilot-suggestion-buttons"

export async function CopilotRecommendations({
  className,
}: {
  className?: string
}) {
  const suggestions = await api.copilot.getSuggestions()

  return (
    <CopilotEmptyState>
      <div
        className={cn(
          "flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center",
          className
        )}
      >
        <CopilotRecommendationsHeader />
        <CopilotSuggestionButtons suggestions={suggestions} />
      </div>
    </CopilotEmptyState>
  )
}
