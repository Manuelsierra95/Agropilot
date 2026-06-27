"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { usePreservedSearchParams } from "@/hooks/use-preserved-search-params"
import type { ScopeKey } from "./scope"

export function useNavigateWithScope() {
  const router = useRouter()
  const buildUrl = usePreservedSearchParams()

  return useCallback(
    (
      url: string,
      options?: {
        include?: ScopeKey[]
        override?: Partial<Record<ScopeKey, string | null>>
      },
    ) => {
      router.push(buildUrl(url, options))
    },
    [router, buildUrl],
  )
}
