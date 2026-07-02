"use client"

import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

import { api } from "@workspace/web/lib/api"

import { CopilotEmptyState } from "@workspace/web/features/copilot/components/copilot-empty-state"
import { CopilotRecommendationsHeader } from "@workspace/web/features/copilot/components/copilot-recommendations-header"
import { CopilotSuggestionButtons } from "@workspace/web/features/copilot/components/copilot-suggestion-buttons"

export function CopilotRecommendations({ className }: { className?: string }) {
  const { data: suggestions, isLoading } = useQuery({
    queryKey: ["copilot", "suggestions"],
    queryFn: () => api.copilot.fetchSuggestions(),
  })

  return (
    <CopilotEmptyState>
      <div
        className={cn(
          "flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center",
          className
        )}
      >
        <CopilotRecommendationsHeader />
        {isLoading ? (
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        ) : (
          <CopilotSuggestionButtons suggestions={suggestions ?? []} />
        )}
      </div>
    </CopilotEmptyState>
  )
}
