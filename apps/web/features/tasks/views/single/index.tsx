"use client"

import { TasksLayout } from "@workspace/web/features/tasks/components/tasks-layout"
import type { TasksLayoutData } from "@workspace/web/features/tasks/components/tasks-layout"

export type TasksSingleViewProps = TasksLayoutData

export function TasksSingleView({
  recommendations,
  tasks,
  isLoading,
  isLoadingRecommendations,
}: TasksSingleViewProps) {
  return (
    <TasksLayout
      recommendations={recommendations}
      tasks={tasks}
      isLoading={isLoading}
      isLoadingRecommendations={isLoadingRecommendations}
    />
  )
}
