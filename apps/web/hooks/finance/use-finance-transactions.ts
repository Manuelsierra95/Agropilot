"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { api } from "@/lib/api"
import { mutationQueryOptions } from "@/lib/dashboard/cache-policy"
import { dashboardQueryKeys } from "@/lib/dashboard/query-keys"
import { toFinanceTransactions } from "@/lib/finance/mappers"
import { useDashboardScope } from "@/hooks/dashboard/use-dashboard-scope"

export function useFinanceTransactions() {
  const scope = useDashboardScope()

  return useQuery({
    queryKey: dashboardQueryKeys.financeTransactions(scope),
    queryFn: () => api.finance.getScopedTransactions(scope),
    select: toFinanceTransactions,
    placeholderData: keepPreviousData,
    ...mutationQueryOptions,
  })
}
