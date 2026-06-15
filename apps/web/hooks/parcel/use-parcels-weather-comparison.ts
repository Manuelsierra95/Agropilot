"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { api } from "@/lib/api"
import { mutationQueryOptions } from "@/lib/dashboard/cache-policy"
import { dashboardQueryKeys } from "@/lib/dashboard/query-keys"
import {
  buildAllModeSummary,
  toParcelComparisonItems,
} from "@/lib/parcel/mappers"
import { useDashboardScope } from "@/hooks/dashboard/use-dashboard-scope"
import { useIsAllParcelsSelected } from "@/hooks/use-is-all-parcels-selected"

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
