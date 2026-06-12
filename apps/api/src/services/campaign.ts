import { db, schema, eq, desc } from "@workspace/db"
import type { CampaignListItem, DashboardScopeQuery } from "@workspace/schemas"
import { getCampaignPeriodForDate } from "@/services/finance"

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

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export async function resolveActiveCampaign() {
  const active = await db.query.campaigns.findFirst({
    where: eq(schema.campaigns.isActive, true),
    orderBy: [desc(schema.campaigns.startDate)],
  })

  if (active) return active

  const period = getCampaignPeriodForDate(todayIso())
  return db.query.campaigns.findFirst({
    where: eq(schema.campaigns.name, period.name),
  })
}

export type ResolvedDateRange = {
  from: string
  to: string
}

export function resolveScopeDateRange(
  campaign: { startDate: string; endDate: string } | null | undefined,
  filters: DashboardScopeQuery
): ResolvedDateRange {
  if (filters.from && filters.to) {
    return { from: filters.from, to: filters.to }
  }

  if (campaign) {
    return { from: campaign.startDate, to: campaign.endDate }
  }

  const period = getCampaignPeriodForDate(todayIso())
  return { from: period.startDate, to: period.endDate }
}

export function getPreviousCampaignName(name: string): string {
  const [startYear] = name.split("/").map(Number)
  if (!Number.isFinite(startYear)) return name
  return `${startYear - 1}/${startYear}`
}
