import { client } from "@workspace/web/lib/api/client"
import { notifyDashboardMutation } from "@workspace/web/lib/dashboard/notify-dashboard-mutation"
import type {
  DashboardRecommendation,
  RecommendationAcceptInput,
  RecommendationSelect,
  TaskSelect,
} from "@workspace/schemas"
import { isDemoMode } from "@workspace/web/lib/demo-mode"
import {
  acceptDemoRecommendation,
  dismissDemoRecommendation,
  getDemoRecommendationsList,
} from "@workspace/web/lib/mockdata"

export type RecommendationListItem = DashboardRecommendation & {
  parcelId: string | null
  parcelName: string | null
}

const listRecommendations = (params?: {
  parcelId?: string
}): Promise<RecommendationListItem[]> => {
  if (isDemoMode()) return Promise.resolve(getDemoRecommendationsList(params))
  return client.api.v1.recommendations
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
}

const acceptRecommendation = (
  recommendationId: string,
  input: RecommendationAcceptInput = {}
): Promise<{ task: TaskSelect; recommendation: RecommendationSelect }> => {
  if (isDemoMode()) {
    const result = acceptDemoRecommendation(
      recommendationId,
      input as unknown as Record<string, unknown>
    )
    notifyDashboardMutation(["events", "daily"], {
      parcelId: result.task.parcelId ?? undefined,
    })
    return Promise.resolve(result)
  }
  return (client.api.v1.recommendations[":recommendationId"].accept as any)
    .$post({ param: { recommendationId }, json: input })
    .then((res: Response) => {
      if (!res.ok) {
        throw new Error("Failed to accept recommendation")
      }
      return res.json() as unknown as Promise<{
        data: { task: TaskSelect; recommendation: RecommendationSelect }
      }>
    })
    .then((body: { data: { task: TaskSelect; recommendation: RecommendationSelect } }) => {
      notifyDashboardMutation(["events", "daily"], {
        parcelId: body.data.task.parcelId ?? undefined,
      })
      return body.data
    })
}

const dismissRecommendation = (
  recommendationId: string
): Promise<RecommendationSelect> => {
  if (isDemoMode()) {
    notifyDashboardMutation(["daily"])
    return Promise.resolve(dismissDemoRecommendation(recommendationId))
  }
  return client.api.v1.recommendations[":recommendationId"].dismiss
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
}

export const recommendationsApi = {
  listRecommendations,
  acceptRecommendation,
  dismissRecommendation,
}
