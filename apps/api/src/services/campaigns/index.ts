export {
  getCampaignPeriodForDate,
  formatCampaignDisplayName,
  pickDefaultCampaignId,
  getPreviousCampaignName,
  resolveScopeDateRange,
  type CampaignPeriod,
  type ResolvedDateRange,
} from "@workspace/api/services/campaigns/domain/campaign"

export { ensureCampaignForDate } from "@workspace/api/services/campaigns/commands/ensure-campaign"

export { listCampaignsForSwitcher } from "@workspace/api/services/campaigns/queries/list-campaigns"
export { resolveCampaignById } from "@workspace/api/services/campaigns/queries/get-campaign-by-id"
export {
  resolveActiveCampaign,
  resolveScopeDateRangeForFilters,
} from "@workspace/api/services/campaigns/queries/resolve-active-campaign"
