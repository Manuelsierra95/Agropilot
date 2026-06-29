"use client"

import { GradientSeparator } from "@workspace/web/components/ui/gradient-separator"
import { toCalendarEvents } from "@workspace/web/lib/calendar/mappers"

import { OlivePrice } from "@workspace/web/features/dashboard/olive-price"
import { ResumeCrop } from "@workspace/web/features/dashboard/resume-crop"
import { FinanceResume } from "@workspace/web/features/dashboard/finance-resume"
import { CampaignAccumulatedMargin } from "@workspace/web/features/dashboard/campaign-accumulated-margin"
import { Recommendations } from "@workspace/web/features/dashboard/recommendations"
import { DashboardMap } from "@workspace/web/features/dashboard/map"
import { RiskRadar } from "@workspace/web/features/dashboard/risk-radar"
import { RecentEvents } from "@workspace/web/features/dashboard/recent-events"
import { RecentTransactions } from "@workspace/web/features/dashboard/recent-transactions"
import { SellingWindow } from "@workspace/web/features/dashboard/selling-window"
import { ProductionValue } from "@workspace/web/features/dashboard/production-value"
import { SellingWindowAll } from "@workspace/web/features/dashboard/all/selling-window-all"
import { ResumeCropAll } from "@workspace/web/features/dashboard/all/resume-crop-all"
import { ParcelsFinanceBars } from "@workspace/web/features/dashboard/all/parcels-finance-bars"
import { RecommendationsAll } from "@workspace/web/features/dashboard/all/recommendations-all"
import { RiskRadarMulti } from "@workspace/web/features/dashboard/all/risk-radar-multi"
import { ProductionValueAll } from "@workspace/web/features/dashboard/all/production-value-all"
import {
  dashboardContainerClassName,
  dashboardGridSlot,
  dashboardMainClassName,
} from "@workspace/web/features/dashboard/dashboard-grid-layout"
import {
  MapSkeleton,
  ProductionValueSkeleton,
  ResumeCropSkeleton,
  WidgetSkeleton,
} from "@workspace/web/features/dashboard/dashboard-skeleton"
import { useDashboardOverview } from "@workspace/web/hooks/dashboard"
import { useIsAllParcelsSelected } from "@workspace/web/hooks/use-is-all-parcels-selected"
import type {
  DashboardOverviewAll,
  DashboardOverviewSingle,
} from "@workspace/schemas"

export default function DashboardOverview() {
  const isAllParcels = useIsAllParcelsSelected()
  const overview = useDashboardOverview()
  const data = overview.data
  const isPending = overview.isPending && !data

  const single = !isAllParcels
    ? (data as DashboardOverviewSingle | undefined)
    : undefined
  const all = isAllParcels
    ? (data as DashboardOverviewAll | undefined)
    : undefined

  const olivePrices = data?.market.olivePrices ?? []
  const parcelsMap = data?.operations.parcelsMap ?? []
  const upcomingWeek = data?.operations.upcomingWeek ?? []
  const recentTransactions = data?.finance.recentTransactions ?? []
  const productionValue = data?.crop.productionValue

  return (
    <div className={dashboardContainerClassName}>
      <main className={dashboardMainClassName}>
        <div className={dashboardGridSlot.topRow}>
          <GradientSeparator
            orientation="horizontal"
            className={dashboardGridSlot.horizSepMobile}
          />
          <div className={dashboardGridSlot.rowInner}>
            {isPending ? (
              <WidgetSkeleton
                className="min-w-0 flex-2"
                contentHeight="h-[140px]"
              />
            ) : (
              <OlivePrice
                className="min-w-0 flex-2"
                items={olivePrices}
              />
            )}
            <GradientSeparator
              orientation="vertical"
              className={dashboardGridSlot.verticalSepDesktop}
            />
            {isAllParcels ? (
              isPending && !all?.market.allSellingWindows?.length ? (
                <WidgetSkeleton
                  className="min-w-0 flex-1"
                  contentHeight="h-[140px]"
                />
              ) : (
                <SellingWindowAll
                  className="min-w-0 flex-1"
                  items={all?.market.allSellingWindows ?? []}
                />
              )
            ) : isPending && !single?.market.sellingWindow ? (
              <WidgetSkeleton
                className="min-w-0 flex-1"
                contentHeight="h-[140px]"
              />
            ) : single?.market.sellingWindow ? (
              <SellingWindow
                className="min-w-0 flex-1"
                scopeKey={overview.scopeKey}
                {...single.market.sellingWindow}
              />
            ) : null}
          </div>
        </div>

        <div className={dashboardGridSlot.resumeCropWrapper}>
          <GradientSeparator
            orientation="vertical"
            className={dashboardGridSlot.verticalSepDesktop}
          />
          {isAllParcels ? (
            isPending && !all?.crop.allOverviews?.length ? (
              <ResumeCropSkeleton className={dashboardGridSlot.resumeCrop} />
            ) : (
              <ResumeCropAll
                className={dashboardGridSlot.resumeCrop}
                items={all?.crop.allOverviews ?? []}
              />
            )
          ) : isPending && !single?.crop.overview ? (
            <ResumeCropSkeleton className={dashboardGridSlot.resumeCrop} />
          ) : single?.crop.overview ? (
            <ResumeCrop
              className={dashboardGridSlot.resumeCrop}
              data={{
                ...single.crop.overview,
                lastUpdate: new Date(single.crop.overview.lastUpdate),
              }}
            />
          ) : null}
        </div>

        <div className={dashboardGridSlot.financeRow}>
          <GradientSeparator orientation="horizontal" />
          <div className={dashboardGridSlot.rowInner}>
            {!isAllParcels &&
              (isPending && !single?.finance.resume ? (
                <WidgetSkeleton
                  className="min-w-0 flex-1"
                  contentHeight="h-[200px]"
                />
              ) : single?.finance.resume ? (
                <FinanceResume
                  className="min-w-0 flex-1"
                  transactions={single.finance.resume.transactions}
                  oils={olivePrices}
                  previousCampaign={single.finance.resume.previousCampaign}
                />
              ) : null)}
            {!isAllParcels && (
              <GradientSeparator
                orientation="vertical"
                className={dashboardGridSlot.verticalSepDesktop}
              />
            )}
            {isAllParcels ? (
              isPending && !all?.finance.comparison ? (
                <WidgetSkeleton
                  className="min-w-0 w-full flex-1"
                  contentHeight="h-[200px]"
                />
              ) : all?.finance.comparison ? (
                <ParcelsFinanceBars
                  className="min-w-0 w-full flex-1"
                  parcels={all.finance.comparison.parcels}
                />
              ) : null
            ) : isPending && !single?.finance.campaignMargin ? (
              <WidgetSkeleton
                className="min-w-0 flex-2"
                contentHeight="h-[200px]"
              />
            ) : single?.finance.campaignMargin ? (
              <CampaignAccumulatedMargin
                className="min-w-0 flex-2"
                data={single.finance.campaignMargin}
              />
            ) : null}
          </div>
        </div>

        <div className={dashboardGridSlot.recoMapRow}>
          <GradientSeparator orientation="horizontal" />
          <div className={dashboardGridSlot.rowInner}>
            {isAllParcels ? (
              isPending && !all?.intelligence.allRecommendations?.length ? (
                <WidgetSkeleton
                  className="min-w-0 flex-1"
                  contentHeight="h-[240px]"
                />
              ) : (
                <RecommendationsAll
                  className="min-w-0 flex-1"
                  items={all?.intelligence.allRecommendations ?? []}
                />
              )
            ) : isPending && !single?.intelligence.recommendations?.length ? (
              <WidgetSkeleton
                className="min-w-0 flex-1"
                contentHeight="h-[240px]"
              />
            ) : (
              <Recommendations
                className="min-w-0 flex-1"
                data={{
                  recommendations: single?.intelligence.recommendations ?? [],
                }}
              />
            )}
            <GradientSeparator
              orientation="vertical"
              className={dashboardGridSlot.verticalSepDesktop}
            />
            {isPending && !parcelsMap.length ? (
              <MapSkeleton className="min-w-0 flex-2" />
            ) : (
              <DashboardMap
                className="min-w-0 flex-2"
                parcels={parcelsMap}
              />
            )}
            <GradientSeparator
              orientation="vertical"
              className={dashboardGridSlot.verticalSepDesktop}
            />
            {isAllParcels ? (
              isPending && !all?.intelligence.allRisks?.length ? (
                <WidgetSkeleton
                  className="min-w-0 flex-[1.5]"
                  contentHeight="h-[240px]"
                />
              ) : (
                <RiskRadarMulti
                  className="min-w-0 flex-[1.5]"
                  items={all?.intelligence.allRisks ?? []}
                />
              )
            ) : isPending && !single?.intelligence.risks ? (
              <WidgetSkeleton
                className="min-w-0 flex-[1.5]"
                contentHeight="h-[240px]"
              />
            ) : single?.intelligence.risks ? (
              <RiskRadar
                className="min-w-0 flex-[1.5]"
                risks={single.intelligence.risks}
              />
            ) : null}
          </div>
        </div>

        <div className={dashboardGridSlot.tablesRow}>
          <GradientSeparator orientation="horizontal" />
          <div className={dashboardGridSlot.rowInner}>
            {isPending && !upcomingWeek.length ? (
              <WidgetSkeleton
                className="min-w-0 flex-1"
                contentHeight="h-[220px]"
              />
            ) : (
              <RecentEvents
                className="min-w-0 flex-1"
                data={toCalendarEvents(upcomingWeek)}
              />
            )}
            <GradientSeparator
              orientation="vertical"
              className={dashboardGridSlot.verticalSepDesktop}
            />
            {isPending && !recentTransactions.length ? (
              <WidgetSkeleton
                className="min-w-0 flex-1"
                contentHeight="h-[220px]"
              />
            ) : (
              <RecentTransactions
                className="min-w-0 flex-1"
                data={recentTransactions}
                showParcelColumn={isAllParcels}
              />
            )}
          </div>
        </div>

        <div className={dashboardGridSlot.productionValueRow}>
          <GradientSeparator orientation="horizontal" />
          {isPending && !productionValue ? (
            <ProductionValueSkeleton
              className={dashboardGridSlot.productionValue}
            />
          ) : productionValue ? (
            isAllParcels ? (
              <ProductionValueAll
                {...productionValue}
                parcels={all?.finance.comparison?.parcels ?? []}
                cropOverviews={all?.crop.allOverviews ?? []}
                className={dashboardGridSlot.productionValue}
              />
            ) : (
              <ProductionValue
                {...productionValue}
                className={dashboardGridSlot.productionValue}
              />
            )
          ) : null}
        </div>
      </main>
    </div>
  )
}
