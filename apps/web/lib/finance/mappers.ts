import type { DashboardFinanceTransaction } from "@workspace/schemas"

import type {
  FinanceCategoryTransaction,
  FinanceTransaction,
  FinanceTransactionSnapshot,
} from "@workspace/web/lib/finance/types"

export function toFinanceTransaction(
  row: DashboardFinanceTransaction
): FinanceTransaction {
  return {
    id: row.id,
    userId: row.userId,
    parcelId: row.parcelId,
    parcelName: row.parcelName,
    type: row.type,
    category: row.category,
    concept: row.concept,
    amount: row.amount,
    paymentMethod: row.paymentMethod,
    invoiceNumber: row.invoiceNumber,
    date: new Date(row.date),
    description: row.description,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  }
}

export function toFinanceTransactions(
  rows: DashboardFinanceTransaction[]
): FinanceTransaction[] {
  return rows.map(toFinanceTransaction)
}

export function toTransactionSnapshots(
  transactions: FinanceTransaction[]
): FinanceTransactionSnapshot[] {
  return transactions.map(
    ({
      type,
      category,
      amount,
      paymentMethod,
      invoiceNumber,
      date,
      parcelName,
    }) => ({
      type,
      category,
      amount,
      paymentMethod,
      invoiceNumber,
      date,
      ...(parcelName ? { parcelName } : {}),
    })
  )
}

export function toCategoryDrawerTransactions(
  transactions: FinanceTransaction[]
): FinanceCategoryTransaction[] {
  return transactions.map(
    ({ id, date, concept, amount, paymentMethod, invoiceNumber }) => ({
      id,
      date,
      concept,
      amount,
      paymentMethod,
      invoiceNumber,
    })
  )
}
