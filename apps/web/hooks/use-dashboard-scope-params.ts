"use client"

import { parseAsString, useQueryStates } from "nuqs"

export const dashboardScopeParsers = {
  parcelId: parseAsString,
  campaignId: parseAsString,
  from: parseAsString,
  to: parseAsString,
}

export function useDashboardScopeParams() {
  return useQueryStates(dashboardScopeParsers, {
    shallow: false,
    history: "push",
  })
}
