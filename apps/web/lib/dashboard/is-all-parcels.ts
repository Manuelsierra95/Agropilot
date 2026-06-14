import type { DashboardScopeParams } from "@/lib/dashboard/scope-key"

export function isAllParcelsScope(scope: DashboardScopeParams): boolean {
  return !scope.parcelId
}
