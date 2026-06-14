"use client"

import { useQuery } from "@tanstack/react-query"

import { api } from "@/lib/api"
import {
  dailyQueryOptions,
  mutationQueryOptions,
} from "@/lib/dashboard/cache-policy"
import { dashboardQueryKeys } from "@/lib/dashboard/query-keys"
import { buildDashboardScopeKey } from "@/lib/dashboard/scope-key"
import { useDashboardScope } from "@/hooks/dashboard/use-dashboard-scope"

export function useParcelsFinanceComparison() {
  const scope = useDashboardScope()

  return useQuery({
    queryKey: dashboardQueryKeys.parcelsFinanceComparison(scope),
    queryFn: () => api.finance.getParcelsFinanceComparison(scope),
    enabled: !scope.parcelId,
    ...mutationQueryOptions,
  })
}

export function useAllParcelsSellingWindows() {
  const scope = useDashboardScope()

  return useQuery({
    queryKey: dashboardQueryKeys.parcelsSellingWindows(scope),
    queryFn: () => api.finance.getParcelsSellingWindows(scope),
    enabled: !scope.parcelId,
    select: (data) => data.parcels,
    ...mutationQueryOptions,
  })
}

export function useAllParcelsCropOverviews() {
  const scope = useDashboardScope()

  return useQuery({
    queryKey: dashboardQueryKeys.parcelsCropOverviews(scope),
    queryFn: () => api.parcel.getParcelsCropOverviews(scope),
    enabled: !scope.parcelId,
    select: (data) => data.parcels,
    placeholderData: (prev) => prev,
  })
}

export function useAllParcelsRisks() {
  const scope = useDashboardScope()

  return useQuery({
    queryKey: dashboardQueryKeys.parcelsRisks(),
    queryFn: () => api.parcel.getParcelsRisks(),
    enabled: !scope.parcelId,
    select: (data) =>
      data.parcels.map((parcel) => ({
        parcelId: parcel.parcelId,
        name: parcel.name,
        risks: parcel.risks,
      })),
    ...dailyQueryOptions(),
  })
}

export function useAllParcelsRecommendations() {
  const scope = useDashboardScope()

  return useQuery({
    queryKey: dashboardQueryKeys.parcelsRecommendations(),
    queryFn: () => api.parcel.getParcelsRecommendations(),
    enabled: !scope.parcelId,
    select: (data) => {
      const items: Array<{
        parcelId: string
        parcelName: string
        type: string
        priority: "low" | "medium" | "high"
        message: string
        details: string
      }> = []

      for (const parcel of data.parcels) {
        for (const rec of parcel.recommendations) {
          items.push({
            parcelId: parcel.parcelId,
            parcelName: parcel.name,
            ...rec,
          })
        }
      }

      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return items.sort(
        (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
      )
    },
    ...dailyQueryOptions(),
  })
}

export function useAllParcelsScopeKey(): string {
  const scope = useDashboardScope()
  return buildDashboardScopeKey(scope)
}
