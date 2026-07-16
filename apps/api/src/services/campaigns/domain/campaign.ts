import { HTTPException } from "hono/http-exception"
import { todayIso } from "@workspace/api/services/shared/date-utils"

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

export function formatCampaignDisplayName(name: string): string {
  const [startYear, endYear] = name.split("/").map(Number)
  if (!Number.isFinite(startYear) || !Number.isFinite(endYear)) {
    return name
  }
  const endShort = String(endYear).slice(-2)
  return `Campaña ${startYear}–${endShort}`
}

export function pickDefaultCampaignId(
  campaigns: { id: string; status: string }[]
): string | undefined {
  return (
    campaigns.find((campaign) => campaign.status === "active")?.id ??
    campaigns[0]?.id
  )
}

export function getPreviousCampaignName(name: string): string {
  const [startYear] = name.split("/").map(Number)
  if (startYear === undefined || !Number.isFinite(startYear)) return name
  return `${startYear - 1}/${startYear}`
}

export type ResolvedDateRange = {
  from: string
  to: string
}

export function resolveScopeDateRange(
  campaign: { startDate: string; endDate: string } | null | undefined,
  filters: { from?: string; to?: string }
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
