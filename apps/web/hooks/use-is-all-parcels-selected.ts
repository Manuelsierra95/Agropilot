"use client"

import { isAllParcelsScope } from "@/lib/dashboard/is-all-parcels"
import { useDashboardScope } from "@/hooks/dashboard/use-dashboard-scope"

export function useIsAllParcelsSelected(): boolean {
  const scope = useDashboardScope()
  return isAllParcelsScope(scope)
}
