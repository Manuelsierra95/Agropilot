"use client"

import * as React from "react"

import { PageContainer } from "@/components/ui/page-container"
import { WidgetSkeleton } from "@/features/dashboard/dashboard-skeleton"
import { useCropOverview } from "@/hooks/dashboard"
import { useParcelAgroclimate, useParcelsWeatherComparison } from "@/hooks/parcel"
import { useIsAllParcelsSelected } from "@/hooks/use-is-all-parcels-selected"
import { useDashboardScopeParams } from "@/hooks/use-dashboard-scope-params"
import {
  apiMetricsToWeatherMetrics,
  cropOverviewToAgroclimateMetrics,
  cropOverviewToYieldData,
  toParcelItem,
} from "@/lib/parcel/mappers"
import { useDashboardListsStore } from "@/store/useDashboardListsStore"

import { ParcelAllView } from "./components/parcel-all-view"
import { ParcelHero } from "./components/parcel-hero"
import { ParcelSingleView } from "./components/parcel-single-view"
import { EditParcelSheet } from "./components/edit-parcel-sheet"

export default function Parcel() {
  const [{ parcelId }] = useDashboardScopeParams()
  const isAllParcels = useIsAllParcelsSelected()
  const parcels = useDashboardListsStore((s) => s.parcels)
  const [editSheetOpen, setEditSheetOpen] = React.useState(false)

  const activeParcel = React.useMemo(() => {
    if (isAllParcels || !parcelId) return undefined
    const parcel = parcels.find((p) => p.id === parcelId)
    return parcel ? toParcelItem(parcel) : undefined
  }, [isAllParcels, parcelId, parcels])

  const cropOverview = useCropOverview()
  const agroclimate = useParcelAgroclimate()
  const weatherComparison = useParcelsWeatherComparison()

  const apiResponse = agroclimate.data
  const parcelComparisonData = weatherComparison.data?.items ?? []
  const allModeSummary =
    weatherComparison.data?.summary ?? {
      totalArea: 0,
      avgRain30d: 0,
      avgTemp: 0,
      highWaterStressCount: 0,
    }

  const heroAgroclimate = cropOverview.data
    ? cropOverviewToAgroclimateMetrics(cropOverview.data)
    : undefined
  const yieldData = cropOverview.data
    ? cropOverviewToYieldData(cropOverview.data)
    : undefined

  const isLoadingSingle =
    !isAllParcels &&
    ((agroclimate.isPending && !agroclimate.data) ||
      (cropOverview.isPending && !cropOverview.data))

  const isLoadingAll =
    isAllParcels &&
    weatherComparison.isPending &&
    !weatherComparison.data

  if (parcels.length === 0) {
    return (
      <PageContainer className="border">
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          No hay datos de parcelas disponibles.
        </div>
      </PageContainer>
    )
  }

  if (!isAllParcels && parcelId && !activeParcel) {
    return (
      <PageContainer className="border">
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          No se encontró la parcela seleccionada.
        </div>
      </PageContainer>
    )
  }

  if (isLoadingSingle || isLoadingAll) {
    return (
      <PageContainer className="gap-4">
        <WidgetSkeleton contentHeight="h-[220px]" />
        <WidgetSkeleton contentHeight="h-[420px]" />
      </PageContainer>
    )
  }

  if (!isAllParcels && !apiResponse?.daily.data.length) {
    return (
      <PageContainer className="border">
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          No hay datos climáticos para la parcela seleccionada.
        </div>
      </PageContainer>
    )
  }

  const metrics = apiResponse
    ? apiMetricsToWeatherMetrics(apiResponse.metrics)
    : undefined
  const daily = apiResponse?.daily.data

  return (
    <PageContainer className="gap-4">
      <ParcelHero
        isAllSelected={isAllParcels}
        activeParcel={activeParcel}
        parcelCount={parcels.length}
        allModeSummary={allModeSummary}
        apiResponse={apiResponse}
        agroclimate={heroAgroclimate}
        income={cropOverview.data?.estimatedProfitability}
        employeeCount={cropOverview.data?.participants}
        tasksPending={cropOverview.data?.pendingTasks}
        yieldData={yieldData}
        onEditParcel={() => setEditSheetOpen(true)}
      />

      {activeParcel && (
        <EditParcelSheet
          open={editSheetOpen}
          onOpenChange={setEditSheetOpen}
          parcel={activeParcel}
          apiResponse={apiResponse}
        />
      )}

      {!isAllParcels && activeParcel && daily && metrics && apiResponse ? (
        <ParcelSingleView
          activeParcel={activeParcel}
          daily={daily}
          metrics={metrics}
          apiResponse={apiResponse}
        />
      ) : (
        <ParcelAllView
          parcelComparisonData={parcelComparisonData}
          allModeSummary={allModeSummary}
        />
      )}
    </PageContainer>
  )
}
