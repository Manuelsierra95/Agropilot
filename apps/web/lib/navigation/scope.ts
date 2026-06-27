import { dashboardScopeParsers } from "@/hooks/use-dashboard-scope-params"

export type ScopeKey = keyof typeof dashboardScopeParsers

export const SCOPE_KEYS = {
  global: [] as ScopeKey[],
  parcel: ["campaignId", "parcelId"] as ScopeKey[],
  temporal: ["from", "to"] as ScopeKey[],
} as const
