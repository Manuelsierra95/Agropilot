"use client"

import { MapPopup } from "@workspace/ui/components/map"
import type { Parcel, ParcelLngLat } from "./types"
import { formatAreaHa } from "@workspace/schemas"

type ParcelPopupProps = {
  parcel: Parcel
  lngLat: ParcelLngLat
  onClose: () => void
}

export function ParcelPopup({ parcel, lngLat, onClose }: ParcelPopupProps) {
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
      <div className="w-[216px] overflow-hidden rounded-lg border border-border bg-background shadow-[0_4px_24px_-4px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.03)]">
        {/* ── Header ─────────────────────────────── */}
        <div className="flex items-center gap-2 px-3 pt-3 pb-2.5">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: parcel.color }}
          />
          <p className="truncate text-[13px] leading-none font-semibold text-foreground">
            {parcel.name}
          </p>
        </div>

        {/* ── Sub-header: type + area ──────────────── */}
        <div className="flex items-center gap-1.5 px-3 pb-3">
          <span className="text-[11.5px] text-muted-foreground">
            {parcel.type}
          </span>
          {parcel.area != null ? (
            <>
              <span className="text-[11px] text-border select-none">·</span>
              <span className="text-[11.5px] text-muted-foreground tabular-nums">
                {formatAreaHa(parcel.area)} ha
              </span>
            </>
          ) : null}
        </div>

        <div className="h-px bg-border" />

        {/* ── Data rows ──────────────────────────── */}
        <div className="space-y-2.5 px-3 py-3">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-medium tracking-[0.07em] text-muted-foreground/55 uppercase">
              Régimen hídrico
            </span>
            <span className="font-mono text-[10.5px] text-muted-foreground">
              {parcel.irrigationType ?? "Sin dato"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-medium tracking-[0.07em] text-muted-foreground/55 uppercase">
              Coords
            </span>
            <span className="font-mono text-[10.5px] text-muted-foreground tabular-nums">
              {lngLat[1].toFixed(4)}N&nbsp;{Math.abs(lngLat[0]).toFixed(4)}O
            </span>
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* ── Footer ──────────────────────────────── */}
        <button
          type="button"
          onClick={onClose}
          className="w-full cursor-pointer px-3 py-2.5 text-center text-[11.5px] text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
        >
          Cerrar
        </button>
      </div>
    </MapPopup>
  )
}
