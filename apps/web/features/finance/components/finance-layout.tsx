"use client"

import * as React from "react"

import { PageContainer } from "@workspace/web/components/ui/page-container"
import { GradientSeparator } from "@workspace/web/components/ui/gradient-separator"
import { CashFlowSummaryCard } from "@workspace/web/components/cards/cash-flow-summary-card"
import { FinanceRecommendationsCard } from "@workspace/web/components/cards/finance-recommendations-card"
import { ParcelsFinanceBars } from "@workspace/web/components/charts/parcels-finance-bars"
import { WidgetSkeleton } from "@workspace/web/components/widget-skeleton"
import { ExpensesPieChart } from "@workspace/web/features/finance/components/chart/expenses-pie-chart"
import { IncomePieChart } from "@workspace/web/features/finance/components/chart/income-pie-chart"
import { TransactionTable } from "@workspace/web/features/finance/components/table"
import { NewTransactionSheet } from "@workspace/web/features/finance/components/new-transaction-sheet"
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
  newTransactionOpen: boolean
  onNewTransactionOpenChange: (open: boolean) => void
  onTransactionSuccess: () => void
}

export function FinanceLayout({
  isAllParcels,
  rows,
  snapshots,
  olivePrices,
  parcelsComparison,
  isLoadingCharts,
  newTransactionOpen,
  onNewTransactionOpenChange,
  onTransactionSuccess,
}: FinanceLayoutProps) {
  return (
    <PageContainer className="grid grid-cols-[1fr_auto_1fr] grid-rows-[auto] gap-4">
      <div className="col-span-1 row-span-2">
        {isLoadingCharts ? (
          <WidgetSkeleton contentHeight="h-[280px]" />
        ) : (
          <IncomePieChart data={rows} />
        )}
      </div>

      <GradientSeparator
        orientation="vertical"
        className="col-span-1 row-span-5"
      />

      <div className="col-span-1 col-start-3 row-span-3 row-start-1 flex flex-col gap-4">
        {isAllParcels &&
        parcelsComparison.isPending &&
        !parcelsComparison.data ? (
          <WidgetSkeleton contentHeight="h-[140px]" />
        ) : isAllParcels && parcelsComparison.data?.parcels.length ? (
          <ParcelsFinanceBars parcels={parcelsComparison.data.parcels} />
        ) : null}

        {isLoadingCharts || (olivePrices.isPending && !olivePrices.data) ? (
          <WidgetSkeleton contentHeight="h-[280px]" />
        ) : (
          <FinanceRecommendationsCard
            className="flex-1"
            transactions={snapshots}
            oils={olivePrices.data ?? []}
            redirectButton={false}
          />
        )}
      </div>

      <GradientSeparator
        orientation="horizontal"
        className="col-span-1 row-start-3"
      />

      <div className="col-span-1 row-span-2 row-start-4">
        {isLoadingCharts ? (
          <WidgetSkeleton contentHeight="h-[280px]" />
        ) : (
          <ExpensesPieChart data={rows} />
        )}
      </div>

      <GradientSeparator
        orientation="horizontal"
        className="col-span-1 col-start-3 row-start-4"
      />

      <div className="col-span-1 col-start-3 row-start-5">
        {isLoadingCharts ? (
          <WidgetSkeleton contentHeight="h-[200px]" />
        ) : (
          <CashFlowSummaryCard transactions={snapshots} />
        )}
      </div>

      <GradientSeparator
        orientation="horizontal"
        className="col-span-3 row-start-6"
      />

      <div className="col-span-3 row-start-7">
        {isLoadingCharts ? (
          <WidgetSkeleton contentHeight="h-[320px]" />
        ) : (
          <TransactionTable
            data={rows}
            showParcelColumn={isAllParcels}
            onNewTransaction={() => onNewTransactionOpenChange(true)}
          />
        )}
      </div>

      <NewTransactionSheet
        open={newTransactionOpen}
        onOpenChange={onNewTransactionOpenChange}
        onSuccess={onTransactionSuccess}
      />
    </PageContainer>
  )
}
