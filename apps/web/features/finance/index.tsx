"use client"

import { useMemo, useState } from "react"

import { FinanceAllView } from "@workspace/web/features/finance/views/all"
import { FinanceSingleView } from "@workspace/web/features/finance/views/single"
import {
  useOlivePrices,
  useParcelsFinanceComparison,
} from "@workspace/web/hooks/dashboard"
import { useFinanceTransactions } from "@workspace/web/hooks/finance"
import { useIsAllParcelsSelected } from "@workspace/web/hooks/use-is-all-parcels-selected"
import { toTransactionSnapshots } from "@workspace/web/lib/finance/mappers"

export default function Finance() {
  const isAllParcels = useIsAllParcelsSelected()
  const [newTransactionOpen, setNewTransactionOpen] = useState(false)

  const transactionsQuery = useFinanceTransactions()
  const olivePrices = useOlivePrices()
  const parcelsComparison = useParcelsFinanceComparison()

  const rows = useMemo(
    () => transactionsQuery.data ?? [],
    [transactionsQuery.data]
  )
  const snapshots = useMemo(() => toTransactionSnapshots(rows), [rows])

  const isLoadingCharts =
    transactionsQuery.isPending && transactionsQuery.data === undefined

  const viewProps = {
    rows,
    snapshots,
    olivePrices,
    parcelsComparison,
    isLoadingCharts,
    newTransactionOpen,
    onNewTransactionOpenChange: setNewTransactionOpen,
    onTransactionSuccess: () => transactionsQuery.refetch(),
  }

  return isAllParcels ? (
    <FinanceAllView {...viewProps} />
  ) : (
    <FinanceSingleView {...viewProps} />
  )
}
