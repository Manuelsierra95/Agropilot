"use client"

import { useEffect, useRef, useState } from "react"

import { searchPlaces } from "@/lib/geocoding/search-places"
import type { PlaceSuggestion } from "@/lib/geocoding/types"

const DEBOUNCE_MS = 300
const MIN_QUERY_LENGTH = 2

export function usePlaceSearch() {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const abortRef = useRef<AbortController | null>(null)
  const requestIdRef = useRef(0)
  const skipSearchRef = useRef(false)

  useEffect(() => {
    if (skipSearchRef.current) {
      skipSearchRef.current = false
      return
    }

    const trimmed = query.trim()

    if (trimmed.length < MIN_QUERY_LENGTH) {
      abortRef.current?.abort()
      setSuggestions([])
      setIsSearching(false)
      setError(null)
      return
    }

    const timeoutId = window.setTimeout(() => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      const requestId = ++requestIdRef.current
      setIsSearching(true)
      setError(null)

      void searchPlaces(trimmed, { signal: controller.signal })
        .then((results) => {
          if (requestId !== requestIdRef.current) return
          setSuggestions(results)
          setIsOpen(true)
        })
        .catch((err: unknown) => {
          if (requestId !== requestIdRef.current) return
          if (err instanceof DOMException && err.name === "AbortError") return
          setSuggestions([])
          setError(
            err instanceof Error
              ? err.message
              : "Error al buscar ubicaciones"
          )
        })
        .finally(() => {
          if (requestId !== requestIdRef.current) return
          setIsSearching(false)
        })
    }, DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [query])

  const clear = () => {
    abortRef.current?.abort()
    setQuery("")
    setSuggestions([])
    setError(null)
    setIsOpen(false)
    setIsSearching(false)
  }

  const applySelection = (label: string) => {
    abortRef.current?.abort()
    skipSearchRef.current = true
    setQuery(label)
    setSuggestions([])
    setError(null)
    setIsOpen(false)
    setIsSearching(false)
  }

  return {
    query,
    setQuery,
    suggestions,
    isSearching,
    error,
    isOpen,
    setIsOpen,
    clear,
    applySelection,
  }
}
