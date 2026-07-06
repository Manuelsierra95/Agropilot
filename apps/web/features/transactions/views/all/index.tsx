"use client"

import { TransactionsLayout } from "@workspace/web/features/transactions/components/transactions-layout"
import type { TransactionsLayoutData } from "@workspace/web/features/transactions/views/single"

export type TransactionsAllViewProps = TransactionsLayoutData

export function TransactionsAllView(props: TransactionsAllViewProps) {
  return <TransactionsLayout isAllParcels {...props} />
}
