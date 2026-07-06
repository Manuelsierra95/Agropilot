import { db, schema, eq, and } from "@workspace/db"
import { HTTPException } from "hono/http-exception"
import type { HarvestDeliveryCreateInput } from "@workspace/schemas"
import { ensureCampaignForDate } from "@workspace/api/services/campaigns"

type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0]

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
  data: { deliveryDate: string; campaignId?: string },
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

  return ensureCampaignForDate(data.deliveryDate, tx)
}

export async function createHarvestDelivery(
  organizationId: string,
  data: HarvestDeliveryCreateInput
) {
  await assertParcelBelongsToOrg(organizationId, data.parcelId)

  return db.transaction(async (tx) => {
    const campaignId = await resolveCampaignId(data, tx)

    const rawQuantity = data.rawQuantity
    const conversionRate = data.conversionRate ?? null
    const processedQuantity =
      conversionRate != null
        ? (rawQuantity * conversionRate) / 100
        : rawQuantity
    const processedUnit =
      conversionRate != null ? data.processedUnit : data.rawUnit

    const [delivery] = await tx
      .insert(schema.harvestDeliveries)
      .values({
        organizationId,
        parcelId: data.parcelId,
        campaignId,
        deliveryDate: data.deliveryDate,
        destinationName: data.destinationName ?? null,
        rawQuantity: toAmountString(rawQuantity),
        rawUnit: data.rawUnit,
        conversionRate:
          conversionRate != null ? toAmountString(conversionRate) : null,
        processedQuantity: toAmountString(processedQuantity),
        processedUnit,
        grade: data.grade ?? null,
        quantityRemaining: toAmountString(processedQuantity),
        status: "stored",
        targetSalePricePerUnit: data.targetSalePricePerUnit
          ? toAmountString(data.targetSalePricePerUnit)
          : null,
        notes: data.notes ?? null,
      })
      .returning()

    if (!delivery) {
      throw new HTTPException(500, {
        message: "Failed to create harvest delivery",
      })
    }

    return delivery
  })
}
