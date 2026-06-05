"use client"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { Plus, X } from "lucide-react"
import type { FieldFormData } from "./parcel-form"

interface ParcelListProps {
  parcels: FieldFormData[]
  activeParcelId: string
  onSelect: (id: string) => void
  onAdd: () => void
  onRemove: (id: string) => void
  invalidParcelIds?: Set<string>
}

function getParcelLabel(parcel: FieldFormData, index: number, total: number) {
  const trimmed = parcel.name.trim()
  if (trimmed) return trimmed
  return total > 1 ? `Parcela ${index + 1}` : "Nueva parcela"
}

export function ParcelList({
  parcels,
  activeParcelId,
  onSelect,
  onAdd,
  onRemove,
  invalidParcelIds,
}: ParcelListProps) {
  return (
    <div className="shrink-0 -mx-6 flex flex-col gap-2 border-b border-sidebar-border bg-sidebar px-6 pb-3">
      <div className="flex flex-wrap gap-2">
        {parcels.map((parcel, index) => {
          const isActive = parcel.id === activeParcelId
          const isInvalid = invalidParcelIds?.has(parcel.id)
          const label = getParcelLabel(parcel, index, parcels.length)

          return (
            <div
              key={parcel.id}
              className={cn(
                "inline-flex max-w-full items-center gap-0.5 rounded-lg border pr-0.5 transition-colors",
                isActive
                  ? "border-primary bg-primary/10"
                  : "border-sidebar-border bg-sidebar-accent hover:bg-sidebar-accent/80",
                isInvalid && "border-destructive/50"
              )}
            >
              <button
                type="button"
                onClick={() => onSelect(parcel.id)}
                className="cursor-pointer truncate px-2.5 py-1.5 text-left text-sm font-medium text-foreground"
              >
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
