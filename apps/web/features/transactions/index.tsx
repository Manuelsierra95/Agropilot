"use client"

import { useMemo, useState } from "react"

import { TransactionsAllView } from "@workspace/web/features/transactions/views/all"
import { TransactionsSingleView } from "@workspace/web/features/transactions/views/single"
import { useFinanceTransactions } from "@workspace/web/hooks/finance"
import { useIsAllParcelsSelected } from "@workspace/web/hooks/use-is-all-parcels-selected"
import { toTransactionSnapshots } from "@workspace/web/lib/finance/mappers"

export default function Transactions() {
  const isAllParcels = useIsAllParcelsSelected()
  const [newTransactionOpen, setNewTransactionOpen] = useState(false)

  const transactionsQuery = useFinanceTransactions()

  const rows = useMemo(
    () => transactionsQuery.data ?? [],
    [transactionsQuery.data]
  )
  const snapshots = useMemo(() => toTransactionSnapshots(rows), [rows])

  const isLoading =
    transactionsQuery.isPending && transactionsQuery.data === undefined

  const viewProps = {
    rows,
    snapshots,
    isLoading,
    newTransactionOpen,
    onNewTransactionOpenChange: setNewTransactionOpen,
    onTransactionSuccess: () => transactionsQuery.refetch(),
  }

  return isAllParcels ? (
    <TransactionsAllView {...viewProps} />
  ) : (
    <TransactionsSingleView {...viewProps} />
  )
}
