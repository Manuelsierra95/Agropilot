"use client"

import { useCallback, useMemo, useState } from "react"
import { Progress } from "@workspace/ui/components/progress"
import { OnboardingHeader } from "./components/onboarding-header"
import {
  OnboardingStep,
  type OnboardingStepRenderer,
} from "./components/onboarding-step"
import { CreateParcel, type FieldFormData } from "./components/parcel"
import { createParcelDraft } from "./components/parcel/parcel-draft-utils"
import { toParcelCreateInput } from "./components/parcel/parcel-form"
import { BulkFinance } from "./components/finance/bulk-finance"
import { TeamInvites } from "./components/team"
import { OnboardingSummary } from "./components/onboarding-summary"
import type { FinanceBulkRow, TeamInviteDraft } from "./mocks/onboarding-mocks"
import { parcelApi } from "@/lib/api/routes/parcel"
import { userApi } from "@/lib/api/routes/user"

const ONBOARDING_STEP_AFTER_PARCELS = 2

function createInitialParcelState() {
  const draft = createParcelDraft()
  return { parcels: [draft], activeParcelId: draft.id }
}

export default function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(1)
  const [parcelState, setParcelState] = useState(createInitialParcelState)
  const { parcels, activeParcelId } = parcelState

  const setParcels = useCallback(
    (
      next: FieldFormData[] | ((current: FieldFormData[]) => FieldFormData[])
    ) => {
      setParcelState((state) => ({
        ...state,
        parcels: typeof next === "function" ? next(state.parcels) : next,
      }))
    },
    []
  )

  const setActiveParcelId = useCallback((id: string) => {
    setParcelState((state) => ({ ...state, activeParcelId: id }))
  }, [])
  const [financeRows, setFinanceRows] = useState<FinanceBulkRow[]>([])
  const [teamInvites, setTeamInvites] = useState<TeamInviteDraft[]>([])

  const totalSteps = 4
  const progress = (currentStep / totalSteps) * 100

  const goNext = useCallback(() => {
    setCurrentStep((step) => Math.min(step + 1, totalSteps))
  }, [])

  const goBack = useCallback(() => {
    setCurrentStep((step) => Math.max(step - 1, 1))
  }, [])

  const goToStep = useCallback((step: number) => {
    setCurrentStep(Math.min(Math.max(step, 1), totalSteps))
  }, [])

  const handleAddParcel = useCallback(() => {
    const draft = createParcelDraft()
    setParcelState((state) => ({
      parcels: [...state.parcels, draft],
      activeParcelId: draft.id,
    }))
  }, [])

  const handleRemoveParcel = useCallback((id: string) => {
    setParcelState((state) => {
      if (state.parcels.length <= 1) return state
      const nextParcels = state.parcels.filter((parcel) => parcel.id !== id)
      const nextActiveId =
        state.activeParcelId === id
          ? (nextParcels[0]?.id ?? state.activeParcelId)
          : state.activeParcelId
      return { parcels: nextParcels, activeParcelId: nextActiveId }
    })
  }, [])

  const handlePolygonChange = useCallback(
    (parcelId: string, polygon: string | null) => {
      setParcels((current) =>
        current.map((parcel) =>
          parcel.id === parcelId ? { ...parcel, polygon } : parcel
        )
      )
    },
    []
  )

  const handleCentroidChange = useCallback(
    (parcelId: string, centroid: string | null) => {
      setParcels((current) =>
        current.map((parcel) =>
          parcel.id === parcelId ? { ...parcel, centroid } : parcel
        )
      )
    },
    []
  )

  const handlePersistParcelsAndContinue = useCallback(async () => {
    try {
      const pending = parcels.filter((parcel) => !parcel.serverId)
      const created = await Promise.all(
        pending.map((parcel) =>
          parcelApi.createParcel(toParcelCreateInput(parcel))
        )
      )

      if (created.length > 0) {
        setParcelState((state) => {
          let createdIndex = 0
          return {
            ...state,
            parcels: state.parcels.map((parcel) => {
              if (parcel.serverId) return parcel
              const serverParcel = created[createdIndex]
              createdIndex += 1
              return serverParcel
                ? { ...parcel, serverId: serverParcel.id }
                : parcel
            }),
          }
        })
      }

      await userApi.updateOnboarding(ONBOARDING_STEP_AFTER_PARCELS)
      goNext()
    } catch {
      throw new Error("Failed to persist parcels")
    }
  }, [parcels, goNext])

  const steps = useMemo<OnboardingStepRenderer[]>(
    () => [
      () => (
        <CreateParcel
          parcels={parcels}
          activeParcelId={activeParcelId}
          onParcelsChange={setParcels}
          onActiveParcelChange={setActiveParcelId}
          onAddParcel={handleAddParcel}
          onRemoveParcel={handleRemoveParcel}
          onPolygonChange={handlePolygonChange}
          onCentroidChange={handleCentroidChange}
          onPersistAndContinue={handlePersistParcelsAndContinue}
        />
      ),
      ({ onContinue, onSkip }) => (
        <BulkFinance
          rows={financeRows}
          onRowsChange={setFinanceRows}
          onContinue={onContinue}
          onSkip={onSkip}
        />
      ),
      ({ onContinue, onSkip }) => (
        <TeamInvites
          invites={teamInvites}
          onInvitesChange={setTeamInvites}
          onContinue={onContinue}
          onSkip={onSkip}
        />
      ),
      () => (
        <OnboardingSummary
          parcels={parcels}
          financeRows={financeRows}
          teamInvites={teamInvites}
          onEditParcels={() => goToStep(1)}
        />
      ),
    ],
    [
      parcels,
      activeParcelId,
      financeRows,
      teamInvites,
      handleAddParcel,
      handleRemoveParcel,
      handlePolygonChange,
      handleCentroidChange,
      handlePersistParcelsAndContinue,
      goToStep,
    ]
  )

  return (
    <div className="flex h-screen flex-col bg-background">
      <Progress value={progress} className="h-1 rounded-none" />
      <OnboardingHeader
        currentStep={currentStep}
        totalSteps={totalSteps}
        onBack={currentStep > 1 ? goBack : undefined}
      />

      <main className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col overflow-hidden px-4 pb-4 sm:px-6 sm:pb-6">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-sm">
          <OnboardingStep
            steps={steps}
            currentStep={currentStep}
            onContinue={goNext}
            onSkip={goNext}
          />
        </div>
      </main>
    </div>
  )
}
