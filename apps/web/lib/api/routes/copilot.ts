import { cache } from "react"

import { client } from "@/lib/api/client"

export type CopilotSuggestionsResponse = {
  suggestions: string[]
}

const getSuggestions = cache(
  (): Promise<string[]> =>
    client.api.v1.copilot.suggestions
      .$get()
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch copilot suggestions")
        }
        return res.json()
      })
      .then((data: CopilotSuggestionsResponse) => data.suggestions)
)

export const copilotApi = {
  getSuggestions,
}
