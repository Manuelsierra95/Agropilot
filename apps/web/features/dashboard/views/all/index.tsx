"use client"

import { GradientSeparator } from "@workspace/web/components/ui/gradient-separator"
import { toCalendarTasks } from "@workspace/web/lib/calendar/mappers"
import type { DashboardOverviewAll } from "@workspace/schemas"

import { OlivePrice } from "@workspace/web/features/dashboard/components/olive-price"
import { RecentTasks } from "@workspace/web/features/dashboard/components/recent-tasks"
import { RecentTransactions } from "@workspace/web/features/dashboard/components/recent-transactions"
import type { TransactionSnapshot } from "@workspace/web/features/dashboard/components/recent-transactions"
import { SellingWindowAll } from "@workspace/web/features/dashboard/views/all/components/selling-window-all"
import { ResumeCropAll } from "@workspace/web/features/dashboard/views/all/components/resume-crop-all"
import { ParcelsFinanceBars } from "@workspace/web/components/charts/parcels-finance-bars"
import { RecommendationsAll } from "@workspace/web/features/dashboard/views/all/components/recommendations-all"
import { RiskRadarMulti } from "@workspace/web/features/dashboard/views/all/components/risk-radar-multi"
import { ProductionValueAll } from "@workspace/web/features/dashboard/views/all/components/production-value-all"
import { dashboardGridSlot } from "@workspace/web/features/dashboard/lib/dashboard-grid-layout"
import { WidgetSkeleton } from "@workspace/web/components/widget-skeleton"
import {
  ProductionValueSkeleton,
  ResumeCropSkeleton,
} from "@workspace/web/features/dashboard/components/dashboard-skeleton"

type DashboardAllViewProps = {
  data?: DashboardOverviewAll
  olivePrices: DashboardOverviewAll["market"]["olivePrices"]
  upcomingWeek: DashboardOverviewAll["operations"]["upcomingWeek"]
  recentTransactions: DashboardOverviewAll["finance"]["recentTransactions"]
  productionValue?: DashboardOverviewAll["crop"]["productionValue"]
  isPending: boolean
}

export function DashboardAllView({
  data,
  olivePrices,
  upcomingWeek,
  recentTransactions,
  productionValue,
  isPending,
}: DashboardAllViewProps) {
  return (
    <>
      <div className={dashboardGridSlot.topRow}>
        <GradientSeparator
          orientation="horizontal"
          className={dashboardGridSlot.horizSepMobile}
        />
        <div className={dashboardGridSlot.rowInner}>
          {isPending ? (
            <WidgetSkeleton
              className="min-w-0 md:flex-2"
              contentHeight="h-[140px]"
            />
          ) : (
            <OlivePrice className="min-w-0 md:flex-2" items={olivePrices} />
          )}
          <GradientSeparator
            orientation="vertical"
            className={dashboardGridSlot.verticalSepDesktop}
          />
          {isPending ? (
            <WidgetSkeleton
              className="min-w-0 md:flex-1"
              contentHeight="h-[140px]"
            />
          ) : data?.market?.allSellingWindows?.length ? (
            <SellingWindowAll
              className="min-w-0 md:flex-1"
              items={data.market?.allSellingWindows ?? []}
            />
          ) : null}
        </div>
      </div>

      <div className={dashboardGridSlot.resumeCropWrapper}>
        <GradientSeparator
          orientation="vertical"
          className={dashboardGridSlot.verticalSepDesktop}
        />
        {isPending ? (
          <ResumeCropSkeleton className={dashboardGridSlot.resumeCrop} />
        ) : data?.crop?.allOverviews?.length ? (
          <ResumeCropAll
            className={dashboardGridSlot.resumeCrop}
            items={data.crop?.allOverviews ?? []}
          />
        ) : null}
      </div>

      <div className={dashboardGridSlot.financeRow}>
        <GradientSeparator orientation="horizontal" />
        <div className={dashboardGridSlot.rowInner}>
          {isPending ? (
            <WidgetSkeleton
              className="w-full min-w-0 flex-1"
              contentHeight="h-[200px]"
            />
          ) : data?.finance?.comparison ? (
            <ParcelsFinanceBars
              className="w-full min-w-0 flex-1"
              parcels={data.finance?.comparison?.parcels ?? []}
            />
          ) : null}
        </div>
      </div>

      <div className={dashboardGridSlot.recoMapRow}>
        <GradientSeparator orientation="horizontal" />
        <div className={dashboardGridSlot.rowInner}>
          {isPending ? (
            <WidgetSkeleton
              className="min-w-0 flex-1"
              contentHeight="h-[240px]"
            />
          ) : data?.intelligence?.allRecommendations?.length ? (
            <RecommendationsAll
              className="min-w-0 flex-1"
              items={data.intelligence?.allRecommendations ?? []}
            />
          ) : null}
          <GradientSeparator
            orientation="vertical"
            className={dashboardGridSlot.verticalSepDesktop}
          />
          {isPending ? (
            <WidgetSkeleton
              className="min-w-0 flex-[1.5]"
              contentHeight="h-[240px]"
            />
          ) : data?.intelligence?.allRisks?.length ? (
            <RiskRadarMulti
              className="min-w-0 flex-[1.5]"
              items={data.intelligence?.allRisks ?? []}
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
            <RecentTasks
              className="min-w-0 flex-1"
              data={toCalendarTasks(upcomingWeek)}
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
              data={recentTransactions as TransactionSnapshot[]}
              showParcelColumn
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
        ) : productionValue && data ? (
          <ProductionValueAll
            {...productionValue}
            parcels={data.finance?.comparison?.parcels ?? []}
            cropOverviews={data.crop?.allOverviews ?? []}
            className={dashboardGridSlot.productionValue}
          />
        ) : null}
      </div>
    </>
  )
}
