"use client"

import { PageContainer } from "@workspace/web/components/ui/page-container"
import { GradientSeparator } from "@workspace/web/components/ui/gradient-separator"
import { WidgetSkeleton } from "@workspace/web/components/widget-skeleton"
import { ExpensesPieChart } from "@workspace/web/features/finance/components/chart/expenses-pie-chart"
import { IncomePieChart } from "@workspace/web/features/finance/components/chart/income-pie-chart"
import { FinanceResume } from "@workspace/web/features/dashboard/views/single/components/finance-resume"
import { CampaignAccumulatedMargin } from "@workspace/web/features/dashboard/views/single/components/campaign-accumulated-margin"
import type {
  FinanceTransaction,
  FinanceTransactionSnapshot,
} from "@workspace/web/lib/finance/types"
import type {
  DashboardCampaignMargin,
  DashboardFinanceResume,
  DashboardOlivePriceItem,
} from "@workspace/schemas"

export type FinanceViewData = {
  rows: FinanceTransaction[]
  olivePrices: {
    data?: DashboardOlivePriceItem[]
    isPending: boolean
  }
  financeResume: {
    isPending: boolean
    data?: DashboardFinanceResume
  }
  campaignMargin: {
    isPending: boolean
    data?: DashboardCampaignMargin
  }
  isLoadingCharts: boolean
}

export function FinanceSingleView({
  rows,
  olivePrices,
  financeResume,
  campaignMargin,
  isLoadingCharts,
}: FinanceViewData) {
  const isLoadingTopRow =
    (financeResume.isPending && !financeResume.data) ||
    (campaignMargin.isPending && !campaignMargin.data)

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
        ) : campaignMargin.data ? (
          <CampaignAccumulatedMargin
            className="min-h-[480px] min-w-0 flex-1"
            data={campaignMargin.data}
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
