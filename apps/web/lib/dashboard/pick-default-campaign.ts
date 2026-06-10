import type { CampaignListItem } from "@workspace/schemas"

export function pickDefaultCampaignId(
  campaigns: CampaignListItem[]
): string | undefined {
  return (
    campaigns.find((campaign) => campaign.status === "active")?.id ??
    campaigns[0]?.id
  )
}
