"use client"

import { useMemo, useRef } from "react"

import { useParcelRecommendations } from "@workspace/web/hooks/dashboard/use-dashboard-queries"
import { useAllParcelsRecommendations } from "@workspace/web/hooks/dashboard/use-all-parcels-queries"
import { useDashboardScope } from "@workspace/web/hooks/dashboard/use-dashboard-scope"
import { useIsAllParcelsSelected } from "@workspace/web/hooks/use-is-all-parcels-selected"
import { useDashboardListsStore } from "@workspace/web/store/useDashboardListsStore"
import type { DashboardRecommendation } from "@workspace/schemas"
import type {
  Recommendation,
  RecommendationAction,
} from "@workspace/web/features/tasks/components/recommendations-card"

function recommendationKey(
  rec: DashboardRecommendation,
  parcelId: string
): string {
  return `${parcelId}:${rec.type}:${rec.priority}:${rec.message}:${rec.details}`
}

function useStableRecommendationIds() {
  const idsRef = useRef<Map<string, string>>(new Map())

  return (rec: DashboardRecommendation, parcelId: string): string => {
    const key = recommendationKey(rec, parcelId)
    let id = idsRef.current.get(key)
    if (!id) {
      id = crypto.randomUUID()
      idsRef.current.set(key, id)
    }
    return id
  }
}

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
  rec: DashboardRecommendation,
  parcelId: string,
  parcelName: string,
  getId: (rec: DashboardRecommendation, parcelId: string) => string
): Recommendation {
  const urgency = mapPriorityToUrgency(rec.priority)

  return {
    id: getId(rec, parcelId),
    parcelId,
    parcelName,
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

  const allParcelsQuery = useAllParcelsRecommendations()
  const singleParcelQuery = useParcelRecommendations()

  const parcelName = useDashboardListsStore(
    (state) => state.parcels.find((parcel) => parcel.id === parcelId)?.name
  )

  const getStableId = useStableRecommendationIds()

  return useMemo(() => {
    if (isAllParcels) {
      const items = allParcelsQuery.data ?? []
      return {
        ...allParcelsQuery,
        recommendations: items.map((item) =>
          normalizeRecommendation(
            item,
            item.parcelId,
            item.parcelName,
            getStableId
          )
        ),
      }
    }

    const items = singleParcelQuery.data ?? []
    return {
      ...singleParcelQuery,
      recommendations: items.map((rec) =>
        normalizeRecommendation(rec, parcelId, parcelName ?? "—", getStableId)
      ),
    }
  }, [
    isAllParcels,
    allParcelsQuery,
    singleParcelQuery,
    parcelId,
    parcelName,
    getStableId,
  ])
}
