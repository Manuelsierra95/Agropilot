"use client"

import { useEffect } from "react"

import { api } from "@/lib/api"
import { authClient, useSession } from "@/lib/auth-client"
import { parseAuthSession } from "@workspace/schemas"
import { useDashboardScopeParams } from "@/hooks/use-dashboard-scope-params"
import { useDashboardListsStore } from "@/store/useDashboardListsStore"
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

export function useDashboardDataLoader() {
  const { data: session } = useSession()
  const organizationId =
    parseAuthSession(session?.session)?.activeOrganizationId ?? null
  const [{ parcelId }] = useDashboardScopeParams()

  const setOrganizations = useDashboardListsStore(
    (state) => state.setOrganizations
  )
  const setParcels = useDashboardListsStore((state) => state.setParcels)
  const setCampaignsForParcel = useDashboardListsStore(
    (state) => state.setCampaignsForParcel
  )
  const setLoadingOrganizations = useDashboardListsStore(
    (state) => state.setLoadingOrganizations
  )
  const setLoadingParcels = useDashboardListsStore(
    (state) => state.setLoadingParcels
  )
  const setLoadingCampaigns = useDashboardListsStore(
    (state) => state.setLoadingCampaigns
  )

  useEffect(() => {
    let cancelled = false

    async function loadOrganizations() {
      setLoadingOrganizations(true)
      try {
        const { data, error } = await authClient.organization.list()
        if (cancelled || error || !data) return
        setOrganizations(mapOrganizations(data))
      } finally {
        if (!cancelled) {
          setLoadingOrganizations(false)
        }
      }
    }

    void loadOrganizations()

    return () => {
      cancelled = true
    }
  }, [setLoadingOrganizations, setOrganizations])

  useEffect(() => {
    if (!organizationId) return

    let cancelled = false

    async function loadParcels() {
      setLoadingParcels(true)
      try {
        const parcels = await api.parcel.getListParcels()
        if (!cancelled) {
          setParcels(parcels)
        }
      } finally {
        if (!cancelled) {
          setLoadingParcels(false)
        }
      }
    }

    void loadParcels()

    return () => {
      cancelled = true
    }
  }, [organizationId, setLoadingParcels, setParcels])

  useEffect(() => {
    if (!parcelId) return
    if (useDashboardListsStore.getState().campaignsByParcelId[parcelId]) {
      return
    }

    let cancelled = false
    const requestParcelId = parcelId

    async function loadCampaigns() {
      setLoadingCampaigns(requestParcelId, true)
      try {
        const campaigns = await api.campaign.list(requestParcelId)
        if (!cancelled) {
          setCampaignsForParcel(requestParcelId, campaigns)
        }
      } finally {
        if (!cancelled) {
          setLoadingCampaigns(requestParcelId, false)
        }
      }
    }

    void loadCampaigns()

    return () => {
      cancelled = true
    }
  }, [parcelId, setCampaignsForParcel, setLoadingCampaigns])
}
