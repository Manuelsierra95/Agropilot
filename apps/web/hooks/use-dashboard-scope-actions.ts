"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"
import { useRouter } from "next/navigation"

import { api } from "@/lib/api"
import { authClient } from "@/lib/auth-client"
import { invalidateDashboard } from "@/lib/dashboard/invalidate-dashboard"
import { pickDefaultCampaignId } from "@/lib/dashboard/pick-default-campaign"
import { buildDashboardScopeKey } from "@/lib/dashboard/scope-key"
import { useDashboardScopeParams } from "@/hooks/use-dashboard-scope-params"
import {
  SCOPE_LOADING_KEY,
  useDashboardScopeTransition,
} from "@/hooks/use-dashboard-scope-transition"
import {
  selectCampaignsForParcel,
  useDashboardListsStore,
} from "@/store/useDashboardListsStore"

async function resolveCampaignsForParcel(parcelId: string) {
  const store = useDashboardListsStore.getState()
  const cached = selectCampaignsForParcel(store, parcelId)
  if (cached.length > 0) {
    return cached
  }

  store.setLoadingCampaigns(parcelId, true)
  try {
    const campaigns = await api.campaign.list(parcelId)
    store.setCampaignsForParcel(parcelId, campaigns)
    return campaigns
  } finally {
    store.setLoadingCampaigns(parcelId, false)
  }
}

const ALL_DASHBOARD_FAMILIES = [
  "finance",
  "events",
  "parcels",
  "production",
  "daily",
] as const

export function useDashboardScopeActions() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [scopeParams, setScopeParams] = useDashboardScopeParams()
  const { navigateScope, updatePendingScopeKey } = useDashboardScopeTransition()
  const invalidateOnOrgChange = useDashboardListsStore(
    (state) => state.invalidateOnOrgChange
  )

  const invalidateDashboardScope = useCallback(
    (previousScope?: {
      parcelId?: string | null
      campaignId?: string | null
      from?: string | null
      to?: string | null
    }) => {
      invalidateDashboard(queryClient, [...ALL_DASHBOARD_FAMILIES], {
        parcelId: previousScope?.parcelId ?? scopeParams.parcelId,
        campaignId: previousScope?.campaignId ?? scopeParams.campaignId,
        from: previousScope?.from ?? scopeParams.from,
        to: previousScope?.to ?? scopeParams.to,
      })
    },
    [queryClient, scopeParams]
  )

  const selectOrganization = useCallback(
    (organizationId: string) => {
      navigateScope(SCOPE_LOADING_KEY, async () => {
        const { error } = await authClient.organization.setActive({
          organizationId,
        })
        if (error) {
          throw new Error(error.message ?? "No se pudo cambiar la organización")
        }

        invalidateOnOrgChange()
        invalidateDashboardScope()

        const parcels = await api.parcel.getListParcels()
        if (parcels.length === 0) {
          updatePendingScopeKey(buildDashboardScopeKey({}))
          await setScopeParams({
            parcelId: null,
            campaignId: null,
            from: null,
            to: null,
          })
          router.refresh()
          return
        }

        const parcelId = parcels[0]!.id
        const campaigns = await resolveCampaignsForParcel(parcelId)
        const campaignId = pickDefaultCampaignId(campaigns)
        const expectedKey = buildDashboardScopeKey({ parcelId, campaignId })

        updatePendingScopeKey(expectedKey)
        await setScopeParams({
          parcelId,
          campaignId: campaignId ?? null,
          from: null,
          to: null,
        })
        router.refresh()
      })
    },
    [
      invalidateDashboardScope,
      invalidateOnOrgChange,
      navigateScope,
      router,
      setScopeParams,
      updatePendingScopeKey,
    ]
  )

  const selectParcel = useCallback(
    (parcelId: string) => {
      navigateScope(SCOPE_LOADING_KEY, async () => {
        const campaigns = await resolveCampaignsForParcel(parcelId)
        const campaignId = pickDefaultCampaignId(campaigns)
        const expectedKey = buildDashboardScopeKey({ parcelId, campaignId })

        updatePendingScopeKey(expectedKey)
        await setScopeParams({
          parcelId,
          campaignId: campaignId ?? null,
          from: null,
          to: null,
        })
      })
    },
    [navigateScope, setScopeParams, updatePendingScopeKey]
  )

  const selectCampaign = useCallback(
    (campaignId: string) => {
      const expectedKey = buildDashboardScopeKey({
        parcelId: scopeParams.parcelId,
        campaignId,
      })

      navigateScope(expectedKey, () => {
        void setScopeParams({
          campaignId,
          from: null,
          to: null,
        })
      })
    },
    [navigateScope, scopeParams.parcelId, setScopeParams]
  )

  const selectDateRange = useCallback(
    (from: string, to: string) => {
      const expectedKey = buildDashboardScopeKey({
        parcelId: scopeParams.parcelId,
        from,
        to,
      })

      navigateScope(expectedKey, () => {
        void setScopeParams({
          from,
          to,
          campaignId: null,
        })
      })
    },
    [navigateScope, scopeParams.parcelId, setScopeParams]
  )

  return {
    selectOrganization,
    selectParcel,
    selectCampaign,
    selectDateRange,
  }
}
