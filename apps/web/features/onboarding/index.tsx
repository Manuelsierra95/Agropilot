"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Progress } from "@workspace/ui/components/progress"
import { OnboardingHeader } from "@workspace/web/features/onboarding/components/onboarding-header"
import {
  OnboardingStep,
  type OnboardingStepRenderer,
} from "@workspace/web/features/onboarding/components/onboarding-step"
import {
  CreateParcel,
  type FieldFormData,
} from "@workspace/web/features/onboarding/components/parcel"
import { createParcelDraft } from "@workspace/web/features/onboarding/components/parcel/parcel-draft-utils"
import {
  toParcelCreateInput,
  toParcelUpdateInput,
} from "@workspace/web/features/onboarding/components/parcel/parcel-form"
import { BulkFinance } from "@workspace/web/features/onboarding/components/finance/bulk-finance"
import { TeamInvites } from "@workspace/web/features/onboarding/components/team"
import { OnboardingSummary } from "@workspace/web/features/onboarding/components/onboarding-summary"
import type {
  FinanceBulkRow,
  TeamInviteDraft,
} from "@workspace/web/features/onboarding/mocks/onboarding-mocks"
import { useOnboardingResume } from "@workspace/web/features/onboarding/use-onboarding-resume"
import { parcelApi } from "@workspace/web/lib/api/routes/parcel"
import { userApi } from "@workspace/web/lib/api/routes/user"

const TOTAL_STEPS = 4
const COMPLETED_STEP = TOTAL_STEPS + 1

interface OnboardingFlowProps {
  initialStep: number
}

function createInitialParcelState(parcels: FieldFormData[] = []): {
  parcels: FieldFormData[]
  activeParcelId: string
} {
  if (parcels.length > 0) {
    return { parcels, activeParcelId: parcels[0]!.id }
  }
  const draft = createParcelDraft()
  return { parcels: [draft], activeParcelId: draft.id }
}

export default function OnboardingFlow({ initialStep }: OnboardingFlowProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(initialStep)
  const [parcelState, setParcelState] = useState(() =>
    createInitialParcelState()
  )
  const { parcels, activeParcelId } = parcelState
  const [financeRows, setFinanceRows] = useState<FinanceBulkRow[]>([])
  const [teamInvites, setTeamInvites] = useState<TeamInviteDraft[]>([])
  const [financeImported, setFinanceImported] = useState(false)
  const [teamSent, setTeamSent] = useState(false)

  const {
    parcels: resumedParcels,
    financeRows: resumedFinanceRows,
    teamInvites: resumedTeamInvites,
    isLoading,
  } = useOnboardingResume(initialStep)

  useEffect(() => {
    router.replace(`/onboarding?step=${currentStep}`, { scroll: false })
  }, [currentStep, router])

  useEffect(() => {
    if (isLoading) return

    setParcelState((prev) => {
      if (resumedParcels.length > 0) {
        return {
          parcels: resumedParcels,
          activeParcelId: resumedParcels[0]!.id,
        }
      }
      if (initialStep >= 2 && prev.parcels.length === 0) {
        const draft = createParcelDraft()
        return { parcels: [draft], activeParcelId: draft.id }
      }
      return prev
    })

    if (resumedFinanceRows.length > 0) {
      setFinanceRows(resumedFinanceRows)
      setFinanceImported(true)
    }

    if (resumedTeamInvites.length > 0) {
      setTeamInvites(resumedTeamInvites)
      setTeamSent(true)
    }
  }, [
    resumedParcels,
    resumedFinanceRows,
    resumedTeamInvites,
    isLoading,
    initialStep,
  ])

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

  const saveStep = useCallback(async (step: number) => {
    await userApi.updateOnboarding(step).catch(() => undefined)
  }, [])

  const updateStep = useCallback(
    async (step: number) => {
      const validStep = Math.min(Math.max(step, 1), TOTAL_STEPS)
      setCurrentStep(validStep)
      await saveStep(validStep)
    },
    [saveStep]
  )

  const goNext = useCallback(async () => {
    await updateStep(currentStep + 1)
  }, [currentStep, updateStep])

  const goBack = useCallback(async () => {
    await updateStep(currentStep - 1)
  }, [currentStep, updateStep])

  const goToStep = useCallback(
    async (step: number) => {
      await updateStep(step)
    },
    [updateStep]
  )

  const handleFinish = useCallback(async () => {
    try {
      await userApi.updateOnboarding(COMPLETED_STEP)
      router.push("/dashboard")
    } catch {
      // Si falla el guardado, permanecemos en el resumen para que el usuario reintente
    }
  }, [router])

  const handleAddParcel = useCallback(() => {
    const draft = createParcelDraft()
    setParcelState((state) => ({
      parcels: [...state.parcels, draft],
      activeParcelId: draft.id,
    }))
  }, [])

  const handleRemoveParcel = useCallback(
    async (id: string) => {
      const parcel = parcels.find((item) => item.id === id)
      if (!parcel) return

      if (parcel.serverId) {
        await parcelApi.deleteParcel(parcel.serverId)
      }

      setParcelState((state) => {
        if (state.parcels.length <= 1) return state
        const nextParcels = state.parcels.filter((item) => item.id !== id)
        const nextActiveId =
          state.activeParcelId === id
            ? (nextParcels[0]?.id ?? state.activeParcelId)
            : state.activeParcelId
        return { parcels: nextParcels, activeParcelId: nextActiveId }
      })
    },
    [parcels]
  )

  const handlePolygonChange = useCallback(
    (parcelId: string, polygon: string | null) => {
      setParcels((current) =>
        current.map((parcel) =>
          parcel.id === parcelId ? { ...parcel, polygon } : parcel
        )
      )
    },
    [setParcels]
  )

  const handleCentroidChange = useCallback(
    (parcelId: string, centroid: string | null) => {
      setParcels((current) =>
        current.map((parcel) =>
          parcel.id === parcelId ? { ...parcel, centroid } : parcel
        )
      )
    },
    [setParcels]
  )

  const handleSaveParcel = useCallback(
    async (parcelId: string) => {
      const parcel = parcels.find((item) => item.id === parcelId)
      if (!parcel) {
        throw new Error("Parcel not found")
      }

      if (parcel.serverId) {
        await parcelApi.updateParcel(
          parcel.serverId,
          toParcelUpdateInput(parcel)
        )
        return
      }

      const created = await parcelApi.createParcel(toParcelCreateInput(parcel))

      setParcelState((state) => ({
        ...state,
        parcels: state.parcels.map((item) =>
          item.id === parcelId ? { ...item, serverId: created.id } : item
        ),
      }))
    },
    [parcels]
  )

  const progress = (currentStep / TOTAL_STEPS) * 100

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
          onSaveParcel={handleSaveParcel}
          onContinue={goNext}
        />
      ),
      ({ onContinue, onSkip }) => (
        <BulkFinance
          parcels={parcels}
          rows={financeRows}
          onRowsChange={setFinanceRows}
          initialImported={financeImported}
          onContinue={onContinue}
          onSkip={onSkip}
        />
      ),
      ({ onContinue, onSkip }) => (
        <TeamInvites
          invites={teamInvites}
          onInvitesChange={setTeamInvites}
          initialSent={teamSent}
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
          onFinish={handleFinish}
        />
      ),
    ],
    [
      parcels,
      activeParcelId,
      financeRows,
      financeImported,
      teamInvites,
      teamSent,
      handleAddParcel,
      handleRemoveParcel,
      handlePolygonChange,
      handleCentroidChange,
      handleSaveParcel,
      goNext,
      goToStep,
      handleFinish,
      setParcels,
      setActiveParcelId,
    ]
  )

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background">
        <p className="text-muted-foreground">Cargando onboarding…</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <Progress value={progress} className="h-1 rounded-none" />
      <OnboardingHeader
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
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
