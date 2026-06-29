"use client"

import { useMemo } from "react"

import type { DashboardScopeParams } from "@workspace/web/lib/dashboard/scope-key"
import { useDashboardScopeParams } from "@workspace/web/hooks/use-dashboard-scope-params"

export function useDashboardScope(): DashboardScopeParams {
  const [params] = useDashboardScopeParams()

  return useMemo(
    () => ({
      parcelId: params.parcelId,
      campaignId: params.campaignId,
      from: params.from,
      to: params.to,
    }),
    [params.parcelId, params.campaignId, params.from, params.to]
  )
}
