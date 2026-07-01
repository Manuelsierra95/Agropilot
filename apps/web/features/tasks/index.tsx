"use client"

import { useMemo } from "react"

import { PageContainer } from "@workspace/web/components/ui/page-container"
import { GradientSeparator } from "@workspace/web/components/ui/gradient-separator"
import { WidgetSkeleton } from "@workspace/web/components/widget-skeleton"
import { CampaignTimeline } from "@workspace/web/features/calendar/components/campaign-timeline"
import { Kanban } from "@workspace/web/features/calendar/components/kanban"

import { useCalendarEvents } from "@workspace/web/hooks/calendar"
import { useIsAllParcelsSelected } from "@workspace/web/hooks/use-is-all-parcels-selected"
import { useDashboardScopeParams } from "@workspace/web/hooks/use-dashboard-scope-params"
import { eventsToCampaignTimeline } from "@workspace/web/lib/calendar/mappers"
import {
  selectCampaignsForParcel,
  useDashboardListsStore,
} from "@workspace/web/store/useDashboardListsStore"

export default function Calendar() {
  const isAllParcels = useIsAllParcelsSelected()
  const [{ parcelId, campaignId, from, to }] = useDashboardScopeParams()

  const campaigns = useDashboardListsStore((state) =>
    selectCampaignsForParcel(state, parcelId)
  )

  const calendarEvents = useCalendarEvents()

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
      events,
      activeCampaign.startDate,
      activeCampaign.endDate,
      activeCampaign.name
    )
  }, [activeCampaign, events])

  return (
    <PageContainer className="grid grid-cols-[1fr_auto_1fr_auto_1fr] grid-rows-[minmax(0,300px)_auto_minmax(0,1120px)_auto_auto] gap-4">
      <div className="col-start-5 row-start-3">
        {calendarEvents.isPending && !calendarEvents.data ? (
          <WidgetSkeleton
            className="h-full min-h-[480px]"
            contentHeight="h-full"
          />
        ) : (
          <Kanban events={events} />
        )}
      </div>

      <GradientSeparator
        orientation="horizontal"
        className="col-span-5 col-start-1 row-start-4"
      />

      <div className="col-span-5 col-start-1 row-start-5">
        {!timelineData ? (
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
