import { api } from "@workspace/web/lib/api"
import { pickDefaultCampaignId } from "@workspace/web/lib/dashboard/pick-default-campaign"

type SearchParams = Record<string, string | string[] | undefined>

function readParam(
  searchParams: SearchParams,
  key: string
): string | undefined {
  const value = searchParams[key]
  return typeof value === "string" ? value : undefined
}

function pickDefaultParcel<
  T extends { id: string; createdAt?: Date | string | null },
>(parcels: T[]): T {
  // Deterministic ordering: oldest parcel first (by createdAt asc, id as tiebreaker).
  // If no createdAt, falls back to the order returned by the API.
  const sorted = [...parcels].sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : Infinity
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : Infinity
    if (aTime !== bTime) return aTime - bTime
    return a.id.localeCompare(b.id)
  })
  return sorted[0]!
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
  const parcelIdInvalid = Boolean(parcelId && !validParcelIds.has(parcelId))
  let targetParcelId: string | undefined
  if (parcelId && validParcelIds.has(parcelId)) {
    targetParcelId = parcelId
  } else if (pathname === "/dashboard") {
    // Overview root defaults to the first (oldest) parcel so the user
    // lands on a single-parcel view instead of the org-wide aggregate.
    targetParcelId = pickDefaultParcel(parcels).id
  }

  const hasCustomRange = Boolean(from && to)
  let targetCampaignId = campaignId
  let targetFrom = from
  let targetTo = to

  if (!hasCustomRange) {
    const campaigns = targetParcelId
      ? await api.campaign.list(targetParcelId)
      : await api.campaign.list()
    const validCampaignIds = new Set(campaigns.map((campaign) => campaign.id))
    targetCampaignId =
      campaignId && validCampaignIds.has(campaignId)
        ? campaignId
        : pickDefaultCampaignId(campaigns)
    targetFrom = undefined
    targetTo = undefined
  }

  const parcelUnchanged = !parcelIdInvalid && targetParcelId === parcelId
  const campaignUnchanged = hasCustomRange
    ? targetFrom === from && targetTo === to && !campaignId
    : targetCampaignId === campaignId && !from && !to

  if (parcelUnchanged && campaignUnchanged) {
    return null
  }

  const params = new URLSearchParams()

  // The overview root always normalises onto a single parcelId (the oldest);
  // all other dashboard routes pin whatever parcelId is in scope.
  if (targetParcelId) {
    params.set("parcelId", targetParcelId)
  }

  if (hasCustomRange && targetFrom && targetTo) {
    params.set("from", targetFrom)
    params.set("to", targetTo)
  } else if (targetCampaignId) {
    params.set("campaignId", targetCampaignId)
  }

  const query = params.toString()
  return query ? `${pathname}?${query}` : pathname
}
