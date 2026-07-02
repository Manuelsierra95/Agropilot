"use client"

import { TasksLayout } from "@workspace/web/features/tasks/components/tasks-layout"
import type { TasksLayoutData } from "@workspace/web/features/tasks/components/tasks-layout"

export type TasksAllViewProps = TasksLayoutData

export function TasksAllView({
  recommendations,
  tasks,
  timelineData,
  isLoading,
  isLoadingRecommendations,
}: TasksAllViewProps) {
  return (
    <TasksLayout
      recommendations={recommendations}
      tasks={tasks}
      timelineData={timelineData}
      isLoading={isLoading}
      isLoadingRecommendations={isLoadingRecommendations}
    />
  )
}
