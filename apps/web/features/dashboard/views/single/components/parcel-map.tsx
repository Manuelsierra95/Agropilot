"use client"

import type { DashboardMapParcel } from "@workspace/schemas"
import { MapComponent } from "@workspace/web/components/maps/map"
import { cn } from "@workspace/ui/lib/utils"

type ParcelMapProps = {
  className?: string
  parcel?: DashboardMapParcel
}

export function ParcelMap({ className, parcel }: ParcelMapProps) {
  return (
    <MapComponent
      className={cn("min-h-[240px]", className)}
      resizeWithContainer
      parcel={parcel}
      hint=""
    />
  )
}
