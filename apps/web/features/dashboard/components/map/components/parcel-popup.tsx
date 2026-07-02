"use client"

import { MapPopup } from "@workspace/ui/components/map"

import type {
  Parcel,
  ParcelLngLat,
} from "@workspace/web/features/dashboard/components/map/components/types"
import { GridIcon, SunIcon } from "lucide-react"
import { Button } from "@workspace/ui/components/button"

type ParcelPopupProps = {
  parcel: Parcel
  lngLat: ParcelLngLat
  onClose: () => void
}

const cropEmoji: Record<string, string> = {
  Trigo: "🌾",
  Olivos: "🫒",
  Girasol: "🌻",
}

export function ParcelPopup({ parcel, lngLat, onClose }: ParcelPopupProps) {
  const emoji = cropEmoji[parcel.type] ?? "🌿"

  return (
    <MapPopup
      longitude={lngLat[0]}
      latitude={lngLat[1]}
      onClose={onClose}
      closeButton={false}
      closeOnClick={false}
      focusAfterOpen={false}
      offset={12}
      className="rounded-none! border-none! bg-transparent! p-0! shadow-none!"
    >
      <div className="w-56 overflow-hidden rounded-[14px] border border-border/40 bg-background shadow-lg">
        {/* Accent bar */}
        <div className="h-[3px]" style={{ background: parcel.color }} />

        {/* Header */}
        <div className="relative px-3.5 pt-3 pb-2.5">
          <div className="flex items-start gap-2.5">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-[17px]"
              style={{ backgroundColor: `${parcel.color}22` }}
            >
              {emoji}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-serif text-sm leading-snug font-semibold text-foreground">
                {parcel.name}
              </p>
              <span
                className="mt-1 inline-flex items-center rounded-full px-1.5 py-0.5 text-[10.5px] font-medium tracking-wide uppercase"
                style={{
                  backgroundColor: `${parcel.color}18`,
                  color: parcel.color,
                }}
              >
                {parcel.type}
              </span>
              <div className="mt-1 flex gap-1.5">
                <span className="text-[10px] text-muted-foreground/60 tabular-nums">
                  {lngLat[1].toFixed(4)}°N
                </span>
                <span className="text-[10px] text-muted-foreground/60 tabular-nums">
                  {Math.abs(lngLat[0]).toFixed(4)}°O
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-3.5 h-px bg-border/50" />

        {/* Body */}
        <div className="flex flex-col gap-1.5 px-3.5 py-2.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
              <GridIcon />
              Superficie
            </span>
            <span className="text-xs font-medium text-foreground tabular-nums">
              {parcel.area} ha
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
              <SunIcon />
              Estado
            </span>
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
              style={{
                backgroundColor: `${parcel.color}18`,
                color: parcel.color,
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: parcel.color }}
              />
              Activa
            </span>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="grid grid-cols-3 gap-2 px-3.5 pb-3">
          <Button
            size="sm"
            variant="outline"
            className="col-span-1 w-full"
            onClick={() => onClose()}
          >
            Cerrar
          </Button>
          <Button size="sm" variant="outline" className="col-span-2 w-full">
            Ver detalle →
          </Button>
        </div>
      </div>
    </MapPopup>
  )
}
