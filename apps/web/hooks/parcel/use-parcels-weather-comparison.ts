"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { api } from "@workspace/web/lib/api"
import { mutationQueryOptions } from "@workspace/web/lib/dashboard/cache-policy"
import { dashboardQueryKeys } from "@workspace/web/lib/dashboard/query-keys"
import {
  buildAllModeSummary,
  toParcelComparisonItems,
} from "@workspace/web/lib/parcel/mappers"
import { useDashboardScope } from "@workspace/web/hooks/dashboard/use-dashboard-scope"
import { useIsAllParcelsSelected } from "@workspace/web/hooks/use-is-all-parcels-selected"

export function useParcelsWeatherComparison() {
  const scope = useDashboardScope()
  const isAllParcels = useIsAllParcelsSelected()

  return useQuery({
    queryKey: dashboardQueryKeys.parcelsWeatherComparison(scope),
    queryFn: () => api.parcel.getParcelsWeatherComparison(scope),
    select: (comparison) => ({
      items: toParcelComparisonItems(comparison),
      summary: buildAllModeSummary(toParcelComparisonItems(comparison)),
    }),
    enabled: isAllParcels,
    placeholderData: keepPreviousData,
    ...mutationQueryOptions,
  })
}
