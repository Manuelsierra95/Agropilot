import {
  db,
  schema,
  eq,
  and,
  asc,
  desc,
  isNotNull,
  gte,
  lte,
} from "@workspace/db"
import { HTTPException } from "hono/http-exception"
import type {
  TransactionCategory,
  TransactionCreateInput,
  TransactionSelect,
  TransactionUpdateInput,
} from "@workspace/schemas"

type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0]

export type CampaignPeriod = {
  name: string
  startDate: string
  endDate: string
}

export function getCampaignPeriodForDate(date: string): CampaignPeriod {
  const [yearStr, monthStr] = date.split("-")
  const year = Number(yearStr)
  const month = Number(monthStr)

  if (!Number.isFinite(year) || !Number.isFinite(month)) {
    throw new HTTPException(400, { message: "Invalid transaction date" })
  }

  if (month >= 10) {
    return {
      name: `${year}/${year + 1}`,
      startDate: `${year}-10-01`,
      endDate: `${year + 1}-09-30`,
    }
  }

  return {
    name: `${year - 1}/${year}`,
    startDate: `${year - 1}-10-01`,
    endDate: `${year}-09-30`,
  }
}

async function findCampaignByName(
  tx: DbTransaction,
  name: string
): Promise<{ id: string } | undefined> {
  return tx.query.campaigns.findFirst({
    where: eq(schema.campaigns.name, name),
    columns: { id: true },
  })
}

export async function ensureCampaignForDate(
  date: string,
  tx: DbTransaction
): Promise<string> {
  const period = getCampaignPeriodForDate(date)
  const existing = await findCampaignByName(tx, period.name)

  if (existing) {
    return existing.id
  }

  const [created] = await tx
    .insert(schema.campaigns)
    .values({
      name: period.name,
      startDate: period.startDate,
      endDate: period.endDate,
      isActive: false,
    })
    .onConflictDoNothing({ target: schema.campaigns.name })
    .returning({ id: schema.campaigns.id })

  if (created) {
    return created.id
  }

  const campaign = await findCampaignByName(tx, period.name)
  if (!campaign) {
    throw new HTTPException(500, {
      message: "Failed to resolve campaign for transaction date",
    })
  }

  return campaign.id
}

function toAmountString(amount: number): string {
  return amount.toFixed(2)
}

const INVOICE_SEQUENCE_PATTERN = /^[A-Z]+-(\d{4})-(\d+)$/i

function parseInvoiceSequence(
  invoiceNumber: string
): { year: number; seq: number } | null {
  const match = invoiceNumber.trim().match(INVOICE_SEQUENCE_PATTERN)
  if (!match) return null
  return { year: Number(match[1]), seq: Number(match[2]) }
}

function formatInvoiceNumber(year: number, seq: number): string {
  return `FAC-${year}-${String(seq).padStart(4, "0")}`
}

async function getMaxInvoiceSequence(
  tx: DbTransaction,
  organizationId: string,
  year: number
): Promise<number> {
  const rows = await tx.query.transactions.findMany({
    where: and(
      eq(schema.transactions.organizationId, organizationId),
      isNotNull(schema.transactions.invoiceNumber)
    ),
    columns: { invoiceNumber: true },
  })

  let max = 0
  for (const row of rows) {
    if (!row.invoiceNumber) continue
    const parsed = parseInvoiceSequence(row.invoiceNumber)
    if (parsed && parsed.year === year) {
      max = Math.max(max, parsed.seq)
    }
  }

  return max
}

async function assignMissingInvoiceNumbers(
  tx: DbTransaction,
  organizationId: string,
  items: TransactionCreateInput[]
): Promise<TransactionCreateInput[]> {
  const years = [...new Set(items.map((item) => item.date.slice(0, 4)))]
  const maxByYear = new Map<string, number>()

  for (const year of years) {
    maxByYear.set(
      year,
      await getMaxInvoiceSequence(tx, organizationId, Number(year))
    )
  }

  for (const item of items) {
    if (!item.invoiceNumber?.trim()) continue
    const parsed = parseInvoiceSequence(item.invoiceNumber)
    if (!parsed) continue
    const yearKey = String(parsed.year)
    maxByYear.set(yearKey, Math.max(maxByYear.get(yearKey) ?? 0, parsed.seq))
  }

  return items.map((item) => {
    if (item.invoiceNumber?.trim()) return item

    const year = item.date.slice(0, 4)
    const next = (maxByYear.get(year) ?? 0) + 1
    maxByYear.set(year, next)

    return {
      ...item,
      invoiceNumber: formatInvoiceNumber(Number(year), next),
    }
  })
}

async function assertParcelBelongsToOrg(
  organizationId: string,
  parcelId: string | null | undefined
) {
  if (!parcelId) return

  const parcel = await db.query.parcels.findFirst({
    where: and(
      eq(schema.parcels.id, parcelId),
      eq(schema.parcels.organizationId, organizationId)
    ),
    columns: { id: true },
  })

  if (!parcel) {
    throw new HTTPException(400, {
      message: "Parcel not found in organization",
    })
  }
}

async function resolveCampaignId(
  data: { date: string; campaignId?: string },
  tx: DbTransaction
): Promise<string> {
  if (data.campaignId) {
    const campaign = await tx.query.campaigns.findFirst({
      where: eq(schema.campaigns.id, data.campaignId),
      columns: { id: true },
    })

    if (!campaign) {
      throw new HTTPException(400, { message: "Campaign not found" })
    }

    return campaign.id
  }

  return ensureCampaignForDate(data.date, tx)
}

function buildTransactionValues(
  organizationId: string,
  userId: string,
  campaignId: string,
  data: TransactionCreateInput
) {
  return {
    organizationId,
    userId,
    campaignId,
    concept: data.concept,
    description: data.description ?? null,
    flow: data.flow,
    date: data.date,
    category: data.category,
    amount: toAmountString(data.amount),
    parcelId: data.parcelId ?? null,
    paymentMethod: data.paymentMethod ?? null,
    invoiceNumber: data.invoiceNumber ?? null,
    meta: data.meta ?? null,
  }
}

export async function listTransactions(
  organizationId: string
): Promise<TransactionSelect[]> {
  return db.query.transactions.findMany({
    where: eq(schema.transactions.organizationId, organizationId),
    orderBy: [desc(schema.transactions.date)],
  })
}

export type TransactionQueryFilters = {
  from: string
  to: string
  flow?: "income" | "expense"
  category?: TransactionCategory
}

export type OilGrade = "virgen_extra" | "virgen" | "lampante"

export type MarketPricesQueryFilters = {
  grade: OilGrade
  from: string
  to: string
}

export type MarketPriceRow = {
  date: string
  price: string
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
    conditions.push(eq(schema.transactions.category, filters.category))
  }

  return db.query.transactions.findMany({
    where: and(...conditions),
    orderBy: [desc(schema.transactions.date)],
  })
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

export async function createTransaction(
  organizationId: string,
  userId: string,
  data: TransactionCreateInput
): Promise<TransactionSelect> {
  await assertParcelBelongsToOrg(organizationId, data.parcelId)

  return db.transaction(async (tx) => {
    const campaignId = await resolveCampaignId(data, tx)

    const [created] = await tx
      .insert(schema.transactions)
      .values(buildTransactionValues(organizationId, userId, campaignId, data))
      .returning()

    if (!created) {
      throw new HTTPException(500, { message: "Transaction creation failed" })
    }

    return created
  })
}

export async function updateTransaction(
  organizationId: string,
  transactionId: string,
  data: TransactionUpdateInput
): Promise<TransactionSelect> {
  if (data.parcelId !== undefined) {
    await assertParcelBelongsToOrg(organizationId, data.parcelId)
  }

  return db.transaction(async (tx) => {
    const existing = await tx.query.transactions.findFirst({
      where: and(
        eq(schema.transactions.organizationId, organizationId),
        eq(schema.transactions.id, transactionId)
      ),
    })

    if (!existing) {
      throw new HTTPException(404, { message: "Transaction not found" })
    }

    const nextDate = data.date ?? existing.date
    const campaignId = await resolveCampaignId(
      { date: nextDate, campaignId: data.campaignId },
      tx
    )

    const { campaignId: _ignored, amount, ...rest } = data

    const [updated] = await tx
      .update(schema.transactions)
      .set({
        ...rest,
        campaignId,
        ...(amount !== undefined ? { amount: toAmountString(amount) } : {}),
      })
      .where(
        and(
          eq(schema.transactions.organizationId, organizationId),
          eq(schema.transactions.id, transactionId)
        )
      )
      .returning()

    if (!updated) {
      throw new HTTPException(404, { message: "Transaction not found" })
    }

    return updated
  })
}

export async function deleteTransaction(
  organizationId: string,
  transactionId: string
): Promise<void> {
  const [deleted] = await db
    .delete(schema.transactions)
    .where(
      and(
        eq(schema.transactions.organizationId, organizationId),
        eq(schema.transactions.id, transactionId)
      )
    )
    .returning({ id: schema.transactions.id })

  if (!deleted) {
    throw new HTTPException(404, { message: "Transaction not found" })
  }
}

export async function bulkCreateTransactions(
  organizationId: string,
  userId: string,
  items: TransactionCreateInput[]
): Promise<TransactionSelect[]> {
  const parcelIds = [
    ...new Set(items.map((item) => item.parcelId).filter(Boolean) as string[]),
  ]

  for (const parcelId of parcelIds) {
    await assertParcelBelongsToOrg(organizationId, parcelId)
  }

  return db.transaction(async (tx) => {
    const uniqueDates = [...new Set(items.map((item) => item.date))]
    const campaignByDate = new Map<string, string>()

    for (const date of uniqueDates) {
      campaignByDate.set(date, await ensureCampaignForDate(date, tx))
    }

    const itemsWithInvoices = await assignMissingInvoiceNumbers(
      tx,
      organizationId,
      items
    )

    const values = await Promise.all(
      itemsWithInvoices.map(async (item) => {
        const campaignId =
          item.campaignId ??
          campaignByDate.get(item.date) ??
          (await ensureCampaignForDate(item.date, tx))

        return buildTransactionValues(organizationId, userId, campaignId, item)
      })
    )

    const created = await tx
      .insert(schema.transactions)
      .values(values)
      .returning()

    if (created.length === 0) {
      throw new HTTPException(500, {
        message: "Bulk transaction creation failed",
      })
    }

    return created
  })
}

export {
  getOlivePricesForDashboard,
  getSellingWindowForDashboard,
  getFinanceResumeForDashboard,
  getCampaignMarginForDashboard,
  getTransactionsForDashboard,
  getRecentTransactionsForDashboard,
  getProductionValueForDashboard,
  getParcelsFinanceComparisonForDashboard,
  getParcelsSellingWindowsForDashboard,
} from "@/services/finance-dashboard"
