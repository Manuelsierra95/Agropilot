"use client"

import { useMutation } from "@tanstack/react-query"

import { api } from "@workspace/web/lib/api"
import type { Recommendation } from "@workspace/web/features/tasks/components/recommendations-card"

function mapActionToCategory(action: Recommendation["action"]): string {
  switch (action) {
    case "irrigate":
      return "irrigation"
    case "treat":
      return "treatment"
    case "inspect":
      return "inspection"
    case "schedule":
      return "inspection"
  }
}

function mapUrgencyToPriority(urgency: Recommendation["urgency"]): number {
  switch (urgency) {
    case "now":
      return 3
    case "soon":
      return 2
    case "plan":
      return 1
  }
}

function formatTodayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function useCreateTaskFromRecommendation() {
  return useMutation({
    mutationFn: (recommendation: Recommendation) =>
      api.tasks.createTask({
        title: recommendation.title,
        category: mapActionToCategory(recommendation.action),
        startDate: formatTodayISO(),
        description: recommendation.reason,
        parcelId: recommendation.parcelId,
        priority: mapUrgencyToPriority(recommendation.urgency),
      }),
  })
}
