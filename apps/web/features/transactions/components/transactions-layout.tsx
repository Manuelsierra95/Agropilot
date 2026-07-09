"use client"

import { CashFlowSummaryCard } from "@workspace/web/components/cards/cash-flow-summary-card"
import { GradientSeparator } from "@workspace/web/components/ui/gradient-separator"
import { PageContainer } from "@workspace/web/components/ui/page-container"
import { WidgetSkeleton } from "@workspace/web/components/widget-skeleton"
import { NewTransactionSheet } from "@workspace/web/features/finance/components/new-transaction-sheet"
import { TransactionTable } from "@workspace/web/components/finance"
import type { TransactionsLayoutData } from "@workspace/web/features/transactions/views/single"

type TransactionsLayoutProps = TransactionsLayoutData & {
  isAllParcels: boolean
}

export function TransactionsLayout({
  isAllParcels,
  rows,
  snapshots,
  isLoading,
  newTransactionOpen,
  onNewTransactionOpenChange,
  onTransactionSuccess,
}: TransactionsLayoutProps) {
  return (
    <PageContainer className="flex flex-col gap-4">
      <div className="min-h-[200px]">
        {isLoading ? (
          <WidgetSkeleton
            className="h-full"
            contentHeight="h-full min-h-[160px]"
          />
        ) : (
          <CashFlowSummaryCard className="h-full" transactions={snapshots} />
        )}
      </div>

      <GradientSeparator orientation="horizontal" />

      <div>
        {isLoading ? (
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
