import { client } from "@/lib/api/client"
import type { DashboardOverview, DashboardOverviewQuery } from "@workspace/schemas"

const getOverview = (
  filters: DashboardOverviewQuery = {}
): Promise<DashboardOverview> => {
  const query: Record<string, string> = {}
  if (filters.parcelId) query.parcelId = filters.parcelId
  if (filters.campaignId) query.campaignId = filters.campaignId
  if (filters.from) query.from = filters.from
  if (filters.to) query.to = filters.to

  return client.api.v1.dashboard.overview
    .$get({ query })
    .then((res) => res.json())
    .then((res) => res.overview)
}

export const dashboardApi = {
  getOverview,
}
