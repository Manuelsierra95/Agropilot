"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"
import { useRouter } from "next/navigation"

import { api } from "@workspace/web/lib/api"
import { authClient } from "@workspace/web/lib/auth-client"
import { invalidateDashboard } from "@workspace/web/lib/dashboard/invalidate-dashboard"
import { pickDefaultCampaignId } from "@workspace/web/lib/dashboard/pick-default-campaign"
import { buildDashboardScopeKey } from "@workspace/web/lib/dashboard/scope-key"
import { useDashboardScopeParams } from "@workspace/web/hooks/use-dashboard-scope-params"
import {
  SCOPE_LOADING_KEY,
  useDashboardScopeTransition,
} from "@workspace/web/hooks/use-dashboard-scope-transition"
import {
  ORG_CAMPAIGNS_KEY,
  selectCampaignsForParcel,
  useDashboardListsStore,
} from "@workspace/web/store/useDashboardListsStore"
import { isDemoMode } from "@workspace/web/lib/demo-mode"

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

async function resolveOrgCampaigns() {
  const store = useDashboardListsStore.getState()
  const cached = selectCampaignsForParcel(store, null)
  if (cached.length > 0) {
    return cached
  }

  store.setLoadingCampaigns(ORG_CAMPAIGNS_KEY, true)
  try {
    const campaigns = await api.campaign.list()
    store.setCampaignsForParcel(ORG_CAMPAIGNS_KEY, campaigns)
    return campaigns
  } finally {
    store.setLoadingCampaigns(ORG_CAMPAIGNS_KEY, false)
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
        if (!isDemoMode()) {
          const { error } = await authClient.organization.setActive({
            organizationId,
          })
          if (error) {
            throw new Error(error.message ?? "No se pudo cambiar la organización")
          }
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

        const campaigns = await resolveOrgCampaigns()
        const campaignId = pickDefaultCampaignId(campaigns)
        const expectedKey = buildDashboardScopeKey({ campaignId })

        updatePendingScopeKey(expectedKey)
        await setScopeParams({
          parcelId: null,
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

  const selectAllParcels = useCallback(() => {
    navigateScope(SCOPE_LOADING_KEY, async () => {
      const campaigns = await resolveOrgCampaigns()
      const campaignId = pickDefaultCampaignId(campaigns)
      const expectedKey = buildDashboardScopeKey({ campaignId })

      updatePendingScopeKey(expectedKey)
      await setScopeParams({
        parcelId: null,
        campaignId: campaignId ?? null,
        from: null,
        to: null,
      })
    })
  }, [navigateScope, setScopeParams, updatePendingScopeKey])

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
    selectAllParcels,
    selectParcel,
    selectCampaign,
    selectDateRange,
  }
}
