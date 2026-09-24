"use client"

import { useEffect } from "react"

import { api } from "@workspace/web/lib/api"
import { authClient, useSession } from "@workspace/web/lib/auth-client"
import { parseAuthSession } from "@workspace/schemas"
import { useDashboardScopeParams } from "@workspace/web/hooks/use-dashboard-scope-params"
import {
  ORG_CAMPAIGNS_KEY,
  useDashboardListsStore,
} from "@workspace/web/store/useDashboardListsStore"
import type { DashboardOrganization } from "@workspace/web/store/useDashboardListsStore"
import { isDemoMode } from "@workspace/web/lib/demo-mode"
import {
  DEMO_CAMPAIGNS_BY_PARCEL,
  DEMO_ORGANIZATIONS,
  DEMO_PARCELS,
  DEMO_PARCEL_IDS,
} from "@workspace/web/lib/mockdata"

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
        if (isDemoMode()) {
          if (!cancelled) setOrganizations(DEMO_ORGANIZATIONS)
          return
        }
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
        if (isDemoMode()) {
          if (!cancelled) setParcels(DEMO_PARCELS)
          return
        }
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
    const campaignsKey = parcelId ?? ORG_CAMPAIGNS_KEY
    if (useDashboardListsStore.getState().campaignsByParcelId[campaignsKey]) {
      return
    }

    let cancelled = false

    async function loadCampaigns() {
      setLoadingCampaigns(campaignsKey, true)
      try {
        if (isDemoMode()) {
          const mapKey: string =
            parcelId ?? (campaignsKey === ORG_CAMPAIGNS_KEY
              ? "__org__"
              : campaignsKey)
          const list =
            DEMO_CAMPAIGNS_BY_PARCEL[mapKey] ??
            DEMO_CAMPAIGNS_BY_PARCEL[ORG_CAMPAIGNS_KEY] ??
            []
          if (!cancelled) setCampaignsForParcel(campaignsKey, list)
          return
        }
        const campaigns = parcelId
          ? await api.campaign.list(parcelId)
          : await api.campaign.list()
        if (!cancelled) {
          setCampaignsForParcel(campaignsKey, campaigns)
        }
      } finally {
        if (!cancelled) {
          setLoadingCampaigns(campaignsKey, false)
        }
      }
    }

    void loadCampaigns()

    return () => {
      cancelled = true
    }
  }, [parcelId, setCampaignsForParcel, setLoadingCampaigns])
}
