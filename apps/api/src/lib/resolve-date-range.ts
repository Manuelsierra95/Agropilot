import { HTTPException } from "hono/http-exception"
import { todayIso } from "@workspace/api/services/shared/date-utils"

type DateRangeInput = {
  campaign?: { startDate: string; endDate: string } | null
  from?: string
  to?: string
}

export type ResolvedDateRange = {
  from: string
  to: string
  scope: "parcel" | "organization"
}

function getCampaignPeriodForDate(date: string) {
  const [yearStr, monthStr] = date.split("-")
  const year = Number(yearStr)
  const month = Number(monthStr)

  if (!Number.isFinite(year) || !Number.isFinite(month)) {
    throw new HTTPException(400, { message: "Invalid date" })
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

export function resolveDateRange(
  input: DateRangeInput,
  parcelId?: string
): ResolvedDateRange {
  const { campaign, from, to } = input
  const scope = parcelId ? "parcel" : "organization" as const

  if (!campaign && from && to) {
    return { from, to, scope }
  }

  if (campaign && !from && !to) {
    return { from: campaign.startDate, to: campaign.endDate, scope }
  }

  if (campaign && from && to) {
    return {
      from: from < campaign.startDate ? campaign.startDate : from,
      to: to > campaign.endDate ? campaign.endDate : to,
      scope,
    }
  }

  const period = getCampaignPeriodForDate(todayIso())
  return { from: period.startDate, to: period.endDate, scope }
}
