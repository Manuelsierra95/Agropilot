"use client"

import { useMemo } from "react"

import { FinanceAllView } from "@workspace/web/features/finance/views/all"
import { FinanceSingleView } from "@workspace/web/features/finance/views/single"
import {
  useCampaignMargin,
  useFinanceResume,
  useOlivePrices,
  useParcelsFinanceComparison,
} from "@workspace/web/hooks/dashboard"
import { useFinanceTransactions } from "@workspace/web/hooks/finance"
import { useIsAllParcelsSelected } from "@workspace/web/hooks/use-is-all-parcels-selected"

export default function Finance() {
  const isAllParcels = useIsAllParcelsSelected()

  const transactionsQuery = useFinanceTransactions()
  const olivePrices = useOlivePrices()
  const parcelsComparison = useParcelsFinanceComparison()
  const financeResume = useFinanceResume()
  const campaignMargin = useCampaignMargin()

  const rows = useMemo(
    () => transactionsQuery.data ?? [],
    [transactionsQuery.data]
  )

  const isLoadingCharts =
    transactionsQuery.isPending && transactionsQuery.data === undefined

  const viewProps = {
    rows,
    olivePrices,
    financeResume,
    campaignMargin,
    parcelsComparison,
    isLoadingCharts,
  }

  return isAllParcels ? (
    <FinanceAllView {...viewProps} />
  ) : (
    <FinanceSingleView {...viewProps} />
  )
}
