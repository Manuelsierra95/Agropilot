"use client"

import { useMemo, useState } from "react"

import { PageContainer } from "@workspace/web/components/ui/page-container"
import { WidgetSkeleton } from "@workspace/web/components/widget-skeleton"
import { CampaignTimeline } from "@workspace/web/features/tasks/components/campaign-timeline"
import { Kanban } from "@workspace/web/features/tasks/components/kanban"
import { RecommendationsCard } from "@workspace/web/features/tasks/components/recommendations-card"
import { useCreateTaskFromRecommendation } from "@workspace/web/features/tasks/hooks/use-create-task-from-recommendation"
import { taskSelectToCalendarTask } from "@workspace/web/features/tasks/lib/task-helpers"
import type { CampaignTimelineData } from "@workspace/web/features/tasks/lib/types"
import type { Recommendation } from "@workspace/web/features/tasks/components/recommendations-card"
import type { CalendarTask } from "@workspace/web/lib/calendar/types"

export type TasksLayoutData = {
  recommendations: Recommendation[]
  tasks: CalendarTask[]
  timelineData: CampaignTimelineData | null
  isLoading: boolean
  isLoadingRecommendations?: boolean
}

export function TasksLayout({
  recommendations,
  tasks,
  timelineData,
  isLoading,
  isLoadingRecommendations,
}: TasksLayoutData) {
  const createTask = useCreateTaskFromRecommendation()
  const [addedRecommendationIds, setAddedRecommendationIds] = useState<
    Set<string>
  >(new Set())
  const [optimisticTasks, setOptimisticTasks] = useState<CalendarTask[]>([])
  const [addingRecommendationId, setAddingRecommendationId] = useState<
    string | null
  >(null)

  const visibleRecommendations = useMemo(
    () => recommendations.filter((rec) => !addedRecommendationIds.has(rec.id)),
    [recommendations, addedRecommendationIds]
  )

  const displayedTasks = useMemo(() => {
    const confirmedIds = new Set(tasks.map((task) => task.id))
    return [
      ...tasks,
      ...optimisticTasks.filter((task) => !confirmedIds.has(task.id)),
    ]
  }, [tasks, optimisticTasks])

  const handleAddToTasks = async (recommendation: Recommendation) => {
    setAddingRecommendationId(recommendation.id)

    try {
      const task = await createTask.mutateAsync(recommendation)
      const calendarTask = taskSelectToCalendarTask(
        task,
        recommendation.parcelName
      )

      setOptimisticTasks((prev) => {
        const confirmedIds = new Set(tasks.map((t) => t.id))
        const cleaned = prev.filter((t) => !confirmedIds.has(t.id))
        return [...cleaned, calendarTask]
      })
      setAddedRecommendationIds((prev) => new Set(prev).add(recommendation.id))
    } finally {
      setAddingRecommendationId(null)
    }
  }

  return (
    <PageContainer className="grid gap-4 lg:grid-cols-12">
      {/* RECOMMENDATIONS */}
      <div className="lg:col-span-4">
        {isLoadingRecommendations ? (
          <WidgetSkeleton
            className="h-full min-h-[480px]"
            contentHeight="h-full"
          />
        ) : (
          <RecommendationsCard
            recommendations={visibleRecommendations}
            onAddToTasks={handleAddToTasks}
            addingRecommendationId={addingRecommendationId}
          />
        )}
      </div>

      {/* KANBAN */}
      <div className="lg:col-span-8">
        {isLoading ? (
          <WidgetSkeleton
            className="h-full min-h-[480px]"
            contentHeight="h-full"
          />
        ) : (
          <Kanban tasks={displayedTasks} />
        )}
      </div>

      {/* TIMELINE */}
      <div className="lg:col-span-12">
        {isLoading || !timelineData ? (
          <WidgetSkeleton className="h-[280px]" contentHeight="h-[240px]" />
        ) : (
          <CampaignTimeline
            tasks={timelineData.tasks}
            days={timelineData.days}
            todayIndex={timelineData.todayIndex}
            title={timelineData.title}
          />
        )}
      </div>
    </PageContainer>
  )
}
