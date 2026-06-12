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
    // Evita re-ejecutar el RSC del dashboard en cada cambio de parcela/campaña.
    shallow: true,
    history: "push",
  })
}
