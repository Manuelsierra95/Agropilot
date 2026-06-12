"use client"

import { GradientSeparator } from "@/components/ui/gradient-separator"
import type { DashboardCalendarEvent } from "@workspace/schemas"

import { OlivePrice } from "@/features/dashboard/olive-price"
import { ResumeCrop } from "@/features/dashboard/resume-crop"
import { FinanceResume } from "@/features/dashboard/finance-resume"
import { CampaignAccumulatedMargin } from "@/features/dashboard/campaign-accumulated-margin"
import { Recommendations } from "@/features/dashboard/recommendations"
import { DashboardMap } from "@/features/dashboard/map"
import { RiskRadar } from "@/features/dashboard/risk-radar"
import { RecentEvents } from "@/features/dashboard/recent-events"
import { RecentTransactions } from "@/features/dashboard/recent-transactions"
import { SellingWindow } from "@/features/dashboard/selling-window"
import { ProductionValue } from "@/features/dashboard/production-value"
import {
  dashboardContainerClassName,
  dashboardGridSlot,
  dashboardMainClassName,
} from "@/features/dashboard/dashboard-grid-layout"
import {
  MapSkeleton,
  ProductionValueSkeleton,
  ResumeCropSkeleton,
  WidgetSkeleton,
} from "@/features/dashboard/dashboard-skeleton"
import {
  useCampaignMargin,
  useCropOverview,
  useFinanceResume,
  useOlivePrices,
  useParcelRecommendations,
  useParcelRisks,
  useParcelsMap,
  useProductionValue,
  useRecentTransactions,
  useSellingWindow,
  useUpcomingWeekTasks,
} from "@/hooks/dashboard"

function toCalendarEvents(
  events: DashboardCalendarEvent[]
): import("@/lib/calendar-mock").CalendarEvent[] {
  return events.map((event) => ({
    ...event,
    start: new Date(event.start),
    end: new Date(event.end),
  }))
}

export default function DashboardOverview() {
  const olivePrices = useOlivePrices()
  const sellingWindow = useSellingWindow()
  const cropOverview = useCropOverview()
  const financeResume = useFinanceResume()
  const campaignMargin = useCampaignMargin()
  const recommendations = useParcelRecommendations()
  const parcelsMap = useParcelsMap()
  const risks = useParcelRisks()
  const upcomingWeek = useUpcomingWeekTasks()
  const recentTransactions = useRecentTransactions()
  const productionValue = useProductionValue()

  return (
    <div className={dashboardContainerClassName}>
      <main className={dashboardMainClassName}>
        <div className={dashboardGridSlot.topRow}>
          <GradientSeparator
            orientation="horizontal"
            className={dashboardGridSlot.horizSepMobile}
          />
          <div className={dashboardGridSlot.rowInner}>
            {olivePrices.isPending && !olivePrices.data ? (
              <WidgetSkeleton
                className="min-w-0 flex-2"
                contentHeight="h-[140px]"
              />
            ) : (
              <OlivePrice
                className="min-w-0 flex-2"
                items={olivePrices.data ?? []}
              />
            )}
            <GradientSeparator
              orientation="vertical"
              className={dashboardGridSlot.verticalSepDesktop}
            />
            {sellingWindow.isPending && !sellingWindow.data ? (
              <WidgetSkeleton
                className="min-w-0 flex-1"
                contentHeight="h-[140px]"
              />
            ) : sellingWindow.data ? (
              <SellingWindow
                className="min-w-0 flex-1"
                scopeKey={sellingWindow.scopeKey}
                {...sellingWindow.data}
              />
            ) : null}
          </div>
        </div>

        <div className={dashboardGridSlot.resumeCropWrapper}>
          <GradientSeparator
            orientation="vertical"
            className={dashboardGridSlot.verticalSepDesktop}
          />
          {cropOverview.isPending && !cropOverview.data ? (
            <ResumeCropSkeleton className={dashboardGridSlot.resumeCrop} />
          ) : cropOverview.data ? (
            <ResumeCrop
              className={dashboardGridSlot.resumeCrop}
              data={{
                ...cropOverview.data,
                lastUpdate: new Date(cropOverview.data.lastUpdate),
              }}
            />
          ) : null}
        </div>

        <div className={dashboardGridSlot.financeRow}>
          <GradientSeparator orientation="horizontal" />
          <div className={dashboardGridSlot.rowInner}>
            {financeResume.isPending && !financeResume.data ? (
              <WidgetSkeleton
                className="min-w-0 flex-1"
                contentHeight="h-[200px]"
              />
            ) : financeResume.data ? (
              <FinanceResume
                className="min-w-0 flex-1"
                transactions={financeResume.data.transactions}
                oils={olivePrices.data ?? []}
                previousCampaign={financeResume.data.previousCampaign}
              />
            ) : null}
            <GradientSeparator
              orientation="vertical"
              className={dashboardGridSlot.verticalSepDesktop}
            />
            {campaignMargin.isPending && !campaignMargin.data ? (
              <WidgetSkeleton
                className="min-w-0 flex-2"
                contentHeight="h-[200px]"
              />
            ) : campaignMargin.data ? (
              <CampaignAccumulatedMargin
                className="min-w-0 flex-2"
                data={campaignMargin.data}
              />
            ) : null}
          </div>
        </div>

        <div className={dashboardGridSlot.recoMapRow}>
          <GradientSeparator orientation="horizontal" />
          <div className={dashboardGridSlot.rowInner}>
            {recommendations.isPending && !recommendations.data ? (
              <WidgetSkeleton
                className="min-w-0 flex-1"
                contentHeight="h-[240px]"
              />
            ) : (
              <Recommendations
                className="min-w-0 flex-1"
                data={recommendations.data ?? []}
              />
            )}
            <GradientSeparator
              orientation="vertical"
              className={dashboardGridSlot.verticalSepDesktop}
            />
            {parcelsMap.isPending && !parcelsMap.data ? (
              <MapSkeleton className="min-w-0 flex-2" />
            ) : (
              <DashboardMap
                className="min-w-0 flex-2"
                parcels={parcelsMap.data ?? []}
              />
            )}
            <GradientSeparator
              orientation="vertical"
              className={dashboardGridSlot.verticalSepDesktop}
            />
            {risks.isPending && !risks.data ? (
              <WidgetSkeleton
                className="min-w-0 flex-[1.5]"
                contentHeight="h-[240px]"
              />
            ) : risks.data ? (
              <RiskRadar
                className="min-w-0 flex-[1.5]"
                apiResponse={{ risks: risks.data }}
              />
            ) : null}
          </div>
        </div>

        <div className={dashboardGridSlot.tablesRow}>
          <GradientSeparator orientation="horizontal" />
          <div className={dashboardGridSlot.rowInner}>
            {upcomingWeek.isPending && !upcomingWeek.data ? (
              <WidgetSkeleton
                className="min-w-0 flex-1"
                contentHeight="h-[220px]"
              />
            ) : (
              <RecentEvents
                className="min-w-0 flex-1"
                data={toCalendarEvents(upcomingWeek.data ?? [])}
              />
            )}
            <GradientSeparator
              orientation="vertical"
              className={dashboardGridSlot.verticalSepDesktop}
            />
            {recentTransactions.isPending && !recentTransactions.data ? (
              <WidgetSkeleton
                className="min-w-0 flex-1"
                contentHeight="h-[220px]"
              />
            ) : (
              <RecentTransactions
                className="min-w-0 flex-1"
                data={recentTransactions.data ?? []}
              />
            )}
          </div>
        </div>

        <div className={dashboardGridSlot.productionValueRow}>
          <GradientSeparator orientation="horizontal" />
          {productionValue.isPending && !productionValue.data ? (
            <ProductionValueSkeleton
              className={dashboardGridSlot.productionValue}
            />
          ) : productionValue.data ? (
            <ProductionValue
              {...productionValue.data}
              className={dashboardGridSlot.productionValue}
            />
          ) : null}
        </div>
      </main>
    </div>
  )
}
