"use client"

import { isAllParcelsScope } from "@workspace/web/lib/dashboard/is-all-parcels"
import { useDashboardScope } from "@workspace/web/hooks/dashboard/use-dashboard-scope"

export function useIsAllParcelsSelected(): boolean {
  const scope = useDashboardScope()
  return isAllParcelsScope(scope)
}
