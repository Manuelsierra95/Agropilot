"use client"

import { useMemo } from "react"
import { parseAsString, useQueryStates } from "nuqs"
import type { ScopeKey } from "@workspace/web/lib/navigation/scope"

const dashboardScopeParsers = {
  parcelId: parseAsString,
  campaignId: parseAsString,
  from: parseAsString,
  to: parseAsString,
}

export function usePreservedSearchParams() {
  const [params] = useQueryStates(dashboardScopeParsers, { shallow: true })

  const baseParams = useMemo(() => {
    const sp = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null) sp.set(key, value)
    })
    return sp
  }, [params])

  return (
    basePath: string,
    options?: {
      include?: ScopeKey[]
      override?: Partial<Record<ScopeKey, string | null>>
    }
  ) => {
    const searchParams = new URLSearchParams(baseParams)
    const include = options?.include

    if (include) {
      for (const key of Array.from(searchParams.keys())) {
        if (!include.includes(key as ScopeKey)) {
          searchParams.delete(key)
        }
      }
    }

    if (options?.override) {
      Object.entries(options.override).forEach(([k, v]) => {
        if (v === null) searchParams.delete(k)
        else searchParams.set(k, v)
      })
    }

    const qs = searchParams.toString()
    return qs ? `${basePath}?${qs}` : basePath
  }
}
