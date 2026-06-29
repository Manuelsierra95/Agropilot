import { db, schema, eq, desc } from "@workspace/db"
import type { DashboardScopeQuery } from "@workspace/schemas"
import {
  getCampaignPeriodForDate,
  resolveScopeDateRange,
  type ResolvedDateRange,
} from "@/services/campaigns/domain/campaign"
import { resolveCampaignById } from "@/services/campaigns/queries/get-campaign-by-id"

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

export async function resolveScopeDateRangeForFilters(
  filters: DashboardScopeQuery
): Promise<ResolvedDateRange> {
  const campaign = filters.campaignId
    ? await resolveCampaignById(filters.campaignId)
    : filters.from && filters.to
      ? null
      : await resolveActiveCampaign()

  return resolveScopeDateRange(campaign, filters)
}
