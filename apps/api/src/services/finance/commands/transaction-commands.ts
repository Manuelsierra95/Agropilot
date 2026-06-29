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
import { ensureCampaignForDate } from "@workspace/api/services/campaigns"

type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0]

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
