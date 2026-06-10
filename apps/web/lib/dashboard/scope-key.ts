export type DashboardScopeParams = {
  parcelId?: string | null
  campaignId?: string | null
  from?: string | null
  to?: string | null
}

export function buildDashboardScopeKey(params: DashboardScopeParams): string {
  return [
    params.parcelId ?? "",
    params.campaignId ?? "",
    params.from ?? "",
    params.to ?? "",
  ].join(":")
}
