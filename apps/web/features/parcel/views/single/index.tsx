"use client"

import * as React from "react"

import type {
  AgroclimateMetrics,
  ParcelApiResponse,
  ParcelItem,
  YieldData,
} from "@workspace/web/features/parcel/lib/parcel-types"
import type {
  WeatherDaily,
  WeatherMetrics,
} from "@workspace/web/lib/parcel/types"
import { ParcelHero } from "@workspace/web/features/parcel/components/parcel-hero"
import { ParcelWeatherDashboard } from "@workspace/web/features/parcel/views/single/components/parcel-weather-dashboard"
import { EditParcel } from "@workspace/web/features/parcel/views/single/components/edit-parcel"

type ParcelSingleViewProps = {
  activeParcel: ParcelItem
  daily: WeatherDaily[]
  metrics: WeatherMetrics
  apiResponse?: ParcelApiResponse
  agroclimate?: AgroclimateMetrics
  yieldData?: YieldData
  income?: number
  employeeCount?: number
  tasksPending?: number
  onDeleteSuccess?: () => void
}

export function ParcelSingleView({
  activeParcel,
  daily,
  metrics,
  apiResponse,
  agroclimate,
  yieldData,
  income,
  employeeCount,
  tasksPending,
  onDeleteSuccess,
}: ParcelSingleViewProps) {
  const [editSheetOpen, setEditSheetOpen] = React.useState(false)

  return (
    <>
      <ParcelHero
        isAllSelected={false}
        activeParcel={activeParcel}
        apiResponse={apiResponse}
        agroclimate={agroclimate}
        income={income}
        employeeCount={employeeCount}
        tasksPending={tasksPending}
        yieldData={yieldData}
        onEditParcel={() => setEditSheetOpen(true)}
      />

      <EditParcel
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
        parcel={activeParcel}
        apiResponse={apiResponse}
        onDeleteSuccess={onDeleteSuccess}
      />

      <ParcelWeatherDashboard
        activeParcel={activeParcel}
        daily={daily}
        metrics={metrics}
        apiResponse={apiResponse}
      />
    </>
  )
}
