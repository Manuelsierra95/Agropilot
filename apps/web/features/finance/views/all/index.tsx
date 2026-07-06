"use client"

import { FinanceLayout } from "@workspace/web/features/finance/components/finance-layout"
import type { FinanceLayoutData } from "@workspace/web/features/finance/views/single"

export type FinanceAllViewProps = FinanceLayoutData

export function FinanceAllView({
  rows,
  snapshots,
  olivePrices,
  parcelsComparison,
  isLoadingCharts,
}: FinanceAllViewProps) {
  return (
    <FinanceLayout
      isAllParcels
      rows={rows}
      snapshots={snapshots}
      olivePrices={olivePrices}
      parcelsComparison={parcelsComparison}
      isLoadingCharts={isLoadingCharts}
    />
  )
}
