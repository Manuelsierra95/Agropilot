import { client } from "@workspace/web/lib/api/client"
import type { DashboardScopeParams } from "@workspace/web/lib/dashboard/scope-key"
import { toScopeQuery } from "@workspace/web/lib/dashboard/scope-query"
import type { DashboardOverview } from "@workspace/schemas"
import { isDemoMode } from "@workspace/web/lib/demo-mode"
import { getDemoDashboardOverview } from "@workspace/web/lib/mockdata"

const getDashboardOverview = (
  scope: DashboardScopeParams
): Promise<DashboardOverview> => {
  if (isDemoMode()) {
    return Promise.resolve(getDemoDashboardOverview(scope))
  }
  return client.api.v1.dashboard.overview
    .$get({ query: toScopeQuery(scope) })
    .then((res) => res.json() as unknown as Promise<{ data: DashboardOverview }>)
    .then((res) => res.data)
}

export const dashboardApi = {
  getDashboardOverview,
}
