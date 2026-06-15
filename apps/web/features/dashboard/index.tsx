"use client"

import { GradientSeparator } from "@/components/ui/gradient-separator"
import { toCalendarEvents } from "@/lib/calendar/mappers"

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
import { SellingWindowAll } from "@/features/dashboard/all/selling-window-all"
import { ResumeCropAll } from "@/features/dashboard/all/resume-crop-all"
import { ParcelsFinanceBars } from "@/features/dashboard/all/parcels-finance-bars"
import { RecommendationsAll } from "@/features/dashboard/all/recommendations-all"
import { RiskRadarMulti } from "@/features/dashboard/all/risk-radar-multi"
import { ProductionValueAll } from "@/features/dashboard/all/production-value-all"
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
  useAllParcelsCropOverviews,
  useAllParcelsRecommendations,
  useAllParcelsRisks,
  useAllParcelsSellingWindows,
  useCampaignMargin,
  useCropOverview,
  useFinanceResume,
  useOlivePrices,
  useParcelRecommendations,
  useParcelRisks,
  useParcelsFinanceComparison,
  useParcelsMap,
  useProductionValue,
  useRecentTransactions,
  useSellingWindow,
  useUpcomingWeekTasks,
} from "@/hooks/dashboard"
import { useIsAllParcelsSelected } from "@/hooks/use-is-all-parcels-selected"

export default function DashboardOverview() {
  const isAllParcels = useIsAllParcelsSelected()

  const olivePrices = useOlivePrices()
  const sellingWindow = useSellingWindow()
  const allSellingWindows = useAllParcelsSellingWindows()
  const cropOverview = useCropOverview()
  const allCropOverviews = useAllParcelsCropOverviews()
  const financeResume = useFinanceResume()
  const campaignMargin = useCampaignMargin()
  const parcelsFinanceComparison = useParcelsFinanceComparison()
  const recommendations = useParcelRecommendations()
  const allRecommendations = useAllParcelsRecommendations()
  const parcelsMap = useParcelsMap()
  const risks = useParcelRisks()
  const allRisks = useAllParcelsRisks()
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
            {isAllParcels ? (
              allSellingWindows.isPending && !allSellingWindows.data?.length ? (
                <WidgetSkeleton
                  className="min-w-0 flex-1"
                  contentHeight="h-[140px]"
                />
              ) : (
                <SellingWindowAll
                  className="min-w-0 flex-1"
                  items={allSellingWindows.data ?? []}
                />
              )
            ) : sellingWindow.isPending && !sellingWindow.data ? (
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
          {isAllParcels ? (
            allCropOverviews.isPending && !allCropOverviews.data?.length ? (
              <ResumeCropSkeleton className={dashboardGridSlot.resumeCrop} />
            ) : (
              <ResumeCropAll
                className={dashboardGridSlot.resumeCrop}
                items={allCropOverviews.data ?? []}
              />
            )
          ) : cropOverview.isPending && !cropOverview.data ? (
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
            {!isAllParcels &&
              (financeResume.isPending && !financeResume.data ? (
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
              ) : null)}
            {!isAllParcels && (
              <GradientSeparator
                orientation="vertical"
                className={dashboardGridSlot.verticalSepDesktop}
              />
            )}
            {isAllParcels ? (
              parcelsFinanceComparison.isPending &&
              !parcelsFinanceComparison.data ? (
                <WidgetSkeleton
                  className="min-w-0 w-full flex-1"
                  contentHeight="h-[200px]"
                />
              ) : parcelsFinanceComparison.data ? (
                <ParcelsFinanceBars
                  className="min-w-0 w-full flex-1"
                  parcels={parcelsFinanceComparison.data.parcels}
                />
              ) : null
            ) : campaignMargin.isPending && !campaignMargin.data ? (
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
            {isAllParcels ? (
              allRecommendations.isPending &&
              allRecommendations.data === undefined ? (
                <WidgetSkeleton
                  className="min-w-0 flex-1"
                  contentHeight="h-[240px]"
                />
              ) : (
                <RecommendationsAll
                  className="min-w-0 flex-1"
                  items={allRecommendations.data ?? []}
                />
              )
            ) : recommendations.isPending && !recommendations.data ? (
              <WidgetSkeleton
                className="min-w-0 flex-1"
                contentHeight="h-[240px]"
              />
            ) : (
              <Recommendations
                className="min-w-0 flex-1"
                data={{ recommendations: recommendations.data ?? [] }}
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
            {isAllParcels ? (
              allRisks.isPending && !allRisks.data?.length ? (
                <WidgetSkeleton
                  className="min-w-0 flex-[1.5]"
                  contentHeight="h-[240px]"
                />
              ) : (
                <RiskRadarMulti
                  className="min-w-0 flex-[1.5]"
                  items={allRisks.data ?? []}
                />
              )
            ) : risks.isPending && !risks.data ? (
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
                showParcelColumn={isAllParcels}
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
            isAllParcels ? (
              <ProductionValueAll
                {...productionValue.data}
                parcels={parcelsFinanceComparison.data?.parcels ?? []}
                cropOverviews={allCropOverviews.data ?? []}
                className={dashboardGridSlot.productionValue}
              />
            ) : (
              <ProductionValue
                {...productionValue.data}
                className={dashboardGridSlot.productionValue}
              />
            )
          ) : null}
        </div>
      </main>
    </div>
  )
}
