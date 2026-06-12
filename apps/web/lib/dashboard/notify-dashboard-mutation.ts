import { getDashboardQueryClient } from "@/lib/dashboard/query-client-ref"
import { invalidateDashboard } from "@/lib/dashboard/invalidate-dashboard"
import type { DashboardCacheFamily } from "@/lib/dashboard/query-keys"
import type { DashboardScopeParams } from "@/lib/dashboard/scope-key"

export function notifyDashboardMutation(
  families: DashboardCacheFamily[],
  scope?: DashboardScopeParams
) {
  const queryClient = getDashboardQueryClient()
  if (!queryClient) return
  invalidateDashboard(queryClient, families, scope)
}
