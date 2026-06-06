"use client"

import { useMemo, useState, useTransition } from "react"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { OnboardingSplitLayout } from "../onboarding-split-layout"
import { parcelSearchResultToDraft } from "@/lib/cadastre/apply-search-response"
import { searchParcel } from "@/lib/cadastre/search-parcel"
import {
  ParcelForm,
  PARCEL_ONBOARDING_FORM_ID,
  applyDuplicateNameErrors,
  hasUnsavedParcelData,
  validateParcelForm,
  type FieldFormData,
  type ParcelFormErrors,
  type ParcelSaveStatus,
} from "./parcel-form"
import type { ParcelSearchResult } from "./parcel-search/types"
import { ParcelMap } from "./parcel-map-preview"
import { ParcelList } from "./parcel-list"
import { clearParcelDraftData } from "./parcel-draft-utils"
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
  onRemoveParcel: (id: string) => void | Promise<void>
  onPolygonChange: (parcelId: string, polygon: string | null) => void
  onCentroidChange: (parcelId: string, centroid: string | null) => void
  onSaveParcel: (parcelId: string) => Promise<void>
  onContinue?: () => Promise<void>
}

function getSaveStatusBadge(status: ParcelSaveStatus) {
  switch (status) {
    case "saving":
      return (
        <Badge variant="outline" className="border-muted-foreground/40">
          Guardando…
        </Badge>
      )
    case "saved":
      return (
        <Badge className="border-transparent bg-emerald-600 text-white hover:bg-emerald-600/90">
          Guardada
        </Badge>
      )
    case "error":
      return <Badge variant="destructive">Error al guardar</Badge>
    default:
      return null
  }
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
  onSaveParcel,
  onContinue,
}: CreateParcelProps) {
  const [errorsByParcelId, setErrorsByParcelId] = useState<
    Record<string, ParcelFormErrors>
  >({})
  const [invalidParcelIds, setInvalidParcelIds] = useState<Set<string>>(
    () => new Set()
  )
  const [saveStatusByParcelId, setSaveStatusByParcelId] = useState<
    Record<string, ParcelSaveStatus>
  >({})
  const [saveErrorByParcelId, setSaveErrorByParcelId] = useState<
    Record<string, string>
  >({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)
  const [hasAttemptedSave, setHasAttemptedSave] = useState(false)
  const [formResetKey, setFormResetKey] = useState(0)
  const [isPending, startTransition] = useTransition()
  const [isSaving, startSaveTransition] = useTransition()

  const activeParcel = useMemo(
    () => parcels.find((parcel) => parcel.id === activeParcelId) ?? parcels[0],
    [parcels, activeParcelId]
  )

  if (!activeParcel) {
    return null
  }

  const displayName = activeParcel.name || "Parcela sin nombre"
  const initial = displayName.charAt(0).toUpperCase()
  const activeErrors =
    hasAttemptedSubmit || hasAttemptedSave
      ? (errorsByParcelId[activeParcel.id] ?? {})
      : {}
  const activeSaveStatus =
    saveStatusByParcelId[activeParcel.id] ??
    (activeParcel.serverId ? "saved" : "idle")
  const activeSaveError = saveErrorByParcelId[activeParcel.id] ?? null

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

    if (data.serverId && saveStatusByParcelId[data.id] === "saved") {
      setSaveStatusByParcelId((current) => ({
        ...current,
        [data.id]: "idle",
      }))
    }

    if (!hasAttemptedSubmit && !hasAttemptedSave) return

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
    const located = parcelSearchResultToDraft(result)

    const nextParcels = parcels.map((parcel) =>
      parcel.id === activeParcel.id
        ? {
            ...parcel,
            polygon: located.polygon,
            centroid: located.centroid,
            refcat: located.refcat,
            address: located.address,
          }
        : parcel
    )
    onParcelsChange(nextParcels)

    if (!hasAttemptedSubmit && !hasAttemptedSave) return

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
      const withDuplicates = applyDuplicateNameErrors(nextParcels, next)
      setInvalidParcelIds(new Set(Object.keys(withDuplicates)))
      return withDuplicates
    })
  }

  const handleRemoveParcel = async (id: string) => {
    if (parcels.length <= 1) return

    try {
      await onRemoveParcel(id)
    } catch {
      setSubmitError(
        "No pudimos eliminar la parcela. Comprueba tu conexión e inténtalo de nuevo."
      )
      return
    }

    setSaveStatusByParcelId((current) => {
      const next = { ...current }
      delete next[id]
      return next
    })
    setSaveErrorByParcelId((current) => {
      const next = { ...current }
      delete next[id]
      return next
    })

    if (!hasAttemptedSubmit && !hasAttemptedSave) return

    setErrorsByParcelId((current) => {
      const next = { ...current }
      delete next[id]
      const nextParcels = parcels.filter((parcel) => parcel.id !== id)
      const withDuplicates = applyDuplicateNameErrors(nextParcels, next)
      setInvalidParcelIds(new Set(Object.keys(withDuplicates)))
      return withDuplicates
    })
  }

  const handleSaveActiveParcel = () => {
    setHasAttemptedSave(true)
    setSaveErrorByParcelId((current) => {
      const next = { ...current }
      delete next[activeParcel.id]
      return next
    })

    const fieldErrors = validateParcelForm(activeParcel)
    const errorsWithDuplicates = applyDuplicateNameErrors(parcels, {
      ...(Object.keys(fieldErrors).length > 0
        ? { [activeParcel.id]: fieldErrors }
        : {}),
    })

    if (errorsWithDuplicates[activeParcel.id]) {
      syncValidationState(parcels, errorsWithDuplicates)
      return
    }

    syncValidationState(parcels, errorsWithDuplicates)

    setSaveStatusByParcelId((current) => ({
      ...current,
      [activeParcel.id]: "saving",
    }))

    startSaveTransition(async () => {
      try {
        await onSaveParcel(activeParcel.id)
        setSaveStatusByParcelId((current) => ({
          ...current,
          [activeParcel.id]: "saved",
        }))
        setSaveErrorByParcelId((current) => {
          const next = { ...current }
          delete next[activeParcel.id]
          return next
        })
      } catch {
        setSaveStatusByParcelId((current) => ({
          ...current,
          [activeParcel.id]: "error",
        }))
        setSaveErrorByParcelId((current) => ({
          ...current,
          [activeParcel.id]:
            "No pudimos guardar la parcela. Comprueba tu conexión e inténtalo de nuevo.",
        }))
      }
    })
  }

  const handleClearActiveParcel = () => {
    const cleared = clearParcelDraftData(activeParcel)
    const nextParcels = parcels.map((parcel) =>
      parcel.id === activeParcel.id ? cleared : parcel
    )

    onParcelsChange(nextParcels)
    onPolygonChange(activeParcel.id, null)
    onCentroidChange(activeParcel.id, null)
    setFormResetKey((key) => key + 1)

    setSaveErrorByParcelId((current) => {
      const next = { ...current }
      delete next[activeParcel.id]
      return next
    })

    setSaveStatusByParcelId((current) => {
      if (!current[activeParcel.id]) return current
      const next = { ...current }
      delete next[activeParcel.id]
      return next
    })

    setErrorsByParcelId((current) => {
      if (!current[activeParcel.id]) return current
      const next = { ...current }
      delete next[activeParcel.id]
      const withDuplicates = applyDuplicateNameErrors(nextParcels, next)
      setInvalidParcelIds(new Set(Object.keys(withDuplicates)))
      return withDuplicates
    })

    setHasAttemptedSave(false)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitError(null)
    setHasAttemptedSubmit(true)

    const hasSavedParcel = parcels.some((parcel) => parcel.serverId)
    if (!hasSavedParcel) {
      setSubmitError("Guarda al menos una parcela antes de continuar.")
      return
    }

    const unsavedWithData = parcels.filter(hasUnsavedParcelData)
    if (unsavedWithData.length > 0) {
      const firstUnsaved = unsavedWithData[0]
      if (firstUnsaved) {
        onActiveParcelChange(firstUnsaved.id)
      }
      setSubmitError("Guarda la parcela antes de continuar.")
      return
    }

    if (!onContinue) {
      return
    }

    startTransition(async () => {
      try {
        await onContinue()
      } catch {
        setSubmitError(
          "No pudimos avanzar. Comprueba tu conexión e inténtalo de nuevo."
        )
      }
    })
  }

  const parcelCountLabel =
    parcels.length === 1 ? "1 parcela" : `${parcels.length} parcelas`

  return (
    <OnboardingSplitLayout
      as="form"
      contentOverflow="hidden"
      formProps={{
        id: PARCEL_ONBOARDING_FORM_ID,
        noValidate: true,
        onSubmit: handleSubmit,
      }}
      actions={
        <div className="flex flex-col gap-2">
          {activeSaveError ? (
            <p className="text-sm text-destructive">{activeSaveError}</p>
          ) : null}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="min-w-0 flex-1"
              disabled={isSaving || isPending}
              onClick={handleClearActiveParcel}
            >
              Limpiar
            </Button>
            <Button
              type="button"
              className="min-w-0 flex-1"
              disabled={isSaving || isPending}
              onClick={handleSaveActiveParcel}
            >
              {isSaving
                ? "Guardando…"
                : activeParcel.serverId
                  ? "Actualizar parcela"
                  : "Guardar parcela"}
            </Button>
          </div>
        </div>
      }
      footer={
        <div className="flex flex-col gap-2">
          {submitError ? (
            <p className="text-center text-sm text-destructive">
              {submitError}
            </p>
          ) : null}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isPending || isSaving}
          >
            {isPending ? "Continuando…" : "Continuar"}
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
            {getSaveStatusBadge(activeSaveStatus)}
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
          invalidParcelIds={hasAttemptedSubmit ? invalidParcelIds : undefined}
          saveStatusByParcelId={saveStatusByParcelId}
        />
        <div className="relative z-0 min-h-0 flex-1 pt-6">
          <ParcelForm
            key={`${activeParcel.id}-${formResetKey}`}
            value={activeParcel}
            onChange={updateActiveParcel}
            errors={activeErrors}
            onGeometryFound={handleGeometryFound}
            searchParcel={searchParcel}
            searchDisabled={isPending || isSaving}
          />
        </div>
      </div>
    </OnboardingSplitLayout>
  )
}
