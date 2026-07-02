import { client } from "@workspace/web/lib/api/client"
import { notifyDashboardMutation } from "@workspace/web/lib/dashboard/notify-dashboard-mutation"
import type {
  DashboardRecommendation,
  RecommendationAcceptInput,
  RecommendationSelect,
  TaskSelect,
} from "@workspace/schemas"

export type RecommendationListItem = DashboardRecommendation & {
  parcelId: string | null
  parcelName: string | null
}

const listRecommendations = (params?: {
  parcelId?: string
}): Promise<RecommendationListItem[]> =>
  client.api.v1.recommendations
    .$get({ query: params?.parcelId ? { parcelId: params.parcelId } : {} })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Failed to fetch recommendations")
      }
      return res.json() as unknown as Promise<{
        data: { recommendations: RecommendationListItem[] }
      }>
    })
    .then((body) => body.data.recommendations)

const acceptRecommendation = (
  recommendationId: string,
  input: RecommendationAcceptInput = {}
): Promise<{ task: TaskSelect; recommendation: RecommendationSelect }> =>
  client.api.v1.recommendations[":recommendationId"].accept
    .$post({ param: { recommendationId }, json: input })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Failed to accept recommendation")
      }
      return res.json() as unknown as Promise<{
        data: { task: TaskSelect; recommendation: RecommendationSelect }
      }>
    })
    .then((body) => {
      notifyDashboardMutation(["events", "daily"], {
        parcelId: body.data.task.parcelId ?? undefined,
      })
      return body.data
    })

const dismissRecommendation = (
  recommendationId: string
): Promise<RecommendationSelect> =>
  client.api.v1.recommendations[":recommendationId"].dismiss
    .$post({ param: { recommendationId } })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Failed to dismiss recommendation")
      }
      return res.json() as unknown as Promise<{
        data: { recommendation: RecommendationSelect }
      }>
    })
    .then((body) => {
      notifyDashboardMutation(["daily"])
      return body.data.recommendation
    })

export const recommendationsApi = {
  listRecommendations,
  acceptRecommendation,
  dismissRecommendation,
}
