import { db, schema, eq, desc } from "@workspace/db"
import type { CampaignListItem } from "@workspace/schemas"
import { formatCampaignDisplayName } from "@/services/campaigns/domain/campaign"

export async function listCampaignsForSwitcher(
  parcelId?: string
): Promise<CampaignListItem[]> {
  const campaigns = await db.query.campaigns.findMany({
    orderBy: [desc(schema.campaigns.startDate)],
  })

  const profitByCampaignId = new Map<string, number>()

  if (parcelId) {
    const summaries = await db.query.parcelFinancialSummaries.findMany({
      where: eq(schema.parcelFinancialSummaries.parcelId, parcelId),
    })

    for (const summary of summaries) {
      profitByCampaignId.set(summary.campaignId, Number(summary.profit ?? 0))
    }
  }

  return campaigns.map((campaign) => ({
    id: campaign.id,
    name: formatCampaignDisplayName(campaign.name),
    startDate: campaign.startDate,
    endDate: campaign.endDate,
    status: campaign.isActive ? ("active" as const) : ("closed" as const),
    balance: parcelId
      ? (profitByCampaignId.get(campaign.id) ?? null)
      : null,
  }))
}
