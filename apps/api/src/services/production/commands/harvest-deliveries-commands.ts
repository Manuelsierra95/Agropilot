import { db, schema, eq, and } from "@workspace/db"
import { HTTPException } from "hono/http-exception"
import type { HarvestDeliveryCreateInput } from "@workspace/schemas"
import { ensureCampaignForDate } from "@workspace/api/services/campaigns"
import { invalidateOrganizationApiCache } from "@workspace/api/lib/invalidate-org-api-cache"

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

async function incrementParcelFinancialSummaryTotalKg(
  tx: DbTransaction,
  parcelId: string,
  campaignId: string,
  addedRawKg: number
) {
  const existing = await tx.query.parcelFinancialSummaries.findFirst({
    where: and(
      eq(schema.parcelFinancialSummaries.parcelId, parcelId),
      eq(schema.parcelFinancialSummaries.campaignId, campaignId)
    ),
    columns: { id: true, totalKg: true },
  })

  if (existing) {
    const currentTotalKg = Number(existing.totalKg ?? 0)
    await tx
      .update(schema.parcelFinancialSummaries)
      .set({ totalKg: toAmountString(currentTotalKg + addedRawKg) })
      .where(eq(schema.parcelFinancialSummaries.id, existing.id))
  } else {
    await tx.insert(schema.parcelFinancialSummaries).values({
      parcelId,
      campaignId,
      totalKg: toAmountString(addedRawKg),
    })
  }
}

export async function createHarvestDelivery(
  organizationId: string,
  data: HarvestDeliveryCreateInput
) {
  await assertParcelBelongsToOrg(organizationId, data.parcelId)

  const delivery = await db.transaction(async (tx) => {
    const campaignId = await resolveCampaignId(data, tx)

    const rawQuantity = data.rawQuantity
    const conversionRate = data.conversionRate ?? null
    const processedQuantity =
      conversionRate != null
        ? (rawQuantity * conversionRate) / 100
        : rawQuantity
    const processedUnit =
      conversionRate != null ? data.processedUnit : data.rawUnit

    const [created] = await tx
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

    if (!created) {
      throw new HTTPException(500, {
        message: "Failed to create harvest delivery",
      })
    }

    await incrementParcelFinancialSummaryTotalKg(
      tx,
      data.parcelId,
      campaignId,
      rawQuantity
    )

    return created
  })

  await invalidateOrganizationApiCache(organizationId, [
    "/api/v1/production",
    "/api/v1/dashboard",
    "/api/v1/finance",
  ])

  return delivery
}
