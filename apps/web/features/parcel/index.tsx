"use client"

import * as React from "react"

import { PageContainer } from "@workspace/web/components/ui/page-container"
import { WidgetSkeleton } from "@workspace/web/components/widget-skeleton"
import { useCropOverview } from "@workspace/web/hooks/dashboard"
import {
  useParcelAgroclimate,
  useParcelsWeatherComparison,
} from "@workspace/web/hooks/parcel"
import { useIsAllParcelsSelected } from "@workspace/web/hooks/use-is-all-parcels-selected"
import { useDashboardScopeParams } from "@workspace/web/hooks/use-dashboard-scope-params"
import {
  apiMetricsToWeatherMetrics,
  cropOverviewToAgroclimateMetrics,
  cropOverviewToYieldData,
  toParcelItem,
} from "@workspace/web/lib/parcel/mappers"
import { useDashboardListsStore } from "@workspace/web/store/useDashboardListsStore"

import { ParcelAllView } from "@workspace/web/features/parcel/views/all"
import { ParcelSingleView } from "@workspace/web/features/parcel/views/single"

export default function Parcel() {
  const [scopeParams, setScopeParams] = useDashboardScopeParams()
  const { parcelId } = scopeParams
  const isAllParcels = useIsAllParcelsSelected()
  const parcels = useDashboardListsStore((s) => s.parcels)
  const isLoadingParcels = useDashboardListsStore((s) => s.isLoadingParcels)

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
  const allModeSummary = weatherComparison.data?.summary ?? {
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
    isAllParcels && weatherComparison.isPending && !weatherComparison.data

  if (isLoadingParcels) {
    return (
      <PageContainer className="gap-4">
        <WidgetSkeleton contentHeight="h-[220px]" />
        <WidgetSkeleton contentHeight="h-[420px]" />
      </PageContainer>
    )
  }

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
      {isAllParcels ? (
        <ParcelAllView
          parcelComparisonData={parcelComparisonData}
          allModeSummary={allModeSummary}
          parcelCount={parcels.length}
        />
      ) : (
        <ParcelSingleView
          activeParcel={activeParcel!}
          daily={daily!}
          metrics={metrics!}
          apiResponse={apiResponse}
          agroclimate={heroAgroclimate}
          income={cropOverview.data?.estimatedProfitability}
          employeeCount={cropOverview.data?.participants}
          tasksPending={cropOverview.data?.pendingTasks}
          yieldData={yieldData}
          onDeleteSuccess={() => {
            void setScopeParams({ parcelId: null }, { history: "replace" })
          }}
        />
      )}
    </PageContainer>
  )
}
