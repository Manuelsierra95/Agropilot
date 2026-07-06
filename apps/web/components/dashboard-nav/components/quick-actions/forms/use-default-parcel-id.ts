"use client"

import { useDashboardScope } from "@workspace/web/hooks/dashboard/use-dashboard-scope"

/** Parcel id from dashboard URL scope (`?parcelId=`), when viewing a single parcel. */
export function useDefaultParcelId(): string | undefined {
  const { parcelId } = useDashboardScope()
  return parcelId ?? undefined
}
