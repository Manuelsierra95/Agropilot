"use client"

import { useQuery } from "@tanstack/react-query"

import { api } from "@workspace/web/lib/api"
import type { HarvestDeliveriesQuery } from "@workspace/schemas"

export function useHarvestDeliveries(query: HarvestDeliveriesQuery) {
  return useQuery({
    queryKey: ["harvest-deliveries", query.parcelId, query.status],
    queryFn: () => api.production.getHarvestDeliveries(query),
    enabled: Boolean(query.parcelId),
  })
}
