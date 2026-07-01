"use client"

import { FinanceLayout } from "@workspace/web/features/finance/components/finance-layout"
import type {
  FinanceTransaction,
  FinanceTransactionSnapshot,
} from "@workspace/web/lib/finance/types"
import type {
  DashboardOlivePriceItem,
  DashboardParcelFinanceComparisonItem,
} from "@workspace/schemas"

export type FinanceLayoutData = {
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

export function FinanceSingleView({
  rows,
  snapshots,
  olivePrices,
  parcelsComparison,
  isLoadingCharts,
  newTransactionOpen,
  onNewTransactionOpenChange,
  onTransactionSuccess,
}: FinanceLayoutData) {
  return (
    <FinanceLayout
      isAllParcels={false}
      rows={rows}
      snapshots={snapshots}
      olivePrices={olivePrices}
      parcelsComparison={parcelsComparison}
      isLoadingCharts={isLoadingCharts}
      newTransactionOpen={newTransactionOpen}
      onNewTransactionOpenChange={onNewTransactionOpenChange}
      onTransactionSuccess={onTransactionSuccess}
    />
  )
}
