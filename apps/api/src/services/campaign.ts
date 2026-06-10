import { db, schema, eq, desc } from "@workspace/db"
import type { CampaignListItem } from "@workspace/schemas"

export function formatCampaignDisplayName(name: string): string {
  const [startYear, endYear] = name.split("/").map(Number)
  if (!Number.isFinite(startYear) || !Number.isFinite(endYear)) {
    return name
  }
  const endShort = String(endYear).slice(-2)
  return `Campaña ${startYear}–${endShort}`
}

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

export async function resolveCampaignById(campaignId: string) {
  return db.query.campaigns.findFirst({
    where: eq(schema.campaigns.id, campaignId),
  })
}

export function pickDefaultCampaignId(
  campaigns: CampaignListItem[]
): string | undefined {
  return (
    campaigns.find((campaign) => campaign.status === "active")?.id ??
    campaigns[0]?.id
  )
}
