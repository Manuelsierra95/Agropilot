import { db, schema, eq, and } from "@workspace/db"
import { HTTPException } from "hono/http-exception"
import type { UpdateCampaignSaleTargetInput } from "@workspace/schemas"
import { invalidateOrganizationApiCache } from "@workspace/api/lib/invalidate-org-api-cache"
import { resolveFinanceScopeContext } from "@workspace/api/services/finance/queries/finance-dashboard"

function toPriceString(value: number): string {
  return value.toFixed(4)
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
    throw new HTTPException(404, {
      message: "Parcel not found in organization",
    })
  }
}

export async function updateCampaignSaleTarget(
  organizationId: string,
  input: UpdateCampaignSaleTargetInput
): Promise<{ campaignTarget: number }> {
  await assertParcelBelongsToOrg(organizationId, input.parcelId)

  const { campaignId } = await resolveFinanceScopeContext(organizationId, {
    parcelId: input.parcelId,
    campaignId: input.campaignId,
    from: input.from,
    to: input.to,
  })

  if (!campaignId) {
    throw new HTTPException(400, {
      message: "Campaign could not be resolved for this scope",
    })
  }

  const avgMarketPrice = toPriceString(input.campaignTarget)

  const existing = await db.query.parcelFinancialSummaries.findFirst({
    where: and(
      eq(schema.parcelFinancialSummaries.parcelId, input.parcelId),
      eq(schema.parcelFinancialSummaries.campaignId, campaignId)
    ),
    columns: { id: true },
  })

  if (existing) {
    await db
      .update(schema.parcelFinancialSummaries)
      .set({ avgMarketPrice })
      .where(eq(schema.parcelFinancialSummaries.id, existing.id))
  } else {
    await db.insert(schema.parcelFinancialSummaries).values({
      parcelId: input.parcelId,
      campaignId,
      avgMarketPrice,
    })
  }

  await invalidateOrganizationApiCache(organizationId)

  return { campaignTarget: input.campaignTarget }
}
