"use client"

import * as React from "react"

import { PageContainer } from "@workspace/web/components/ui/page-container"
import { GradientSeparator } from "@workspace/web/components/ui/gradient-separator"
import { FinanceRecommendationsCard } from "@workspace/web/components/cards/finance-recommendations-card"
import { ParcelsFinanceBars } from "@workspace/web/components/charts/parcels-finance-bars"
import { WidgetSkeleton } from "@workspace/web/components/widget-skeleton"
import { ExpensesPieChart } from "@workspace/web/features/finance/components/chart/expenses-pie-chart"
import { IncomePieChart } from "@workspace/web/features/finance/components/chart/income-pie-chart"
import type {
  FinanceTransaction,
  FinanceTransactionSnapshot,
} from "@workspace/web/lib/finance/types"
import type {
  DashboardOlivePriceItem,
  DashboardParcelFinanceComparisonItem,
} from "@workspace/schemas"

type FinanceLayoutProps = {
  isAllParcels: boolean
  rows: FinanceTransaction[]
  snapshots: FinanceTransactionSnapshot[]
  olivePrices: {
    data?: DashboardOlivePriceItem[]
    isPending: boolean
  }
  parcelsComparison: {
    isPending: boolean
    data?: { parcels: DashboardParcelFinanceComparisonItem[] }
  }
  isLoadingCharts: boolean
}

export function FinanceLayout({
  isAllParcels,
  rows,
  snapshots,
  olivePrices,
  parcelsComparison,
  isLoadingCharts,
}: FinanceLayoutProps) {
  const showParcelsBars =
    isAllParcels && Boolean(parcelsComparison.data?.parcels.length)

  return (
    <PageContainer className="flex flex-col gap-4">
      <div className="grid min-h-[580px] grid-cols-[1fr_auto_1fr] items-stretch gap-4">
        <div className="flex min-h-0 flex-col gap-4">
          <div className="min-h-0 flex-1 basis-0">
            {isLoadingCharts ? (
              <WidgetSkeleton
                className="h-full"
                contentHeight="h-full min-h-[240px]"
              />
            ) : (
              <IncomePieChart data={rows} />
            )}
          </div>

          <GradientSeparator orientation="horizontal" />

          <div className="min-h-0 flex-1 basis-0">
            {isLoadingCharts ? (
              <WidgetSkeleton
                className="h-full"
                contentHeight="h-full min-h-[240px]"
              />
            ) : (
              <ExpensesPieChart data={rows} />
            )}
          </div>
        </div>

        <GradientSeparator orientation="vertical" className="self-stretch" />

        <div className="flex min-h-0 flex-col gap-4">
          {isAllParcels &&
          parcelsComparison.isPending &&
          !parcelsComparison.data ? (
            <WidgetSkeleton className="shrink-0" contentHeight="h-[140px]" />
          ) : showParcelsBars ? (
            <ParcelsFinanceBars
              className="shrink-0"
              parcels={parcelsComparison.data!.parcels}
            />
          ) : null}

          <div className="min-h-0 flex-1 basis-0">
            {isLoadingCharts || (olivePrices.isPending && !olivePrices.data) ? (
              <WidgetSkeleton
                className="h-full"
                contentHeight="h-full min-h-[200px]"
              />
            ) : (
              <FinanceRecommendationsCard
                className="h-full"
                transactions={snapshots}
                oils={olivePrices.data ?? []}
                redirectButton={false}
              />
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
