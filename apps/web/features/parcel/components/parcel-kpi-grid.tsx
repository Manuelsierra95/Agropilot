import { mockParcels } from "@/store/mockParcels"
import type { ParcelApiResponse } from "./parcel-types"
import type { WeatherMetrics } from "@/store/parcel-weather.mock"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import type { AllModeSummary } from "./parcel-types"
import { formatNumber } from "./parcel-utils"

type ParcelKpiGridProps = {
  isAllSelected: boolean
  metrics?: WeatherMetrics
  allModeSummary: AllModeSummary
  olivePriceValue: number
  cropHealthValue: number
  apiResponse?: ParcelApiResponse
}

export function ParcelKpiGrid({
  isAllSelected,
  metrics,
  allModeSummary,
  olivePriceValue,
  cropHealthValue,
  apiResponse,
}: ParcelKpiGridProps) {
  const apiMetrics = apiResponse?.metrics

  return (
    <section className="mt-4 grid md:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardHeader>
          <CardDescription>
            {isAllSelected ? "Superficie total" : "Déficit hídrico"}
          </CardDescription>
          <CardTitle className="text-2xl">
            {isAllSelected
              ? `${formatNumber(allModeSummary.totalArea)} ha`
              : apiResponse
                ? `${formatNumber(apiMetrics?.water.deficit7d ?? 0)} mm`
                : `${formatNumber(metrics?.waterDeficit7d ?? 0)} mm`}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {isAllSelected
            ? `Parcelas activas: ${mockParcels.length}`
            : apiResponse
              ? `15d: ${formatNumber(apiMetrics?.water.deficit15d ?? 0)} mm · 30d: ${formatNumber(apiMetrics?.water.deficit30d ?? 0)} mm`
              : `Déficit 15d: ${formatNumber(metrics?.waterDeficit15d ?? 0)} mm`}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>
            {isAllSelected ? "Lluvia media 30d" : "Lluvia y sequía"}
          </CardDescription>
          <CardTitle className="text-2xl">
            {isAllSelected
              ? `${formatNumber(allModeSummary.avgRain30d)} mm`
              : apiResponse
                ? `${formatNumber(apiMetrics?.rain.rain7d ?? 0)} mm`
                : `${formatNumber(metrics?.rain30d ?? 0)} mm`}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {isAllSelected
            ? "Promedio calculado sobre todas las parcelas"
            : apiResponse
              ? `30d: ${formatNumber(apiMetrics?.rain.rain30d ?? 0)} mm · secos: ${formatNumber(apiMetrics?.rain.dryDaysConsecutive ?? 0)} días`
              : `Últimos 7 días: ${formatNumber(metrics?.rain7d ?? 0)} mm`}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>
            {isAllSelected ? "Temperatura media" : "Temperatura y estrés"}
          </CardDescription>
          <CardTitle className="text-2xl">
            {isAllSelected
              ? `${formatNumber(allModeSummary.avgTemp)}°C`
              : apiResponse
                ? `${formatNumber(apiMetrics?.temperature.avg7d ?? 0)}°C`
                : `${formatNumber(metrics?.tempAvg ?? 0)}°C`}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {isAllSelected
            ? "Media ponderada simple entre parcelas"
            : apiResponse
              ? `30d: ${formatNumber(apiMetrics?.temperature.avg30d ?? 0)}°C · tendencia: ${formatNumber(apiMetrics?.temperature.trend ?? 0, 1)}°C`
              : `Tendencia térmica: ${formatNumber(metrics?.tempTrend ?? 0, 2)}`}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>
            {isAllSelected
              ? "Mercado y salud del cultivo"
              : "Cultivo y ambiente"}
          </CardDescription>
          <CardTitle className="text-2xl">
            {isAllSelected
              ? `${formatNumber(olivePriceValue, 2)} €/kg`
              : apiResponse
                ? apiMetrics?.crop.stage
                : `${formatNumber(olivePriceValue, 2)} €/kg`}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {isAllSelected
            ? `Índice de salud: ${formatNumber(cropHealthValue, 0)} / 100`
            : apiResponse
              ? `GDD: ${formatNumber(apiMetrics?.crop.gdd ?? 0, 0)} · Kc: ${formatNumber(apiMetrics?.crop.kc ?? 0, 2)} · HR: ${formatNumber(apiMetrics?.environment.humidityAvg7d ?? 0, 0)}%`
              : `Índice de salud: ${formatNumber(cropHealthValue, 0)} / 100`}
        </CardContent>
      </Card>
    </section>
  )
}
