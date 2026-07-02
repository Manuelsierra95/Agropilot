"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"

import { PageContainer } from "@workspace/web/components/ui/page-container"
import { WidgetSkeleton } from "@workspace/web/components/widget-skeleton"
import { CampaignTimeline } from "@workspace/web/features/tasks/components/campaign-timeline"
import { Kanban } from "@workspace/web/features/tasks/components/kanban"
import { RecommendationsCard } from "@workspace/web/features/tasks/components/recommendations-card"
import {
  useAcceptRecommendation,
  useDismissRecommendation,
} from "@workspace/web/features/tasks/hooks/use-recommendations-mutations"
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
  const acceptRecommendation = useAcceptRecommendation()
  const dismissRecommendation = useDismissRecommendation()
  const [optimisticTasks, setOptimisticTasks] = useState<CalendarTask[]>([])
  const [processingRecommendationId, setProcessingRecommendationId] = useState<
    string | null
  >(null)

  const displayedTasks = useMemo(() => {
    const confirmedIds = new Set(tasks.map((task) => task.id))
    return [
      ...tasks,
      ...optimisticTasks.filter((task) => !confirmedIds.has(task.id)),
    ]
  }, [tasks, optimisticTasks])

  const handleAddToTasks = async (recommendation: Recommendation) => {
    setProcessingRecommendationId(recommendation.id)

    try {
      const { task } = await acceptRecommendation.mutateAsync({
        recommendationId: recommendation.id,
      })
      const calendarTask = taskSelectToCalendarTask(
        task,
        recommendation.parcelName
      )

      setOptimisticTasks((prev) => {
        const confirmedIds = new Set(tasks.map((t) => t.id))
        const cleaned = prev.filter((t) => !confirmedIds.has(t.id))
        return [...cleaned, calendarTask]
      })
    } catch {
      toast.error("No se pudo añadir la tarea")
    } finally {
      setProcessingRecommendationId(null)
    }
  }

  const handleDismiss = async (recommendation: Recommendation) => {
    setProcessingRecommendationId(recommendation.id)

    try {
      await dismissRecommendation.mutateAsync(recommendation.id)
    } catch {
      toast.error("No se pudo descartar la recomendación")
    } finally {
      setProcessingRecommendationId(null)
    }
  }

  return (
    <PageContainer className="grid gap-4 lg:grid-cols-12">
      <div className="lg:col-span-4">
        {isLoadingRecommendations ? (
          <WidgetSkeleton
            className="h-full min-h-[480px]"
            contentHeight="h-full"
          />
        ) : (
          <RecommendationsCard
            recommendations={recommendations}
            onAddToTasks={handleAddToTasks}
            onDismiss={handleDismiss}
            processingRecommendationId={processingRecommendationId}
          />
        )}
      </div>

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
