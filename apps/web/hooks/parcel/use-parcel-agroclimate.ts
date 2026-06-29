"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { api } from "@workspace/web/lib/api"
import { mutationQueryOptions } from "@workspace/web/lib/dashboard/cache-policy"
import { dashboardQueryKeys } from "@workspace/web/lib/dashboard/query-keys"
import { toParcelApiResponse } from "@workspace/web/lib/parcel/mappers"
import { useDashboardScope } from "@workspace/web/hooks/dashboard/use-dashboard-scope"

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
