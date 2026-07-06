"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { api } from "@workspace/web/lib/api"
import {
  dailyQueryOptions,
  mutationQueryOptions,
} from "@workspace/web/lib/dashboard/cache-policy"
import { dashboardQueryKeys } from "@workspace/web/lib/dashboard/query-keys"
import { buildDashboardScopeKey } from "@workspace/web/lib/dashboard/scope-key"
import { useDashboardScope } from "@workspace/web/hooks/dashboard/use-dashboard-scope"
import { useSellingWindowOverridesStore } from "@workspace/web/store/useSellingWindowOverridesStore"

function useScopedQueryOptions(scope: ReturnType<typeof useDashboardScope>) {
  return {
    enabled: Boolean(scope.parcelId),
    placeholderData: keepPreviousData,
  } as const
}

export function useOlivePrices() {
  return useQuery({
    queryKey: dashboardQueryKeys.olivePrices(),
    queryFn: () => api.finance.getOlivePrices(),
    ...dailyQueryOptions(),
    placeholderData: keepPreviousData,
  })
}

export function useSellingWindow() {
  const scope = useDashboardScope()
  const scopeKey = buildDashboardScopeKey(scope)
  const overrides = useSellingWindowOverridesStore(
    (state) => state.overridesByScopeKey[scopeKey]
  )

  const query = useQuery({
    queryKey: dashboardQueryKeys.sellingWindow(scope),
    queryFn: () => api.finance.getSellingWindow(scope),
    ...useScopedQueryOptions(scope),
    ...mutationQueryOptions,
  })

  const data = useMemo(() => {
    if (!query.data) return undefined
    return {
      ...query.data,
      estimatedKg: overrides?.estimatedKg ?? query.data.estimatedKg,
    }
  }, [overrides, query.data])

  return { ...query, data, scopeKey }
}

export function useFinanceResume() {
  const scope = useDashboardScope()

  return useQuery({
    queryKey: dashboardQueryKeys.financeResume(scope),
    queryFn: () => api.finance.getFinanceResume(scope),
    placeholderData: keepPreviousData,
    ...mutationQueryOptions,
  })
}

export function useCampaignMargin() {
  const scope = useDashboardScope()

  return useQuery({
    queryKey: dashboardQueryKeys.campaignMargin(scope),
    queryFn: () => api.finance.getCampaignMargin(scope),
    ...useScopedQueryOptions(scope),
    ...mutationQueryOptions,
  })
}

export function useRecentTransactions() {
  const scope = useDashboardScope()

  return useQuery({
    queryKey: dashboardQueryKeys.recentTransactions(scope),
    queryFn: () => api.finance.getRecentTransactions(scope),
    placeholderData: keepPreviousData,
    ...mutationQueryOptions,
  })
}

export function useProductionValue() {
  const scope = useDashboardScope()

  return useQuery({
    queryKey: dashboardQueryKeys.productionValue(scope),
    queryFn: () => api.finance.getProductionValue(scope),
    placeholderData: keepPreviousData,
    ...mutationQueryOptions,
  })
}

export function useParcelRecommendations() {
  const scope = useDashboardScope()
  const parcelId = scope.parcelId ?? ""

  return useQuery({
    queryKey: dashboardQueryKeys.recommendations(parcelId),
    queryFn: () => api.parcel.getParcelRecommendations(parcelId),
    enabled: Boolean(parcelId),
    ...dailyQueryOptions(),
    placeholderData: keepPreviousData,
  })
}

export function useParcelRisks() {
  const scope = useDashboardScope()
  const parcelId = scope.parcelId ?? ""

  return useQuery({
    queryKey: dashboardQueryKeys.risks(parcelId),
    queryFn: () => api.parcel.getParcelRisks(parcelId),
    enabled: Boolean(parcelId),
    ...dailyQueryOptions(),
    placeholderData: keepPreviousData,
  })
}

export function useCropOverview() {
  const scope = useDashboardScope()
  const parcelId = scope.parcelId ?? ""

  return useQuery({
    queryKey: dashboardQueryKeys.cropOverview(scope),
    queryFn: () => api.parcel.getParcelCropOverview(parcelId, scope),
    enabled: Boolean(parcelId),
    placeholderData: keepPreviousData,
  })
}

export function useUpcomingWeekTasks() {
  const scope = useDashboardScope()

  return useQuery({
    queryKey: dashboardQueryKeys.upcomingWeek(scope),
    queryFn: () => api.tasks.getUpcomingWeek(scope),
    placeholderData: keepPreviousData,
    ...mutationQueryOptions,
  })
}
