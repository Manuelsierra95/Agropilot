"use client"

import { GradientSeparator } from "@/components/ui/gradient-separator"
import { FinanceResume } from "@/features/dashboard/finance-resume"
import { CampaignAccumulatedMargin } from "@/features/dashboard/campaign-accumulated-margin"
import { ParcelsFinanceBars } from "@/features/dashboard/all/parcels-finance-bars"
import { dashboardGridSlot } from "@/features/dashboard/dashboard-grid-layout"
import { WidgetSkeleton } from "@/features/dashboard/dashboard-skeleton"

interface QueryState {
  isPending: boolean
  data: any
}

interface DashboardFinanceRowProps {
  financeResume: QueryState
  campaignMargin: QueryState
  parcelsFinanceComparison: QueryState
  olivePrices: QueryState
  isAllParcels: boolean
}

export function DashboardFinanceRow({
  financeResume,
  campaignMargin,
  parcelsFinanceComparison,
  olivePrices,
  isAllParcels,
}: DashboardFinanceRowProps) {
  return (
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
  )
}
