import type { DashboardScopeQuery } from "@workspace/schemas"

import type { DashboardScopeParams } from "@workspace/web/lib/dashboard/scope-key"

export function toScopeQuery(
  scope: DashboardScopeParams
): Record<string, string> {
  const query: Record<string, string> = {}

  if (scope.parcelId) query.parcelId = scope.parcelId
  if (scope.campaignId) query.campaignId = scope.campaignId
  if (scope.from) query.from = scope.from
  if (scope.to) query.to = scope.to

  return query
}

export function scopeFromParams(
  params: DashboardScopeQuery
): DashboardScopeParams {
  return {
    parcelId: params.parcelId ?? null,
    campaignId: params.campaignId ?? null,
    from: params.from ?? null,
    to: params.to ?? null,
  }
}
