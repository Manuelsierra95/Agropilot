import { client } from "@workspace/web/lib/api/client"
import type { CampaignListItem } from "@workspace/schemas"

const listCampaigns = (parcelId?: string): Promise<CampaignListItem[]> =>
  client.api.v1.campaign
    .$get({
      query: parcelId ? { parcelId } : {},
    })
    .then(async (res) => {
      const data = await res.json()
      if (!res.ok) {
        throw new Error(
          typeof data === "object" && data && "error" in data
            ? String((data as { error: unknown }).error)
            : `Failed to load campaigns (${res.status})`
        )
      }
      return (data as { data: { campaigns: CampaignListItem[] } }).data.campaigns
    })

export const campaignApi = {
  list: listCampaigns,
}
