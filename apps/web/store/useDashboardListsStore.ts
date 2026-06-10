import { create } from "zustand"
import type { CampaignListItem } from "@workspace/schemas"
import type { ParcelSelect } from "@workspace/schemas"

export type DashboardOrganization = {
  id: string
  name: string
  logo?: string | null
  plan: string
}

/** Stable empty reference for Zustand selectors (avoids infinite SSR loops). */
export const EMPTY_CAMPAIGNS: CampaignListItem[] = []

type DashboardListsState = {
  organizations: DashboardOrganization[]
  parcels: ParcelSelect[]
  campaignsByParcelId: Record<string, CampaignListItem[]>
  isLoadingOrganizations: boolean
  isLoadingParcels: boolean
  loadingCampaignParcelIds: Record<string, boolean>
  setOrganizations: (organizations: DashboardOrganization[]) => void
  setParcels: (parcels: ParcelSelect[]) => void
  setCampaignsForParcel: (
    parcelId: string,
    campaigns: CampaignListItem[]
  ) => void
  setLoadingOrganizations: (isLoading: boolean) => void
  setLoadingParcels: (isLoading: boolean) => void
  setLoadingCampaigns: (parcelId: string, isLoading: boolean) => void
  invalidateOnOrgChange: () => void
}

export const useDashboardListsStore = create<DashboardListsState>((set) => ({
  organizations: [],
  parcels: [],
  campaignsByParcelId: {},
  isLoadingOrganizations: true,
  isLoadingParcels: true,
  loadingCampaignParcelIds: {},
  setOrganizations: (organizations) => set({ organizations }),
  setParcels: (parcels) => set({ parcels }),
  setCampaignsForParcel: (parcelId, campaigns) =>
    set((state) => ({
      campaignsByParcelId: {
        ...state.campaignsByParcelId,
        [parcelId]: campaigns,
      },
    })),
  setLoadingOrganizations: (isLoadingOrganizations) =>
    set({ isLoadingOrganizations }),
  setLoadingParcels: (isLoadingParcels) => set({ isLoadingParcels }),
  setLoadingCampaigns: (parcelId, isLoading) =>
    set((state) => ({
      loadingCampaignParcelIds: {
        ...state.loadingCampaignParcelIds,
        [parcelId]: isLoading,
      },
    })),
  invalidateOnOrgChange: () =>
    set({
      parcels: [],
      campaignsByParcelId: {},
      loadingCampaignParcelIds: {},
      isLoadingParcels: true,
    }),
}))

export function selectCampaignsForParcel(
  state: DashboardListsState,
  parcelId: string | null | undefined
): CampaignListItem[] {
  if (!parcelId) return EMPTY_CAMPAIGNS
  return state.campaignsByParcelId[parcelId] ?? EMPTY_CAMPAIGNS
}

export function selectIsLoadingCampaigns(
  state: DashboardListsState,
  parcelId: string | null | undefined
): boolean {
  if (!parcelId) return false
  return state.loadingCampaignParcelIds[parcelId] ?? false
}

export function selectHasLoadedCampaignsForParcel(
  state: DashboardListsState,
  parcelId: string | null | undefined
): boolean {
  if (!parcelId) return false
  return parcelId in state.campaignsByParcelId
}
