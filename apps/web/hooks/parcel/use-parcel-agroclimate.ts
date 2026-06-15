"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { api } from "@/lib/api"
import { mutationQueryOptions } from "@/lib/dashboard/cache-policy"
import { dashboardQueryKeys } from "@/lib/dashboard/query-keys"
import { toParcelApiResponse } from "@/lib/parcel/mappers"
import { useDashboardScope } from "@/hooks/dashboard/use-dashboard-scope"

export function useParcelAgroclimate() {
  const scope = useDashboardScope()
  const parcelId = scope.parcelId ?? ""

  return useQuery({
    queryKey: dashboardQueryKeys.parcelAgroclimate(scope),
    queryFn: () => api.parcel.getParcelAgroclimate(parcelId, scope),
    select: toParcelApiResponse,
    enabled: Boolean(parcelId),
    placeholderData: keepPreviousData,
    ...mutationQueryOptions,
  })
}
