"use client"

import { useMemo, useState, useTransition } from "react"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { OnboardingSplitLayout } from "../onboarding-split-layout"
import {
  draftCentroidFromCoordinates,
  draftPolygonFromCoordinates,
} from "@/lib/cadastre/geometry"
import {
  ParcelForm,
  PARCEL_ONBOARDING_FORM_ID,
  applyDuplicateNameErrors,
  validateAllParcelDrafts,
  validateParcelForm,
  type FieldFormData,
  type ParcelFormErrors,
} from "./parcel-form"
import type { ParcelSearchResult } from "./parcel-search/types"
import { ParcelMap } from "./parcel-map-preview"
import { ParcelList } from "./parcel-list"
import {
  CROP_TYPE_LABELS,
  DEFAULT_CROP_TYPE,
  IRRIGATION_TYPE_LABELS,
  type CropTypeValue,
} from "./parcel-constants"

export type { FieldFormData }

interface CreateParcelProps {
  parcels: FieldFormData[]
  activeParcelId: string
  onParcelsChange: (parcels: FieldFormData[]) => void
  onActiveParcelChange: (id: string) => void
  onAddParcel: () => void
  onRemoveParcel: (id: string) => void
  onPolygonChange: (parcelId: string, polygon: string | null) => void
  onCentroidChange: (parcelId: string, centroid: string | null) => void
  onPersistAndContinue?: () => Promise<void>
}

export function CreateParcel({
  parcels,
  activeParcelId,
  onParcelsChange,
  onActiveParcelChange,
  onAddParcel,
  onRemoveParcel,
  onPolygonChange,
  onCentroidChange,
  onPersistAndContinue,
}: CreateParcelProps) {
  const [errorsByParcelId, setErrorsByParcelId] = useState<
    Record<string, ParcelFormErrors>
  >({})
  const [invalidParcelIds, setInvalidParcelIds] = useState<Set<string>>(
    () => new Set()
  )
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)
  const [isPending, startTransition] = useTransition()

  const activeParcel = useMemo(
    () => parcels.find((parcel) => parcel.id === activeParcelId) ?? parcels[0],
    [parcels, activeParcelId]
  )

  if (!activeParcel) {
    return null
  }

  const displayName = activeParcel.name || "Parcela sin nombre"
  const initial = displayName.charAt(0).toUpperCase()
  const activeErrors = hasAttemptedSubmit
    ? (errorsByParcelId[activeParcel.id] ?? {})
    : {}

  const syncValidationState = (
    nextParcels: FieldFormData[],
    nextErrors: Record<string, ParcelFormErrors>
  ) => {
    setErrorsByParcelId(nextErrors)
    setInvalidParcelIds(new Set(Object.keys(nextErrors)))
  }

  const updateActiveParcel = (data: FieldFormData) => {
    const nextParcels = parcels.map((parcel) =>
      parcel.id === activeParcel.id ? data : parcel
    )
    onParcelsChange(nextParcels)

    if (!hasAttemptedSubmit) return

    const fieldErrors = validateParcelForm(data)
    const baseErrors = { ...errorsByParcelId }

    if (Object.keys(fieldErrors).length === 0) {
      delete baseErrors[data.id]
    } else {
      baseErrors[data.id] = fieldErrors
    }

    const withDuplicates = applyDuplicateNameErrors(nextParcels, baseErrors)
    syncValidationState(nextParcels, withDuplicates)
  }

  const handleSelectParcel = (id: string) => {
    onActiveParcelChange(id)
  }

  const handleGeometryFound = (result: ParcelSearchResult) => {
    const polygon = draftPolygonFromCoordinates(result.geometryCoordinates)
    const centroid = draftCentroidFromCoordinates(result.geometryCoordinates)
    const nextParcels = parcels.map((parcel) =>
      parcel.id === activeParcel.id
        ? {
            ...parcel,
            polygon,
            centroid,
            refcat: result.refcat ?? null,
            address: result.address ?? null,
          }
        : parcel
    )
    onParcelsChange(nextParcels)

    if (!hasAttemptedSubmit) return

    setErrorsByParcelId((current) => {
      const next = { ...current }
      const parcelErrors = next[activeParcel.id]
      if (parcelErrors?.geometry) {
        const { geometry: _geometry, ...rest } = parcelErrors
        if (Object.keys(rest).length === 0) {
          delete next[activeParcel.id]
        } else {
          next[activeParcel.id] = rest
        }
      }
      const withDuplicates = applyDuplicateNameErrors(parcels, next)
      setInvalidParcelIds(new Set(Object.keys(withDuplicates)))
      return withDuplicates
    })
  }

  const handleRemoveParcel = (id: string) => {
    if (parcels.length <= 1) return
    const nextParcels = parcels.filter((parcel) => parcel.id !== id)
    onRemoveParcel(id)

    if (!hasAttemptedSubmit) return

    setErrorsByParcelId((current) => {
      const next = { ...current }
      delete next[id]
      const withDuplicates = applyDuplicateNameErrors(nextParcels, next)
      setInvalidParcelIds(new Set(Object.keys(withDuplicates)))
      return withDuplicates
    })
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitError(null)
    setHasAttemptedSubmit(true)

    const validation = validateAllParcelDrafts(parcels)
    if (validation.invalidParcelIds.length > 0) {
      if (validation.firstInvalidParcelId) {
        onActiveParcelChange(validation.firstInvalidParcelId)
      }
      syncValidationState(parcels, validation.errorsByParcelId)
      return
    }

    syncValidationState(parcels, {})

    if (!onPersistAndContinue) {
      return
    }

    startTransition(async () => {
      try {
        await onPersistAndContinue()
      } catch {
        setSubmitError(
          "No pudimos guardar las parcelas. Comprueba tu conexión e inténtalo de nuevo."
        )
      }
    })
  }

  const parcelCountLabel =
    parcels.length === 1
      ? "1 parcela"
      : `${parcels.length} parcelas`

  return (
    <OnboardingSplitLayout
      as="form"
      formProps={{
        id: PARCEL_ONBOARDING_FORM_ID,
        noValidate: true,
        onSubmit: handleSubmit,
      }}
      footer={
        <div className="flex flex-col gap-2">
          {submitError ? (
            <p className="text-center text-sm text-destructive">{submitError}</p>
          ) : null}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isPending}
          >
            {isPending ? "Guardando parcelas…" : "Continuar"}
          </Button>
        </div>
      }
      previewHeader={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 rounded-lg bg-primary text-primary-foreground">
              <AvatarFallback className="rounded-lg text-sm font-semibold">
                {initial}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-foreground">{displayName}</p>
              <p className="text-sm text-muted-foreground">
                {parcelCountLabel} · Vista previa
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              {CROP_TYPE_LABELS[
                (activeParcel.cropType || DEFAULT_CROP_TYPE) as CropTypeValue
              ] ?? activeParcel.cropType}
            </Badge>
            {activeParcel.irrigationType ? (
              <Badge variant="outline">
                {IRRIGATION_TYPE_LABELS[activeParcel.irrigationType]}
              </Badge>
            ) : (
              <Badge variant="outline">Sin régimen hídrico</Badge>
            )}
          </div>
        </div>
      }
      preview={
        <ParcelMap
          parcels={parcels}
          activeParcelId={activeParcelId}
          onPolygonChange={onPolygonChange}
          onCentroidChange={onCentroidChange}
        />
      }
    >
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        <ParcelList
          parcels={parcels}
          activeParcelId={activeParcelId}
          onSelect={handleSelectParcel}
          onAdd={onAddParcel}
          onRemove={handleRemoveParcel}
          invalidParcelIds={
            hasAttemptedSubmit ? invalidParcelIds : undefined
          }
        />
        <div className="relative z-0 min-h-0 flex-1 overflow-y-auto pt-6">
          <ParcelForm
            value={activeParcel}
            onChange={updateActiveParcel}
            errors={activeErrors}
            onGeometryFound={handleGeometryFound}
            searchDisabled={isPending}
          />
        </div>
      </div>
    </OnboardingSplitLayout>
  )
}
