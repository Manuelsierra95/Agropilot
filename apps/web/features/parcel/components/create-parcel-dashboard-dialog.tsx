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
import {
  validateParcelForm,
  toParcelCreateInput,
  type FieldFormData,
  type ParcelFormErrors,
} from "@workspace/web/features/onboarding/components/parcel/parcel-form"
import { ParcelMap } from "@workspace/web/features/onboarding/components/parcel/parcel-map-preview"
import {
  createParcelDraft,
  clearParcelDraftData,
} from "@workspace/web/features/onboarding/components/parcel/parcel-draft-utils"
import {
  CROP_TYPE_LABELS,
  DEFAULT_CROP_TYPE,
  IRRIGATION_TYPE_LABELS,
  type CropTypeValue,
} from "@workspace/web/features/onboarding/components/parcel/parcel-constants"
import { ParcelDashboardForm } from "@workspace/web/features/parcel/components/parcel-dashboard-form"
import { searchParcel } from "@workspace/web/lib/cadastre/search-parcel"
import { parcelSearchResultToDraft } from "@workspace/web/lib/cadastre/apply-search-response"
import type { ParcelSearchResult } from "@workspace/web/features/onboarding/components/parcel/parcel-search/types"
import { api } from "@workspace/web/lib/api"

interface CreateParcelDashboardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateParcelDashboardDialog({
  open,
  onOpenChange,
}: CreateParcelDashboardDialogProps) {
  const queryClient = useQueryClient()
  const [parcel, setParcel] = useState<FieldFormData>(() => createParcelDraft())
  const [errors, setErrors] = useState<ParcelFormErrors>({})
  const [saveError, setSaveError] = useState<string | null>(null)
  const [hasAttemptedSave, setHasAttemptedSave] = useState(false)
  const [formResetKey, setFormResetKey] = useState(0)
  const [isSaving, startSaveTransition] = useTransition()

  const parcels = useMemo(() => [parcel], [parcel])

  const displayName = parcel.name || "Parcela sin nombre"
  const initial = displayName.charAt(0).toUpperCase()
  const activeErrors = hasAttemptedSave ? errors : {}

  const updateParcel = (data: FieldFormData) => {
    setParcel(data)

    if (!hasAttemptedSave) return

    const fieldErrors = validateParcelForm(data)
    setErrors(fieldErrors)
  }

  const handleGeometryFound = (result: ParcelSearchResult) => {
    const located = parcelSearchResultToDraft(result)

    setParcel((current) => ({
      ...current,
      polygon: located.polygon,
      centroid: located.centroid,
      refcat: located.refcat,
      address: located.address,
    }))

    if (!hasAttemptedSave) return

    setErrors((current) => {
      if (!current.geometry) return current
      const { geometry: _geometry, ...rest } = current
      return rest
    })
  }

  const handleSave = () => {
    setHasAttemptedSave(true)
    setSaveError(null)

    const fieldErrors = validateParcelForm(parcel)
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      return
    }

    setErrors({})

    startSaveTransition(async () => {
      try {
        await api.parcel.createParcel(toParcelCreateInput(parcel))
        toast.success("Parcela creada")
        queryClient.invalidateQueries({ queryKey: ["parcels"] })
        handleOpenChange(false)
      } catch {
        setSaveError(
          "No pudimos guardar la parcela. Comprueba tu conexión e inténtalo de nuevo."
        )
        toast.error("Error al guardar la parcela")
      }
    })
  }

  const handleClear = () => {
    setParcel(clearParcelDraftData(parcel))
    setFormResetKey((key) => key + 1)
    setSaveError(null)
    setErrors({})
    setHasAttemptedSave(false)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setParcel(createParcelDraft())
      setErrors({})
      setSaveError(null)
      setHasAttemptedSave(false)
      setFormResetKey(0)
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-[min(96vw,72rem)] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-none">
        <DialogHeader className="shrink-0 border-b px-6 py-4">
          <DialogTitle>Crear parcela</DialogTitle>
          <DialogDescription>
            Añade la información de tu parcela y localízala en el mapa.
          </DialogDescription>
        </DialogHeader>

        <div className="grid h-[min(80vh,800px)] min-h-[28rem] grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,32rem)]">
          <div className="flex min-h-0 flex-col overflow-hidden p-6">
            <div className="min-h-0 flex-1 overflow-hidden">
              <ParcelDashboardForm
                key={`${parcel.id}-${formResetKey}`}
                value={parcel}
                onChange={updateParcel}
                errors={activeErrors}
                onGeometryFound={handleGeometryFound}
                searchParcel={searchParcel}
                searchDisabled={isSaving}
              />
            </div>
            <div className="shrink-0 border-t border-sidebar-border pt-4">
              {saveError ? (
                <p className="mb-2 text-sm text-destructive">{saveError}</p>
              ) : null}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="min-w-0 flex-1"
                  disabled={isSaving}
                  onClick={handleClear}
                >
                  Limpiar
                </Button>
                <Button
                  type="button"
                  className="min-w-0 flex-1"
                  disabled={isSaving}
                  onClick={handleSave}
                >
                  {isSaving ? "Guardando…" : "Guardar parcela"}
                </Button>
              </div>
            </div>
          </div>

          <div className="hidden min-h-0 flex-col border-l border-sidebar-border bg-sidebar-accent/40 lg:flex">
            <div className="shrink-0 border-b border-sidebar-border px-6 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
                    {initial}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {displayName}
                    </p>
                    <p className="text-sm text-muted-foreground">Vista previa</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {CROP_TYPE_LABELS[
                      (parcel.cropType || DEFAULT_CROP_TYPE) as CropTypeValue
                    ] ?? parcel.cropType}
                  </Badge>
                  {parcel.irrigationType ? (
                    <Badge variant="outline">
                      {IRRIGATION_TYPE_LABELS[parcel.irrigationType]}
                    </Badge>
                  ) : (
                    <Badge variant="outline">Sin régimen hídrico</Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
              <ParcelMap parcels={parcels} activeParcelId={parcel.id} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
