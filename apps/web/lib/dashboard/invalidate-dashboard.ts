import type { QueryClient } from "@tanstack/react-query"

import {
  dashboardQueryKeys,
  type DashboardCacheFamily,
} from "@workspace/web/lib/dashboard/query-keys"
import type { DashboardScopeParams } from "@workspace/web/lib/dashboard/scope-key"

/** Queries que no dependen del scope parcela/campaña. */
const GLOBAL_KEY_SEGMENTS = new Set(["olive-prices", "parcels-map"])

const FAMILY_KEY_SEGMENTS: Record<DashboardCacheFamily, readonly string[]> = {
  finance: [
    "overview",
    "finance-resume",
    "finance-transactions",
    "campaign-margin",
    "recent-transactions",
    "selling-window",
    "parcels-selling-windows",
  ],
  production: ["overview", "production-value", "selling-window"],
  events: ["upcoming-week", "calendar-events"],
  parcels: [
    "parcels-map",
    "crop-overview",
    "parcel-agroclimate",
    "parcels-weather-comparison",
  ],
  daily: [
    "olive-prices",
    "recommendations",
    "risks",
    "parcel-agroclimate",
    "parcels-weather-comparison",
  ],
}

function segmentsForFamilies(
  families: DashboardCacheFamily[],
  scope?: DashboardScopeParams
) {
  const segments = families.flatMap((family) => FAMILY_KEY_SEGMENTS[family])
  if (!scope) return segments
  return segments.filter((segment) => !GLOBAL_KEY_SEGMENTS.has(segment))
}

export function invalidateDashboard(
  queryClient: QueryClient,
  families: DashboardCacheFamily[],
  scope?: DashboardScopeParams
) {
  if (families.length === 0) return

  if (families.length >= Object.keys(FAMILY_KEY_SEGMENTS).length) {
    void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all })
    return
  }

  const segments = new Set(segmentsForFamilies(families, scope))
  if (segments.size === 0) return

  void queryClient.invalidateQueries({
    predicate: (query) => {
      const key = query.queryKey
      if (!Array.isArray(key) || key[0] !== "dashboard") return false

      const segment = key[1]
      if (typeof segment !== "string" || !segments.has(segment)) return false

      if (!scope) return true

      const scopeSegment = key[2]
      if (typeof scopeSegment !== "string") return true

      return scopeSegment.includes(scope.parcelId ?? "")
    },
  })
}
