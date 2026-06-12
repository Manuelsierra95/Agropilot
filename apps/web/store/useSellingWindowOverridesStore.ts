import { create } from "zustand"

type SellingWindowOverrides = {
  estimatedKg?: number
  campaignTarget?: number
}

type SellingWindowOverridesState = {
  overridesByScopeKey: Record<string, SellingWindowOverrides>
  setEstimatedKg: (scopeKey: string, estimatedKg: number) => void
  setCampaignTarget: (scopeKey: string, campaignTarget: number) => void
  clearScope: (scopeKey: string) => void
}

export const useSellingWindowOverridesStore = create<SellingWindowOverridesState>(
  (set) => ({
    overridesByScopeKey: {},
    setEstimatedKg: (scopeKey, estimatedKg) =>
      set((state) => ({
        overridesByScopeKey: {
          ...state.overridesByScopeKey,
          [scopeKey]: {
            ...state.overridesByScopeKey[scopeKey],
            estimatedKg,
          },
        },
      })),
    setCampaignTarget: (scopeKey, campaignTarget) =>
      set((state) => ({
        overridesByScopeKey: {
          ...state.overridesByScopeKey,
          [scopeKey]: {
            ...state.overridesByScopeKey[scopeKey],
            campaignTarget,
          },
        },
      })),
    clearScope: (scopeKey) =>
      set((state) => {
        const { [scopeKey]: _, ...rest } = state.overridesByScopeKey
        return { overridesByScopeKey: rest }
      }),
  })
)
