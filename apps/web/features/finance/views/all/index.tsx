"use client"

import { PageContainer } from "@workspace/web/components/ui/page-container"
import { GradientSeparator } from "@workspace/web/components/ui/gradient-separator"
import { WidgetSkeleton } from "@workspace/web/components/widget-skeleton"
import { ParcelsFinanceBars } from "@workspace/web/components/charts/parcels-finance-bars"
import { ExpensesPieChart } from "@workspace/web/features/finance/components/chart/expenses-pie-chart"
import { IncomePieChart } from "@workspace/web/features/finance/components/chart/income-pie-chart"
import { FinanceResume } from "@workspace/web/features/dashboard/views/single/components/finance-resume"
import type { FinanceViewData } from "@workspace/web/features/finance/views/single"
import type { FinanceTransactionSnapshot } from "@workspace/web/lib/finance/types"
import type { DashboardParcelFinanceComparisonItem } from "@workspace/schemas"

export type FinanceAllViewProps = FinanceViewData & {
  parcelsComparison: {
    isPending: boolean
    data?: { parcels: DashboardParcelFinanceComparisonItem[] }
  }
}

export function FinanceAllView({
  rows,
  olivePrices,
  financeResume,
  parcelsComparison,
  isLoadingCharts,
}: FinanceAllViewProps) {
  const showParcelsBars = Boolean(parcelsComparison.data?.parcels.length)
  const isLoadingTopRow =
    (financeResume.isPending && !financeResume.data) ||
    (parcelsComparison.isPending && !parcelsComparison.data)

  return (
    <PageContainer className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-stretch">
        {isLoadingTopRow ? (
          <WidgetSkeleton className="min-h-[480px] min-w-0 flex-1" />
        ) : financeResume.data ? (
          <FinanceResume
            className="min-h-[480px] min-w-0 flex-1"
            transactions={
              financeResume.data
                .transactions as unknown as FinanceTransactionSnapshot[]
            }
            oils={olivePrices.data ?? []}
            previousCampaign={financeResume.data.previousCampaign}
            redirectButton={false}
            showInsights
          />
        ) : null}
        <GradientSeparator orientation="vertical" className="hidden md:block" />
        {isLoadingTopRow ? (
          <WidgetSkeleton className="min-h-[480px] min-w-0 flex-1" />
        ) : showParcelsBars ? (
          <ParcelsFinanceBars
            className="min-h-[480px] min-w-0 flex-1"
            parcels={parcelsComparison.data!.parcels}
          />
        ) : null}
      </div>

      <GradientSeparator orientation="horizontal" />

      <div className="flex flex-col gap-4 md:flex-row md:items-stretch">
        <div className="min-h-[280px] min-w-0 flex-1">
          {isLoadingCharts ? (
            <WidgetSkeleton className="h-full min-h-[280px]" />
          ) : (
            <ExpensesPieChart data={rows} />
          )}
        </div>
        <GradientSeparator orientation="vertical" className="hidden md:block" />
        <div className="min-h-[280px] min-w-0 flex-1">
          {isLoadingCharts ? (
            <WidgetSkeleton className="h-full min-h-[280px]" />
          ) : (
            <IncomePieChart data={rows} />
          )}
        </div>
      </div>
    </PageContainer>
  )
}
