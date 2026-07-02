"use client"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { Check, Plus, X } from "lucide-react"
import type {
  FieldFormData,
  ParcelSaveStatus,
} from "@workspace/web/features/onboarding/components/parcel/parcel-form"

interface ParcelListProps {
  parcels: FieldFormData[]
  activeParcelId: string
  onSelect: (id: string) => void
  onAdd: () => void
  onRemove: (id: string) => void
  invalidParcelIds?: Set<string>
  saveStatusByParcelId?: Record<string, ParcelSaveStatus>
}

function getParcelLabel(parcel: FieldFormData, index: number, total: number) {
  const trimmed = parcel.name.trim()
  if (trimmed) return trimmed
  return total > 1 ? `Parcela ${index + 1}` : "Nueva parcela"
}

function isParcelSaved(
  parcel: FieldFormData,
  saveStatusByParcelId?: Record<string, ParcelSaveStatus>
) {
  if (saveStatusByParcelId?.[parcel.id] === "saved") return true
  return Boolean(parcel.serverId)
}

export function ParcelList({
  parcels,
  activeParcelId,
  onSelect,
  onAdd,
  onRemove,
  invalidParcelIds,
  saveStatusByParcelId,
}: ParcelListProps) {
  return (
    <div className="-mx-6 flex shrink-0 flex-col gap-2 border-b border-sidebar-border bg-sidebar px-6 pb-3">
      <div className="flex flex-wrap gap-2">
        {parcels.map((parcel, index) => {
          const isActive = parcel.id === activeParcelId
          const isInvalid = invalidParcelIds?.has(parcel.id)
          const isSaved = isParcelSaved(parcel, saveStatusByParcelId)
          const label = getParcelLabel(parcel, index, parcels.length)

          return (
            <div
              key={parcel.id}
              className={cn(
                "inline-flex max-w-full items-center gap-0.5 rounded-lg border pr-0.5 transition-colors",
                isActive
                  ? "border-primary bg-primary/10"
                  : "border-sidebar-border bg-sidebar-accent hover:bg-sidebar-accent/80",
                isInvalid && "border-destructive/50",
                isSaved && !isActive && "border-emerald-600/30"
              )}
            >
              <button
                type="button"
                onClick={() => onSelect(parcel.id)}
                className="inline-flex cursor-pointer items-center gap-1 truncate px-2.5 py-1.5 text-left text-sm font-medium text-foreground"
              >
                {isSaved ? (
                  <Check
                    className="h-3.5 w-3.5 shrink-0 text-emerald-600"
                    aria-hidden
                  />
                ) : null}
                {label}
              </button>
              {parcels.length > 1 ? (
                <button
                  type="button"
                  aria-label={`Eliminar ${label}`}
                  className="cursor-pointer rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  onClick={(event) => {
                    event.stopPropagation()
                    onRemove(parcel.id)
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
          )
        })}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1"
          onClick={onAdd}
        >
          <Plus className="h-3.5 w-3.5" />
          Añadir parcela
        </Button>
      </div>
      {parcels.length > 1 ? (
        <p className="text-xs text-muted-foreground">
          Selecciona una parcela para editarla y localízala con el buscador.
        </p>
      ) : null}
    </div>
  )
}
