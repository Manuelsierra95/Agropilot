import { cache } from "react"

import { client } from "@workspace/web/lib/api/client"
import { isDemoMode } from "@workspace/web/lib/demo-mode"
import { getDemoCopilotSuggestions } from "@workspace/web/lib/mockdata"

async function fetchSuggestions(): Promise<string[]> {
  if (isDemoMode()) return getDemoCopilotSuggestions()
  const res = await client.api.v1.copilot.suggestions.$get()
  if (!res.ok) {
    throw new Error("Failed to fetch copilot suggestions")
  }
  const body = (await res.json()) as {
    meta: unknown
    data: { suggestions: string[] }
  }
  return body.data.suggestions
}

const getSuggestions = cache(fetchSuggestions)

export const copilotApi = {
  getSuggestions,
  fetchSuggestions,
}
