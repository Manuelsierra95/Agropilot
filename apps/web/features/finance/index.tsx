"use client"

import { useMemo } from "react"

import { PageContainer } from "@/components/ui/page-container"
import { GradientSeparator } from "@/components/ui/gradient-separator"
import { CashFlowSummaryCard } from "@/components/cards/cash-flow-summary-card"
import { FinanceRecommendationsCard } from "@/components/cards/finance-recommendations-card"
import { ParcelsFinanceBars } from "@/features/dashboard/all/parcels-finance-bars"
import { WidgetSkeleton } from "@/features/dashboard/dashboard-skeleton"
import { ExpensesPieChart } from "./chart/expenses-pie-chart"
import { IncomePieChart } from "./chart/income-pie-chart"
import { TransactionTable } from "./table"
import {
  useOlivePrices,
  useParcelsFinanceComparison,
} from "@/hooks/dashboard"
import { useFinanceTransactions } from "@/hooks/finance"
import { useIsAllParcelsSelected } from "@/hooks/use-is-all-parcels-selected"
import { toTransactionSnapshots } from "@/lib/finance/mappers"

export default function Finance() {
  const isAllParcels = useIsAllParcelsSelected()

  const transactionsQuery = useFinanceTransactions()
  const olivePrices = useOlivePrices()
  const parcelsComparison = useParcelsFinanceComparison()

  const rows = transactionsQuery.data ?? []
  const snapshots = useMemo(() => toTransactionSnapshots(rows), [rows])

  const isLoadingCharts =
    transactionsQuery.isPending && transactionsQuery.data === undefined

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
          <TransactionTable data={rows} showParcelColumn={isAllParcels} />
        )}
      </div>
    </PageContainer>
  )
}
