"use client"

import { useMemo } from "react"

import { useDashboardScope } from "@workspace/web/hooks/dashboard/use-dashboard-scope"
import { useIsAllParcelsSelected } from "@workspace/web/hooks/use-is-all-parcels-selected"
import { useRecommendations } from "@workspace/web/features/tasks/hooks/use-recommendations-mutations"
import type { DashboardRecommendation } from "@workspace/schemas"
import type {
  Recommendation,
  RecommendationAction,
} from "@workspace/web/features/tasks/components/recommendations-card"

function mapTypeToAction(type: string): RecommendationAction {
  switch (type.toLowerCase()) {
    case "irrigation":
      return "irrigate"
    case "treatment":
    case "fertilization":
      return "treat"
    case "inspection":
      return "inspect"
    default:
      return "schedule"
  }
}

function mapPriorityToUrgency(
  priority: DashboardRecommendation["priority"]
): Recommendation["urgency"] {
  switch (priority) {
    case "high":
      return "now"
    case "medium":
      return "soon"
    case "low":
      return "plan"
  }
}

function normalizeRecommendation(
  rec: DashboardRecommendation & {
    parcelId?: string | null
    parcelName?: string | null
  }
): Recommendation {
  const urgency = mapPriorityToUrgency(rec.priority)

  return {
    id: rec.id,
    parcelId: rec.parcelId ?? "",
    parcelName: rec.parcelName ?? "—",
    title: rec.message,
    reason: rec.details,
    action: mapTypeToAction(rec.type),
    urgency,
    when:
      urgency === "now"
        ? "Ahora"
        : urgency === "soon"
          ? "Pronto"
          : "Planificar",
  }
}

export function useTaskRecommendations() {
  const isAllParcels = useIsAllParcelsSelected()
  const scope = useDashboardScope()
  const parcelId = scope.parcelId ?? ""

  const allQuery = useRecommendations()
  const singleQuery = useRecommendations(isAllParcels ? undefined : parcelId)

  const query = isAllParcels ? allQuery : singleQuery

  return useMemo(
    () => ({
      ...query,
      recommendations: (query.data ?? []).map(normalizeRecommendation),
    }),
    [query]
  )
}
