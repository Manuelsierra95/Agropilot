"use client"

import { useMemo } from "react"

import { GradientSeparator } from "@workspace/web/components/ui/gradient-separator"
import { toCalendarTasks } from "@workspace/web/lib/calendar/mappers"
import type { DashboardOverviewSingle } from "@workspace/schemas"
import type { FinanceTransactionSnapshot } from "@workspace/web/lib/finance/types"
import { useDashboardScope } from "@workspace/web/hooks/dashboard"

import { OlivePrice } from "@workspace/web/features/dashboard/components/olive-price"
import { ResumeCrop } from "@workspace/web/features/dashboard/views/single/components/resume-crop"
import { FinanceResume } from "@workspace/web/features/dashboard/views/single/components/finance-resume"
import { CampaignAccumulatedMargin } from "@workspace/web/features/dashboard/views/single/components/campaign-accumulated-margin"
import { Recommendations } from "@workspace/web/features/dashboard/views/single/components/recommendations"
import { ParcelMap } from "@workspace/web/features/dashboard/views/single/components/parcel-map"
import { RiskRadar } from "@workspace/web/features/dashboard/views/single/components/risk-radar"
import { RecentTasks } from "@workspace/web/features/dashboard/components/recent-tasks"
import { RecentTransactions } from "@workspace/web/features/dashboard/components/recent-transactions"
import type { TransactionSnapshot } from "@workspace/web/features/dashboard/components/recent-transactions"
import { SellingWindow } from "@workspace/web/features/dashboard/views/single/components/selling-window"
import { ProductionValue } from "@workspace/web/features/dashboard/components/production-value"
import { dashboardGridSlot } from "@workspace/web/features/dashboard/lib/dashboard-grid-layout"
import { WidgetSkeleton } from "@workspace/web/components/widget-skeleton"
import {
  MapSkeleton,
  ProductionValueSkeleton,
  ResumeCropSkeleton,
} from "@workspace/web/features/dashboard/components/dashboard-skeleton"

type DashboardSingleViewProps = {
  data?: DashboardOverviewSingle
  olivePrices: DashboardOverviewSingle["market"]["olivePrices"]
  upcomingWeek: DashboardOverviewSingle["operations"]["upcomingWeek"]
  recentTransactions: DashboardOverviewSingle["finance"]["recentTransactions"]
  productionValue?: DashboardOverviewSingle["crop"]["productionValue"]
  isPending: boolean
  scopeKey?: string
}

export function DashboardSingleView({
  data,
  olivePrices,
  upcomingWeek,
  recentTransactions,
  productionValue,
  isPending,
  scopeKey,
}: DashboardSingleViewProps) {
  const scope = useDashboardScope()
  const mapParcel = useMemo(() => {
    if (!scope.parcelId) return undefined
    return data?.operations.parcelsMap?.find(
      (parcel) => parcel.id === scope.parcelId
    )
  }, [data?.operations.parcelsMap, scope.parcelId])
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
          ) : data?.market?.sellingWindow ? (
            <SellingWindow
              className="min-w-0 md:flex-1"
              parcelId={scope.parcelId ?? undefined}
              {...data.market?.sellingWindow}
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
        ) : data?.crop?.overview ? (
          <ResumeCrop
            className={dashboardGridSlot.resumeCrop}
            data={{
              ...data.crop?.overview,
              lastUpdate: new Date(data.crop?.overview?.lastUpdate ?? 0),
            }}
          />
        ) : null}
      </div>

      <div className={dashboardGridSlot.financeRow}>
        <GradientSeparator orientation="horizontal" />
        <div className={dashboardGridSlot.rowInner}>
          {isPending ? (
            <WidgetSkeleton
              className="min-w-0 flex-1"
              contentHeight="h-[200px]"
            />
          ) : data?.finance?.resume ? (
            <FinanceResume
              className="min-w-0 flex-1"
              transactions={
                data.finance?.resume
                  ?.transactions as unknown as FinanceTransactionSnapshot[]
              }
              oils={olivePrices}
              previousCampaign={data.finance?.resume?.previousCampaign}
            />
          ) : null}
          <GradientSeparator
            orientation="vertical"
            className={dashboardGridSlot.verticalSepDesktop}
          />
          {isPending ? (
            <WidgetSkeleton
              className="min-w-0 flex-[1.5] md:flex-2"
              contentHeight="h-[200px]"
            />
          ) : data?.finance?.campaignMargin ? (
            <CampaignAccumulatedMargin
              className="min-w-0 flex-[1.5] md:flex-2"
              data={data.finance?.campaignMargin}
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
          ) : data ? (
            <Recommendations
              className="min-w-0 flex-1"
              data={{
                recommendations: data.intelligence?.recommendations ?? [],
              }}
            />
          ) : null}
          <GradientSeparator
            orientation="vertical"
            className={dashboardGridSlot.verticalSepDesktop}
          />
          {isPending ? (
            <MapSkeleton className="min-w-0 flex-2" />
          ) : (
            <ParcelMap className="min-w-0 flex-2 py-4" parcel={mapParcel} />
          )}
          <GradientSeparator
            orientation="vertical"
            className={dashboardGridSlot.verticalSepDesktop}
          />
          {isPending ? (
            <WidgetSkeleton
              className="min-w-0 flex-[1.5]"
              contentHeight="h-[240px]"
            />
          ) : data?.intelligence?.risks ? (
            <RiskRadar
              className="min-w-0 flex-[1.5]"
              risks={data.intelligence?.risks}
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
              showParcelColumn={false}
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
          <ProductionValue
            {...productionValue}
            className={dashboardGridSlot.productionValue}
          />
        ) : null}
      </div>
    </>
  )
}
