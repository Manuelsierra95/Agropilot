"use client"

import * as React from "react"

import { DashboardPageContainer } from "@/components/dashboard-page-container"
import { mockDashboardMetrics, mockParcels } from "@/store/mockParcels"
import { parcelWeatherByParcelId } from "@/store/parcel-weather.mock"
import { useParcelStore } from "@/store/useParcelStore"

import { ParcelAllView } from "./components/parcel-all-view"
import { ParcelHero } from "./components/parcel-hero"
import { ParcelKpiGrid } from "./components/parcel-kpi-grid"
import { ParcelSingleView } from "./components/parcel-single-view"
import type {
  AllModeSummary,
  ParcelComparisonItem,
  ParcelItem,
} from "./components/parcel-types"

export default function Parcel() {
  const parcelId = useParcelStore((state) => state.parcelId)
  const isAllSelected = parcelId === "all"

  const selectedParcel = React.useMemo<ParcelItem | undefined>(() => {
    if (isAllSelected) return undefined
    return mockParcels.find((parcel) => parcel.id === parcelId)
  }, [isAllSelected, parcelId])

  const activeParcel = selectedParcel ?? mockParcels[0]

  const weather = React.useMemo(() => {
    if (!activeParcel || isAllSelected) return undefined
    return parcelWeatherByParcelId[activeParcel.id]
  }, [activeParcel, isAllSelected])

  const cropHealthValue = mockDashboardMetrics.crop_health?.[0]?.value ?? 0
  const olivePriceValue = mockDashboardMetrics.olive_price?.[0]?.value ?? 0

  const parcelComparisonData = React.useMemo<ParcelComparisonItem[]>(() => {
    return mockParcels.map((parcel) => {
      const parcelWeather = parcelWeatherByParcelId[parcel.id]
      return {
        name: parcel.name.replace("Parcela ", "").replace("Olivar ", ""),
        area: parcel.area,
        rain30d: parcelWeather?.metrics.rain30d ?? 0,
        tempAvg: parcelWeather?.metrics.tempAvg ?? 0,
        waterDeficit30d: parcelWeather?.metrics.waterDeficit30d ?? 0,
        dryDaysConsecutive: parcelWeather?.metrics.dryDaysConsecutive ?? 0,
        heatStressDays: parcelWeather?.metrics.heatStressDays ?? 0,
        waterStress: parcelWeather?.risks.waterStress ?? "low",
      }
    })
  }, [])

  const allModeSummary = React.useMemo<AllModeSummary>(() => {
    const totalArea = parcelComparisonData.reduce(
      (acc, item) => acc + item.area,
      0
    )
    const avgRain30d =
      parcelComparisonData.length > 0
        ? parcelComparisonData.reduce((acc, item) => acc + item.rain30d, 0) /
          parcelComparisonData.length
        : 0
    const avgTemp =
      parcelComparisonData.length > 0
        ? parcelComparisonData.reduce((acc, item) => acc + item.tempAvg, 0) /
          parcelComparisonData.length
        : 0
    const highWaterStressCount = parcelComparisonData.filter(
      (item) => item.waterStress === "high"
    ).length

    const maxDry = [...parcelComparisonData].sort(
      (a, b) => b.dryDaysConsecutive - a.dryDaysConsecutive
    )[0]
    const maxDeficit = [...parcelComparisonData].sort(
      (a, b) => b.waterDeficit30d - a.waterDeficit30d
    )[0]

    return {
      totalArea,
      avgRain30d,
      avgTemp,
      highWaterStressCount,
      maxDry,
      maxDeficit,
    }
  }, [parcelComparisonData])

  if (!activeParcel) {
    return (
      <DashboardPageContainer className="mx-4 mt-4 border md:mx-6 md:mt-0">
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          No hay datos de parcelas disponibles.
        </div>
      </DashboardPageContainer>
    )
  }

  if (!isAllSelected && !weather) {
    return (
      <DashboardPageContainer className="mx-4 mt-4 border md:mx-6 md:mt-0">
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          No hay datos climáticos para la parcela seleccionada.
        </div>
      </DashboardPageContainer>
    )
  }

  const metrics = weather?.metrics
  const risks = weather?.risks
  const daily = weather?.daily

  return (
    <DashboardPageContainer className="mx-4 mt-4 border md:mx-6 md:mt-0">
      <ParcelHero
        isAllSelected={isAllSelected}
        activeParcel={activeParcel}
        allModeSummary={allModeSummary}
        risks={risks}
      />

      <ParcelKpiGrid
        isAllSelected={isAllSelected}
        metrics={metrics}
        allModeSummary={allModeSummary}
        olivePriceValue={olivePriceValue}
        cropHealthValue={cropHealthValue}
      />

      {!isAllSelected && daily && metrics ? (
        <ParcelSingleView
          activeParcel={activeParcel}
          daily={daily}
          metrics={metrics}
        />
      ) : (
        <ParcelAllView
          parcelComparisonData={parcelComparisonData}
          allModeSummary={allModeSummary}
        />
      )}
    </DashboardPageContainer>
  )
}
