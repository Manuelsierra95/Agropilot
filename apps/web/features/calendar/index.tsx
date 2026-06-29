"use client"

import { useMemo } from "react"

import { PageContainer } from "@workspace/web/components/ui/page-container"
import { GradientSeparator } from "@workspace/web/components/ui/gradient-separator"
import { WidgetSkeleton } from "@workspace/web/features/dashboard/dashboard-skeleton"
import { CalendarClient } from "@workspace/web/features/calendar/components/calendar/calendar-client"
import { ActiveAlertsCard } from "@workspace/web/features/calendar/components/active-alerts-card"
import { CampaignTimeline } from "@workspace/web/features/calendar/components/campaign-timeline"
import { KpisCard } from "@workspace/web/features/calendar/components/kpis-card"
import { RecommendationsCard } from "@workspace/web/features/calendar/components/recommendations-card"
import { Kanban } from "@workspace/web/features/calendar/components/kanban"
import {
  useAllParcelsRecommendations,
  useAllParcelsRisks,
  useParcelRecommendations,
  useParcelRisks,
} from "@workspace/web/hooks/dashboard"
import {
  useCalendarEvents,
  useParcelWeatherForecast,
} from "@workspace/web/hooks/calendar"
import { useIsAllParcelsSelected } from "@workspace/web/hooks/use-is-all-parcels-selected"
import { useDashboardScopeParams } from "@workspace/web/hooks/use-dashboard-scope-params"
import {
  allParcelsRecommendationsToCardItems,
  eventsToCampaignTimeline,
  parcelRecommendationsToCardItems,
  risksToActiveAlerts,
  risksToActiveAlertsAll,
} from "@workspace/web/lib/calendar/mappers"
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
  const weatherForecast = useParcelWeatherForecast()
  const parcelRecommendations = useParcelRecommendations()
  const allRecommendations = useAllParcelsRecommendations()
  const parcelRisks = useParcelRisks()
  const allRisks = useAllParcelsRisks()

  const events = calendarEvents.data ?? []

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

  const alerts = useMemo(() => {
    if (isAllParcels) {
      return risksToActiveAlertsAll(allRisks.data ?? [])
    }
    if (!parcelRisks.data) return []
    const parcelName =
      events.find((event) => event.parcelId === parcelId)?.parcelName ?? "Parcela"
    return risksToActiveAlerts(parcelRisks.data, parcelName)
  }, [allRisks.data, events, isAllParcels, parcelId, parcelRisks.data])

  const recommendations = useMemo(() => {
    if (isAllParcels) {
      return allParcelsRecommendationsToCardItems(allRecommendations.data ?? [])
    }
    const parcelName =
      events.find((event) => event.parcelId === parcelId)?.parcelName ?? "Parcela"
    return parcelRecommendationsToCardItems(
      parcelRecommendations.data ?? [],
      parcelName
    )
  }, [
    allRecommendations.data,
    events,
    isAllParcels,
    parcelId,
    parcelRecommendations.data,
  ])

  const forecast = isAllParcels ? undefined : weatherForecast.forecast

  return (
    <PageContainer className="grid grid-cols-[1fr_auto_1fr_auto_1fr] grid-rows-[minmax(0,300px)_auto_minmax(0,1120px)_auto_auto] gap-4">
      <div className="col-start-1 row-start-1">
        {isAllParcels
          ? allRisks.isPending && !allRisks.data?.length
            ? (
                <WidgetSkeleton className="h-full" contentHeight="h-[220px]" />
              )
            : (
                <ActiveAlertsCard alerts={alerts} />
              )
          : parcelRisks.isPending && !parcelRisks.data
            ? (
                <WidgetSkeleton className="h-full" contentHeight="h-[220px]" />
              )
            : (
                <ActiveAlertsCard alerts={alerts} />
              )}
      </div>

      <GradientSeparator
        orientation="vertical"
        className="col-start-2 row-start-1"
      />

      <div className="col-start-3 row-start-1">
        {isAllParcels
          ? allRecommendations.isPending &&
            allRecommendations.data === undefined
            ? (
                <WidgetSkeleton className="h-full" contentHeight="h-[220px]" />
              )
            : (
                <RecommendationsCard recommendations={recommendations} />
              )
          : parcelRecommendations.isPending && !parcelRecommendations.data
            ? (
                <WidgetSkeleton className="h-full" contentHeight="h-[220px]" />
              )
            : (
                <RecommendationsCard recommendations={recommendations} />
              )}
      </div>

      <GradientSeparator
        orientation="vertical"
        className="col-start-4 row-start-1"
      />

      <div className="col-start-5 row-start-1">
        {calendarEvents.isPending && !calendarEvents.data ? (
          <WidgetSkeleton className="h-full" contentHeight="h-[220px]" />
        ) : (
          <KpisCard events={events} />
        )}
      </div>

      <GradientSeparator
        orientation="horizontal"
        className="col-span-5 col-start-1 row-start-2"
      />

      <div className="col-span-3 row-start-3 overflow-auto">
        {calendarEvents.isPending && !calendarEvents.data ? (
          <WidgetSkeleton className="h-full min-h-[480px]" contentHeight="h-full" />
        ) : (
          <CalendarClient initialEvents={events} forecast={forecast} />
        )}
      </div>

      <GradientSeparator
        orientation="vertical"
        className="col-start-4 row-start-3"
      />

      <div className="col-start-5 row-start-3">
        {calendarEvents.isPending && !calendarEvents.data ? (
          <WidgetSkeleton className="h-full min-h-[480px]" contentHeight="h-full" />
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
