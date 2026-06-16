"use client"

import { useQuery } from "@tanstack/react-query"
import { authClient } from "@/lib/auth-client"
import { api } from "@/lib/api"
import { parseAuthSession } from "@workspace/schemas"
import { useSession } from "@/lib/auth-client"
import type { DashboardOrganization } from "@/store/useDashboardListsStore"

function mapOrganizations(
  organizations: Array<{
    id: string
    name: string
    logo?: string | null
    metadata?: Record<string, unknown> | null
  }>
): DashboardOrganization[] {
  return organizations.map((org) => ({
    id: org.id,
    name: org.name,
    logo: org.logo,
    plan:
      typeof org.metadata?.plan === "string" ? org.metadata.plan : "Standard",
  }))
}

export function useOrganizationsQuery() {
  return useQuery({
    queryKey: ["dashboard", "organizations"],
    queryFn: async () => {
      const { data, error } = await authClient.organization.list()
      if (error || !data) throw new Error("Failed to load organizations")
      return mapOrganizations(data)
    },
    staleTime: Infinity,
  })
}

export function useParcelsListQuery() {
  return useQuery({
    queryKey: ["dashboard", "parcelsList"],
    queryFn: () => api.parcel.getListParcels(),
    staleTime: 60_000,
  })
}

export function useCampaignsListQuery(parcelId?: string | null) {
  return useQuery({
    queryKey: ["dashboard", "campaignsList", parcelId ?? "__org__"],
    queryFn: () => api.campaign.list(parcelId ?? undefined),
    staleTime: 60_000,
  })
}
