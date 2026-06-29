import { getDashboardQueryClient } from "@workspace/web/lib/dashboard/query-client-ref"
import { invalidateDashboard } from "@workspace/web/lib/dashboard/invalidate-dashboard"
import type { DashboardCacheFamily } from "@workspace/web/lib/dashboard/query-keys"
import type { DashboardScopeParams } from "@workspace/web/lib/dashboard/scope-key"

export function notifyDashboardMutation(
  families: DashboardCacheFamily[],
  scope?: DashboardScopeParams
) {
  const queryClient = getDashboardQueryClient()
  if (!queryClient) return
  invalidateDashboard(queryClient, families, scope)
}
