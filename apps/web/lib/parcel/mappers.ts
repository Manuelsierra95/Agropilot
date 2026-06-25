import type {
  DashboardOlivar,
  DashboardParcelAgroclimate,
  DashboardParcelsWeatherComparison,
  ParcelSelect,
} from "@workspace/schemas"
import { squareMetersToHectares } from "@workspace/schemas"

import type {
  AgroclimateMetrics,
  AllModeSummary,
  ParcelApiResponse,
  ParcelComparisonItem,
  ParcelItem,
  WeatherMetrics,
  YieldData,
} from "./types"

export function toParcelItem(parcel: ParcelSelect): ParcelItem {
  return {
    id: parcel.id,
    name: parcel.name,
    area: parcel.areaM2 ? squareMetersToHectares(parcel.areaM2) : 0,
    type: parcel.cropType,
    irrigationType: parcel.irrigationType,
  }
}

export function toParcelApiResponse(
  agroclimate: DashboardParcelAgroclimate
): ParcelApiResponse {
  return agroclimate as ParcelApiResponse
}

export function toParcelComparisonItems(
  comparison: DashboardParcelsWeatherComparison
): ParcelComparisonItem[] {
  return comparison.parcels
}

export function buildAllModeSummary(
  parcelComparisonData: ParcelComparisonItem[]
): AllModeSummary {
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
}

export function cropOverviewToAgroclimateMetrics(
  olivar: DashboardOlivar
): AgroclimateMetrics {
  const change = olivar.temperatureChange
  const tempTrend: AgroclimateMetrics["tempTrend"] =
    change > 0.5 ? "up" : change < -0.5 ? "down" : "stable"

  return {
    currentTemp: olivar.temperature,
    tempTrendPct: Math.abs(change),
    tempTrend,
    kc: olivar.kc,
    gdd: olivar.gdd,
    phenoStage: olivar.phenologicalStage,
  }
}

export function cropOverviewToYieldData(olivar: DashboardOlivar): YieldData {
  return {
    trees: olivar.totalTrees,
    totalKg: olivar.totalYieldKg,
  }
}

export function apiMetricsToWeatherMetrics(
  metrics: ParcelApiResponse["metrics"]
): WeatherMetrics {
  return {
    waterDeficit7d: metrics.water.deficit7d,
    waterDeficit15d: metrics.water.deficit15d,
    waterDeficit30d: metrics.water.deficit30d,
    dryDaysConsecutive: metrics.rain.dryDaysConsecutive,
    tempTrend: metrics.temperature.trend,
    rainTrend: metrics.rain.trend,
    heatStressDays: metrics.temperature.heatStressDays,
    coldStressDays: metrics.temperature.coldStressDays,
    rain7d: metrics.rain.rain7d,
    rain30d: metrics.rain.rain30d,
    tempAvg: metrics.temperature.avg7d,
    variabilityIndex: metrics.environment.variabilityIndex,
  }
}
