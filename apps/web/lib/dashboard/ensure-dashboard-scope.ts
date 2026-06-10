import { api } from "@/lib/api"
import { pickDefaultCampaignId } from "@/lib/dashboard/pick-default-campaign"

type SearchParams = Record<string, string | string[] | undefined>

function readParam(
  searchParams: SearchParams,
  key: string
): string | undefined {
  const value = searchParams[key]
  return typeof value === "string" ? value : undefined
}

export async function ensureDashboardScopeSearchParams(
  pathname: string,
  searchParams: SearchParams
): Promise<string | null> {
  const parcelId = readParam(searchParams, "parcelId")
  const campaignId = readParam(searchParams, "campaignId")
  const from = readParam(searchParams, "from")
  const to = readParam(searchParams, "to")

  const parcels = await api.parcel.getListParcels()
  if (parcels.length === 0) {
    return null
  }

  const validParcelIds = new Set(parcels.map((parcel) => parcel.id))
  const targetParcelId =
    parcelId && validParcelIds.has(parcelId) ? parcelId : parcels[0]!.id

  const hasCustomRange = Boolean(from && to)
  let targetCampaignId = campaignId
  let targetFrom = from
  let targetTo = to

  if (!hasCustomRange) {
    const campaigns = await api.campaign.list(targetParcelId)
    const validCampaignIds = new Set(campaigns.map((campaign) => campaign.id))
    targetCampaignId =
      campaignId && validCampaignIds.has(campaignId)
        ? campaignId
        : pickDefaultCampaignId(campaigns)
    targetFrom = undefined
    targetTo = undefined
  }

  const parcelUnchanged = targetParcelId === parcelId
  const campaignUnchanged = hasCustomRange
    ? targetFrom === from && targetTo === to && !campaignId
    : targetCampaignId === campaignId && !from && !to

  if (parcelUnchanged && campaignUnchanged) {
    return null
  }

  const params = new URLSearchParams()
  params.set("parcelId", targetParcelId)

  if (hasCustomRange && targetFrom && targetTo) {
    params.set("from", targetFrom)
    params.set("to", targetTo)
  } else if (targetCampaignId) {
    params.set("campaignId", targetCampaignId)
  }

  return `${pathname}?${params.toString()}`
}
