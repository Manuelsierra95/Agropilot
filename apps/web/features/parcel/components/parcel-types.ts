import type { WeatherRisks } from "@/store/parcel-weather.mock"
import type { mockParcels } from "@/store/mockParcels"

export type ParcelItem = (typeof mockParcels)[number]
export type WeatherRiskLevel = WeatherRisks["waterStress"]

export type ParcelComparisonItem = {
  name: string
  area: number
  rain30d: number
  tempAvg: number
  waterDeficit30d: number
  dryDaysConsecutive: number
  heatStressDays: number
  waterStress: WeatherRiskLevel
}

export type AllModeSummary = {
  totalArea: number
  avgRain30d: number
  avgTemp: number
  highWaterStressCount: number
  maxDry?: ParcelComparisonItem
  maxDeficit?: ParcelComparisonItem
}
