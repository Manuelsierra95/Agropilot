import { db, schema } from "@workspace/db"

import {
  generateFinancialSummaries,
  generateParcelCashflow,
  generateTransactions,
} from "../data/generators"

export async function seedFinance(
  parcelIds: string[],
  campaigns: { id: string; isActive: boolean | null }[]
) {
  const activeCampaign =
    campaigns.find((c) => c.isActive) ?? campaigns[0]

  if (!activeCampaign) {
    console.log("⊘ transactions (no campaigns)")
    return
  }

  const transactions = generateTransactions(parcelIds, activeCampaign.id)
  await db.insert(schema.transactions).values(transactions)
  console.log(`✓ transactions (${transactions.length})`)

  const summaries = generateFinancialSummaries(parcelIds, campaigns)
  await db.insert(schema.parcelFinancialSummaries).values(summaries)
  console.log(`✓ parcel_financial_summaries (${summaries.length})`)

  const cashflow = generateParcelCashflow(parcelIds, activeCampaign.id)
  await db.insert(schema.parcelCashflowDaily).values(cashflow)
  console.log(`✓ parcel_cashflow_daily (${cashflow.length})`)
}
