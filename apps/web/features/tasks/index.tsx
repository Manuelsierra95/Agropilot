"use client"

import { useCalendarEvents } from "@workspace/web/hooks/calendar"
import { useIsAllParcelsSelected } from "@workspace/web/hooks/use-is-all-parcels-selected"
import { useTaskRecommendations } from "@workspace/web/features/tasks/hooks/use-task-recommendations"
import { TasksAllView } from "@workspace/web/features/tasks/views/all"
import { TasksSingleView } from "@workspace/web/features/tasks/views/single"

export default function Tasks() {
  const isAllParcels = useIsAllParcelsSelected()

  const calendarEvents = useCalendarEvents()
  const tasks = calendarEvents.data ?? []

  const recommendationsQuery = useTaskRecommendations()
  const recommendations = recommendationsQuery.recommendations ?? []

  const isLoading = calendarEvents.isPending && !calendarEvents.data
  const isLoadingRecommendations =
    recommendationsQuery.isPending && !recommendationsQuery.data

  const viewProps = {
    recommendations,
    tasks,
    isLoading,
    isLoadingRecommendations,
  }

  return isAllParcels ? (
    <TasksAllView {...viewProps} />
  ) : (
    <TasksSingleView {...viewProps} />
  )
}
