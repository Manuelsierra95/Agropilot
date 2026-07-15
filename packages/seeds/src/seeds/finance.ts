import { db, schema } from "@workspace/db"

import {
  generateFinancialSummaries,
  generateParcelCashflow,
  generateSaleTransactions,
  generateTransactions,
} from "../data/generators"

export async function seedFinance(
  parcelIds: string[],
  campaigns: { id: string; isActive: boolean | null }[],
  saleDeliveries: {
    id: string
    parcelId: string
    campaignId: string
    processedQuantity: string
    grade: string | null
  }[] = []
) {
  const activeCampaign =
    campaigns.find((c) => c.isActive) ?? campaigns[0]

  if (!activeCampaign) {
    console.log("⊘ transactions (no campaigns)")
    return
  }

  const expenseTransactions = generateTransactions(
    parcelIds,
    activeCampaign.id
  )
  const saleTransactions = generateSaleTransactions(saleDeliveries)
  const transactions = [
    ...expenseTransactions,
    ...saleTransactions.map(
      ({ deliveryId: _deliveryId, saleAmount: _saleAmount, ...tx }) => tx
    ),
  ]

  await db.insert(schema.transactions).values(transactions)
  console.log(`✓ transactions (${transactions.length})`)

  const summaries = generateFinancialSummaries(
    parcelIds,
    campaigns,
    transactions
  )
  await db.insert(schema.parcelFinancialSummaries).values(summaries)
  console.log(`✓ parcel_financial_summaries (${summaries.length})`)

  const cashflow = generateParcelCashflow(
    parcelIds,
    activeCampaign.id,
    transactions
  )
  await db.insert(schema.parcelCashflowDaily).values(cashflow)
  console.log(`✓ parcel_cashflow_daily (${cashflow.length})`)

  return saleTransactions
}
