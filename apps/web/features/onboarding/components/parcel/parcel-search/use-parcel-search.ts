"use client"

import { useCallback, useState } from "react"
import type {
  ParcelSearchResult,
  SearchParcelFn,
  SearchParcelInput,
} from "./types"

export function useParcelSearch(searchParcel: SearchParcelFn) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(
    async (input: SearchParcelInput): Promise<ParcelSearchResult | null> => {
      setIsLoading(true)
      setError(null)

      try {
        console.log("Searching parcel with input:", input)
        const result = await searchParcel(input)
        console.log("Search result:", result)
        return result
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "No se pudo localizar la parcela. Inténtalo de nuevo."
        setError(message)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [searchParcel]
  )

  const clearError = useCallback(() => setError(null), [])

  return { isLoading, error, search, clearError, setError }
}
