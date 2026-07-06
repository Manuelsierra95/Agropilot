import { db, schema, eq, and, inArray } from "@workspace/db"
import { HTTPException } from "hono/http-exception"
import type {
  HarvestSaleCreateInput,
  HarvestSaleSelect,
  TransactionSelect,
} from "@workspace/schemas"
import { ensureCampaignForDate } from "@workspace/api/services/campaigns"

type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0]

type CreatedHarvestSale = HarvestSaleSelect & {
  delivery: { id: string; quantityRemaining: string; status: string }
}

function toAmountString(amount: number): string {
  return amount.toFixed(2)
}

async function assertParcelBelongsToOrg(
  organizationId: string,
  parcelId: string
) {
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
  data: { saleDate: string; campaignId?: string },
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

  return ensureCampaignForDate(data.saleDate, tx)
}

async function fetchDeliveriesForSale(
  tx: DbTransaction,
  organizationId: string,
  parcelId: string,
  items: HarvestSaleCreateInput["deliveries"]
) {
  const deliveryIds = items.map((item) => item.deliveryId)

  const deliveries = await tx.query.harvestDeliveries.findMany({
    where: and(
      eq(schema.harvestDeliveries.organizationId, organizationId),
      eq(schema.harvestDeliveries.parcelId, parcelId),
      inArray(schema.harvestDeliveries.id, deliveryIds)
    ),
  })

  if (deliveries.length !== deliveryIds.length) {
    throw new HTTPException(400, {
      message: "One or more deliveries not found",
    })
  }

  const deliveryMap = new Map(deliveries.map((d) => [d.id, d]))

  for (const item of items) {
    const delivery = deliveryMap.get(item.deliveryId)
    if (!delivery) {
      throw new HTTPException(400, {
        message: `Delivery ${item.deliveryId} not found`,
      })
    }

    const remaining = Number(delivery.quantityRemaining)
    if (item.quantitySold > remaining) {
      throw new HTTPException(400, {
        message: `Insufficient stock for delivery ${delivery.id}`,
      })
    }
  }

  return deliveryMap
}

async function updateDeliveryStock(
  tx: DbTransaction,
  deliveryId: string,
  quantitySold: number
) {
  const delivery = await tx.query.harvestDeliveries.findFirst({
    where: eq(schema.harvestDeliveries.id, deliveryId),
  })

  if (!delivery) {
    throw new HTTPException(404, { message: "Delivery not found" })
  }

  const remaining = Number(delivery.quantityRemaining) - quantitySold
  const status = remaining <= 0 ? "sold" : "partial"

  const [updated] = await tx
    .update(schema.harvestDeliveries)
    .set({
      quantityRemaining: toAmountString(Math.max(remaining, 0)),
      status,
    })
    .where(eq(schema.harvestDeliveries.id, deliveryId))
    .returning()

  if (!updated) {
    throw new HTTPException(500, {
      message: "Failed to update delivery stock",
    })
  }

  return updated
}

async function createTransactionInTx(
  tx: DbTransaction,
  organizationId: string,
  userId: string,
  parcelId: string,
  campaignId: string,
  data: HarvestSaleCreateInput,
  totalAmount: number,
  totalQuantitySold: number
): Promise<TransactionSelect> {
  const [created] = await tx
    .insert(schema.transactions)
    .values({
      organizationId,
      userId,
      campaignId,
      concept: "Venta aceite",
      description: data.buyerName ? `Venta a ${data.buyerName}` : null,
      flow: "income",
      date: data.saleDate,
      category: "sale",
      amount: toAmountString(totalAmount),
      parcelId,
      paymentMethod: null,
      invoiceNumber: null,
      meta: {
        saleKg: String(totalQuantitySold),
        pricePerUnit: String(data.pricePerUnit),
        buyerName: data.buyerName ?? undefined,
      },
    })
    .returning()

  if (!created) {
    throw new HTTPException(500, { message: "Transaction creation failed" })
  }

  return created
}

async function createHarvestSaleRecords(
  tx: DbTransaction,
  organizationId: string,
  parcelId: string,
  campaignId: string,
  transactionId: string,
  data: HarvestSaleCreateInput
): Promise<CreatedHarvestSale[]> {
  const sales: CreatedHarvestSale[] = []

  for (const item of data.deliveries) {
    const totalAmount = Number(
      (item.quantitySold * data.pricePerUnit).toFixed(2)
    )

    const [sale] = await tx
      .insert(schema.harvestSales)
      .values({
        organizationId,
        deliveryId: item.deliveryId,
        parcelId,
        campaignId,
        transactionId,
        saleDate: data.saleDate,
        quantitySold: toAmountString(item.quantitySold),
        pricePerUnit: toAmountString(data.pricePerUnit),
        totalAmount: toAmountString(totalAmount),
        buyerName: data.buyerName ?? null,
        notes: data.notes ?? null,
      })
      .returning()

    if (!sale) {
      throw new HTTPException(500, { message: "Failed to create harvest sale" })
    }

    const updatedDelivery = await updateDeliveryStock(
      tx,
      item.deliveryId,
      item.quantitySold
    )

    sales.push({
      ...sale,
      delivery: {
        id: updatedDelivery.id,
        quantityRemaining: updatedDelivery.quantityRemaining,
        status: updatedDelivery.status,
      },
    })
  }

  return sales
}

export async function createHarvestSale(
  organizationId: string,
  userId: string,
  parcelId: string,
  data: HarvestSaleCreateInput
): Promise<{
  transaction: TransactionSelect
  sales: CreatedHarvestSale[]
}> {
  await assertParcelBelongsToOrg(organizationId, parcelId)

  return db.transaction(async (tx) => {
    await fetchDeliveriesForSale(tx, organizationId, parcelId, data.deliveries)

    const campaignId = await resolveCampaignId(data, tx)

    const totalQuantitySold = data.deliveries.reduce(
      (sum, item) => sum + item.quantitySold,
      0
    )

    const totalAmount = Number(
      (totalQuantitySold * data.pricePerUnit).toFixed(2)
    )

    const transaction = await createTransactionInTx(
      tx,
      organizationId,
      userId,
      parcelId,
      campaignId,
      data,
      totalAmount,
      totalQuantitySold
    )

    const sales = await createHarvestSaleRecords(
      tx,
      organizationId,
      parcelId,
      campaignId,
      transaction.id,
      data
    )

    return { transaction, sales }
  })
}
