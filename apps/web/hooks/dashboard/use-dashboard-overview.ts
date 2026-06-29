"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { api } from "@workspace/web/lib/api"
import { mutationQueryOptions } from "@workspace/web/lib/dashboard/cache-policy"
import { dashboardQueryKeys } from "@workspace/web/lib/dashboard/query-keys"
import { buildDashboardScopeKey } from "@workspace/web/lib/dashboard/scope-key"
import { useDashboardScope } from "@workspace/web/hooks/dashboard/use-dashboard-scope"
import { useSellingWindowOverridesStore } from "@workspace/web/store/useSellingWindowOverridesStore"
import type {
  DashboardOverviewAll,
  DashboardOverviewSingle,
} from "@workspace/schemas"

export function useDashboardOverview() {
  const scope = useDashboardScope()
  const scopeKey = buildDashboardScopeKey(scope)
  const overrides = useSellingWindowOverridesStore(
    (state) => state.overridesByScopeKey[scopeKey]
  )

  const query = useQuery({
    queryKey: dashboardQueryKeys.overview(scope),
    queryFn: () => api.dashboard.getDashboardOverview(scope),
    placeholderData: keepPreviousData,
    ...mutationQueryOptions,
  })

  const data = useMemo(() => {
    if (!query.data) return undefined
    const overview = query.data as
      | (DashboardOverviewSingle & {
          market: { sellingWindow: DashboardOverviewSingle["market"]["sellingWindow"] }
        })
      | DashboardOverviewAll

    if (!("sellingWindow" in overview.market)) return overview

    return {
      ...overview,
      market: {
        ...overview.market,
        sellingWindow: {
          ...overview.market.sellingWindow,
          estimatedKg:
            overrides?.estimatedKg ?? overview.market.sellingWindow.estimatedKg,
          campaignTarget:
            overrides?.campaignTarget ??
            overview.market.sellingWindow.campaignTarget,
        },
      },
    }
  }, [overrides, query.data])

  return { ...query, data, scopeKey }
}
