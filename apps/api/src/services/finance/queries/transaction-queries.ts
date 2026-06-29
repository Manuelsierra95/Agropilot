import {
  db,
  schema,
  eq,
  and,
  asc,
  desc,
  gte,
  lte,
} from "@workspace/db"
import { HTTPException } from "hono/http-exception"
import type {
  TransactionCategory,
  TransactionSelect,
} from "@workspace/schemas"
import type { TransactionQueryFilters, MarketPricesQueryFilters, MarketPriceRow } from "@workspace/api/services/finance/domain/types"

export async function listTransactions(
  organizationId: string
): Promise<TransactionSelect[]> {
  return db.query.transactions.findMany({
    where: eq(schema.transactions.organizationId, organizationId),
    orderBy: [desc(schema.transactions.date)],
  })
}

export async function queryTransactions(
  organizationId: string,
  filters: TransactionQueryFilters
): Promise<TransactionSelect[]> {
  const conditions = [
    eq(schema.transactions.organizationId, organizationId),
    gte(schema.transactions.date, filters.from),
    lte(schema.transactions.date, filters.to),
  ]

  if (filters.flow) {
    conditions.push(eq(schema.transactions.flow, filters.flow))
  }

  if (filters.category) {
    conditions.push(eq(schema.transactions.category, filters.category as TransactionCategory))
  }

  return db.query.transactions.findMany({
    where: and(...conditions),
    orderBy: [desc(schema.transactions.date)],
  })
}

export async function getTransactionById(
  organizationId: string,
  transactionId: string
): Promise<TransactionSelect> {
  const transaction = await db.query.transactions.findFirst({
    where: and(
      eq(schema.transactions.organizationId, organizationId),
      eq(schema.transactions.id, transactionId)
    ),
  })

  if (!transaction) {
    throw new HTTPException(404, { message: "Transaction not found" })
  }

  return transaction
}

export async function queryMarketPrices(
  filters: MarketPricesQueryFilters
): Promise<MarketPriceRow[]> {
  return db.query.marketPrices.findMany({
    where: and(
      eq(schema.marketPrices.product, "olive_oil"),
      eq(schema.marketPrices.grade, filters.grade),
      gte(schema.marketPrices.date, filters.from),
      lte(schema.marketPrices.date, filters.to)
    ),
    orderBy: [asc(schema.marketPrices.date)],
    columns: {
      date: true,
      price: true,
    },
  })
}
