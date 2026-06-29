"use client"

import { useMemo, useState, useTransition } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { ParcelForm } from "@workspace/web/features/onboarding/components/parcel/parcel-form"
import {
  validateParcelForm,
  applyDuplicateNameErrors,
  hasUnsavedParcelData,
  toParcelCreateInput,
  toParcelUpdateInput,
  type FieldFormData,
  type ParcelFormErrors,
  type ParcelSaveStatus,
} from "@workspace/web/features/onboarding/components/parcel/parcel-form"
import { ParcelList } from "@workspace/web/features/onboarding/components/parcel/parcel-list"
import { ParcelMap } from "@workspace/web/features/onboarding/components/parcel/parcel-map-preview"
import { createParcelDraft, clearParcelDraftData } from "@workspace/web/features/onboarding/components/parcel/parcel-draft-utils"
import {
  CROP_TYPE_LABELS,
  DEFAULT_CROP_TYPE,
  IRRIGATION_TYPE_LABELS,
  type CropTypeValue,
} from "@workspace/web/features/onboarding/components/parcel/parcel-constants"
import { searchParcel } from "@workspace/web/lib/cadastre/search-parcel"
import { parcelSearchResultToDraft } from "@workspace/web/lib/cadastre/apply-search-response"
import type { ParcelSearchResult } from "@workspace/web/features/onboarding/components/parcel/parcel-search/types"
import { api } from "@workspace/web/lib/api"

interface CreateParcelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
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

export function CreateParcelDialog({
  open,
  onOpenChange,
}: CreateParcelDialogProps) {
  const queryClient = useQueryClient()
  const [parcels, setParcels] = useState<FieldFormData[]>(() => [
    createParcelDraft(),
  ])
  const [activeParcelId, setActiveParcelId] = useState<string>(
    () => parcels[0]?.id ?? ""
  )
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
  const [hasAttemptedSave, setHasAttemptedSave] = useState(false)
  const [formResetKey, setFormResetKey] = useState(0)
  const [isSaving, startSaveTransition] = useTransition()

  const activeParcel = useMemo(
    () => parcels.find((p) => p.id === activeParcelId) ?? parcels[0],
    [parcels, activeParcelId]
  )

  if (!activeParcel) return null

  const displayName = activeParcel.name || "Parcela sin nombre"
  const initial = displayName.charAt(0).toUpperCase()
  const activeErrors = hasAttemptedSave
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
    const nextParcels = parcels.map((p) =>
      p.id === activeParcel.id ? data : p
    )
    setParcels(nextParcels)

    if (!hasAttemptedSave) return

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

  const handleGeometryFound = (result: ParcelSearchResult) => {
    const located = parcelSearchResultToDraft(result)

    const nextParcels = parcels.map((p) =>
      p.id === activeParcel.id
        ? {
            ...p,
            polygon: located.polygon,
            centroid: located.centroid,
            refcat: located.refcat,
            address: located.address,
          }
        : p
    )
    setParcels(nextParcels)

    if (!hasAttemptedSave) return

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

  const handleAddParcel = () => {
    const newParcel = createParcelDraft()
    setParcels((current) => [...current, newParcel])
    setActiveParcelId(newParcel.id)
  }

  const handleRemoveParcel = (id: string) => {
    if (parcels.length <= 1) return

    setParcels((current) => current.filter((p) => p.id !== id))

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

    if (!hasAttemptedSave) return

    setErrorsByParcelId((current) => {
      const next = { ...current }
      delete next[id]
      const nextParcels = parcels.filter((p) => p.id !== id)
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
        if (activeParcel.serverId) {
          await api.parcel.updateParcel(
            activeParcel.serverId,
            toParcelUpdateInput(activeParcel)
          )
        } else {
          const created = await api.parcel.createParcel(
            toParcelCreateInput(activeParcel)
          )
          setParcels((current) =>
            current.map((p) =>
              p.id === activeParcel.id ? { ...p, serverId: created.id } : p
            )
          )
        }

        setSaveStatusByParcelId((current) => ({
          ...current,
          [activeParcel.id]: "saved",
        }))
        setSaveErrorByParcelId((current) => {
          const next = { ...current }
          delete next[activeParcel.id]
          return next
        })
        toast.success(
          activeParcel.serverId ? "Parcela actualizada" : "Parcela creada"
        )
        queryClient.invalidateQueries({ queryKey: ["parcels"] })
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
        toast.error("Error al guardar la parcela")
      }
    })
  }

  const handleClearActiveParcel = () => {
    const cleared = clearParcelDraftData(activeParcel)
    const nextParcels = parcels.map((p) =>
      p.id === activeParcel.id ? cleared : p
    )
    setParcels(nextParcels)
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

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setParcels([createParcelDraft()])
      setActiveParcelId("")
      setErrorsByParcelId({})
      setInvalidParcelIds(new Set())
      setSaveStatusByParcelId({})
      setSaveErrorByParcelId({})
      setHasAttemptedSave(false)
      setFormResetKey(0)
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-5xl gap-0 overflow-hidden p-0 sm:max-w-5xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Crear parcela</DialogTitle>
          <DialogDescription>
            Añade la información de tu parcela y localízala en el mapa.
          </DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)]">
          <div className="flex min-h-0 flex-col overflow-hidden p-6">
            <ParcelList
              parcels={parcels}
              activeParcelId={activeParcelId}
              onSelect={setActiveParcelId}
              onAdd={handleAddParcel}
              onRemove={handleRemoveParcel}
              invalidParcelIds={invalidParcelIds}
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
                searchDisabled={isSaving}
              />
            </div>
            <div className="shrink-0 border-t border-sidebar-border pt-4">
              {activeSaveError ? (
                <p className="mb-2 text-sm text-destructive">
                  {activeSaveError}
                </p>
              ) : null}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="min-w-0 flex-1"
                  disabled={isSaving}
                  onClick={handleClearActiveParcel}
                >
                  Limpiar
                </Button>
                <Button
                  type="button"
                  className="min-w-0 flex-1"
                  disabled={isSaving}
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
          </div>

          <div className="hidden min-h-0 flex-col border-l border-sidebar-border bg-sidebar-accent/40 lg:flex">
            <div className="shrink-0 border-b border-sidebar-border px-6 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-semibold">
                    {initial}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {displayName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {parcels.length === 1
                        ? "1 parcela"
                        : `${parcels.length} parcelas`}{" "}
                      · Vista previa
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
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
              <ParcelMap
                parcels={parcels}
                activeParcelId={activeParcelId}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
