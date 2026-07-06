"use client"

import { TransactionsLayout } from "@workspace/web/features/transactions/components/transactions-layout"
import type {
  FinanceTransaction,
  FinanceTransactionSnapshot,
} from "@workspace/web/lib/finance/types"

export type TransactionsLayoutData = {
  rows: FinanceTransaction[]
  snapshots: FinanceTransactionSnapshot[]
  isLoading: boolean
  newTransactionOpen: boolean
  onNewTransactionOpenChange: (open: boolean) => void
  onTransactionSuccess: () => void
}

export function TransactionsSingleView(props: TransactionsLayoutData) {
  return <TransactionsLayout isAllParcels={false} {...props} />
}
