import { cache } from "react"

import { client } from "@/lib/api/client"

export type CopilotSuggestionsResponse = {
  suggestions: string[]
}

async function fetchSuggestions(): Promise<string[]> {
  const res = await client.api.v1.copilot.suggestions.$get()
  if (!res.ok) {
    throw new Error("Failed to fetch copilot suggestions")
  }
  const data: CopilotSuggestionsResponse = await res.json()
  return data.suggestions
}

const getSuggestions = cache(fetchSuggestions)

export const copilotApi = {
  getSuggestions,
  fetchSuggestions,
}
