import { client } from "@workspace/web/lib/api/client"
import type { DashboardScopeParams } from "@workspace/web/lib/dashboard/scope-key"
import { toScopeQuery } from "@workspace/web/lib/dashboard/scope-query"
import type { DashboardOverview } from "@workspace/schemas"

const getDashboardOverview = (
  scope: DashboardScopeParams
): Promise<DashboardOverview> =>
  client.api.v1.dashboard.overview
    .$get({ query: toScopeQuery(scope) })
    .then(
      (res) =>
        res.json() as Promise<{ data: DashboardOverview }>
    )
    .then((res) => res.data)

export const dashboardApi = {
  getDashboardOverview,
}
