"use client"

import { useEffect, useState } from "react"
import type {
  ParcelSelect,
  TransactionSelect,
  InvitationSelect,
} from "@workspace/schemas"
import type { FieldFormData } from "@workspace/web/features/onboarding/components/parcel/parcel-form"
import type {
  FinanceBulkRow,
  TeamInviteDraft,
  TeamInviteRole,
} from "@workspace/web/features/onboarding/mocks/onboarding-mocks"
import { parcelApi } from "@workspace/web/lib/api/routes/parcel"
import { financeApi } from "@workspace/web/lib/api/routes/finance"
import { organizationApi } from "@workspace/web/lib/api/routes/organization"

function mapParcelToFieldFormData(parcel: ParcelSelect): FieldFormData {
  return {
    id: parcel.id,
    serverId: parcel.id,
    name: parcel.name,
    cropType: parcel.cropType,
    irrigationType: parcel.irrigationType ?? undefined,
    areaHa: parcel.areaM2 != null ? parcel.areaM2 / 10_000 : null,
    polygon: parcel.polygon ?? null,
    centroid: parcel.centroid ?? null,
  }
}

function mapTransactionToFinanceBulkRow(tx: TransactionSelect): FinanceBulkRow {
  return {
    id: tx.id,
    concept: tx.concept,
    description: tx.description ?? null,
    amount: Number(tx.amount),
    date: tx.date,
    category: tx.category,
    flow: tx.flow,
    paymentMethod: tx.paymentMethod ?? null,
    invoiceNumber: tx.invoiceNumber ?? null,
    parcelId: tx.parcelId ?? null,
  }
}

function mapInvitationToTeamInviteDraft(
  invitation: InvitationSelect
): TeamInviteDraft {
  return {
    id: invitation.id,
    email: invitation.email,
    role: (invitation.role as TeamInviteRole | null) ?? "member",
  }
}

interface OnboardingResumeState {
  parcels: FieldFormData[]
  financeRows: FinanceBulkRow[]
  teamInvites: TeamInviteDraft[]
  isLoading: boolean
  error: string | null
}

export function useOnboardingResume(
  initialStep: number
): OnboardingResumeState {
  const [state, setState] = useState<OnboardingResumeState>({
    parcels: [],
    financeRows: [],
    teamInvites: [],
    isLoading: initialStep > 1,
    error: null,
  })

  useEffect(() => {
    if (initialStep <= 1) {
      setState((current) => ({ ...current, isLoading: false }))
      return
    }

    let cancelled = false

    async function load() {
      try {
        const [parcels, transactions, invitations] = await Promise.all([
          parcelApi.getListParcels(),
          initialStep >= 2
            ? financeApi.listTransactions()
            : Promise.resolve([]),
          initialStep >= 3
            ? organizationApi.listInvitations()
            : Promise.resolve([]),
        ])

        if (cancelled) return

        setState({
          parcels: parcels.map(mapParcelToFieldFormData),
          financeRows: transactions.map(mapTransactionToFinanceBulkRow),
          teamInvites: invitations.map(mapInvitationToTeamInviteDraft),
          isLoading: false,
          error: null,
        })
      } catch (err) {
        if (cancelled) return
        setState((current) => ({
          ...current,
          isLoading: false,
          error:
            err instanceof Error ? err.message : "Error al cargar los datos",
        }))
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [initialStep])

  return state
}
