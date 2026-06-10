import { client } from "@/lib/api/client"
import type { DashboardOverview } from "@workspace/schemas"
import { cache } from "react"

const getOverview = cache(
  (): Promise<DashboardOverview> =>
    client.api.v1.dashboard.overview
      .$get()
      .then((res) => res.json())
      .then((res) => res.overview)
)

export const dashboardApi = {
  getOverview,
}
