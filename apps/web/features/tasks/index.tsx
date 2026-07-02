"use client"

import { useMemo } from "react"

import { useCalendarEvents } from "@workspace/web/hooks/calendar"
import { useDashboardScopeParams } from "@workspace/web/hooks/use-dashboard-scope-params"
import { useIsAllParcelsSelected } from "@workspace/web/hooks/use-is-all-parcels-selected"
import { useTaskRecommendations } from "@workspace/web/features/tasks/hooks/use-task-recommendations"
import { eventsToCampaignTimeline } from "@workspace/web/features/tasks/lib/mappers"
import { TasksAllView } from "@workspace/web/features/tasks/views/all"
import { TasksSingleView } from "@workspace/web/features/tasks/views/single"
import {
  selectCampaignsForParcel,
  useDashboardListsStore,
} from "@workspace/web/store/useDashboardListsStore"

export default function Tasks() {
  const isAllParcels = useIsAllParcelsSelected()
  const [{ parcelId, campaignId, from, to }] = useDashboardScopeParams()

  const campaigns = useDashboardListsStore((state) =>
    selectCampaignsForParcel(state, parcelId)
  )

  const calendarEvents = useCalendarEvents()
  const tasks = calendarEvents.data ?? []

  const recommendationsQuery = useTaskRecommendations()
  const recommendations = recommendationsQuery.recommendations ?? []

  const activeCampaign = useMemo(() => {
    if (from && to) {
      return {
        name: "Rango personalizado",
        startDate: from,
        endDate: to,
      }
    }
    return (
      campaigns.find((campaign) => campaign.id === campaignId) ??
      campaigns.find((campaign) => campaign.status === "active") ??
      campaigns[0]
    )
  }, [campaignId, campaigns, from, to])

  const timelineData = useMemo(() => {
    if (!activeCampaign) return null
    return eventsToCampaignTimeline(
      tasks,
      activeCampaign.startDate,
      activeCampaign.endDate,
      activeCampaign.name
    )
  }, [activeCampaign, tasks])

  const isLoading = calendarEvents.isPending && !calendarEvents.data
  const isLoadingRecommendations =
    recommendationsQuery.isPending && !recommendationsQuery.data

  const viewProps = {
    recommendations,
    tasks,
    timelineData,
    isLoading,
    isLoadingRecommendations,
  }

  return isAllParcels ? (
    <TasksAllView {...viewProps} />
  ) : (
    <TasksSingleView {...viewProps} />
  )
}
