"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { api } from "@workspace/web/lib/api"
import { mutationQueryOptions } from "@workspace/web/lib/dashboard/cache-policy"
import { dashboardQueryKeys } from "@workspace/web/lib/dashboard/query-keys"
import { toFinanceTransactions } from "@workspace/web/lib/finance/mappers"
import { useDashboardScope } from "@workspace/web/hooks/dashboard/use-dashboard-scope"

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
