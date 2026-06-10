import { client } from "@/lib/api/client"
import type { CampaignListItem } from "@workspace/schemas"

const listCampaigns = (parcelId?: string): Promise<CampaignListItem[]> =>
  client.api.v1.campaign
    .$get({
      query: parcelId ? { parcelId } : {},
    })
    .then((res) => res.json())
    .then((data) => data.campaigns)

export const campaignApi = {
  list: listCampaigns,
}
